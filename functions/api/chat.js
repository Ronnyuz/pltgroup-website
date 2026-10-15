// Public: the site consultant. POST {id?, message, lang, page} -> {id, reply, saved}.
// The conversation is kept server-side and only ever appended to, so earlier turns
// (including the model's thinking blocks) go back to the API exactly as they came.
import Anthropic from '@anthropic-ai/sdk';
import { body, clip, db, fail, json, sameOrigin } from '../_lib/core.js';
import { buildSystemPrompt } from '../_lib/chat-prompt.js';

const MAX_TURNS = 30;          // visitor messages per conversation
const MAX_PER_DAY = 60;        // visitor messages per IP per day
const MAX_TOOL_ROUNDS = 3;

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
  ru: { busy: 'Консультант сейчас недоступен. Напишите нам в Telegram или WhatsApp: +998 33 111 30 10.', long: 'Диалог получился длинным. Оставьте, пожалуйста, контакт в форме на странице «Контакты» или напишите в Telegram: +998 33 111 30 10.', limit: 'На сегодня лимит сообщений исчерпан. Напишите нам в Telegram или WhatsApp: +998 33 111 30 10.', refusal: 'С этим вопросом я помочь не могу. Расскажите о вашей задаче: сайт, бот, CRM или аналитика?' },
  uz: { busy: 'Maslahatchi hozir mavjud emas. Telegram yoki WhatsApp orqali yozing: +998 33 111 30 10.', long: 'Suhbat uzun bo‘lib ketdi. Iltimos, «Aloqa» sahifasidagi shaklda kontaktingizni qoldiring yoki Telegramga yozing: +998 33 111 30 10.', limit: 'Bugungi xabarlar limiti tugadi. Telegram yoki WhatsApp orqali yozing: +998 33 111 30 10.', refusal: 'Bu savolda yordam bera olmayman. Vazifangiz haqida aytib bering: sayt, bot, CRM yoki analitika?' },
  en: { busy: 'The consultant is unavailable right now. Message us on Telegram or WhatsApp: +998 33 111 30 10.', long: 'This conversation got long. Please leave your contact on the Contacts page or message us on Telegram: +998 33 111 30 10.', limit: 'The message limit for today is reached. Message us on Telegram or WhatsApp: +998 33 111 30 10.', refusal: 'I cannot help with that. Tell me about your task: a website, a bot, CRM or analytics?' },
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
  if (!lead.name || !lead.contact) return 'Not saved: name and contact are required.';
  if (chat.lead_id) return 'Already saved earlier in this conversation.';
  const r = await d.prepare('INSERT INTO leads (name, contact, service, task, lang, page) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(lead.name, lead.contact, lead.service, lead.task, chat.lang, `${chat.page || '/'} · chat`).run();
  chat.lead_id = r.meta.last_row_id;
  return 'Saved. A manager will contact the visitor within one working day.';
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail(403, 'forbidden');
  const b = await body(request);
  const lang = ['ru', 'uz', 'en'].includes(b?.lang) ? b.lang : 'ru';
  const t = TEXT[lang];
  const message = clip(b?.message, 1000);
  if (!message) return fail(400, 'empty message');
  if (!env.ANTHROPIC_API_KEY) return json({ reply: t.busy, unavailable: true });

  const d = await db(env);
  if (await overDailyLimit(d, request.headers.get('cf-connecting-ip') || 'unknown')) return json({ id: b.id, reply: t.limit });

  let chat = /^[a-f0-9]{32}$/.test(b.id || '') ? await d.prepare('SELECT * FROM chats WHERE id = ?').bind(b.id).first() : null;
  if (chat) chat = { ...chat, messages: JSON.parse(chat.messages) };
  else chat = { id: newId(), lang, page: clip(b.page, 160), system: buildSystemPrompt(), messages: [], turns: 0, lead_id: null, isNew: true };
  if (chat.turns >= MAX_TURNS) return json({ id: chat.id, reply: t.long });

  chat.messages.push({ role: 'user', content: message });
  chat.turns += 1;

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, ...(env.ANTHROPIC_BASE_URL ? { baseURL: env.ANTHROPIC_BASE_URL } : {}) });
  // Claude Haiku 5.5 by default: fast and inexpensive. CHAT_MODEL switches to a larger model.
  const model = env.CHAT_MODEL || 'claude-haiku-5-5';
  const fallback = !model.startsWith('claude-haiku');
  let reply = '';
  let saved = false;
  try {
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
  } catch (err) {
    console.error('chat error', err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err);
    return json({ id: chat.isNew ? undefined : chat.id, reply: t.busy, unavailable: true });
  }
  if (!reply) reply = t.busy;

  const messages = JSON.stringify(chat.messages);
  if (chat.isNew) {
    await d.prepare('INSERT INTO chats (id, lang, page, system, messages, turns, lead_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(chat.id, chat.lang, chat.page, chat.system, messages, chat.turns, chat.lead_id).run();
  } else {
    await d.prepare("UPDATE chats SET messages = ?, turns = ?, lead_id = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(messages, chat.turns, chat.lead_id, chat.id).run();
  }
  return json({ id: chat.id, reply, saved });
}
