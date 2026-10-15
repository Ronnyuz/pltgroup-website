// HTML templates for every page. Text: src/i18n.mjs. Contacts: src/site.mjs.
import { SITE, LANGS } from './site.mjs';

// Escape HTML, then keep short words attached to the next word (no hanging prepositions).
const NB = /(^|[\s(«"])(в|и|с|к|о|у|а|я|на|не|по|за|до|от|из|для|без|или|но|что|как|мы|вы|a|an|in|on|of|to|by|va|bu)\s+/gi;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  .replace(NB, '$1$2 ').replace(NB, '$1$2 ');

const svg = (d) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const icon = {
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  copy: svg('<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>'),
  phone: svg('<path d="M6.6 3.5h3l1.5 4.2-2 1.4a12 12 0 0 0 5.8 5.8l1.4-2 4.2 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"/>'),
  telegram: svg('<path d="M21 4.5L2.9 11.4c-.9.4-.9 1.3 0 1.6l4.6 1.4 1.8 5.4c.2.6.9.8 1.4.4l2.6-2.2 4.7 3.5c.6.4 1.4.1 1.6-.6L22.3 5.8c.2-.9-.6-1.6-1.3-1.3zM8 14.2l9.6-6.9"/>'),
  whatsapp: svg('<path d="M4 20l1.2-4.2A8.5 8.5 0 1 1 8.4 19L4 20z"/><path d="M9.2 8.4c.3-.4.9-.4 1.1 0l.8 1.8-.8 1a6.4 6.4 0 0 0 2.6 2.6l1-.8 1.8.8c.4.2.4.8 0 1.1-.8.7-2 .9-3.6-.1a8.3 8.3 0 0 1-3-3.2c-.6-1.4-.5-2.5.1-3.2z"/>'),
  mail: svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>'),
};

// Logo mark: a 3x3 dot grid in the particle colours.
const DOT_COLORS = ['var(--c1)', 'var(--c1)', 'var(--c2)', 'var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c2)', 'var(--c3)', 'var(--c3)'];
const logo = `<svg class="logo" viewBox="0 0 30 30" aria-hidden="true">${DOT_COLORS.map((c, i) => `<circle cx="${5 + (i % 3) * 10}" cy="${5 + Math.floor(i / 3) * 10}" r="${i === 4 ? 4 : 3.2}" fill="${c}"/>`).join('')}</svg>`;

export const PAGES = ['home', 'services', 'process', 'prices', 'contacts'];
const FILE = { home: 'index.html', services: 'services.html', process: 'process.html', prices: 'prices.html', contacts: 'contacts.html', privacy: 'privacy.html' };
const FONTS = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&display=swap';

// Link to a page in the current language (index.html is written as the folder itself).
const href = (ctx, page) => `${ctx.root}${ctx.langPath}${page === 'home' ? '' : FILE[page]}` || './';

function head(ctx, { title, description }) {
  const t = ctx.t;
  const file = ctx.page === 'home' ? '' : FILE[ctx.page];
  const url = `${SITE.url}/${ctx.langPath}${file}`;
  return `<!doctype html>
<html lang="${t.meta.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  ${LANGS.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${SITE.url}/${l.path}${file}">`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${SITE.url}/${file}">
  <meta name="theme-color" content="#fbfbfd">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="PLT GROUP">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE.url}/assets/og.png">
  <meta property="og:locale" content="${t.meta.ogLocale}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${ctx.root}assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${ctx.root}assets/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${FONTS}">
  <link rel="stylesheet" href="${ctx.root}assets/styles.css">`;
}

const langSwitch = (ctx) => `<nav class="lang" aria-label="${esc(ctx.t.meta.langLabel)}">${LANGS.map((l) =>
  `<a href="${ctx.root}${l.path}${ctx.page === 'home' ? '' : FILE[ctx.page]}" hreflang="${l.code}" lang="${l.code}"${l.code === ctx.t.meta.code ? ' aria-current="true"' : ''}>${l.short}</a>`).join('')}</nav>`;

const navLinks = (ctx) => ['services', 'process', 'prices', 'contacts'].map((p) =>
  `<a href="${href(ctx, p)}"${ctx.page === p ? ' aria-current="page"' : ''}>${esc(ctx.t.nav[p])}</a>`).join('');

function header(ctx) {
  const t = ctx.t;
  return `<a class="skip" href="#main">${esc(t.nav.skip)}</a>
<header class="site-header" data-header>
  <div class="wrap header-row">
    <a class="brand" href="${href(ctx, 'home')}"${ctx.page === 'home' ? ' aria-current="page"' : ''}>${logo}<span>PLT GROUP</span></a>
    <nav class="nav" aria-label="${esc(t.nav.label)}">${navLinks(ctx)}</nav>
    <div class="header-end">
      ${langSwitch(ctx)}
      <a class="btn btn--small header-cta" href="${href(ctx, 'contacts')}">${esc(t.nav.cta)}</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="${esc(t.nav.menu)}" data-burger><span></span><span></span></button>
    </div>
  </div>
  <div class="menu" id="menu" data-menu hidden>
    <div class="wrap">
      <nav class="menu-nav" aria-label="${esc(t.nav.label)}"><a href="${href(ctx, 'home')}"${ctx.page === 'home' ? ' aria-current="page"' : ''}>${esc(t.nav.home)}</a>${navLinks(ctx)}</nav>
      <div class="menu-foot">${langSwitch(ctx)}<a href="mailto:${SITE.email}">${SITE.email}</a></div>
    </div>
  </div>
</header>`;
}

function footer(ctx) {
  const t = ctx.t;
  return `<footer class="site-footer">
  <div class="wrap footer-top">
    <div class="footer-brand">
      <a class="brand" href="${href(ctx, 'home')}">${logo}<span>PLT GROUP</span></a>
      <p>${esc(t.footer.tagline)}</p>
    </div>
    <nav class="footer-nav" aria-label="${esc(t.nav.label)}">${navLinks({ ...ctx, page: null })}</nav>
    <div class="footer-contacts">
      <a href="mailto:${SITE.email}">${SITE.email}</a>
      <a href="tel:${SITE.phone}">${SITE.phoneHuman}</a>
      <a href="${SITE.telegram}" rel="noopener">Telegram</a>
      <a href="${SITE.whatsapp}" rel="noopener">WhatsApp</a>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>© ${new Date().getFullYear()} PLT GROUP. ${esc(t.footer.rights)}</span>
    <a href="${href(ctx, 'privacy')}">${esc(t.footer.privacy)}</a>
    ${langSwitch(ctx)}
  </div>
</footer>
<script src="${ctx.root}assets/app.js" defer></script>
</body>
</html>
`;
}

const layout = (ctx, meta, body, extraHead = '') => `${head(ctx, meta)}${extraHead}
</head>
<body class="page-${ctx.page}">
${header(ctx)}
<main id="main">
${body}
</main>
${footer(ctx)}`;

// Inner page opening: title and lead over a slow field of particles.
const pageHead = (title, lead) => `<section class="page-head">
    <canvas class="page-dust" data-dust aria-hidden="true"></canvas>
    <div class="wrap">
      <h1>${esc(title)}</h1>
      <p class="lead">${esc(lead)}</p>
    </div>
  </section>`;

const ctaBand = (ctx) => `<section class="cta-band">
    <div class="wrap cta-grid">
      <h2>${esc(ctx.t.home.ctaTitle)}</h2>
      <p>${esc(ctx.t.home.ctaText)}</p>
      <a class="btn btn--dark" href="${href(ctx, 'contacts')}">${esc(ctx.t.home.ctaButton)}</a>
    </div>
  </section>`;

// Board: the same six requests, scattered or sorted into a table. Toggled by the visitor.
const CHAOS = [[-6, 8, -5], [18, 98, 4], [6, 176, 6], [-10, 230, -3], [16, 268, 5], [-2, 50, -7]];
function board(b) {
  return `<div class="board" data-board>
          <div class="board-cols" aria-hidden="true">${b.cols.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
          <ul class="board-field">
            ${b.items.map((it, i) => `<li class="card" style="--cx:${CHAOS[i][0]}px;--cy:${CHAOS[i][1]}px;--cr:${CHAOS[i][2]}deg;--oy:${i * 54}px;--d:${i * 50}ms">
              <span class="card-src"><i class="dot dot--${it[2]}"></i>${esc(it[0])}</span>
              <span class="card-text">${esc(it[1])}</span>
              <span class="pill pill--${it[2]}">${esc(b.status[it[2]])}</span>
            </li>`).join('\n            ')}
          </ul>
        </div>`;
}

export function home(ctx) {
  const t = ctx.t, h = t.home;
  const body = `  <section class="hero">
    <canvas class="hero-canvas" data-particles aria-hidden="true"></canvas>
    <div class="wrap hero-copy">
      <h1 class="hero-title">${esc(h.title)}</h1>
      <p class="lead">${esc(h.lead)}</p>
      <div class="hero-cta">
        <a class="btn btn--amber" href="${href(ctx, 'contacts')}">${esc(h.primary)}</a>
        <a class="btn btn--outline" href="${href(ctx, 'prices')}">${esc(h.secondary)}</a>
      </div>
      <p class="hero-note">${esc(h.note)}</p>
    </div>
  </section>

  <section class="section home-services">
    <div class="wrap">
      <div class="section-top">
        <h2>${esc(h.servicesTitle)}</h2>
        <a class="link" href="${href(ctx, 'services')}">${esc(h.more)}</a>
      </div>
      <ul class="svc-rows">
        ${t.services.items.map((s) => `<li><a class="svc-row" href="${href(ctx, 'services')}#${s.id}">
          <span class="svc-name">${esc(s.title)}</span>
          <span class="svc-short">${esc(s.short)}</span>
          <span class="svc-price">${esc(s.price)}</span>
        </a></li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="section example">
    <div class="wrap example-grid">
      <div class="example-copy">
        <h2>${esc(h.exampleTitle)}</h2>
        <p>${esc(h.exampleText)}</p>
        <button class="btn btn--amber" type="button" data-board-toggle data-on="${esc(h.exampleOn)}" data-off="${esc(h.exampleOff)}">${esc(h.exampleOn)}</button>
        <p class="small">${esc(h.exampleNote)}</p>
      </div>
      ${board(t.board)}
    </div>
  </section>

  ${ctaBand(ctx)}`;
  return layout(ctx, t.pages.home, body, `
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'PLT GROUP',
    url: `${SITE.url}/${ctx.langPath}`, logo: `${SITE.url}/assets/favicon.svg`, image: `${SITE.url}/assets/og.png`,
    description: t.pages.home.description, telephone: SITE.phone, email: SITE.email, areaServed: 'UZ',
    address: { '@type': 'PostalAddress', addressLocality: 'Tashkent', addressCountry: 'UZ' },
  })}</script>`);
}

export function services(ctx) {
  const s = ctx.t.services, l = s.labels;
  const body = `  ${pageHead(s.title, s.lead)}
  <nav class="jump wrap" aria-label="${esc(s.title)}">${s.items.map((i) => `<a href="#${i.id}">${esc(i.title)}</a>`).join('')}</nav>
  <div class="wrap svc-list">
    ${s.items.map((i) => `<article class="svc" id="${i.id}">
      <header class="svc-head">
        <h2>${esc(i.title)}</h2>
        <p><span class="label">${esc(l.for)}</span>${esc(i.for)}</p>
      </header>
      <div class="svc-body">
        <p class="svc-text">${esc(i.text)}</p>
        <h3 class="label">${esc(l.includes)}</h3>
        <ul class="ticks">${i.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>
      <dl class="svc-meta">
        <div><dt>${esc(l.price)}</dt><dd>${esc(i.price)}</dd></div>
        <div><dt>${esc(l.term)}</dt><dd>${esc(i.term)}</dd></div>
        <a class="btn btn--amber btn--small" href="${href(ctx, 'contacts')}?service=${i.id}">${esc(l.cta)}</a>
      </dl>
    </article>`).join('\n    ')}
  </div>
  ${ctaBand(ctx)}`;
  return layout(ctx, ctx.t.pages.services, body);
}

export function process(ctx) {
  const p = ctx.t.process;
  const body = `  ${pageHead(p.title, p.lead)}
  <section class="section">
    <div class="wrap">
      <ol class="steps">
        ${p.steps.map((x, i) => `<li class="step">
          <span class="step-num">${i + 1}</span>
          <div><h2>${esc(x.title)}</h2><p>${esc(x.text)}</p></div>
          <span class="step-time">${esc(x.time)}</span>
        </li>`).join('\n        ')}
      </ol>
    </div>
  </section>
  <section class="section rules">
    <div class="wrap">
      <h2>${esc(p.principlesTitle)}</h2>
      <ul class="rules-grid">${p.principles.map((r, i) => `<li><span class="rule-dot" style="--c:var(--c${i + 1})"></span><strong>${esc(r[0])}</strong><span>${esc(r[1])}</span></li>`).join('')}</ul>
    </div>
  </section>
  <section class="section">
    <div class="wrap faq-grid">
      <h2>${esc(p.faqTitle)}</h2>
      <div class="faq-list">
        ${p.faq.map((q) => `<details class="qa"><summary><span>${esc(q[0])}</span>${icon.plus}</summary><p>${esc(q[1])}</p></details>`).join('\n        ')}
      </div>
    </div>
  </section>
  ${ctaBand(ctx)}`;
  return layout(ctx, ctx.t.pages.process, body);
}

export function prices(ctx) {
  const p = ctx.t.prices, items = ctx.t.services.items;
  const body = `  ${pageHead(p.title, p.lead)}
  <section class="section">
    <div class="wrap">
      <h2 class="table-title">${esc(p.projectsTitle)}</h2>
      <div class="scroll">
        <table class="price-list">
          <thead><tr><th scope="col">${esc(p.cols.service)}</th><th scope="col">${esc(p.cols.price)}</th><th scope="col">${esc(p.cols.term)}</th></tr></thead>
          <tbody>${items.map((i) => `<tr><th scope="row"><a href="${href(ctx, 'services')}#${i.id}">${esc(i.title)}</a><span>${esc(i.short)}</span></th><td>${esc(i.price)}</td><td>${esc(i.term)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>
  </section>
  <section class="section support">
    <div class="wrap">
      <div class="section-top">
        <h2 class="table-title">${esc(p.supportTitle)}</h2>
        <p class="badge">${esc(p.supportLead)}</p>
      </div>
      <div class="scroll">
        <table class="plans">
          <thead><tr><td></td>${p.plans.map((x) => `<th scope="col"${x.featured ? ' class="is-featured"' : ''}>
            <span class="plan-name">${esc(x.name)}</span>${x.featured ? `<span class="plan-badge">${esc(p.popular)}</span>` : ''}
            <span class="plan-for">${esc(x.for)}</span>
            <span class="plan-price">${esc(x.price)}</span><span class="plan-per">${esc(p.perMonth)}</span>
          </th>`).join('')}</tr></thead>
          <tbody>${p.rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th>${r.slice(1).map((v, i) => `<td${p.plans[i].featured ? ' class="is-featured"' : ''}>${v === true ? icon.check : v === null ? `<span class="no">${esc(p.no)}</span>` : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody>
          <tfoot><tr><td></td>${p.plans.map((x) => `<td${x.featured ? ' class="is-featured"' : ''}><a class="btn btn--small ${x.featured ? 'btn--amber' : 'btn--line'}" href="${href(ctx, 'contacts')}?service=support">${esc(p.choose)}</a></td>`).join('')}</tr></tfoot>
        </table>
      </div>
      <p class="small payment">${esc(p.payment)}</p>
    </div>
  </section>
  ${ctaBand(ctx)}`;
  return layout(ctx, ctx.t.pages.prices, body);
}

export function contacts(ctx) {
  const c = ctx.t.contacts, f = ctx.t.form;
  const ids = ['', 'audit', 'sites', 'bots', 'crm', 'analytics', 'ai', 'support'];
  const body = `  <section class="section contacts">
    <div class="wrap contacts-grid">
      <div class="contacts-info">
        <h1>${esc(c.title)}</h1>
        <p class="lead">${esc(c.lead)}</p>
        <div class="mail-row">
          <a class="mail" href="mailto:${SITE.email}">${SITE.email}</a>
          <button class="copy" type="button" data-copy="${SITE.email}" data-done="${esc(c.copied)}">${icon.copy}<span>${esc(c.copy)}</span></button>
        </div>
        <ul class="channels">
          <li><a href="tel:${SITE.phone}">${icon.phone}<span>${esc(c.phone)}</span><b>${SITE.phoneHuman}</b></a></li>
          <li><a href="${SITE.telegram}" rel="noopener">${icon.telegram}<span>Telegram</span><b>${SITE.phoneHuman}</b></a></li>
          <li><a href="${SITE.whatsapp}" rel="noopener">${icon.whatsapp}<span>WhatsApp</span><b>${SITE.phoneHuman}</b></a></li>
        </ul>
        <p class="small">${esc(c.city)}</p>
      </div>
      <form class="form" data-form novalidate data-wa="${SITE.whatsappNumber}" data-intro="${esc(f.intro)}">
        <h2>${esc(f.title)}</h2>
        <div class="field"><label for="f-name">${esc(f.name)}</label><input id="f-name" name="name" autocomplete="name" required><span class="error">${esc(f.required)}</span></div>
        <div class="field"><label for="f-contact">${esc(f.contact)}</label><input id="f-contact" name="contact" autocomplete="tel" inputmode="tel" placeholder="+998" required><span class="error">${esc(f.required)}</span></div>
        <div class="field"><label for="f-service">${esc(f.service)}</label><select id="f-service" name="service">${f.services.map((x, i) => `<option value="${esc(x)}" data-id="${ids[i]}">${esc(x)}</option>`).join('')}</select></div>
        <div class="field"><label for="f-task">${esc(f.task)}</label><textarea id="f-task" name="task" rows="4" placeholder="${esc(f.taskHint)}"></textarea></div>
        <button class="btn btn--amber btn--block" type="submit">${icon.whatsapp}${esc(f.submit)}</button>
        <p class="small form-note">${esc(f.note)}</p>
      </form>
    </div>
  </section>`;
  return layout(ctx, ctx.t.pages.contacts, body);
}

export function privacy(ctx) {
  const p = ctx.t.privacy;
  const body = `  <section class="section doc">
    <div class="wrap doc-wrap">
      <h1>${esc(p.title)}</h1>
      <p class="lead">${esc(p.description)}</p>
      ${p.sections.map((x) => `<h2>${esc(x[0])}</h2>\n      <p>${esc(x[1])}</p>`).join('\n      ')}
      <p class="small">${esc(p.updated)}</p>
    </div>
  </section>`;
  return layout(ctx, { title: `${p.title} | PLT GROUP`, description: p.description }, body);
}

export function notFound(ctx) {
  const n = ctx.t.notFound;
  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(n.title)} | PLT GROUP</title><meta name="robots" content="noindex">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${FONTS}"><link rel="stylesheet" href="/assets/styles.css"></head>
<body class="page-404"><main class="nf"><div class="wrap">
<span class="nf-logo">${logo}</span>
<h1>${esc(n.title)}</h1><p class="lead">${esc(n.text)}</p><a class="btn btn--amber" href="/">${esc(n.home)}</a>
</div></main></body></html>
`;
}
