// /api/auth/login, /api/auth/logout, /api/auth/me, /api/auth/password
import { body, checkPassword, clip, clearFailures, createSession, currentUser, db, endSession, fail, hashPassword, json, noteFailure, publicUser, requireUser, sameOrigin, tooManyFailures, validPassword } from '../../_lib/core.js';

export async function onRequest({ request, env, params }) {
  const action = params.action;
  if (action === 'me' && request.method === 'GET') {
    const user = await currentUser(request, env);
    return user ? json({ user: publicUser(user) }) : fail(401, 'Войдите в панель.');
  }
  if (request.method !== 'POST') return fail(405, 'method not allowed');
  if (!sameOrigin(request)) return fail(403, 'Запрос с другого сайта отклонён.');

  if (action === 'login') {
    const b = await body(request) || {};
    const login = String(b.login || '').trim().toLowerCase(), password = String(b.password || '');
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const keys = [`login:${login}`, `ip:${ip}`];
    if (await tooManyFailures(env, keys)) return fail(429, 'Слишком много попыток. Подождите 15 минут.');
    const d = await db(env);
    // First start: when there are no users yet, the owner signs in with OWNER_LOGIN and OWNER_PASSWORD.
    const count = (await d.prepare('SELECT COUNT(*) AS n FROM users').first()).n;
    if (count === 0) {
      if (!env.OWNER_LOGIN || !env.OWNER_PASSWORD) return fail(500, 'Владелец не настроен: задайте OWNER_LOGIN и OWNER_PASSWORD в Cloudflare.');
      if (login !== String(env.OWNER_LOGIN).toLowerCase() || password !== env.OWNER_PASSWORD) { await noteFailure(env, keys); return fail(401, 'Неверный логин или пароль.'); }
      const { hash, salt } = await hashPassword(password);
      await d.prepare("INSERT INTO users (login, name, pass_hash, salt, role, perms) VALUES (?, ?, ?, ?, 'owner', '[]')").bind(login, 'Владелец', hash, salt).run();
    }
    const user = await d.prepare('SELECT * FROM users WHERE login = ?').bind(login).first();
    if (!user || !user.active || !(await checkPassword(password, user))) { await noteFailure(env, keys); return fail(401, 'Неверный логин или пароль.'); }
    await clearFailures(env, keys);
    await d.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(new Date().toISOString()).run();
    return json({ user: publicUser(user) }, 200, { 'set-cookie': await createSession(env, user.id) });
  }

  if (action === 'logout') return json({ ok: true }, 200, { 'set-cookie': await endSession(request, env) });

  if (action === 'password') {
    const { user, error } = await requireUser(request, env);
    if (error) return error;
    const b = await body(request) || {};
    if (!(await checkPassword(String(b.current || ''), user))) return fail(400, 'Текущий пароль указан неверно.');
    if (!validPassword(b.next)) return fail(400, 'Новый пароль должен быть не короче 8 символов.');
    const { hash, salt } = await hashPassword(b.next);
    const d = await db(env);
    await d.prepare('UPDATE users SET pass_hash = ?, salt = ? WHERE id = ?').bind(hash, salt, user.id).run();
    await d.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id).run();
    return json({ ok: true }, 200, { 'set-cookie': await createSession(env, user.id) });
  }
  // Change own login and display name; the current password confirms it.
  if (action === 'profile') {
    const { user, error } = await requireUser(request, env);
    if (error) return error;
    const b = await body(request) || {};
    if (!(await checkPassword(String(b.current || ''), user))) return fail(400, 'Текущий пароль указан неверно.');
    const login = clip(b.login, 60).toLowerCase();
    if (!/^[a-z0-9._-]{3,60}$/.test(login)) return fail(400, 'Логин: от 3 символов, латиница, цифры, точка, дефис.');
    const d = await db(env);
    if (await d.prepare('SELECT id FROM users WHERE login = ? AND id != ?').bind(login, user.id).first()) return fail(400, 'Такой логин уже занят.');
    await d.prepare('UPDATE users SET login = ?, name = ? WHERE id = ?').bind(login, clip(b.name, 120), user.id).run();
    return json({ user: publicUser(await d.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first()) });
  }
  return fail(404, 'not found');
}
