// HTML templates. Text comes from src/i18n.mjs, contacts from src/site.mjs.
import { SITE, LANGS } from './site.mjs';

// Escape HTML, then keep short words and dashes attached to the next word (Russian typography).
const NB = /(^|[\s(«„"])(в|и|с|к|о|у|а|я|на|не|по|за|до|от|из|для|без|или|но|что|как|все|всё|мы|вы|их|a|an|in|on|of|to|by|va|bu)\s+/gi;
const esc = (s) => {
  let out = String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  out = out.replace(NB, '$1$2\u00a0').replace(NB, '$1$2\u00a0');
  return out.replace(/\s+—/g, '\u00a0—');
};
const svg = (d, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;

const icon = {
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  ne: svg('<path d="M7 17L17 7M9 7h8v8"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  copy: svg('<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>'),
  phone: svg('<path d="M6.6 3.5h3l1.5 4.2-2 1.4a12 12 0 0 0 5.8 5.8l1.4-2 4.2 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"/>'),
  telegram: svg('<path d="M21 4.5L2.9 11.4c-.9.4-.9 1.3 0 1.6l4.6 1.4 1.8 5.4c.2.6.9.8 1.4.4l2.6-2.2 4.7 3.5c.6.4 1.4.1 1.6-.6L22.3 5.8c.2-.9-.6-1.6-1.3-1.3zM8 14.2l9.6-6.9"/>'),
  whatsapp: svg('<path d="M4 20l1.2-4.2A8.5 8.5 0 1 1 8.4 19L4 20z"/><path d="M9.2 8.4c.3-.4.9-.4 1.1 0l.8 1.8-.8 1a6.4 6.4 0 0 0 2.6 2.6l1-.8 1.8.8c.4.2.4.8 0 1.1-.8.7-2 .9-3.6-.1a8.3 8.3 0 0 1-3-3.2c-.6-1.4-.5-2.5.1-3.2z"/>'),
};

const logo = `<svg class="logo" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" class="logo-bg"/><rect x="10" y="20" width="5" height="10" rx="1.5" class="logo-bar"/><rect x="17.5" y="14" width="5" height="16" rx="1.5" class="logo-bar"/><rect x="25" y="9" width="5" height="21" rx="1.5" class="logo-bar logo-bar--accent"/></svg>`;

const langSwitch = (ctx) => `<nav class="lang" aria-label="${esc(ctx.t.meta.langLabel)}">${LANGS.map((l) =>
  `<a href="${ctx.root}${l.path}${ctx.page === 'privacy' ? 'privacy.html' : ''}" hreflang="${l.code}" lang="${l.code}"${l.code === ctx.t.meta.code ? ' aria-current="true"' : ''}>${l.short}</a>`).join('')}</nav>`;

const FONTS = 'https://fonts.googleapis.com/css2?family=Unbounded:wght@300..800&family=Onest:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap';

function head(t, ctx, { title, description, path }) {
  const file = ctx.page === 'privacy' ? 'privacy.html' : '';
  return `<!doctype html>
<html lang="${t.meta.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${SITE.url}${path}">
  ${LANGS.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${SITE.url}/${l.path}${file}">`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${SITE.url}/${file}">
  <meta name="theme-color" content="#0d0e11">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="PLT GROUP">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${SITE.url}${path}">
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

function header(t, ctx) {
  const home = ctx.page === 'home' ? '' : `${ctx.root}${ctx.langPath}`;
  const links = ['services', 'process', 'pricing', 'faq', 'contact'].map((k) => `<a href="${home}#${k}">${esc(t.nav[k])}</a>`).join('');
  return `<a class="skip" href="#main">${esc(t.nav.skip)}</a>
<header class="site-header" data-header>
  <div class="wrap header-row">
    <a class="brand" href="${ctx.root}${ctx.langPath}" aria-label="PLT GROUP">${logo}<span>PLT<em>GROUP</em></span></a>
    <nav class="nav" aria-label="${esc(t.nav.label)}">${links}</nav>
    <div class="header-actions">
      ${langSwitch(ctx)}
      <a class="btn btn--accent btn--small header-cta" href="${home}#contact">${esc(t.nav.cta)}</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="${esc(t.nav.menu)}" data-burger><span></span><span></span></button>
    </div>
  </div>
  <div class="menu" id="menu" data-menu hidden>
    <div class="wrap menu-inner">
      <nav aria-label="${esc(t.nav.label)}">${links}</nav>
      <div class="menu-foot">
        ${langSwitch(ctx)}
        <a class="menu-mail" href="mailto:${SITE.email}">${SITE.email}</a>
      </div>
    </div>
  </div>
</header>`;
}

function footer(t, ctx) {
  return `<footer class="site-footer">
  <div class="wrap footer-row">
    <a class="brand" href="${ctx.root}${ctx.langPath}" aria-label="PLT GROUP">${logo}<span>PLT<em>GROUP</em></span></a>
    <p class="footer-tag">${esc(t.footer.tagline)}</p>
    <div class="footer-links">
      <a href="mailto:${SITE.email}">${SITE.email}</a>
      <a href="tel:${SITE.phone}">${SITE.phoneHuman}</a>
      <a href="${SITE.telegram}" rel="noopener">Telegram</a>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>© ${new Date().getFullYear()} PLT GROUP. ${esc(t.footer.rights)}</span>
    <a href="${ctx.root}${ctx.langPath}privacy.html">${esc(t.footer.privacy)}</a>
    ${langSwitch(ctx)}
  </div>
</footer>
<script src="${ctx.root}assets/app.js" defer></script>
</body>
</html>
`;
}

// Hero headline: fixed lines + one word that cycles, each word with its own accent.
function heroTitle(h) {
  const letters = (w) => [...w].map((c, i) => `<i style="--i:${i}">${esc(c)}</i>`).join('');
  const full = [...h.lines, h.words.map((w) => w[0]).join(' / '), ...h.after].join(' ');
  return `<h1 class="hero-title">
          <span class="sr">${esc(full)}</span>
          ${h.lines.map((l) => `<span class="ht-line" aria-hidden="true">${esc(l)}</span>`).join('')}
          <span class="swap" data-swap aria-hidden="true"><span class="swap-band"></span>${h.words.map((w, i) =>
            `<span class="swap-word${i === 0 ? ' is-on' : ''}" data-accent="${w[1]}">${letters(w[0])}</span>`).join('')}</span>
          ${h.after.map((l) => `<span class="ht-line" aria-hidden="true">${esc(l)}</span>`).join('')}
        </h1>`;
}

// Chaos positions (x px, y px, rotation deg) for the six board cards.
const CHAOS = [[-6, 4, -7], [26, 96, 5], [8, 176, 9], [-14, 236, -4], [30, 300, 6], [-2, 48, -11]];

function board(b) {
  return `<figure class="board" data-board aria-label="${esc(b.aria)}">
          <div class="board-top">
            <span class="board-dots"><i></i><i></i><i></i></span>
            <span class="board-state"><b class="st-chaos">${esc(b.chaos)}</b><b class="st-order">${esc(b.order)}</b></span>
          </div>
          <div class="board-cols" aria-hidden="true">${b.cols.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
          <div class="board-field">
            ${b.items.map((it, i) => `<div class="card" style="--cx:${CHAOS[i][0]}px;--cy:${CHAOS[i][1]}px;--cr:${CHAOS[i][2]}deg;--oy:${i * 54}px;--d:${i * 60}ms">
              <span class="card-src"><i class="dot dot--${it[2]}"></i>${esc(it[0])}</span>
              <span class="card-text">${esc(it[1])}</span>
              <span class="pill pill--${it[2]}">${esc(b.status[it[2]])}</span>
            </div>`).join('\n            ')}
          </div>
        </figure>`;
}

export function home(t, ctx) {
  const s = t;
  const marquee = s.marquee.map((m) => `<span>${esc(m)}</span><i></i>`).join('');
  return `${head(t, ctx, { title: s.meta.title, description: s.meta.description, path: '/' + ctx.langPath })}
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'PLT GROUP',
    url: `${SITE.url}/${ctx.langPath}`,
    logo: `${SITE.url}/assets/favicon.svg`,
    image: `${SITE.url}/assets/og.png`,
    description: s.meta.description,
    telephone: SITE.phone,
    email: SITE.email,
    areaServed: 'UZ',
    address: { '@type': 'PostalAddress', addressLocality: 'Tashkent', addressCountry: 'UZ' },
  })}</script>
</head>
<body class="page-home">
${header(t, ctx)}
<main id="main">

  <section class="hero" data-accent="coral">
    <div class="hero-bg" aria-hidden="true"></div>
    <div class="wrap hero-grid">
      <div class="hero-copy">
        ${heroTitle(s.hero)}
        <p class="hero-lead">${esc(s.hero.lead)}</p>
        <div class="hero-cta">
          <a class="btn btn--accent" href="#contact">${esc(s.hero.primary)} ${icon.arrow}</a>
          <a class="btn btn--ghost" href="#services">${esc(s.hero.secondary)}</a>
        </div>
        <ul class="chips">${s.hero.chips.map((c) => `<li>${icon.check}${esc(c)}</li>`).join('')}</ul>
      </div>
      <div class="hero-visual">${board(s.board)}</div>
    </div>
  </section>

  <div class="marquee" aria-hidden="true"><div class="marquee-track">${marquee}${marquee}</div></div>

  <section class="services" id="services" data-accent="blue" aria-labelledby="services-title">
    <div class="wrap">
      <header class="sec-head">
        <h2 id="services-title">${esc(s.services.title)}</h2>
      </header>
      <ul class="svc-list">
        ${s.services.items.map((it) => `<li>
          <a class="svc" href="#contact" data-service="${esc(it.title)}" data-accent="${it.accent}" style="--row:var(--a-${it.accent})">
            <span class="svc-title">${esc(it.title)}${it.start ? `<small>${esc(s.services.start)}</small>` : ''}</span>
            <span class="svc-text">${esc(it.text)}</span>
            <span class="svc-meta"><b>${esc(it.price)}</b><small>${esc(it.term)}</small></span>
            <span class="svc-go">${icon.ne}</span>
          </a>
        </li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="process" id="process" data-accent="violet" aria-labelledby="process-title">
    <div class="wrap">
      <header class="sec-head">
        <h2 id="process-title">${esc(s.process.title)}</h2>
      </header>
      <ol class="steps" data-steps>
        <li class="steps-line" aria-hidden="true"><i></i></li>
        ${s.process.steps.map((x, i) => `<li class="step">
          <span class="step-num">0${i + 1}</span>
          <h3>${esc(x.title)}</h3>
          <p>${esc(x.text)}</p>
          <span class="step-time">${esc(x.time)}</span>
        </li>`).join('\n        ')}
      </ol>
      <ul class="principles">
        ${s.principles.map((p) => `<li><strong>${esc(p[0])}</strong><span>${esc(p[1])}</span></li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="pricing" id="pricing" data-accent="mint" aria-labelledby="pricing-title">
    <div class="wrap">
      <header class="sec-head sec-head--row">
        <div>
          <h2 id="pricing-title">${esc(s.pricing.title)}</h2>
        </div>
        <p class="sec-lead">${esc(s.pricing.lead)}</p>
      </header>
      <div class="plans-scroll">
        <table class="plans">
          <thead>
            <tr>
              <td></td>
              ${s.pricing.plans.map((p) => `<th scope="col"${p.featured ? ' class="is-featured"' : ''}>
                <span class="plan-name">${esc(p.name)}</span>
                ${p.featured ? `<span class="plan-badge">${esc(s.pricing.popular)}</span>` : ''}
                <span class="plan-for">${esc(p.for)}</span>
                <span class="plan-price">${esc(p.price)}<small>${esc(s.pricing.perMonth)}</small></span>
              </th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${s.pricing.rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th>${r.slice(1).map((v, i) => `<td${s.pricing.plans[i].featured ? ' class="is-featured"' : ''}>${v === true ? icon.check : v === null ? '<span class="no">—</span>' : esc(v)}</td>`).join('')}</tr>`).join('\n            ')}
          </tbody>
          <tfoot>
            <tr><td></td>${s.pricing.plans.map((p) => `<td${p.featured ? ' class="is-featured"' : ''}><a class="btn ${p.featured ? 'btn--accent' : 'btn--line'} btn--small" href="#contact" data-service="${esc(s.form.services.at(-1))}">${esc(s.pricing.cta)}</a></td>`).join('')}</tr>
          </tfoot>
        </table>
      </div>
      <p class="fine">${esc(s.pricing.note)}</p>
    </div>
  </section>

  <section class="faq" id="faq" data-accent="sky" aria-labelledby="faq-title">
    <div class="wrap faq-grid">
      <header class="sec-head">
        <h2 id="faq-title">${esc(s.faq.title)}</h2>
      </header>
      <div class="faq-list">
        ${s.faq.items.map((q) => `<details class="qa">
          <summary><span>${esc(q[0])}</span>${icon.plus}</summary>
          <p>${esc(q[1])}</p>
        </details>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="contact" id="contact" data-accent="coral" aria-labelledby="contact-title">
    <div class="wrap contact-grid">
      <div class="contact-copy">
        <h2 id="contact-title">${esc(s.contact.title)}</h2>
        <p class="contact-lead">${esc(s.contact.lead)}</p>
        <div class="mail-row">
          <a class="mail" href="mailto:${SITE.email}">${SITE.email}</a>
          <button class="copy" type="button" data-copy="${SITE.email}" data-done="${esc(s.contact.copied)}">${icon.copy}<span>${esc(s.contact.copy)}</span></button>
        </div>
        <ul class="channels">
          <li><a href="tel:${SITE.phone}">${icon.phone}<span><small>${esc(s.contact.phone)}</small>${SITE.phoneHuman}</span></a></li>
          <li><a href="${SITE.telegram}" rel="noopener">${icon.telegram}<span><small>Telegram</small>${SITE.phoneHuman}</span></a></li>
          <li><a href="${SITE.whatsapp}" rel="noopener">${icon.whatsapp}<span><small>WhatsApp</small>${SITE.phoneHuman}</span></a></li>
        </ul>
        <p class="city">${esc(s.contact.city)}</p>
      </div>
      <form class="form" data-form novalidate data-wa="${SITE.whatsappNumber}" data-intro="${esc(s.form.intro)}">
        <h3>${esc(s.form.title)}</h3>
        <div class="field">
          <label for="f-name">${esc(s.form.name)}</label>
          <input id="f-name" name="name" autocomplete="name" required>
          <span class="error">${esc(s.form.required)}</span>
        </div>
        <div class="field">
          <label for="f-contact">${esc(s.form.contact)}</label>
          <input id="f-contact" name="contact" autocomplete="tel" inputmode="tel" placeholder="+998" required>
          <span class="error">${esc(s.form.required)}</span>
        </div>
        <div class="field">
          <label for="f-service">${esc(s.form.service)}</label>
          <select id="f-service" name="service" data-service-select>${s.form.services.map((x) => `<option>${esc(x)}</option>`).join('')}</select>
        </div>
        <div class="field">
          <label for="f-task">${esc(s.form.task)}</label>
          <textarea id="f-task" name="task" rows="3" placeholder="${esc(s.form.taskHint)}"></textarea>
        </div>
        <button class="btn btn--accent btn--block" type="submit">${icon.whatsapp}${esc(s.form.submit)}</button>
        <p class="form-note">${esc(s.form.note)}</p>
      </form>
    </div>
  </section>

</main>
${footer(t, ctx)}`;
}

export function privacy(t, ctx) {
  const p = t.privacy;
  return `${head(t, ctx, { title: `${p.title} — PLT GROUP`, description: p.lead, path: '/' + ctx.langPath + 'privacy.html' })}
</head>
<body class="page-doc">
${header(t, ctx)}
<main id="main" class="doc">
  <div class="wrap doc-wrap">
    <p class="eyebrow">${esc(p.eyebrow)}</p>
    <h1>${esc(p.title)}</h1>
    <p class="doc-lead">${esc(p.lead)}</p>
    ${p.sections.map((x) => `<h2>${esc(x[0])}</h2>\n    <p>${esc(x[1])}</p>`).join('\n    ')}
    <p class="doc-date">${esc(p.updated)}</p>
  </div>
</main>
${footer(t, ctx)}`;
}
