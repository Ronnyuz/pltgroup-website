// Owner only. GET lists accounts, POST creates a staff account.
import { PERMS, body, clip, db, fail, hashPassword, json, publicUser, requireUser, validPassword } from '../../_lib/core.js';

export async function onRequestGet({ request, env }) {
  const { error } = await requireUser(request, env, 'owner');
  if (error) return error;
  const rows = await (await db(env)).prepare('SELECT * FROM users ORDER BY id').all();
  return json({ users: rows.results.map(publicUser) });
}

export async function onRequestPost({ request, env }) {
  const { error } = await requireUser(request, env, 'owner');
  if (error) return error;
  const b = await body(request) || {};
  const login = clip(b.login, 60).toLowerCase();
  if (!/^[a-z0-9._-]{3,60}$/.test(login)) return fail(400, 'Логин: от 3 символов, латиница, цифры, точка, дефис.');
  if (!validPassword(b.password)) return fail(400, 'Пароль должен быть не короче 8 символов.');
  const perms = (Array.isArray(b.perms) ? b.perms : []).filter((p) => PERMS.includes(p));
  const d = await db(env);
  if (await d.prepare('SELECT id FROM users WHERE login = ?').bind(login).first()) return fail(400, 'Такой логин уже есть.');
  const { hash, salt } = await hashPassword(b.password);
  await d.prepare("INSERT INTO users (login, name, pass_hash, salt, role, perms) VALUES (?, ?, ?, ?, 'staff', ?)").bind(login, clip(b.name, 120), hash, salt, JSON.stringify(perms)).run();
  const user = await d.prepare('SELECT * FROM users WHERE login = ?').bind(login).first();
  return json({ user: publicUser(user) });
}
