// PLT GROUP admin panel: requests, site texts and prices, cases and news, staff accounts.
(() => {
  const app = document.getElementById('app');
  const PERMS = { leads: 'Заявки', content: 'Тексты и цены', posts: 'Кейсы и новости' };
  const STATUS = { new: 'Новая', work: 'В работе', done: 'Готово', spam: 'Спам' };
  const LANGS = { ru: 'Русский', uz: 'O‘zbekcha', en: 'English' };
  let me = null;
  let dirty = false;

  // DOM helper: h('div', {class: 'x', onclick}, child, 'text', ...). Text is always inserted as text.
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'class') el.className = v;
      else if (k === 'value') el.value = v;
      else if (k === 'checked') el.checked = !!v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(Infinity)) if (kid !== null && kid !== undefined && kid !== false) el.append(kid.nodeType ? kid : String(kid));
    return el;
  }
  const field = (label, input, hint) => h('div', { class: 'field' }, h('label', { class: 'lbl' }, label), input, hint ? h('p', { class: 'hint' }, hint) : null);
  const logo = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    const cols = ['#1d1d1f', '#6e6e73', '#a1a1a6'];
    for (let i = 0; i < 9; i++) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', 4 + (i % 3) * 8); c.setAttribute('cy', 4 + Math.floor(i / 3) * 8); c.setAttribute('r', 2.6); c.setAttribute('fill', cols[i % 3]);
      svg.append(c);
    }
    return svg;
  };

  let toastTimer;
  function toast(text, isError) {
    const t = document.getElementById('toast');
    t.textContent = text; t.hidden = false; t.classList.toggle('is-error', !!isError);
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, isError ? 6000 : 3500);
  }

  async function api(method, url, data) {
    const init = { method, credentials: 'same-origin', headers: {} };
    if (data instanceof FormData) init.body = data;
    else if (data !== undefined) { init.body = JSON.stringify(data); init.headers['content-type'] = 'application/json'; }
    let r;
    try { r = await fetch(url, init); } catch { throw new Error('Нет связи с сервером. Проверьте интернет.'); }
    const out = await r.json().catch(() => ({}));
    if (r.status === 401 && !url.endsWith('/login')) { me = null; renderLogin(); throw new Error(out.error || 'Войдите в панель.'); }
    if (!r.ok) throw new Error(out.error || `Ошибка ${r.status}`);
    return out;
  }
  // Runs an action with a busy button and reports errors.
  async function run(btn, fn) {
    if (btn) btn.disabled = true;
    try { return await fn(); } catch (e) { toast(e.message, true); } finally { if (btn) btn.disabled = false; }
  }
  const can = (perm) => me && (me.role === 'owner' || me.perms.includes(perm));
  const fmtDate = (s) => {
    const d = new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z');
    return d.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });
  };
  const randomPassword = () => {
    const abc = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
    return [...crypto.getRandomValues(new Uint8Array(12))].map((b) => abc[b % abc.length]).join('');
  };

  window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  // Leaving a page with unsaved edits asks first; a refusal puts the address back.
  let lastHash = location.hash, ignoreHash = false;
  window.addEventListener('hashchange', () => {
    if (ignoreHash) { ignoreHash = false; return; }
    if (dirty && !confirm('Есть несохранённые изменения. Уйти без сохранения?')) { ignoreHash = true; location.hash = lastHash; return; }
    dirty = false; lastHash = location.hash;
    if (me) route();
  });

  // ---------- Login ----------
  function renderLogin() {
    const err = h('p', { class: 'err', role: 'alert' });
    const login = h('input', { class: 'input', id: 'l', name: 'login', autocomplete: 'username', autocapitalize: 'none', required: true });
    const pass = h('input', { class: 'input', id: 'p', name: 'password', type: 'password', autocomplete: 'current-password', required: true });
    const btn = h('button', { class: 'btn btn--dark', type: 'submit' }, 'Войти');
    const form = h('form', {
      onsubmit: async (e) => {
        e.preventDefault(); err.textContent = ''; btn.disabled = true;
        try { me = (await api('POST', '/api/auth/login', { login: login.value, password: pass.value })).user; route(); }
        catch (x) { err.textContent = x.message; btn.disabled = false; }
      },
    },
    h('div', { class: 'brand' }, logo(), 'PLT GROUP'),
    h('h1', null, 'Вход в панель'),
    h('p', { class: 'muted', style: 'margin-bottom:22px' }, 'Логин и пароль выдаёт владелец.'),
    field('Логин', login), field('Пароль', pass), btn, err);
    app.className = ''; app.replaceChildren(h('div', { class: 'login' }, form));
    login.focus();
  }

  // ---------- Shell ----------
  const SECTIONS = [
    { id: 'leads', title: 'Заявки', ok: () => can('leads') },
    { id: 'content', title: 'Тексты и цены', ok: () => can('content') },
    { id: 'posts', title: 'Кейсы и новости', ok: () => can('posts') },
    { id: 'users', title: 'Сотрудники', ok: () => me.role === 'owner' },
    { id: 'profile', title: 'Мой профиль', ok: () => true },
  ];
  let newCount = null;

  function shell(active, ...content) {
    const side = h('aside', { class: 'side' },
      h('a', { class: 'brand', href: '#' }, logo(), 'PLT GROUP'),
      h('nav', { class: 'nav' }, SECTIONS.filter((s) => s.ok()).map((s) => h('a', { href: `#${s.id}`, class: s.id === active ? 'on' : '', onclick: () => side.classList.remove('open') },
        s.title, s.id === 'leads' && newCount ? h('span', { class: 'count' }, newCount) : null))),
      h('div', { class: 'side-foot' },
        h('p', { class: 'who' }, h('b', null, me.name && me.name !== 'Владелец' ? me.name : me.login), me.role === 'owner' ? 'Владелец' : 'Сотрудник'),
        h('a', { href: '/', target: '_blank', rel: 'noopener' }, 'Открыть сайт ↗'),
        h('button', { class: 'btn btn--small', type: 'button', onclick: async () => { await api('POST', '/api/auth/logout').catch(() => {}); me = null; dirty = false; renderLogin(); } }, 'Выйти')));
    const top = h('div', { class: 'topbar' }, h('a', { class: 'brand', href: '#' }, logo(), 'PLT GROUP'),
      h('button', { class: 'btn btn--small', type: 'button', onclick: () => side.classList.add('open') }, 'Меню'));
    side.prepend(h('button', { class: 'btn btn--small topbar-close', type: 'button', style: 'align-self:flex-end', onclick: () => side.classList.remove('open') }, 'Закрыть'));
    app.className = '';
    app.replaceChildren(top, h('div', { class: 'shell' }, side, h('main', { class: 'main' }, ...content)));
  }
  // A section that could not load shows why, with a retry, instead of hanging on «Загрузка…».
  function loadFailed(e) {
    const main = app.querySelector('.main');
    if (!main || !me) return;
    const box = main.querySelector('p.muted:last-child');
    const msg = h('div', { class: 'empty' }, h('p', null, e.message), h('button', { class: 'btn btn--small', type: 'button', style: 'margin-top:14px', onclick: route }, 'Повторить'));
    if (box) box.replaceWith(msg); else main.append(msg);
  }
  const head = (title, text, ...actions) => h('div', { class: 'head' }, h('div', null, h('h1', null, title), text ? h('p', { class: 'muted' }, text) : null), actions.length ? h('div', { class: 'lead-actions' }, actions) : null);

  function route() {
    dirty = false;
    const [id, arg] = location.hash.slice(1).split('/');
    const allowed = SECTIONS.filter((s) => s.ok());
    const section = allowed.find((s) => s.id === id) || allowed[0];
    if (section.id !== id) history.replaceState(null, '', `#${section.id}`);
    lastHash = location.hash;
    ({ leads: viewLeads, content: viewContent, posts: arg ? (a) => viewPost(a) : viewPosts, users: viewUsers, profile: viewProfile })[section.id](arg);
  }

  // ---------- Leads ----------
  let leadFilter = 'new';
  async function viewLeads() {
    shell('leads', head('Заявки', 'Заявки из формы на сайте. Каждая заявка также приходит вам в WhatsApp.'), h('p', { class: 'muted' }, 'Загрузка…'));
    let data;
    try { data = await api('GET', `/api/leads${leadFilter === 'all' ? '' : `?status=${leadFilter}`}`); } catch (e) { loadFailed(e); return; }
    newCount = data.counts.new || 0;
    const total = Object.entries(data.counts).filter(([k]) => k !== 'spam').reduce((a, [, n]) => a + n, 0);
    const tabs = h('div', { class: 'tabs', role: 'tablist' },
      [['new', 'Новые'], ['work', 'В работе'], ['done', 'Готово'], ['all', 'Все'], ['spam', 'Спам']].map(([k, t]) =>
        h('button', { type: 'button', role: 'tab', 'aria-selected': String(leadFilter === k), class: leadFilter === k ? 'on' : '', onclick: () => { leadFilter = k; viewLeads(); } },
          t, h('span', { class: 'n' }, k === 'all' ? total : data.counts[k] || 0))));
    const list = data.leads.length
      ? h('div', { class: 'stack' }, data.leads.map(leadCard))
      : h('p', { class: 'empty' }, leadFilter === 'new' ? 'Новых заявок нет.' : 'Здесь пока пусто.');
    shell('leads', head('Заявки', 'Заявки из формы на сайте. Каждая заявка также приходит вам в WhatsApp.', h('button', { class: 'btn btn--small', type: 'button', onclick: viewLeads }, 'Обновить')),
      h('div', { style: 'margin-bottom:18px' }, tabs), list);
  }

  function contactLink(c) {
    const v = c.trim();
    if (/^@?[a-z0-9_]{4,}$/i.test(v) && /[a-z]/i.test(v)) return h('a', { class: 'lead-contact', href: `https://t.me/${v.replace('@', '')}`, target: '_blank', rel: 'noopener' }, v);
    const digits = v.replace(/\D/g, '');
    if (digits.length >= 9) {
      const full = digits.length === 9 ? '998' + digits : digits;
      return h('span', { class: 'lead-contact' }, h('a', { href: `tel:+${full}` }, v), ' · ', h('a', { href: `https://wa.me/${full}`, target: '_blank', rel: 'noopener' }, 'WhatsApp'));
    }
    return h('span', { class: 'lead-contact' }, v);
  }

  function leadCard(l) {
    const status = h('select', { class: 'input', 'aria-label': 'Статус' }, Object.entries(STATUS).map(([k, t]) => h('option', { value: k }, t)));
    status.value = l.status;
    const note = h('textarea', { class: 'input', rows: 2, placeholder: 'Заметка для команды: что обсудили, когда перезвонить' }, l.note || '');
    const save = h('button', { class: 'btn btn--small btn--dark', type: 'button' }, 'Сохранить');
    save.onclick = () => run(save, async () => {
      await api('PATCH', `/api/leads/${l.id}`, { status: status.value, note: note.value });
      toast('Сохранено'); viewLeads();
    });
    status.onchange = save.onclick;
    const del = me.role === 'owner' ? h('button', { class: 'btn btn--small btn--ghost btn--danger', type: 'button', onclick: (e) => {
      if (!confirm(`Удалить заявку от «${l.name}» навсегда?`)) return;
      run(e.currentTarget, async () => { await api('DELETE', `/api/leads/${l.id}`); toast('Заявка удалена'); viewLeads(); });
    } }, 'Удалить') : null;
    return h('article', { class: 'card lead' },
      h('div', { class: 'lead-top' },
        h('div', null, h('p', { class: 'lead-name' }, l.name, ' ', h('span', { class: `pill pill--${l.status}` }, STATUS[l.status])), contactLink(l.contact || '')),
        h('p', { class: 'lead-meta' }, fmtDate(l.created_at), l.lang ? ` · ${l.lang.toUpperCase()}` : '')),
      l.service ? h('p', null, h('b', null, 'Услуга: '), l.service) : null,
      l.task ? h('p', { class: 'lead-task' }, l.task) : null,
      note,
      h('div', { class: 'lead-actions' }, status, save, del, l.updated_by ? h('span', { class: 'lead-meta' }, `Изменил(а): ${l.updated_by}`) : null));
  }

  // ---------- Site texts and prices ----------
  const GROUPS = {
    pages: 'Заголовки страниц для поисковиков', nav: 'Меню', home: 'Главная', board: 'Пример на главной (доска заявок)',
    services: 'Услуги', process: 'Как работаем', prices: 'Цены и тарифы поддержки', contacts: 'Контакты (подписи)',
    form: 'Форма заявки', footer: 'Подвал сайта', privacy: 'Конфиденциальность', notFound: 'Страница 404', work: 'Кейсы и новости (подписи)',
  };
  const LABELS = {
    title: 'Заголовок', description: 'Описание (видно в Google)', lead: 'Подзаголовок', text: 'Текст', price: 'Цена', term: 'Срок',
    name: 'Название', for: 'Кому подходит', short: 'Коротко', includes: 'Что входит', id: 'Код для ссылок (латиница)', time: 'Длительность',
    question: 'Вопрос', answer: 'Ответ', label: 'Что входит', start: 'Тариф 1', business: 'Тариф 2', partner: 'Тариф 3', channel: 'Канал',
    status: 'Статус', items: 'Список', steps: 'Шаги', principles: 'Правила', faq: 'Вопросы и ответы', plans: 'Тарифы', rows: 'Строки таблицы тарифов',
    sections: 'Разделы', cols: 'Колонки', featured: 'Отметить как «Чаще выбирают»', primary: 'Главная кнопка', secondary: 'Вторая кнопка',
    note: 'Примечание', more: 'Ссылка «Подробнее»', cta: 'Кнопка', ctaTitle: 'Призыв: заголовок', ctaText: 'Призыв: текст', ctaButton: 'Призыв: кнопка',
    servicesTitle: 'Заголовок блока услуг', exampleTitle: 'Пример: заголовок', exampleText: 'Пример: текст', exampleOn: 'Пример: кнопка «навести порядок»',
    exampleOff: 'Пример: кнопка «вернуть»', exampleNote: 'Пример: сноска', home: 'Главная', services: 'Услуги', process: 'Как работаем', prices: 'Цены',
    contacts: 'Контакты', work: 'Кейсы', skip: 'Ссылка для экранных чтецов', menu: 'Кнопка меню', labels: 'Подписи', projectsTitle: 'Заголовок таблицы проектов',
    supportTitle: 'Заголовок поддержки', supportLead: 'Подзаголовок поддержки', popular: 'Метка популярного тарифа', perMonth: 'Подпись «в месяц»',
    choose: 'Кнопка выбора', no: 'Слово «нет» в таблице', payment: 'Условия оплаты', email: 'Почта', phone: 'Телефон', copy: 'Кнопка «скопировать»',
    copied: 'Подпись «скопировано»', city: 'Город', contact: 'Поле «контакт»', service: 'Поле «услуга»', task: 'Поле «задача»',
    taskHint: 'Подсказка в поле задачи', required: 'Ошибка «заполните поле»', submit: 'Кнопка отправки', intro: 'Первая строка сообщения в WhatsApp',
    tagline: 'Описание компании', privacy: 'Ссылка на конфиденциальность', rights: 'Права защищены', updated: 'Дата редакции',
    principlesTitle: 'Заголовок правил', faqTitle: 'Заголовок вопросов', case: 'Метка «кейс»', news: 'Метка «новость»', back: 'Ссылка назад',
    tiles: 'Подсказка к анимации', wip: 'В работе', ok: 'Готово', new: 'Новая', langLabel: 'Подпись выбора языка',
  };
  const PATH_LABELS = { 'form.services': 'Варианты в списке «Что нужно»', 'board.status': 'Названия статусов', 'board.cols': 'Колонки доски', 'prices.cols': 'Колонки таблицы' };
  const FIXED = ['board.cols', 'board.items', 'prices.plans', 'form.services'];
  const LONG = ['text', 'description', 'lead', 'answer', 'exampleText', 'payment', 'ctaText', 'taskHint', 'tagline', 'note'];
  const labelFor = (path, key) => PATH_LABELS[path] || LABELS[key] || key;
  const blank = (v) => (Array.isArray(v) ? [] : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)])) : typeof v === 'boolean' ? false : '');
  const at = (obj, path) => path.reduce((o, k) => (o == null ? undefined : o[k]), obj);

  let contentTab = 'ru';
  const refCache = {};
  async function viewContent() {
    const tab = contentTab;
    shell('content', head('Тексты и цены', 'Изменения сохраняются в репозиторий сайта. Сайт обновляется сам через 1–2 минуты.'), h('p', { class: 'muted' }, 'Загрузка…'));
    let file, ref = null;
    try {
      file = await api('GET', `/api/content/${tab}`);
      if (tab === 'uz' || tab === 'en') ref = refCache.ru || (refCache.ru = (await api('GET', '/api/content/ru')).data);
      if (tab === 'ru') refCache.ru = file.data;
    } catch (e) { loadFailed(e); return; }
    const draft = structuredClone(file.data);
    let sha = file.sha;
    const mark = () => { dirty = true; saveBtn.disabled = false; state.replaceChildren(h('span', { class: 'dirty-dot' }), 'Есть несохранённые изменения'); };
    const state = h('span', { class: 'muted small' }, 'Изменений нет');
    const saveBtn = h('button', { class: 'btn btn--dark', type: 'button', disabled: true }, 'Сохранить');
    saveBtn.onclick = () => run(saveBtn, async () => {
      const out = await api('PUT', `/api/content/${tab}`, { data: draft, sha });
      sha = out.sha; dirty = false; saveBtn.disabled = true;
      if (tab === 'ru') refCache.ru = structuredClone(draft);
      state.textContent = 'Сохранено. Сайт обновится через 1–2 минуты.';
      toast('Сохранено. Сайт обновится через 1–2 минуты.');
    });
    const tabs = h('div', { class: 'tabs' }, [...Object.entries(LANGS), ['site', 'Контакты']].map(([k, t]) =>
      h('button', { type: 'button', class: k === tab ? 'on' : '', onclick: () => { if (dirty && !confirm('Есть несохранённые изменения. Переключиться без сохранения?')) return; dirty = false; contentTab = k; viewContent(); } }, t)));

    // Builds inputs for any value of the content file. path: array of keys; set writes into draft.
    function node(path, key) {
      const value = at(draft, path), refValue = ref ? at(ref, path) : undefined, dotted = path.filter((p) => typeof p === 'string').join('.');
      const label = labelFor(dotted, key);
      if (typeof value === 'boolean') {
        const box = h('input', { type: 'checkbox', checked: value, onchange: () => { at(draft, path.slice(0, -1))[key] = box.checked; mark(); } });
        return h('div', { class: 'field' }, h('label', { class: 'check' }, box, label));
      }
      if (typeof value === 'string') {
        const parent = () => at(draft, path.slice(0, -1));
        const set = (v) => { parent()[path[path.length - 1]] = v; mark(); };
        let input;
        if (path[0] === 'board' && key === 'status') {
          input = h('select', { class: 'input', onchange: () => set(input.value) }, ['new', 'wip', 'ok'].map((s) => h('option', { value: s }, draft.board.status[s])));
          input.value = value;
        } else if (LONG.includes(key) || value.length > 90) {
          input = h('textarea', { class: 'input', rows: Math.min(8, Math.max(2, Math.ceil(value.length / 90))), oninput: () => set(input.value) }, value);
        } else input = h('input', { class: 'input', value, oninput: () => set(input.value) });
        const hint = path[0] === 'prices' && ['start', 'business', 'partner'].includes(key) ? '+ значит галочка, - значит «нет», или впишите свой текст' : null;
        return h('div', { class: 'field' }, h('label', { class: 'lbl' }, label), input,
          hint ? h('p', { class: 'hint' }, hint) : null,
          typeof refValue === 'string' && refValue && !(path[0] === 'board' && key === 'status') ? h('p', { class: 'ref' }, refValue) : null);
      }
      if (Array.isArray(value)) {
        const fixed = FIXED.includes(dotted);
        const wrap = h('div', { class: 'sub' }, h('p', { class: 'list-title' }, label));
        const items = h('div');
        const draw = () => {
          items.replaceChildren(...at(draft, path).map((item, i) => {
            const remove = fixed ? null : h('button', { class: 'btn btn--small btn--ghost btn--danger', type: 'button', onclick: () => { if (!confirm('Удалить этот пункт?')) return; at(draft, path).splice(i, 1); mark(); draw(); } }, 'Удалить');
            const up = fixed || i === 0 ? null : h('button', { class: 'btn btn--small btn--ghost', type: 'button', title: 'Выше', onclick: () => { const a = at(draft, path); [a[i - 1], a[i]] = [a[i], a[i - 1]]; mark(); draw(); } }, '↑');
            if (typeof item === 'string') {
              const input = h('input', { class: 'input', value: item, oninput: () => { at(draft, path)[i] = input.value; mark(); } });
              const r = Array.isArray(refValue) ? refValue[i] : null;
              return h('div', { class: 'field' }, h('div', { style: 'display:flex;gap:8px' }, input, up, remove), r ? h('p', { class: 'ref' }, r) : null);
            }
            const title = item.title || item.name || item.question || item.label || item.channel || '';
            return h('div', { class: 'item' }, h('div', { class: 'item-head' }, h('span', null, `${i + 1}. ${title}`.slice(0, 80)), h('span', null, up, remove)),
              Object.keys(item).map((k) => node([...path, i, k], k)));
          }));
        };
        draw();
        wrap.append(items);
        if (!fixed) wrap.append(h('button', { class: 'btn btn--small', type: 'button', onclick: () => { const a = at(draft, path); a.push(blank(a[0] ?? '')); mark(); draw(); } }, '+ Добавить'));
        return wrap;
      }
      if (value && typeof value === 'object') {
        const kids = Object.keys(value).map((k) => node([...path, k], k));
        return path.length > 1 ? h('div', { class: 'sub' }, h('p', { class: 'list-title' }, label), kids) : kids;
      }
      return null;
    }

    let body;
    if (tab === 'site') {
      body = h('div', { class: 'card' },
        h('p', { class: 'note-box' }, 'Эти контакты общие для всех языков. Номер WhatsApp пишите только цифрами с кодом страны, например 998331113010.'),
        field('Почта', h('input', { class: 'input', type: 'email', value: draft.email, oninput: (e) => { draft.email = e.target.value; mark(); } })),
        field('Телефон для звонка', h('input', { class: 'input', value: draft.phone, oninput: (e) => { draft.phone = e.target.value; mark(); } }), 'С кодом страны: +998331113010'),
        field('Телефон как его видно на сайте', h('input', { class: 'input', value: draft.phoneHuman, oninput: (e) => { draft.phoneHuman = e.target.value; mark(); } }), 'Например: +998 33 111 30 10'),
        field('Номер WhatsApp (сюда приходят заявки)', h('input', { class: 'input', value: draft.whatsappNumber, inputmode: 'numeric', oninput: (e) => { draft.whatsappNumber = e.target.value; mark(); } })),
        field('Ссылка Telegram', h('input', { class: 'input', value: draft.telegram, oninput: (e) => { draft.telegram = e.target.value; mark(); } }), 'Например: https://t.me/pltgroup'));
    } else {
      body = h('div', null,
        tab !== 'ru' ? h('p', { class: 'note-box' }, 'Под каждым полем серым показан русский текст, чтобы было удобно переводить. Цены на каждом языке задаются отдельно.') : null,
        Object.keys(GROUPS).filter((g) => draft[g]).map((g, i) => h('details', { class: 'group', open: i === 0 && tab === 'ru' ? true : null },
          h('summary', null, GROUPS[g]), h('div', { class: 'group-body' }, node([g], g)))));
    }
    shell('content', head('Тексты и цены', 'Изменения сохраняются в репозиторий сайта. Сайт обновляется сам через 1–2 минуты.'),
      h('div', { class: 'editor-bar' }, tabs, h('div', { class: 'lead-actions' }, state, saveBtn)), body);
  }

  // ---------- Cases and news ----------
  async function viewPosts() {
    shell('posts', head('Кейсы и новости', 'Раздел «Кейсы» появляется в меню сайта, как только опубликована первая запись.'), h('p', { class: 'muted' }, 'Загрузка…'));
    let data;
    try { data = await api('GET', '/api/posts'); } catch (e) { loadFailed(e); return; }
    const add = h('a', { class: 'btn btn--dark', href: '#posts/new' }, '+ Новая запись');
    const list = data.posts.length ? h('div', { class: 'stack' }, data.posts.map((p) => h('div', { class: 'card post-row' },
      h('span', { class: 'thumb', style: p.cover ? `background-image:url('/${p.cover}')` : null }),
      h('div', null, h('p', { style: 'font-weight:700' }, p.title || p.slug),
        h('p', { class: 'lead-meta' }, p.type === 'news' ? 'Новость' : 'Кейс', p.date ? ` · ${p.date}` : '', ' · ', p.published ? 'опубликовано' : h('b', null, 'черновик'))),
      h('a', { class: 'btn btn--small', href: `#posts/${p.slug}` }, 'Изменить'))))
      : h('p', { class: 'empty' }, 'Записей пока нет. Добавьте первый кейс: что было у клиента, что сделали, какой результат.');
    shell('posts', head('Кейсы и новости', 'Раздел «Кейсы» появляется в меню сайта, как только опубликована первая запись.', add), list);
  }

  const TRANSLIT = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h' };
  const slugify = (s) => [...s.toLowerCase()].map((c) => TRANSLIT[c] ?? c).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

  async function viewPost(slug) {
    const isNew = slug === 'new';
    shell('posts', head(isNew ? 'Новая запись' : 'Запись'), h('p', { class: 'muted' }, 'Загрузка…'));
    let post = { type: 'case', published: false, date: new Date().toISOString().slice(0, 10), client: '', cover: '', title: { ru: '', uz: '', en: '' }, summary: { ru: '', uz: '', en: '' }, body: { ru: '', uz: '', en: '' } };
    let sha = null;
    if (!isNew) {
      try { const out = await api('GET', `/api/posts/${slug}`); post = out.post; sha = out.sha; } catch (e) { loadFailed(e); return; }
    }
    const mark = () => { dirty = true; };
    const type = h('select', { class: 'input', onchange: () => { post.type = type.value; mark(); } }, h('option', { value: 'case' }, 'Кейс'), h('option', { value: 'news' }, 'Новость'));
    type.value = post.type;
    const date = h('input', { class: 'input', type: 'date', value: post.date, oninput: () => { post.date = date.value; mark(); } });
    const client = h('input', { class: 'input', value: post.client, placeholder: 'Например: сеть аптек, Ташкент', oninput: () => { post.client = client.value; mark(); } });
    let slugTouched = !isNew;
    const slugInput = h('input', { class: 'input', value: isNew ? '' : slug, disabled: !isNew, placeholder: 'crm-dlya-distributora', oninput: () => { slugTouched = true; mark(); } });
    const published = h('input', { type: 'checkbox', checked: post.published, onchange: () => { post.published = published.checked; mark(); } });

    const preview = h('div', { class: 'cover-box' });
    const drawCover = (src) => {
      preview.replaceChildren(...[
        post.cover ? h('img', { src: src || `/${post.cover}`, alt: '' }) : h('span', { class: 'muted small' }, 'Обложки нет'),
        h('label', { class: 'btn btn--small' }, post.cover ? 'Заменить' : 'Загрузить картинку', fileInput),
        post.cover ? h('button', { class: 'btn btn--small btn--ghost btn--danger', type: 'button', onclick: () => { post.cover = ''; mark(); drawCover(); } }, 'Убрать') : null].filter(Boolean));
    };
    const fileInput = h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', hidden: true, onchange: () => {
      const f = fileInput.files[0];
      if (!f) return;
      const fd = new FormData(); fd.append('file', f);
      run(null, async () => {
        toast('Загружаю картинку…');
        const out = await api('POST', '/api/upload', fd);
        post.cover = out.path; mark(); drawCover(URL.createObjectURL(f)); toast('Картинка загружена');
      });
      fileInput.value = '';
    } });
    drawCover();

    let lang = 'ru';
    const langBox = h('div');
    const drawLang = () => {
      const t = h('input', { class: 'input', value: post.title[lang], oninput: () => { post.title[lang] = t.value; if (lang === 'ru' && !slugTouched) slugInput.value = slugify(t.value); mark(); } });
      const s = h('textarea', { class: 'input', rows: 2, oninput: () => { post.summary[lang] = s.value; mark(); } }, post.summary[lang]);
      const b = h('textarea', { class: 'input', rows: 14, oninput: () => { post.body[lang] = b.value; mark(); } }, post.body[lang]);
      langBox.replaceChildren(...[
        h('div', { class: 'tabs', style: 'margin-bottom:16px' }, Object.entries(LANGS).map(([k, n]) => h('button', { type: 'button', class: k === lang ? 'on' : '', onclick: () => { lang = k; drawLang(); } }, n))),
        lang !== 'ru' ? h('p', { class: 'note-box' }, 'Если оставить перевод пустым, на этом языке покажется русский текст.') : null,
        field('Заголовок', t, lang === 'ru' ? 'Обязательно на русском' : null),
        field('Коротко (видно в списке)', s),
        field('Текст', b, 'Абзацы разделяйте пустой строкой.')].filter(Boolean));
    };
    drawLang();

    const save = h('button', { class: 'btn btn--dark', type: 'button' }, 'Сохранить');
    save.onclick = () => run(save, async () => {
      const s = isNew ? slugify(slugInput.value || post.title.ru) : slug;
      if (!post.title.ru.trim()) throw new Error('Заполните заголовок на русском.');
      if (!s) throw new Error('Укажите адрес страницы латиницей.');
      const out = await api('PUT', `/api/posts/${s}`, { post, sha });
      dirty = false; sha = out.sha;
      toast(post.published ? 'Сохранено. На сайте появится через 1–2 минуты.' : 'Черновик сохранён.');
      if (isNew) location.hash = `#posts/${s}`;
    });
    const del = isNew ? null : h('button', { class: 'btn btn--ghost btn--danger', type: 'button' }, 'Удалить');
    if (del) del.onclick = () => {
      if (!confirm('Удалить запись с сайта?')) return;
      run(del, async () => { await api('DELETE', `/api/posts/${slug}`); dirty = false; toast('Запись удалена'); location.hash = '#posts'; });
    };

    shell('posts', head(isNew ? 'Новая запись' : post.title.ru || slug, null, h('a', { class: 'btn', href: '#posts' }, '← Все записи'), del, save),
      h('div', { class: 'stack' },
        h('div', { class: 'card' },
          h('div', { class: 'grid3' }, field('Тип', type), field('Дата', date), field('Клиент', client, 'Можно без названия компании')),
          field('Адрес страницы', slugInput, isNew ? 'Заполнится сам по заголовку. Потом его изменить нельзя.' : `pltgroup.uz/work/${slug}.html`),
          h('div', { class: 'field' }, h('label', { class: 'lbl' }, 'Обложка'), preview, h('p', { class: 'hint' }, 'JPG, PNG или WebP до 3 МБ, лучше горизонтальная.')),
          h('label', { class: 'check' }, published, 'Опубликовать на сайте')),
        h('div', { class: 'card' }, langBox)));
  }

  // ---------- Staff ----------
  async function viewUsers() {
    shell('users', head('Сотрудники'), h('p', { class: 'muted' }, 'Загрузка…'));
    let data;
    try { data = await api('GET', '/api/users'); } catch (e) { loadFailed(e); return; }
    const permBoxes = (perms, onchange) => h('div', { class: 'perms' }, Object.entries(PERMS).map(([k, t]) => {
      const box = h('input', { type: 'checkbox', checked: perms.includes(k), onchange: () => onchange(k, box.checked) });
      return h('label', { class: 'check' }, box, t);
    }));

    // New account
    const nf = { name: '', login: '', password: randomPassword(), perms: ['leads'] };
    const nName = h('input', { class: 'input', placeholder: 'Азиз Каримов', oninput: () => { nf.name = nName.value; } });
    const nLogin = h('input', { class: 'input', placeholder: 'aziz', autocapitalize: 'none', oninput: () => { nf.login = nLogin.value; } });
    const nPass = h('input', { class: 'input', value: nf.password, oninput: () => { nf.password = nPass.value; } });
    const create = h('button', { class: 'btn btn--dark', type: 'button' }, 'Создать доступ');
    create.onclick = () => run(create, async () => {
      await api('POST', '/api/users', nf);
      prompt('Доступ создан. Передайте сотруднику логин и пароль (скопируйте):', `pltgroup.uz/admin  логин: ${nf.login.toLowerCase()}  пароль: ${nf.password}`);
      viewUsers();
    });
    const createCard = h('div', { class: 'card' }, h('h2', { style: 'margin-bottom:16px' }, 'Новый сотрудник'),
      h('div', { class: 'grid3' }, field('Имя', nName), field('Логин', nLogin, 'Латиница, от 3 символов'),
        field('Пароль', nPass, 'Не короче 8 символов. Сотрудник сможет сменить его сам.')),
      h('p', { class: 'lbl' }, 'Что ему доступно'),
      permBoxes(nf.perms, (k, on) => { nf.perms = on ? [...nf.perms, k] : nf.perms.filter((p) => p !== k); }),
      create);

    const rows = data.users.map((u) => {
      if (u.role === 'owner') {
        return h('div', { class: 'card user-row' }, h('div', null, h('p', { style: 'font-weight:700' }, u.name || u.login), h('p', { class: 'lead-meta' }, `${u.login} · владелец, доступ ко всему`)));
      }
      const patch = (data, msg) => run(null, async () => { await api('PATCH', `/api/users/${u.id}`, data); toast(msg); viewUsers(); });
      const perms = [...u.perms];
      return h('div', { class: `card${u.active ? '' : ' off'}` },
        h('div', { class: 'user-row' },
          h('div', null, h('p', { style: 'font-weight:700' }, u.name || u.login, u.active ? '' : ' (отключён)'), h('p', { class: 'lead-meta' }, `логин: ${u.login}`)),
          h('div', { class: 'lead-actions' },
            h('button', { class: 'btn btn--small', type: 'button', onclick: () => {
              const p = prompt(`Новый пароль для ${u.login} (не короче 8 символов):`, randomPassword());
              if (p) patch({ password: p }, `Пароль изменён. Новый пароль: ${p}`);
            } }, 'Сменить пароль'),
            h('button', { class: 'btn btn--small', type: 'button', onclick: () => patch({ active: !u.active }, u.active ? 'Доступ отключён' : 'Доступ включён') }, u.active ? 'Отключить' : 'Включить'),
            h('button', { class: 'btn btn--small btn--ghost btn--danger', type: 'button', onclick: () => {
              if (confirm(`Удалить сотрудника ${u.name || u.login}? Его записи в заявках останутся.`)) run(null, async () => { await api('DELETE', `/api/users/${u.id}`); toast('Сотрудник удалён'); viewUsers(); });
            } }, 'Удалить'))),
        permBoxes(perms, (k, on) => patch({ perms: on ? [...perms, k] : perms.filter((p) => p !== k) }, 'Доступ обновлён')));
    });
    shell('users', head('Сотрудники', 'Только вы создаёте доступы и решаете, что каждому можно. Отключённый сотрудник сразу теряет вход.'),
      h('div', { class: 'stack' }, createCard, h('h2', { style: 'margin-top:16px' }, 'Доступы'), rows));
  }

  // ---------- Profile ----------
  function viewProfile() {
    const cur = h('input', { class: 'input', type: 'password', autocomplete: 'current-password' });
    const next = h('input', { class: 'input', type: 'password', autocomplete: 'new-password' });
    const again = h('input', { class: 'input', type: 'password', autocomplete: 'new-password' });
    const btn = h('button', { class: 'btn btn--dark', type: 'submit' }, 'Сменить пароль');
    const form = h('form', { class: 'card', style: 'max-width:440px', onsubmit: (e) => {
      e.preventDefault();
      if (next.value !== again.value) { toast('Новые пароли не совпадают.', true); return; }
      run(btn, async () => { await api('POST', '/api/auth/password', { current: cur.value, next: next.value }); form.reset(); toast('Пароль изменён. На других устройствах нужно войти заново.'); });
    } }, h('h2', { style: 'margin-bottom:16px' }, 'Смена пароля'),
    field('Текущий пароль', cur), field('Новый пароль', next, 'Не короче 8 символов'), field('Повторите новый пароль', again), btn);
    const pName = h('input', { class: 'input', value: me.name === 'Владелец' ? '' : me.name, placeholder: 'Как вас называть в панели' });
    const pLogin = h('input', { class: 'input', value: me.login, autocapitalize: 'none', autocomplete: 'username' });
    const pCur = h('input', { class: 'input', type: 'password', autocomplete: 'current-password' });
    const pBtn = h('button', { class: 'btn btn--dark', type: 'submit' }, 'Сохранить');
    const profile = h('form', { class: 'card', style: 'max-width:440px', onsubmit: (e) => {
      e.preventDefault();
      run(pBtn, async () => {
        me = (await api('POST', '/api/auth/profile', { login: pLogin.value, name: pName.value, current: pCur.value })).user;
        toast(`Сохранено. Ваш логин теперь: ${me.login}`); viewProfile();
      });
    } }, h('h2', { style: 'margin-bottom:16px' }, 'Логин и имя'),
    field('Имя', pName), field('Логин', pLogin, 'Латиница, цифры, точка или дефис, от 3 символов'), field('Текущий пароль', pCur, 'Для подтверждения'), pBtn);
    shell('profile', head('Мой профиль', `${me.name && me.name !== 'Владелец' ? me.name + ' · ' : ''}логин ${me.login}`), h('div', { class: 'stack' }, profile, form));
  }

  // ---------- Start ----------
  api('GET', '/api/auth/me').then((out) => {
    me = out.user;
    if (can('leads')) api('GET', '/api/leads?status=new').then((d) => { newCount = d.counts.new || 0; }).catch(() => {});
    route();
  }).catch(() => { if (!me) renderLogin(); });
})();
