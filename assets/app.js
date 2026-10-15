// PLT GROUP — header, menu, hero word cycle, chaos→order board, section accents,
// process progress, copy email, request form.
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const accentOf = (name) => `var(--a-${name})`;
  const setAccent = (name) => name && root.style.setProperty('--accent', getComputedStyle(root).getPropertyValue(`--a-${name}`).trim() || accentOf(name));

  // Header turns solid after the top of the page.
  const header = document.querySelector('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-solid', window.scrollY > 24 || header.classList.contains('is-open'));
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu.
  const burger = document.querySelector('[data-burger]');
  const menu = document.querySelector('[data-menu]');
  const setMenu = (open) => {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    header.classList.toggle('is-open', open);
    onScroll();
  };
  burger && burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu && menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 1101px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

  // Accent follows the section in the middle of the screen.
  let current = null;
  let heroAccent = null;
  const sections = document.querySelectorAll('main > section[data-accent]');
  const apply = () => setAccent(current && current.classList.contains('hero') ? heroAccent || current.dataset.accent : current && current.dataset.accent);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { current = en.target; apply(); } });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach((s) => io.observe(s));
  }

  // Service rows recolour the page on hover.
  document.querySelectorAll('.svc[data-accent]').forEach((row) => {
    row.addEventListener('mouseenter', () => setAccent(row.dataset.accent));
    row.addEventListener('mouseleave', apply);
  });

  // Hero: cycle the coloured word.
  const swap = document.querySelector('[data-swap]');
  if (swap) {
    const words = [...swap.children];
    let i = 0;
    heroAccent = words[0].dataset.accent;
    if (!reduce && words.length > 1) {
      setInterval(() => {
        if (document.hidden) return;
        const prev = words[i];
        i = (i + 1) % words.length;
        prev.classList.remove('is-on');
        prev.classList.add('is-out');
        setTimeout(() => prev.classList.remove('is-out'), 800);
        words[i].classList.add('is-on');
        heroAccent = words[i].dataset.accent;
        if (!current || current.classList.contains('hero')) setAccent(heroAccent);
      }, 2600);
    }
  }

  // Board: scattered requests snap into an ordered table, then scatter again.
  const board = document.querySelector('[data-board]');
  if (board) {
    if (reduce) board.classList.add('is-order');
    else {
      setTimeout(() => board.classList.add('is-order'), 900);
      setInterval(() => { if (!document.hidden) board.classList.toggle('is-order'); }, 3800);
    }
  }

  // Process line fills as the section scrolls past.
  const steps = document.querySelector('[data-steps]');
  if (steps) {
    const update = () => {
      const r = steps.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.8 - r.top) / (r.height + window.innerHeight * 0.3)));
      steps.style.setProperty('--p', p.toFixed(3));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  // Copy email.
  document.querySelectorAll('[data-copy]').forEach((btn) => btn.addEventListener('click', () => {
    const label = btn.querySelector('span');
    const before = label.textContent;
    const done = () => { label.textContent = btn.dataset.done; setTimeout(() => { label.textContent = before; }, 1800); };
    const fallback = () => {
      const mail = btn.parentElement.querySelector('.mail');
      const range = document.createRange();
      range.selectNodeContents(mail);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(btn.dataset.copy).then(done, fallback);
    else fallback();
  }));

  // Buttons with data-service preselect the service in the form.
  const select = document.querySelector('[data-service-select]');
  document.querySelectorAll('[data-service]').forEach((el) => el.addEventListener('click', () => {
    if (!select) return;
    const want = el.dataset.service.toLowerCase();
    const opt = [...select.options].find((o) => o.text.toLowerCase() === want);
    if (opt) select.value = opt.value;
  }));

  // Form: validate, then open WhatsApp with a prepared message. Nothing is sent to a server.
  const form = document.querySelector('[data-form]');
  if (form) {
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
