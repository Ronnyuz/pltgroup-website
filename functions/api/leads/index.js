// GET /api/leads?status=new|work|done|spam
import { db, json, requireUser } from '../../_lib/core.js';

export async function onRequestGet({ request, env }) {
  const { error } = await requireUser(request, env, 'leads');
  if (error) return error;
  const status = new URL(request.url).searchParams.get('status');
  const d = await db(env);
  const rows = status
    ? await d.prepare('SELECT * FROM leads WHERE status = ? ORDER BY id DESC LIMIT 1000').bind(status).all()
    : await d.prepare("SELECT * FROM leads WHERE status != 'spam' ORDER BY id DESC LIMIT 1000").all();
  const counts = await d.prepare('SELECT status, COUNT(*) AS n FROM leads GROUP BY status').all();
  return json({ leads: rows.results, counts: Object.fromEntries(counts.results.map((r) => [r.status, r.n])) });
}
