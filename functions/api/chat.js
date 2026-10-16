// Public: the site consultant. POST {id?, message, lang, page} -> {id, reply, saved}.
// Two engines: Cloudflare Workers AI (binding AI, free daily allowance) by default, or Claude
// when ANTHROPIC_API_KEY is set. A conversation stays on the engine it started with.
// The conversation is kept server-side and only ever appended to; for Claude, earlier turns
// (including the model's thinking blocks) go back to the API exactly as they came.
import Anthropic from '@anthropic-ai/sdk';
import { body, clip, db, fail, json, sameOrigin } from '../_lib/core.js';
import { buildSystemPrompt } from '../_lib/chat-prompt.js';

const MAX_TURNS = 30;          // visitor messages per conversation
const MAX_PER_DAY = 60;        // visitor messages per IP per day
const MAX_TOOL_ROUNDS = 3;
const WORKERS_AI_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const WORKERS_AI_HISTORY = 16; // messages sent back to the model

const TOOLS = [{
  name: 'save_lead',
  description: 'Save a request for a PLT GROUP manager to call the visitor back. Use only after the visitor has given their name and a phone number or Telegram and agreed to be contacted.',
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Visitor name as they gave it' },
      contact: { type: 'string', description: 'Phone number or Telegram username' },
      service: { type: 'string', description: 'Service they are interested in, e.g. website, Telegram bot, CRM, analytics, AI assistant, or not sure' },
      task: { type: 'string', description: 'Short summary of their business and task in the visitor\'s language' },
    },
    required: ['name', 'contact', 'service', 'task'],
    additionalProperties: false,
  },
}];

const TEXT = {
  ru: { empty: 'Пожалуйста! Если появятся вопросы, пишите.', busy: 'Консультант сейчас недоступен. Напишите нам в Telegram или WhatsApp: +998 33 111 30 10.', long: 'Диалог получился длинным. Оставьте, пожалуйста, контакт в форме на странице «Контакты» или напишите в Telegram: +998 33 111 30 10.', limit: 'На сегодня лимит сообщений исчерпан. Напишите нам в Telegram или WhatsApp: +998 33 111 30 10.', refusal: 'С этим вопросом я помочь не могу. Расскажите о вашей задаче: сайт, бот, CRM или аналитика?' },
  uz: { empty: 'Arzimaydi! Savollar bo‘lsa, yozing.', busy: 'Maslahatchi hozir mavjud emas. Telegram yoki WhatsApp orqali yozing: +998 33 111 30 10.', long: 'Suhbat uzun bo‘lib ketdi. Iltimos, «Aloqa» sahifasidagi shaklda kontaktingizni qoldiring yoki Telegramga yozing: +998 33 111 30 10.', limit: 'Bugungi xabarlar limiti tugadi. Telegram yoki WhatsApp orqali yozing: +998 33 111 30 10.', refusal: 'Bu savolda yordam bera olmayman. Vazifangiz haqida aytib bering: sayt, bot, CRM yoki analitika?' },
  en: { empty: 'You are welcome! Write if you have any questions.', busy: 'The consultant is unavailable right now. Message us on Telegram or WhatsApp: +998 33 111 30 10.', long: 'This conversation got long. Please leave your contact on the Contacts page or message us on Telegram: +998 33 111 30 10.', limit: 'The message limit for today is reached. Message us on Telegram or WhatsApp: +998 33 111 30 10.', refusal: 'I cannot help with that. Tell me about your task: a website, a bot, CRM or analytics?' },
};

const newId = () => [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');

async function overDailyLimit(d, ip) {
  const key = `${ip}:${new Date().toISOString().slice(0, 10)}`;
  await d.prepare('INSERT INTO chat_hits (key, count) VALUES (?, 1) ON CONFLICT(key) DO UPDATE SET count = count + 1').bind(key).run();
  const row = await d.prepare('SELECT count FROM chat_hits WHERE key = ?').bind(key).first();
  return row.count > MAX_PER_DAY;
}

async function saveLead(d, input, chat) {
  const lead = { name: clip(input.name, 120), contact: clip(input.contact, 120), service: clip(input.service, 120), task: clip(input.task, 3000) };
  if (!lead.contact) return 'Not saved: a phone number or Telegram is required.';
  if (chat.lead_id) return 'Already saved earlier in this conversation.';
  const r = await d.prepare('INSERT INTO leads (name, contact, service, task, lang, page) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(lead.name || '-', lead.contact, lead.service, lead.task, chat.lang, `${chat.page || '/'} · chat`).run();
  chat.lead_id = r.meta.last_row_id;
  return 'Saved. A manager will contact the visitor within one working day.';
}

async function runClaude(env, d, chat, t) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, ...(env.ANTHROPIC_BASE_URL ? { baseURL: env.ANTHROPIC_BASE_URL } : {}) });
  // Claude Haiku 5.5 by default: fast and inexpensive. CHAT_MODEL switches to a larger model.
  const model = env.CHAT_MODEL || 'claude-haiku-5-5';
  const fallback = !model.startsWith('claude-haiku');
  let reply = '';
  let saved = false;
  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const response = await client.beta.messages.create({
      model,
      max_tokens: 4000,
      // Haiku has no server-side fallback; larger models retry a declined request on another model.
      ...(fallback ? { betas: ['server-side-fallback-2026-07-01', 'thinking-binding-controls-2026-08-01'], fallbacks: 'default' } : { betas: ['thinking-binding-controls-2026-08-01'] }),
      thinking: { type: 'adaptive', block_binding: { prefix_mismatch_behavior: 'drop_block' } },
      output_config: { effort: 'low' },
      cache_control: { type: 'ephemeral' },
      system: chat.system,
      tools: TOOLS,
      messages: chat.messages,
    });
    if (response.stop_reason === 'refusal') { reply = t.refusal; break; }
    chat.messages.push({ role: 'assistant', content: response.content });
    reply = response.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim() || reply;
    const calls = response.content.filter((c) => c.type === 'tool_use');
    if (response.stop_reason !== 'tool_use' || !calls.length) break;
    // Every tool_use gets its result, so the stored history stays valid for the next turn.
    const results = [];
    for (const call of calls) {
      const out = call.name === 'save_lead' ? await saveLead(d, call.input || {}, chat) : 'Unknown tool.';
      if (out.startsWith('Saved')) saved = true;
      results.push({ type: 'tool_result', tool_use_id: call.id, content: out });
    }
    chat.messages.push({ role: 'user', content: results });
  }
  return { reply, saved };
}

// A phone number or Telegram in the visitor's message: saved as a request even if the model
// forgets to, so a promise to call back is never left without a request behind it.
const CONTACT = /(\+?998[\s-]?\(?\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2})|(\+?\d[\d\s()-]{8,}\d)|(@[a-z0-9_]{4,32})|(t\.me\/[a-z0-9_]{4,32})/i;
async function saveContactFromText(d, chat, text) {
  if (chat.lead_id) return false;
  const m = text.match(CONTACT);
  if (!m) return false;
  const said = chat.messages.filter((x) => x.role === 'user' && typeof x.content === 'string').map((x) => x.content).slice(-4).join(' / ');
  const res = await saveLead(d, { name: '', contact: m[0].trim(), service: '', task: said }, chat);
  return res.startsWith('Saved');
}

// Workers AI models answer with plain text; a request is passed as a [[LEAD|...]] line at the end.
const LEAD_LINE = /\[\[LEAD\|([^\]]*)\]\]/;
const tidy = (text) => text
  .replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#+\s*/gm, '').replace(/^\s*[*-]\s+/gm, '')
  .replace(/\s+—\s+/g, ', ').replace(/—/g, '-').trim();

async function runWorkersAI(env, d, chat, t) {
  const model = env.WORKERS_AI_MODEL || WORKERS_AI_MODEL;
  const input = { messages: [{ role: 'system', content: chat.system }, ...chat.messages.slice(-WORKERS_AI_HISTORY)], max_tokens: 700, temperature: 0.4 };
  const call = async () => (env.AI
    ? env.AI.run(model, input)
    : (await fetch(env.AI_MOCK_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model, ...input }) })).json());
  let out;
  try { out = await call(); } catch (err) { console.error('workers ai, retrying', err); out = await call(); }
  let text = String(out?.response ?? out?.choices?.[0]?.message?.content ?? '').trim();
  let saved = false;
  const m = text.match(LEAD_LINE);
  if (m) {
    const [name, contact, service, task] = m[1].split('|').map((x) => x.trim());
    saved = (await saveLead(d, { name, contact, service, task }, chat)).startsWith('Saved');
    text = text.replace(new RegExp(LEAD_LINE.source, 'g'), '').trim();
  }
  if (!saved) saved = await saveContactFromText(d, chat, chat.messages.at(-1).content);
  text = tidy(text) || t.empty;
  chat.messages.push({ role: 'assistant', content: text });
  return { reply: text, saved };
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail(403, 'forbidden');
  const b = await body(request);
  const lang = ['ru', 'uz', 'en'].includes(b?.lang) ? b.lang : 'ru';
  const t = TEXT[lang];
  const message = clip(b?.message, 1000);
  if (!message) return fail(400, 'empty message');
  const engine = env.ANTHROPIC_API_KEY ? 'claude' : (env.AI || env.AI_MOCK_URL) ? 'workers-ai' : null;
  if (!engine) return json({ reply: t.busy, unavailable: true });

  const d = await db(env);
  if (await overDailyLimit(d, request.headers.get('cf-connecting-ip') || 'unknown')) return json({ id: b.id, reply: t.limit });

  let chat = /^[a-f0-9]{32}$/.test(b.id || '') ? await d.prepare('SELECT * FROM chats WHERE id = ?').bind(b.id).first() : null;
  if (chat && chat.engine !== engine) chat = null; // the engine changed: start a fresh conversation
  if (chat) chat = { ...chat, messages: JSON.parse(chat.messages) };
  else chat = { id: newId(), engine, lang, page: clip(b.page, 160), system: buildSystemPrompt(engine === 'claude' ? 'tool' : 'marker'), messages: [], turns: 0, lead_id: null, isNew: true };
  if (chat.turns >= MAX_TURNS) return json({ id: chat.id, reply: t.long });

  chat.messages.push({ role: 'user', content: message });
  chat.turns += 1;

  let reply = '';
  let saved = false;
  try {
    ({ reply, saved } = engine === 'claude' ? await runClaude(env, d, chat, t) : await runWorkersAI(env, d, chat, t));
  } catch (err) {
    console.error('chat error', err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err);
    return json({ id: chat.isNew ? undefined : chat.id, reply: t.busy, unavailable: true });
  }
  if (!saved && engine === 'claude') saved = await saveContactFromText(d, chat, message);
  if (!reply) reply = t.busy;

  const messages = JSON.stringify(chat.messages);
  if (chat.isNew) {
    await d.prepare('INSERT INTO chats (id, engine, lang, page, system, messages, turns, lead_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(chat.id, chat.engine, chat.lang, chat.page, chat.system, messages, chat.turns, chat.lead_id).run();
  } else {
    await d.prepare("UPDATE chats SET messages = ?, turns = ?, lead_id = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(messages, chat.turns, chat.lead_id, chat.id).run();
  }
  return json({ id: chat.id, reply, saved });
}
