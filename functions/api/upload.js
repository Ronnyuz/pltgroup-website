// POST /api/upload (multipart, field "file"): saves an image to assets/uploads in the site repository.
import { fail, ghWrite, json, requireUser } from '../_lib/core.js';

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX = 3 * 1024 * 1024;

export async function onRequestPost({ request, env }) {
  const { user, error } = await requireUser(request, env, 'posts');
  if (error) return error;
  let file;
  try { file = (await request.formData()).get('file'); } catch { return fail(400, 'Файл не получен.'); }
  if (!file || typeof file === 'string') return fail(400, 'Файл не получен.');
  const ext = TYPES[file.type];
  if (!ext) return fail(400, 'Подойдут JPG, PNG или WebP.');
  if (file.size > MAX) return fail(400, 'Файл больше 3 МБ. Уменьшите изображение.');
  // The declared type comes from the browser; the first bytes show what the file really is.
  const bytes = new Uint8Array(await file.arrayBuffer());
  const starts = (...b) => b.every((x, i) => bytes[i] === x);
  const real = starts(0xff, 0xd8, 0xff) ? 'jpg' : starts(0x89, 0x50, 0x4e, 0x47) ? 'png'
    : (starts(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP') ? 'webp' : null;
  if (real !== ext) return fail(400, 'Подойдут JPG, PNG или WebP.');
  const base = String(file.name || 'image').toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'image';
  const path = `assets/uploads/${Date.now().toString(36)}-${base}.${ext}`;
  try {
    await ghWrite(env, path, bytes, `Upload ${path} (${user.login})`);
  } catch (e) {
    return fail(e.status || 502, e.message);
  }
  return json({ path });
}
