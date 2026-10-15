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

  // Hero tiles: scatter, then settle into the pattern. Runs on load and on every click.
  const tiles = document.querySelector('[data-tiles]');
  if (tiles) {
    const items = [...tiles.children];
    const rand = (min, max) => Math.round(min + Math.random() * (max - min));
    const scatter = () => items.forEach((el) => {
      el.style.setProperty('--tx', `${rand(-26, 26)}px`);
      el.style.setProperty('--ty', `${rand(-26, 26)}px`);
      el.style.setProperty('--tr', `${rand(-1, 2) * 90 + rand(-14, 14)}deg`);
      el.style.setProperty('--ts', (0.82 + Math.random() * 0.12).toFixed(2));
      el.style.setProperty('--d', `${rand(0, 260)}ms`);
    });
    const settle = () => {
      tiles.classList.remove('is-chaos');
      items.forEach((el) => ['--tx', '--ty', '--tr', '--ts'].forEach((p) => el.style.removeProperty(p)));
    };
    const play = (instant) => {
      if (instant) tiles.classList.add('no-anim');
      tiles.classList.add('is-chaos');
      scatter();
      if (instant) { tiles.getBoundingClientRect(); tiles.classList.remove('no-anim'); }
      setTimeout(settle, instant ? 450 : 900);
    };
    if (!reduce) play(true);
    tiles.addEventListener('click', () => { if (!reduce) play(false); });
  }

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

  // Request form. ?service=crm preselects the service. Opens WhatsApp with a prepared message.
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
      const label = (name) => form.querySelector(`[name="${name}"]`).closest('.field').querySelector('label').textContent;
      const lines = [form.dataset.intro, ''];
      ['name', 'contact', 'service', 'task'].forEach((k) => {
        const v = String(data.get(k) || '').trim();
        if (v) lines.push(`${label(k)}: ${v}`);
      });
      window.open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    });
    form.addEventListener('input', (e) => {
      const field = e.target.closest('.field');
      if (field && e.target.value.trim()) { field.classList.remove('is-invalid'); e.target.removeAttribute('aria-invalid'); }
    });
  }
})();
