// GET /api/posts lists cases and news (published and drafts).
import { fail, ghList, ghRead, json, requireUser } from '../../_lib/core.js';

export async function onRequestGet({ request, env }) {
  const { error } = await requireUser(request, env, 'posts');
  if (error) return error;
  try {
    const files = (await ghList(env, 'content/posts')).filter((f) => f.name.endsWith('.json'));
    const posts = await Promise.all(files.map(async (f) => {
      const file = await ghRead(env, f.path);
      const p = JSON.parse(file.text);
      return { slug: f.name.replace(/\.json$/, ''), type: p.type, published: p.published !== false, date: p.date, title: p.title?.ru || '', cover: p.cover || '' };
    }));
    posts.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    return json({ posts });
  } catch (e) {
    return fail(e.status || 502, e.message);
  }
}
