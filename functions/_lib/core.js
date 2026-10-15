// Shared helpers for the admin API (Cloudflare Pages Functions).
// Bindings and settings, all in the Cloudflare Pages project:
//   DB              D1 database binding (leads, users, sessions)
//   OWNER_LOGIN     secret, login of the first owner account
//   OWNER_PASSWORD  secret, password of the first owner account (used once, when no users exist)
//   GITHUB_TOKEN    secret, token with "Contents: read and write" on the site repository
//   GITHUB_REPO     variable, e.g. "Ronnyuz/pltgroup-website"
//   GITHUB_BRANCH   variable, default "main"
//   ANTHROPIC_API_KEY secret, for the site consultant (/api/chat)
//   CHAT_MODEL      variable, optional, model for the consultant

export const PERMS = ['leads', 'content', 'posts'];
const SESSION_DAYS = 14;
const COOKIE = 'plt_session';

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
export const fail = (status, error) => json({ error }, status);

export async function body(request) {
  try { return await request.json(); } catch { return null; }
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL DEFAULT '', pass_hash TEXT NOT NULL, salt TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'staff', perms TEXT NOT NULL DEFAULT '[]', active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL DEFAULT (datetime('now')), name TEXT, contact TEXT, service TEXT, task TEXT, lang TEXT, page TEXT, status TEXT NOT NULL DEFAULT 'new', note TEXT NOT NULL DEFAULT '', updated_by TEXT)`,
  `CREATE TABLE IF NOT EXISTS login_failures (key TEXT PRIMARY KEY, count INTEGER NOT NULL, first_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS chats (id TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), lang TEXT, page TEXT, system TEXT NOT NULL, messages TEXT NOT NULL, turns INTEGER NOT NULL DEFAULT 0, lead_id INTEGER)`,
  `CREATE TABLE IF NOT EXISTS chat_hits (key TEXT PRIMARY KEY, count INTEGER NOT NULL)`,
];
let schemaReady = false;
export async function db(env) {
  if (!env.DB) throw new Error('D1 binding "DB" is missing');
  if (!schemaReady) {
    await env.DB.batch(SCHEMA.map((q) => env.DB.prepare(q)));
    schemaReady = true;
  }
  return env.DB;
}

// Passwords: PBKDF2-SHA256, 100 000 iterations, random 16-byte salt.
const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const randomHex = (n) => hex(crypto.getRandomValues(new Uint8Array(n)));
export async function hashPassword(password, salt = randomHex(16)) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 100000 }, key, 256);
  return { hash: hex(bits), salt };
}
const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const sameText = (a, b) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};
export async function checkPassword(password, user) {
  const { hash } = await hashPassword(password, user.salt);
  return sameText(hash, user.pass_hash);
}
export function validPassword(p) {
  return typeof p === 'string' && p.length >= 8 && p.length <= 200;
}

export const publicUser = (u) => ({ id: u.id, login: u.login, name: u.name, role: u.role, perms: u.role === 'owner' ? PERMS : JSON.parse(u.perms || '[]'), active: !!u.active, created_at: u.created_at });

// Sessions: random token in an HttpOnly cookie, only its hash is stored.
export async function createSession(env, userId) {
  const token = randomHex(32);
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  await (await db(env)).prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').bind(await sha256(token), userId, expires).run();
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}`;
}
const readCookie = (request) => {
  const m = (request.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]{64})`));
  return m ? m[1] : null;
};
export async function endSession(request, env) {
  const token = readCookie(request);
  if (token) await (await db(env)).prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
export async function currentUser(request, env) {
  const token = readCookie(request);
  if (!token) return null;
  const d = await db(env);
  const row = await d.prepare(`SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1`)
    .bind(await sha256(token), new Date().toISOString()).first();
  return row || null;
}

// Mutating requests must come from this site (blocks cross-site form posts).
export function sameOrigin(request) {
  if (['GET', 'HEAD'].includes(request.method)) return true;
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

// Guard for admin endpoints: signed in, active, and holding the permission (owner holds all).
export async function requireUser(request, env, perm) {
  if (!sameOrigin(request)) return { error: fail(403, 'Запрос с другого сайта отклонён.') };
  const user = await currentUser(request, env);
  if (!user) return { error: fail(401, 'Войдите в панель.') };
  if (perm === 'owner' && user.role !== 'owner') return { error: fail(403, 'Это может делать только владелец.') };
  if (perm && perm !== 'owner' && user.role !== 'owner' && !JSON.parse(user.perms || '[]').includes(perm)) return { error: fail(403, 'У вас нет доступа к этому разделу.') };
  return { user };
}

// Simple brute-force brake: 8 failed logins per login or IP lock it for 15 minutes.
const WINDOW = 15 * 60 * 1000;
export async function tooManyFailures(env, keys) {
  const d = await db(env);
  for (const key of keys) {
    const row = await d.prepare('SELECT count, first_at FROM login_failures WHERE key = ?').bind(key).first();
    if (row && Date.now() - row.first_at < WINDOW && row.count >= 8) return true;
  }
  return false;
}
export async function noteFailure(env, keys) {
  const d = await db(env), now = Date.now();
  for (const key of keys) {
    await d.prepare(`INSERT INTO login_failures (key, count, first_at) VALUES (?, 1, ?)
      ON CONFLICT(key) DO UPDATE SET count = CASE WHEN ? - first_at > ? THEN 1 ELSE count + 1 END, first_at = CASE WHEN ? - first_at > ? THEN ? ELSE first_at END`)
      .bind(key, now, now, WINDOW, now, WINDOW, now).run();
  }
}
export async function clearFailures(env, keys) {
  const d = await db(env);
  for (const key of keys) await d.prepare('DELETE FROM login_failures WHERE key = ?').bind(key).run();
}

// GitHub contents API: the panel saves texts and posts as commits to the site repository.
const gh = (env, path, init = {}) => {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) throw new Error('GITHUB_TOKEN или GITHUB_REPO не заданы в настройках Cloudflare.');
  return fetch(`${env.GITHUB_API || 'https://api.github.com'}/repos/${env.GITHUB_REPO}/${path}`, {
    ...init,
    headers: { authorization: `Bearer ${env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'user-agent': 'pltgroup-admin', 'x-github-api-version': '2022-11-28', ...(init.headers || {}) },
  });
};
const branch = (env) => env.GITHUB_BRANCH || 'main';
const b64encode = (bytes) => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s); };
const b64decodeText = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), (c) => c.charCodeAt(0)));

export async function ghRead(env, path) {
  const r = await gh(env, `contents/${encodeURI(path)}?ref=${branch(env)}`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub: ${r.status}`);
  const f = await r.json();
  return { sha: f.sha, text: b64decodeText(f.content || '') };
}
export async function ghList(env, dir) {
  const r = await gh(env, `contents/${encodeURI(dir)}?ref=${branch(env)}`);
  if (r.status === 404) return [];
  if (!r.ok) throw new Error(`GitHub: ${r.status}`);
  return (await r.json()).filter((f) => f.type === 'file');
}
export async function ghWrite(env, path, content, message, sha) {
  const bytes = typeof content === 'string' ? enc.encode(content) : content;
  const r = await gh(env, `contents/${encodeURI(path)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message, content: b64encode(bytes), branch: branch(env), ...(sha ? { sha } : {}) }),
  });
  if (r.status === 409 || r.status === 422) throw Object.assign(new Error('Файл успел измениться. Обновите страницу и повторите.'), { status: 409 });
  if (!r.ok) throw new Error(`GitHub: ${r.status}`);
  return (await r.json()).content.sha;
}
export async function ghDelete(env, path, message, sha) {
  const r = await gh(env, `contents/${encodeURI(path)}`, { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message, sha, branch: branch(env) }) });
  if (!r.ok && r.status !== 404) throw new Error(`GitHub: ${r.status}`);
}

export const clip = (v, n) => String(v ?? '').trim().slice(0, n);
