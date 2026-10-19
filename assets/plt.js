(function () {
  var root = document.documentElement, KEY = 'plt-lang';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Language */
  function setLang(l) {
    root.lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l)); });
    document.querySelectorAll('option[data-ru]').forEach(function (o) { o.textContent = o.getAttribute('data-' + l); });
    document.querySelectorAll('[data-ph-ru]').forEach(function (f) { f.placeholder = f.getAttribute('data-ph-' + l); });
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  setLang(saved === 'uz' ? 'uz' : 'ru');

  /* Theme: light, dark or follow the system. Stored per visitor; light by default. */
  var TKEY = 'plt-theme', mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  var P = 0, mode = 'light';
  function applyTheme(m, animate) {
    mode = m;
    var dark = m === 'dark' || (m === 'auto' && mq && mq.matches);
    P = dark ? 1 : 0;
    if (animate && !reduce) { root.classList.add('theming'); setTimeout(function () { root.classList.remove('theming'); }, 400); }
    root.style.setProperty('--p', String(P));
    root.style.colorScheme = dark ? 'dark' : 'light';
    root.setAttribute('data-scheme', dark ? 'dark' : 'light');
    document.querySelectorAll('[data-theme-set]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-theme-set') === m)); });
    if (window.__pltRepaint) window.__pltRepaint();
  }
  var savedTheme = null;
  try { savedTheme = localStorage.getItem(TKEY); } catch (e) {}
  applyTheme(savedTheme === 'dark' || savedTheme === 'auto' ? savedTheme : 'light', false);
  if (mq) {
    var onSys = function () { if (mode === 'auto') applyTheme('auto', true); };
    if (mq.addEventListener) mq.addEventListener('change', onSys); else if (mq.addListener) mq.addListener(onSys);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-theme-set]');
    if (!b) return;
    var m = b.getAttribute('data-theme-set');
    try { localStorage.setItem(TKEY, m); } catch (err) {}
    applyTheme(m, true);
  });

  /* Copy + toast */
  var toast = document.createElement('div');
  toast.className = 'toast'; toast.hidden = true; toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  var timer;
  function show(msg) { toast.textContent = msg; toast.hidden = false; clearTimeout(timer); timer = setTimeout(function () { toast.hidden = true; }, 1800); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lang]');
    if (b) { setLang(b.getAttribute('data-lang')); return; }
    var c = e.target.closest('[data-copy]');
    if (!c) return;
    var uz = root.lang === 'uz';
    function fallback() {
      var el = document.getElementById(c.getAttribute('data-target'));
      if (el) { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      show(uz ? 'Matn belgilandi, nusxa oling' : 'Текст выделен, скопируйте его');
    }
    try { navigator.clipboard.writeText(c.getAttribute('data-copy')).then(function () { show(uz ? 'Nusxa olindi' : 'Скопировано'); }, fallback); }
    catch (err) { fallback(); }
  });

  /* Hero particles (pltgroup.uz): dots assemble into the word, scatter from the pointer, settle back.
     Colours run --c1 → --c2 → --c3 across the word and fade toward light as the page turns black. */
  var word = document.querySelector('[data-particles]');
  if (!word) return;
  var hex = function (v) { v = v.trim().replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(v.slice(i, i + 2), 16); }); };
  var cs = getComputedStyle(root);
  var STOPS = ['--c1', '--c2', '--c3'].map(function (n) { return hex(cs.getPropertyValue(n)); });
  var LIGHT = [242, 242, 244];
  var mixArr = function (k) {
    k = Math.min(0.999, Math.max(0, k)) * (STOPS.length - 1);
    var i = Math.floor(k), f = k - i, a = STOPS[i], b = STOPS[i + 1];
    return a.map(function (v, j) { return v + (b[j] - v) * f; });
  };
  var ctx = word.getContext('2d');
  var text = word.getAttribute('data-particles') || 'PLT';
  var W, H, ps = [], mx = -9999, my = -9999, running = false, visible = true;
  var sizeCanvas = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = word.clientWidth; H = word.clientHeight;
    word.width = W * dpr; word.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  var build = function () {
    sizeCanvas();
    if (!W || !H) return;
    var copy = word.parentElement.querySelector('.hero-copy');
    var room = Math.max(160, copy.getBoundingClientRect().top - word.getBoundingClientRect().top - 40);
    var off = document.createElement('canvas'); off.width = W; off.height = H;
    var o = off.getContext('2d');
    o.font = '800 100px Manrope, Arial, sans-serif';
    var ratio = o.measureText(text).width / 100;
    var size = Math.min((room - 76) / 0.74, (W * (W < 600 ? 0.86 : (text.length > 3 ? 0.8 : 0.62))) / ratio);
    o.font = '800 ' + size + 'px Manrope, Arial, sans-serif';
    var tw = o.measureText(text).width, x0 = (W - tw) / 2;
    var y0 = Math.max(56, (room - size * 0.74) / 2 + 20) + size * 0.74;
    o.fillStyle = '#fff'; o.fillText(text, x0, y0);
    var data = o.getImageData(0, 0, W, H).data;
    var step = W < 600 ? 6 : (text.length > 3 ? 7 : 8);
    var old = ps; ps = [];
    for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) {
      if (data[(y * W + x) * 4 + 3] > 128) {
        var p = old[ps.length] || { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0 };
        p.tx = x; p.ty = y; p.r = Math.random() < 0.25 ? 3.2 : 2.3; p.dust = false; p.a = 1;
        p.rgb = mixArr((x - x0) / tw);
        ps.push(p);
      }
    }
    for (var i = 0; i < (W < 600 ? 60 : 140); i++) ps.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: Math.random() * W, ty: Math.random() * H, dust: true, r: 1.2, a: .32, rgb: mixArr(Math.random()) });
  };
  var paint = function () {
    ctx.clearRect(0, 0, W, H);
    var t = P;
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i], c = p.rgb;
      var r = c[0] + (LIGHT[0] - c[0]) * t, g = c[1] + (LIGHT[1] - c[1]) * t, b = c[2] + (LIGHT[2] - c[2]) * t;
      ctx.fillStyle = 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ',' + p.a + ')';
      ctx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r);
    }
  };
  var frame = function () {
    if (!visible) { running = false; return; }
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      if (p.dust) { p.ty -= 0.15; if (p.ty < 0) p.ty = H; }
      var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
      if (!p.dust && d2 < 13000) { var f = (13000 - d2) / 13000 * 3.2, d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
      p.vx += (p.tx - p.x) * 0.022; p.vy += (p.ty - p.y) * 0.022; p.vx *= 0.86; p.vy *= 0.86; p.x += p.vx; p.y += p.vy;
    }
    paint();
    requestAnimationFrame(frame);
  };
  var go = function () { if (!running && !reduce) { running = true; requestAnimationFrame(frame); } };
  var heroEl = word.parentElement;
  heroEl.addEventListener('pointermove', function (e) { var r = word.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  heroEl.addEventListener('pointerleave', function () { mx = my = -9999; });
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { build(); if (reduce) settle(); }, 120); });
  var settle = function () { ps.forEach(function (p) { p.x = p.tx; p.y = p.ty; }); paint(); };
  window.__pltRepaint = function () { if (reduce && ps.length) paint(); };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) go(); }).observe(heroEl);
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
    build();
    if (reduce) settle(); else go();
  });
})();

/* Request form: saves the request in the site admin panel (/admin, Заявки) and emails it to the staff.
   FORM_TO receives every request; add colleagues to FORM_CC separated by commas.
   FormSubmit sends one confirmation email to FORM_TO before the first request is delivered. */
var FORM_TO = 'info@pltgroup.uz';
var FORM_CC = '';
/* Telegram: address of the Cloudflare Worker from worker.js. Empty = requests go to email only. */
var TG_ENDPOINT = '';
/* Company details for the footer. A company shows its block once 'name' is filled in. */
var REQUISITES = {
  group:   { name: '', inn: '', address: '' },
  digital: { name: '', inn: '', address: '' },
  agrovia: { name: '', inn: '', address: '' },
  retail:  { name: '', inn: '', address: '' }
};
(function () {
  var form = document.querySelector('[data-form]');
  if (!form) return;
  var done = document.querySelector('[data-form-done]');
  var fail = form.querySelector('[data-form-error]');
  var btn = form.querySelector('button[type="submit"]');
  var label = btn ? btn.querySelector('[data-btn-label]') : null;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.querySelector('[name="_honey"]').value) return;
    var bad = null;
    form.querySelectorAll('[required]').forEach(function (inp) {
      var b = !inp.value.trim();
      inp.closest('.field').classList.toggle('is-invalid', b);
      inp.setAttribute('aria-invalid', String(b));
      if (b && !bad) bad = inp;
    });
    if (bad) { bad.focus(); return; }
    var uz = document.documentElement.lang === 'uz';
    var v = function (id) { var el = form.querySelector('#' + id); return el ? el.value.trim() : ''; };
    var site = (document.title || 'PLT GROUP').trim();
    var data = {
      'Сайт': site,
      'Имя': v('f-name'),
      'Телефон или Telegram': v('f-contact'),
      'Что нужно': v('f-what'),
      'Комментарий': v('f-task') || '-',
      'Язык': uz ? 'узбекский' : 'русский',
      _subject: 'Заявка с сайта ' + site + ': ' + v('f-name'),
      _template: 'table',
      _captcha: 'false'
    };
    if (FORM_CC) data._cc = FORM_CC;
    if (fail) fail.hidden = true;
    btn.disabled = true;
    var before = label ? label.innerHTML : '';
    if (label) label.textContent = uz ? 'Yuborilmoqda…' : 'Отправляем…';
    var toMail = fetch('https://formsubmit.co/ajax/' + FORM_TO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (res) { if (res && (res.success === false || res.success === 'false')) throw new Error('fail'); return true; });
    var toAdmin = fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: v('f-name'), contact: v('f-contact'), service: site + ': ' + v('f-what'), task: v('f-task'), lang: uz ? 'uz' : 'ru', page: location.pathname, website: '' })
    }).then(function (r) { if (!r.ok) throw new Error(r.status); return true; });
    var toTg = TG_ENDPOINT ? fetch(TG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site: site, name: v('f-name'), contact: v('f-contact'), what: v('f-what'), comment: v('f-task'), lang: uz ? 'uz' : 'ru', _honey: '' })
    }).then(function (r) { if (!r.ok) throw new Error(r.status); return true; }) : Promise.reject('off');
    Promise.allSettled([toAdmin, toMail, toTg]).then(function (rs) {
      if (rs.some(function (x) { return x.status === 'fulfilled'; })) return true;
      throw new Error('all failed');
    })
      .then(function () {
        form.hidden = true;
        if (done) { done.hidden = false; var h = done.querySelector('h3'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); } }
      })
      .catch(function () {
        if (!fail) return;
        if (/claude/.test(location.hostname)) {
          fail.textContent = uz ? 'Bu ko‘rib chiqish rejimi: bu yerda yuborish o‘chirilgan. Saytda ariza pochtaga keladi.' : 'Это режим просмотра: здесь отправка отключена. На сайте заявка придёт на почту.';
        }
        fail.hidden = false;
      })
      .then(function () { btn.disabled = false; if (label) label.innerHTML = before; });
  });
  form.addEventListener('input', function (e) { var f = e.target.closest('.field'); if (f && e.target.value.trim()) f.classList.remove('is-invalid'); });
})();

(function () {
  var box = document.querySelector('[data-reqs]');
  if (!box || typeof REQUISITES === 'undefined') return;
  var r = REQUISITES[box.getAttribute('data-reqs')];
  if (!r || !r.name) return;
  var uz = function () { return document.documentElement.lang === 'uz'; };
  var row = function (ru, uzl, val) { return val ? '<li><span class="ru">' + ru + '</span><span class="uz">' + uzl + '</span>: ' + val.replace(/</g, '&lt;') + '</li>' : ''; };
  box.innerHTML = '<li class="label"><span class="ru">Реквизиты</span><span class="uz">Rekvizitlar</span></li><li>' + r.name.replace(/</g, '&lt;') + '</li>' +
    row('ИНН', 'STIR', r.inn) + row('Адрес', 'Manzil', r.address);
  box.hidden = false;
})();
