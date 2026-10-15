// Public: the site form saves a request here before opening WhatsApp.
import { body, clip, db, fail, json, sameOrigin } from '../_lib/core.js';

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail(403, 'forbidden');
  const b = await body(request);
  if (!b) return fail(400, 'bad request');
  if (b.website) return json({ ok: true }); // honeypot: bots fill the hidden field
  const lead = { name: clip(b.name, 120), contact: clip(b.contact, 120), service: clip(b.service, 120), task: clip(b.task, 3000), lang: clip(b.lang, 5), page: clip(b.page, 160) };
  const source = clip(b.source, 40).replace(/[^\w.-]/g, '');
  if (source) lead.page += ` · ${source}`;
  if (!lead.name || !lead.contact) return fail(400, 'name and contact are required');
  await (await db(env)).prepare('INSERT INTO leads (name, contact, service, task, lang, page) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(lead.name, lead.contact, lead.service, lead.task, lead.lang, lead.page).run();
  return json({ ok: true });
}
