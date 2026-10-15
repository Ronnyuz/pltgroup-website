// Owner only. PATCH changes name, permissions, active flag or password; DELETE removes a staff account.
import { PERMS, body, clip, db, fail, hashPassword, json, publicUser, requireUser, validPassword } from '../../_lib/core.js';

async function target(env, id) {
  return (await db(env)).prepare('SELECT * FROM users WHERE id = ?').bind(Number(id)).first();
}

export async function onRequestPatch({ request, env, params }) {
  const { error } = await requireUser(request, env, 'owner');
  if (error) return error;
  const u = await target(env, params.id);
  if (!u) return fail(404, 'Сотрудник не найден.');
  const b = await body(request) || {};
  if (b.password !== undefined && !validPassword(b.password)) return fail(400, 'Пароль должен быть не короче 8 символов.');
  const d = await db(env);
  const name = b.name === undefined ? u.name : clip(b.name, 120);
  const perms = Array.isArray(b.perms) ? JSON.stringify(b.perms.filter((p) => PERMS.includes(p))) : u.perms;
  const active = u.role === 'owner' ? 1 : (b.active === undefined ? u.active : (b.active ? 1 : 0));
  await d.prepare('UPDATE users SET name = ?, perms = ?, active = ? WHERE id = ?').bind(name, perms, active, u.id).run();
  if (b.password !== undefined) {
    const { hash, salt } = await hashPassword(b.password);
    await d.prepare('UPDATE users SET pass_hash = ?, salt = ? WHERE id = ?').bind(hash, salt, u.id).run();
  }
  if (!active || b.password !== undefined) await d.prepare('DELETE FROM sessions WHERE user_id = ?').bind(u.id).run();
  return json({ user: publicUser(await target(env, u.id)) });
}

export async function onRequestDelete({ request, env, params }) {
  const { error } = await requireUser(request, env, 'owner');
  if (error) return error;
  const u = await target(env, params.id);
  if (!u) return fail(404, 'Сотрудник не найден.');
  if (u.role === 'owner') return fail(400, 'Владельца удалить нельзя.');
  const d = await db(env);
  await d.prepare('DELETE FROM sessions WHERE user_id = ?').bind(u.id).run();
  await d.prepare('DELETE FROM users WHERE id = ?').bind(u.id).run();
  return json({ ok: true });
}
