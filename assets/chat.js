// Site consultant: a chat panel that talks to /api/chat. The conversation lives on the server;
// the page keeps its id and the visible messages for this browser tab only.
(() => {
  const root = document.querySelector('[data-chat]');
  if (!root) return;
  const L = JSON.parse(root.dataset.labels || '{}');
  const lang = root.dataset.lang || 'ru';
  const KEY = 'plt_chat';
  let state = { id: null, log: [] };
  try { state = JSON.parse(sessionStorage.getItem(KEY)) || state; } catch (err) { /* storage blocked */ }
  const keep = () => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (err) { /* storage blocked */ } };

  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
  // Plain text with clickable links and line breaks; never inserted as HTML.
  const fill = (node, text) => {
    text.split(/(https?:\/\/[^\s]+|t\.me\/[^\s]+|pltgroup\.uz[^\s]*)/g).forEach((part, i) => {
      if (i % 2) {
        const a = el('a', null, part);
        a.href = part.startsWith('http') ? part : `https://${part}`;
        a.target = '_blank'; a.rel = 'noopener';
        node.append(a);
      } else node.append(part);
    });
  };

  const dots = '<svg viewBox="0 0 30 30" aria-hidden="true"><circle cx="5" cy="5" r="3.2" fill="var(--c1)"/><circle cx="15" cy="5" r="3.2" fill="var(--c1)"/><circle cx="25" cy="5" r="3.2" fill="var(--c2)"/><circle cx="5" cy="15" r="3.2" fill="var(--c1)"/><circle cx="15" cy="15" r="4" fill="var(--c2)"/><circle cx="25" cy="15" r="3.2" fill="var(--c3)"/><circle cx="5" cy="25" r="3.2" fill="var(--c2)"/><circle cx="15" cy="25" r="3.2" fill="var(--c3)"/><circle cx="25" cy="25" r="3.2" fill="var(--c3)"/></svg>';

  const launcher = el('button', 'chat-launch');
  launcher.type = 'button';
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML = dots;
  launcher.append(el('span', null, L.open));

  const panel = el('section', 'chat-panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', L.title);
  panel.hidden = true;
  const head = el('header', 'chat-head');
  const titles = el('div');
  titles.append(el('p', 'chat-title', L.title), el('p', 'chat-note', L.note));
  const close = el('button', 'chat-close');
  close.type = 'button';
  close.setAttribute('aria-label', L.close);
  close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const reset = el('button', 'chat-close');
  reset.type = 'button';
  reset.title = L.reset;
  reset.setAttribute('aria-label', L.reset);
  reset.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/></svg>';
  const tools = el('div', 'chat-tools');
  tools.append(reset, close);
  head.append(titles, tools);
  const log = el('div', 'chat-log');
  log.setAttribute('aria-live', 'polite');
  const form = el('form', 'chat-form');
  const input = el('textarea');
  input.rows = 1; input.maxLength = 1000; input.placeholder = L.placeholder;
  input.setAttribute('aria-label', L.placeholder);
  const send = el('button', 'chat-send');
  send.type = 'submit';
  send.setAttribute('aria-label', L.send);
  send.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
  form.append(input, send);
  panel.append(head, log, form);
  root.append(launcher, panel);
  root.hidden = false;

  const bubble = (who, text) => {
    const b = el('div', `chat-msg chat-msg--${who}`);
    fill(b, text);
    log.append(b);
    log.scrollTop = log.scrollHeight;
    return b;
  };
  const render = () => {
    log.replaceChildren();
    bubble('bot', L.greeting);
    state.log.forEach((m) => bubble(m.who, m.text));
  };

  const setOpen = (open) => {
    panel.hidden = !open;
    launcher.hidden = open;
    launcher.setAttribute('aria-expanded', String(open));
    root.classList.toggle('is-open', open);
    if (open) { render(); setTimeout(() => input.focus(), 50); }
  };
  launcher.addEventListener('click', () => setOpen(true));
  reset.addEventListener('click', () => { state = { id: null, log: [] }; keep(); render(); input.focus(); });
  close.addEventListener('click', () => { setOpen(false); launcher.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); launcher.focus(); } });

  const grow = () => { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 120)}px`; };
  input.addEventListener('input', grow);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });

  let busy = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    busy = true; send.disabled = true;
    input.value = ''; grow();
    state.log.push({ who: 'me', text });
    bubble('me', text);
    const typing = el('div', 'chat-msg chat-msg--bot chat-typing');
    typing.append(el('i'), el('i'), el('i'));
    log.append(typing); log.scrollTop = log.scrollHeight;
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: state.id, message: text, lang, page: location.pathname }) });
      const out = await r.json();
      if (!r.ok || !out.reply) throw new Error(out.error || 'failed');
      if (out.id) state.id = out.id;
      typing.remove();
      state.log.push({ who: 'bot', text: out.reply });
      bubble('bot', out.reply);
    } catch (err) {
      typing.remove();
      state.log.pop();
      log.lastElementChild?.remove();
      input.value = text; grow();
      bubble('sys', L.error);
    } finally {
      keep();
      busy = false; send.disabled = false;
      input.focus();
    }
  });

  // ?chat=1 in a link opens the consultant right away.
  if (new URLSearchParams(location.search).get('chat')) setOpen(true);
})();
