// PLT GROUP — mobile menu, hero tiles, example board, copy email, request form.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu.
  const burger = document.querySelector('[data-burger]');
  const menu = document.querySelector('[data-menu]');
  const setMenu = (open) => {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  };
  if (burger) burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 1061px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

  // Particle palette comes from the theme colours --c1, --c2, --c3 in styles.css.
  const hex = (v) => { v = v.trim().replace('#', ''); return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)); };
  let STOPS = [];
  const readStops = () => { const cs = getComputedStyle(document.documentElement); STOPS = ['--c1', '--c2', '--c3'].map((n) => hex(cs.getPropertyValue(n))); };
  readStops();
  const mix = (k) => {
    k = Math.min(0.999, Math.max(0, k)) * (STOPS.length - 1);
    const i = Math.floor(k), f = k - i, a = STOPS[i], b = STOPS[i + 1];
    return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * f)).join(',')})`;
  };
  const sizeCanvas = (c, ctx) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = c.clientWidth, H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [W, H];
  };

  // Home hero: particles assemble into PLT, scatter from the pointer, settle back.
  const word = document.querySelector('[data-particles]');
  if (word) {
    const ctx = word.getContext('2d');
    const TEXT = word.dataset.particles || 'PLT';
    let W, H, ps = [], mx = -9999, my = -9999;
    const build = () => {
      [W, H] = sizeCanvas(word, ctx);
      const copy = word.parentElement.querySelector('.hero-copy');
      const room = Math.max(160, copy.getBoundingClientRect().top - word.getBoundingClientRect().top - 40);
      const off = document.createElement('canvas'); off.width = W; off.height = H;
      const o = off.getContext('2d');
      o.font = '800 100px Manrope, Arial, sans-serif';
      const ratio = o.measureText(TEXT).width / 100;
      const size = Math.min((room - 76) / 0.74, (W * (W < 600 ? 0.86 : (TEXT.length > 3 ? 0.8 : 0.62))) / ratio);
      o.font = `800 ${size}px Manrope, Arial, sans-serif`;
      const tw = o.measureText(TEXT).width, x0 = (W - tw) / 2;
      const y0 = Math.max(56, (room - size * 0.74) / 2 + 20) + size * 0.74;
      o.fillStyle = '#fff'; o.fillText(TEXT, x0, y0);
      const data = o.getImageData(0, 0, W, H).data;
      const step = W < 600 ? 6 : 8;
      const old = ps; ps = [];
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
        if (data[(y * W + x) * 4 + 3] > 128) {
          const p = old[ps.length] || { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0 };
          p.tx = x; p.ty = y; p.r = Math.random() < 0.25 ? 3.2 : 2.3;
          p.col = mix((x - x0) / tw);
          ps.push(p);
        }
      }
      for (let i = 0; i < (W < 600 ? 60 : 140); i++) ps.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: Math.random() * W, ty: Math.random() * H, dust: true, r: 1.2, col: mix(Math.random()).replace('rgb', 'rgba').replace(')', ',.32)') });
    };
    const paint = () => { ctx.clearRect(0, 0, W, H); for (const p of ps) { ctx.fillStyle = p.col; ctx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r); } };
    const frame = () => {
      for (const p of ps) {
        if (p.dust) { p.ty -= 0.15; if (p.ty < 0) p.ty = H; }
        const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (!p.dust && d2 < 13000) { const f = (13000 - d2) / 13000 * 3.2; const d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx += (p.tx - p.x) * 0.022; p.vy += (p.ty - p.y) * 0.022; p.vx *= 0.86; p.vy *= 0.86; p.x += p.vx; p.y += p.vy;
      }
      paint();
      requestAnimationFrame(frame);
    };
    const hero = word.parentElement;
    hero.addEventListener('pointermove', (e) => { const r = word.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mx = my = -9999; });
    window.addEventListener('resize', build);
    window.addEventListener('plt:palette', () => { readStops(); build(); if (reduce) { ps.forEach((p) => { p.x = p.tx; p.y = p.ty; }); paint(); } });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      build();
      if (reduce) { ps.forEach((p) => { p.x = p.tx; p.y = p.ty; }); paint(); } else frame();
    });
  }

  // Inner pages: a slow drift of warm particles behind the title.
  document.querySelectorAll('[data-dust]').forEach((c) => {
    const ctx = c.getContext('2d');
    let W, H, ps = [];
    const build = () => {
      [W, H] = sizeCanvas(c, ctx);
      const n = Math.round(W * H / 5200);
      ps = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 0.15 + Math.random() * 0.35, r: Math.random() < 0.2 ? 2.6 : 1.6, col: mix(Math.random()), a: 0.25 + Math.random() * 0.55 }));
    };
    const paint = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of ps) { ctx.globalAlpha = p.a * Math.min(1, p.x / (W * 0.45)); ctx.fillStyle = p.col; ctx.fillRect(p.x, p.y, p.r, p.r); }
      ctx.globalAlpha = 1;
    };
    const frame = () => { for (const p of ps) { p.y -= p.s; if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; } } paint(); requestAnimationFrame(frame); };
    window.addEventListener('resize', build);
    build();
    if (reduce) paint(); else frame();
  });

  // Example board: the visitor switches between the mess and the sorted table.
  const toggle = document.querySelector('[data-board-toggle]');
  const board = document.querySelector('[data-board]');
  if (toggle && board) {
    toggle.addEventListener('click', () => {
      const on = board.classList.toggle('is-order');
      toggle.textContent = on ? toggle.dataset.off : toggle.dataset.on;
    });
  }

  // Copy the email address.
  document.querySelectorAll('[data-copy]').forEach((btn) => btn.addEventListener('click', () => {
    const label = btn.querySelector('span');
    const before = label.textContent;
    const done = () => { label.textContent = btn.dataset.done; setTimeout(() => { label.textContent = before; }, 1800); };
    const select = () => {
      const range = document.createRange();
      range.selectNodeContents(btn.parentElement.querySelector('.mail'));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(btn.dataset.copy).then(done, select);
    else select();
  }));

  // Where the visitor came from: ?utm_source=instagram on any page is kept for the request form.
  try {
    const src = new URLSearchParams(location.search).get('utm_source');
    if (src) localStorage.setItem('plt_source', src.slice(0, 40));
  } catch (err) { /* storage blocked */ }
  const source = () => { try { return localStorage.getItem('plt_source') || ''; } catch (err) { return ''; } };

  // Request form. ?service=crm preselects the service. Saves the request, copies its text and opens our Telegram
  // (Telegram cannot prefill a message to a person, so the text goes to the clipboard).
  const form = document.querySelector('[data-form]');
  if (form) {
    const want = new URLSearchParams(location.search).get('service');
    const select = form.querySelector('select');
    const opt = want && [...select.options].find((o) => o.dataset.id === want);
    if (opt) select.value = opt.value;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstBad = null;
      form.querySelectorAll('[required]').forEach((input) => {
        const bad = !input.value.trim();
        input.closest('.field').classList.toggle('is-invalid', bad);
        input.setAttribute('aria-invalid', String(bad));
        if (bad && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); return; }
      const data = new FormData(form);
      // Keep a copy of the request for the team; Telegram opens regardless of the result.
      const lead = Object.fromEntries(['name', 'contact', 'service', 'task', 'website'].map((k) => [k, String(data.get(k) || '').trim()]));
      try {
        fetch('/api/lead', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...lead, lang: form.dataset.lang, page: location.pathname, source: source() }) }).catch(() => {});
      } catch (err) { /* old browsers */ }
      const label = (name) => form.querySelector(`[name="${name}"]`).closest('.field').querySelector('label').textContent;
      const lines = [form.dataset.intro, ''];
      ['name', 'contact', 'service', 'task'].forEach((k) => {
        const v = String(data.get(k) || '').trim();
        if (v) lines.push(`${label(k)}: ${v}`);
      });
      try { navigator.clipboard?.writeText(lines.join('\n')).catch(() => {}); } catch (err) { /* clipboard blocked */ }
      window.open(form.dataset.tg, '_blank', 'noopener');
    });
    form.addEventListener('input', (e) => {
      const field = e.target.closest('.field');
      if (field && e.target.value.trim()) { field.classList.remove('is-invalid'); e.target.removeAttribute('aria-invalid'); }
    });
  }
})();
