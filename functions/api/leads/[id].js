// PATCH /api/leads/:id {status, note}; DELETE (owner only)
import { body, clip, db, fail, json, requireUser } from '../../_lib/core.js';

const STATUSES = ['new', 'work', 'done', 'spam'];

export async function onRequestPatch({ request, env, params }) {
  const { user, error } = await requireUser(request, env, 'leads');
  if (error) return error;
  const b = await body(request) || {};
  const d = await db(env);
  const lead = await d.prepare('SELECT * FROM leads WHERE id = ?').bind(Number(params.id)).first();
  if (!lead) return fail(404, 'Заявка не найдена.');
  const status = STATUSES.includes(b.status) ? b.status : lead.status;
  const note = b.note === undefined ? lead.note : clip(b.note, 3000);
  await d.prepare('UPDATE leads SET status = ?, note = ?, updated_by = ? WHERE id = ?').bind(status, note, user.name || user.login, lead.id).run();
  return json({ lead: { ...lead, status, note, updated_by: user.name || user.login } });
}

export async function onRequestDelete({ request, env, params }) {
  const { error } = await requireUser(request, env, 'owner');
  if (error) return error;
  await (await db(env)).prepare('DELETE FROM leads WHERE id = ?').bind(Number(params.id)).run();
  return json({ ok: true });
}
