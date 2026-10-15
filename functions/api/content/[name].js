// GET /api/content/:name returns a content file; PUT {data, sha} saves it to GitHub.
// name: ru | uz | en (site texts and prices) or site (contacts).
import { body, fail, ghRead, ghWrite, json, requireUser } from '../../_lib/core.js';

const NAMES = ['ru', 'uz', 'en', 'site'];
const path = (name) => `content/${name}.json`;

// The panel may change values and the length of some lists, but not the structure the templates rely on.
// These lists are tied to the layout (board cards, three plans, form options) and keep their length.
const FIXED = ['board.cols', 'board.items', 'prices.plans', 'form.services'];
function sameShape(a, b, at = '') {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return at || 'root';
    if (FIXED.includes(at) ? b.length !== a.length : b.length > 50) return at;
    if (!a.length) return null;
    for (let i = 0; i < b.length; i++) { const bad = sameShape(a[i] ?? a[0], b[i], `${at}[${i}]`); if (bad) return bad; }
    return null;
  }
  if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object' || Array.isArray(b)) return at || 'root';
    if (Object.keys(a).sort().join() !== Object.keys(b).sort().join()) return at || 'root';
    for (const k of Object.keys(a)) { const bad = sameShape(a[k], b[k], at ? `${at}.${k}` : k); if (bad) return bad; }
    return null;
  }
  if (typeof b !== typeof a || (typeof b === 'string' && b.length > 5000)) return at;
  return null;
}

// Values the templates use in links and markup.
function checkValues(name, d) {
  if (name === 'site') return /^\+?\d{9,15}$/.test(String(d.phone).replace(/[\s()-]/g, '')) ? null : 'Проверьте номер телефона.';
  if (d.meta.code !== name) return 'Код языка менять нельзя.';
  if (d.services.items.some((i) => !/^[a-z0-9-]{2,40}$/.test(i.id))) return 'Код услуги: только латинские буквы, цифры и дефис.';
  if (d.board.items.some((i) => !['new', 'wip', 'ok'].includes(i.status))) return 'Неверный статус в примере на главной.';
  return null;
}

export async function onRequest({ request, env, params }) {
  const name = params.name;
  if (!NAMES.includes(name)) return fail(404, 'not found');
  const { user, error } = await requireUser(request, env, 'content');
  if (error) return error;
  try {
    if (request.method === 'GET') {
      const file = await ghRead(env, path(name));
      if (!file) return fail(404, 'Файл не найден.');
      return json({ data: JSON.parse(file.text), sha: file.sha });
    }
    if (request.method === 'PUT') {
      const b = await body(request);
      if (!b || !b.data || !b.sha) return fail(400, 'Нет данных.');
      const file = await ghRead(env, path(name));
      const bad = sameShape(JSON.parse(file.text), b.data);
      if (bad) return fail(400, `Неверный формат данных: ${bad}`);
      const wrong = checkValues(name, b.data);
      if (wrong) return fail(400, wrong);
      const sha = await ghWrite(env, path(name), JSON.stringify(b.data, null, 2) + '\n', `Content: ${name} (${user.login})`, b.sha);
      return json({ ok: true, sha });
    }
  } catch (e) {
    return fail(e.status || 502, e.message);
  }
  return fail(405, 'method not allowed');
}
