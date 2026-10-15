// PLT GROUP — header, mobile menu, scroll reveal, request form.
(() => {
  document.documentElement.classList.add('js');

  // Header becomes solid after leaving the hero.
  const header = document.querySelector('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-solid', window.scrollY > 24);
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
    if (open) header.classList.add('is-solid'); else onScroll();
  };
  burger && burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu && menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 1081px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

  // Reveal sections as they enter the viewport.
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const siblings = [...en.target.parentElement.children].filter((c) => c.classList.contains('reveal'));
        en.target.style.transitionDelay = `${Math.min(siblings.indexOf(en.target), 5) * 70}ms`;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }

  // Buttons with data-service preselect the service in the form.
  const select = document.querySelector('[data-service-select]');
  document.querySelectorAll('[data-service]').forEach((btn) => btn.addEventListener('click', () => {
    if (!select) return;
    const want = btn.dataset.service.toLowerCase();
    const opt = [...select.options].find((o) => o.text.toLowerCase().includes(want) || want.includes(o.text.toLowerCase()));
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
