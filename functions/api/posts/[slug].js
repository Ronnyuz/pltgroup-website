// GET/PUT/DELETE /api/posts/:slug. A post is content/posts/<slug>.json in the site repository.
import { body, clip, fail, ghDelete, ghRead, ghWrite, json, requireUser } from '../../_lib/core.js';

const LANGS = ['ru', 'uz', 'en'];
const validSlug = (s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) && s.length <= 80;
const path = (slug) => `content/posts/${slug}.json`;
const texts = (v, n) => Object.fromEntries(LANGS.map((l) => [l, clip(v?.[l], n)]));

function clean(slug, b) {
  const post = {
    slug,
    type: b.type === 'news' ? 'news' : 'case',
    published: !!b.published,
    date: /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : new Date().toISOString().slice(0, 10),
    client: clip(b.client, 120),
    cover: /^assets\/uploads\/[a-z0-9._-]+$/.test(b.cover || '') ? b.cover : '',
    title: texts(b.title, 200),
    summary: texts(b.summary, 600),
    body: texts(b.body, 20000),
  };
  if (!post.title.ru) return { error: 'Заполните заголовок на русском.' };
  return { post };
}

export async function onRequest({ request, env, params }) {
  const slug = String(params.slug || '');
  if (!validSlug(slug)) return fail(400, 'Адрес может содержать только латинские буквы, цифры и дефис.');
  const { user, error } = await requireUser(request, env, 'posts');
  if (error) return error;
  try {
    const file = await ghRead(env, path(slug));
    if (request.method === 'GET') {
      if (!file) return fail(404, 'Запись не найдена.');
      return json({ post: JSON.parse(file.text), sha: file.sha });
    }
    if (request.method === 'PUT') {
      const b = await body(request) || {};
      // A new post must not overwrite an existing one; an edit must carry the sha it was loaded with.
      if (file && b.sha !== file.sha) return fail(409, b.sha ? 'Запись успела измениться. Обновите страницу.' : 'Запись с таким адресом уже есть.');
      const { post, error: bad } = clean(slug, b.post || {});
      if (bad) return fail(400, bad);
      const sha = await ghWrite(env, path(slug), JSON.stringify(post, null, 2) + '\n', `${file ? 'Update' : 'Add'} post: ${slug} (${user.login})`, file?.sha);
      return json({ ok: true, sha, post });
    }
    if (request.method === 'DELETE') {
      if (file) await ghDelete(env, path(slug), `Remove post: ${slug} (${user.login})`, file.sha);
      return json({ ok: true });
    }
  } catch (e) {
    return fail(e.status || 502, e.message);
  }
  return fail(405, 'method not allowed');
}
