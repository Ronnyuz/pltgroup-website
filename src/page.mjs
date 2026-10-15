// HTML template for the home page. Text comes from src/i18n.mjs.
import { SITE, LANGS } from './site.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const icon = {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h3l1.5 4.2-2 1.4a12 12 0 0 0 5.8 5.8l1.4-2 4.2 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4.5L2.9 11.4c-.9.4-.9 1.3 0 1.6l4.6 1.4 1.8 5.4c.2.6.9.8 1.4.4l2.6-2.2 4.7 3.5c.6.4 1.4.1 1.6-.6L22.3 5.8c.2-.9-.6-1.6-1.3-1.3z M8 14.2l9.6-6.9"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.2-4.2A8.5 8.5 0 1 1 8.4 19L4 20z M9 8.6c.2-.5.5-.6.8-.6h.6c.2 0 .4 0 .5.4l.8 1.8c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5a6.6 6.6 0 0 0 3.1 2.7c.2.1.4 0 .5-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.3.1.4.3.3.6-.1.9-.9 1.7-1.8 1.8-1 .1-2.6-.2-4.6-2a9 9 0 0 1-2.5-3.4c-.4-1.1-.3-2 .1-2.8z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
};

const services = {
  web: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M3 9h18M7 6.8h.01M9.5 6.8h.01"/></svg>',
  bot: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5z"/><path d="M8.5 10h.01M12 10h.01M15.5 10h.01"/></svg>',
  crm: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8.5 6h7M7.2 8.2l3.6 7.6M16.8 8.2l-3.6 7.6"/></svg>',
  data: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  ai: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18.5 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/></svg>',
  shop: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5h16l-1.2 10a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8z"/><path d="M8.5 8.5V7a3.5 3.5 0 0 1 7 0v1.5"/></svg>',
};

export const logo = (cls = '') => `<svg class="logo-mark ${cls}" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" class="logo-bg"/><rect x="10" y="20" width="5" height="10" rx="1.5" class="logo-bar"/><rect x="17.5" y="14" width="5" height="16" rx="1.5" class="logo-bar"/><rect x="25" y="9" width="5" height="21" rx="1.5" class="logo-bar logo-bar--accent"/></svg>`;

const langSwitch = (lang, ctx) => `<nav class="lang" aria-label="${esc(ctx.t.meta.langLabel)}">${LANGS.map((l) =>
  `<a href="${ctx.root}${l.path}${ctx.page === 'privacy' ? 'privacy.html' : ''}" hreflang="${l.code}" lang="${l.code}"${l.code === lang ? ' aria-current="true"' : ''}>${l.short}</a>`).join('')}</nav>`;

export function head(t, ctx, { title, description, path }) {
  const url = SITE.url + path;
  const alternates = LANGS.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${SITE.url}/${l.path}${ctx.page === 'privacy' ? 'privacy.html' : ''}">`).join('\n  ');
  return `<!doctype html>
<html lang="${t.meta.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  ${alternates}
  <link rel="alternate" hreflang="x-default" href="${SITE.url}/${ctx.page === 'privacy' ? 'privacy.html' : ''}">
  <meta name="theme-color" content="#0b0e13">
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
  <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${ctx.root}assets/styles.css">`;
}

export function header(t, ctx) {
  const home = ctx.page === 'home' ? '' : `${ctx.root}${ctx.langPath}`;
  return `<a class="skip" href="#main">${esc(t.nav.skip)}</a>
<header class="site-header" data-header>
  <div class="wrap header-row">
    <a class="brand" href="${ctx.root}${ctx.langPath}" aria-label="PLT GROUP">${logo()}<span>PLT GROUP</span></a>
    <nav class="nav" aria-label="${esc(t.nav.label)}">
      <a href="${home}#services">${esc(t.nav.services)}</a>
      <a href="${home}#process">${esc(t.nav.process)}</a>
      <a href="${home}#pricing">${esc(t.nav.pricing)}</a>
      <a href="${home}#about">${esc(t.nav.about)}</a>
      <a href="${home}#faq">${esc(t.nav.faq)}</a>
    </nav>
    <div class="header-actions">
      ${langSwitch(t.meta.code, ctx)}
      <a class="btn btn--small btn--light header-cta" href="${home}#contact">${esc(t.nav.cta)}</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="${esc(t.nav.menu)}" data-burger><span></span><span></span></button>
    </div>
  </div>
  <div class="menu" id="menu" data-menu hidden>
    <div class="wrap">
      <a href="${home}#services">${esc(t.nav.services)}</a>
      <a href="${home}#process">${esc(t.nav.process)}</a>
      <a href="${home}#pricing">${esc(t.nav.pricing)}</a>
      <a href="${home}#about">${esc(t.nav.about)}</a>
      <a href="${home}#faq">${esc(t.nav.faq)}</a>
      <div class="menu-foot">${langSwitch(t.meta.code, ctx)}</div>
      <a class="btn btn--accent" href="${home}#contact">${esc(t.nav.cta)}</a>
    </div>
  </div>
</header>`;
}

export function footer(t, ctx) {
  const home = ctx.page === 'home' ? '' : `${ctx.root}${ctx.langPath}`;
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <a class="brand" href="${ctx.root}${ctx.langPath}" aria-label="PLT GROUP">${logo()}<span>PLT GROUP</span></a>
      <p>${esc(t.footer.tagline)}</p>
    </div>
    <div>
      <h2 class="footer-title">${esc(t.footer.company)}</h2>
      <a href="${home}#services">${esc(t.nav.services)}</a>
      <a href="${home}#process">${esc(t.nav.process)}</a>
      <a href="${home}#about">${esc(t.nav.about)}</a>
      <a href="${ctx.root}${ctx.langPath}privacy.html">${esc(t.footer.privacy)}</a>
    </div>
    <div>
      <h2 class="footer-title">${esc(t.footer.contacts)}</h2>
      <a href="tel:${SITE.phone}">${SITE.phoneHuman}</a>
      <a href="${SITE.telegram}" rel="noopener">Telegram</a>
      <a href="${SITE.whatsapp}" rel="noopener">WhatsApp</a>
      <span>${esc(t.contact.city)}</span>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>© <span data-year>${new Date().getFullYear()}</span> PLT GROUP. ${esc(t.footer.rights)}</span>
    ${langSwitch(t.meta.code, ctx)}
  </div>
</footer>
<script src="${ctx.root}assets/app.js" defer></script>
</body>
</html>
`;
}

const heroMock = (m) => `<figure class="mock" aria-label="${esc(m.aria)}">
  <div class="mock-top">
    <span class="mock-dots"><i></i><i></i><i></i></span>
    <span class="mock-title">${esc(m.title)}</span>
    <span class="mock-live"><i></i>${esc(m.live)}</span>
  </div>
  <div class="mock-body">
    <div class="mock-kpis">
      <div><small>${esc(m.k1)}</small><strong>48,6 <em>${esc(m.mln)}</em></strong><span class="up">+12%</span></div>
      <div><small>${esc(m.k2)}</small><strong>137</strong><span class="up">+9%</span></div>
      <div><small>${esc(m.k3)}</small><strong>4 ${esc(m.min)}</strong><span class="up">−63%</span></div>
    </div>
    <div class="mock-chart" aria-hidden="true">
      <div class="mock-chart-head"><span>${esc(m.chart)}</span><span>${esc(m.week)}</span></div>
      <div class="bars">${[42, 55, 48, 66, 72, 61, 84].map((h, i) => `<i style="--h:${h}%;--d:${i * 70}ms"${i === 6 ? ' class="hl"' : ''}></i>`).join('')}</div>
    </div>
    <ul class="mock-list">
      ${m.rows.map((r) => `<li><span class="who">${esc(r[0])}</span><span class="what">${esc(r[1])}</span><span class="tag tag--${r[3]}">${esc(r[2])}</span></li>`).join('\n      ')}
    </ul>
  </div>
  <figcaption>${esc(m.caption)}</figcaption>
</figure>`;

export function home(t, ctx) {
  const s = t;
  return `${head(t, ctx, { title: s.meta.title, description: s.meta.description, path: '/' + ctx.langPath })}
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'PLT GROUP',
    url: SITE.url + '/' + ctx.langPath,
    logo: SITE.url + '/assets/favicon.svg',
    image: SITE.url + '/assets/og.png',
    description: s.meta.description,
    telephone: SITE.phone,
    areaServed: 'UZ',
    address: { '@type': 'PostalAddress', addressLocality: 'Tashkent', addressCountry: 'UZ' },
    founder: { '@type': 'Person', name: s.about.founderName },
    sameAs: [SITE.telegram],
  })}</script>
</head>
<body class="page-home">
${header(t, ctx)}
<main id="main">

  <section class="hero">
    <div class="hero-glow" aria-hidden="true"></div>
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="eyebrow eyebrow--dark reveal">${esc(s.hero.eyebrow)}</p>
        <h1 class="reveal">${s.hero.title}</h1>
        <p class="lead reveal">${esc(s.hero.lead)}</p>
        <div class="hero-cta reveal">
          <a class="btn btn--accent" href="#contact">${esc(s.hero.primary)} ${icon.arrow}</a>
          <a class="btn btn--ghost" href="#services">${esc(s.hero.secondary)}</a>
        </div>
        <ul class="hero-points reveal">
          ${s.hero.points.map((p) => `<li>${icon.check}<span>${esc(p)}</span></li>`).join('\n          ')}
        </ul>
      </div>
      <div class="hero-visual reveal">${heroMock(s.mock)}</div>
    </div>
  </section>

  <section class="pains" aria-labelledby="pains-title">
    <div class="wrap">
      <div class="section-head reveal">
        <p class="eyebrow">${esc(s.pains.eyebrow)}</p>
        <h2 id="pains-title">${esc(s.pains.title)}</h2>
      </div>
      <div class="pain-grid">
        ${s.pains.items.map((p, i) => `<article class="pain reveal">
          <span class="pain-num">0${i + 1}</span>
          <p class="pain-before">${esc(p[0])}</p>
          <p class="pain-after">${icon.arrow}<span>${esc(p[1])}</span></p>
        </article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="services" id="services" aria-labelledby="services-title">
    <div class="wrap">
      <div class="section-head section-head--split reveal">
        <div>
          <p class="eyebrow">${esc(s.services.eyebrow)}</p>
          <h2 id="services-title">${esc(s.services.title)}</h2>
        </div>
        <p class="section-lead">${esc(s.services.lead)}</p>
      </div>
      <div class="service-grid">
        ${s.services.items.map((it) => `<article class="service reveal">
          <div class="service-icon">${services[it.icon]}</div>
          <h3>${esc(it.title)}</h3>
          <p>${esc(it.text)}</p>
          <ul>${it.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          <div class="service-foot"><span class="price">${esc(it.price)}</span><span class="term">${esc(it.term)}</span></div>
        </article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="audit" aria-labelledby="audit-title">
    <div class="wrap audit-card reveal">
      <div>
        <p class="eyebrow eyebrow--dark">${esc(s.audit.eyebrow)}</p>
        <h2 id="audit-title">${esc(s.audit.title)}</h2>
        <p class="lead">${esc(s.audit.lead)}</p>
        <a class="btn btn--accent" href="#contact" data-service="${esc(s.audit.service)}">${esc(s.audit.cta)} ${icon.arrow}</a>
      </div>
      <ol class="audit-steps">
        ${s.audit.steps.map((x) => `<li><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></li>`).join('\n        ')}
      </ol>
    </div>
  </section>

  <section class="process" id="process" aria-labelledby="process-title">
    <div class="wrap">
      <div class="section-head reveal">
        <p class="eyebrow">${esc(s.process.eyebrow)}</p>
        <h2 id="process-title">${esc(s.process.title)}</h2>
      </div>
      <ol class="steps">
        ${s.process.steps.map((x, i) => `<li class="step reveal">
          <div class="step-top"><span class="step-num">${i + 1}</span><span class="step-time">${esc(x.time)}</span></div>
          <h3>${esc(x.title)}</h3>
          <p>${esc(x.text)}</p>
        </li>`).join('\n        ')}
      </ol>
    </div>
  </section>

  <section class="pricing" id="pricing" aria-labelledby="pricing-title">
    <div class="wrap">
      <div class="section-head section-head--split reveal">
        <div>
          <p class="eyebrow">${esc(s.pricing.eyebrow)}</p>
          <h2 id="pricing-title">${esc(s.pricing.title)}</h2>
        </div>
        <p class="section-lead">${esc(s.pricing.lead)}</p>
      </div>
      <div class="plans">
        ${s.pricing.plans.map((p) => `<article class="plan${p.featured ? ' plan--featured' : ''} reveal">
          ${p.featured ? `<span class="plan-badge">${esc(s.pricing.popular)}</span>` : ''}
          <h3>${esc(p.name)}</h3>
          <p class="plan-for">${esc(p.for)}</p>
          <p class="plan-price"><span>${esc(s.pricing.from)}</span> ${esc(p.price)} <small>${esc(s.pricing.perMonth)}</small></p>
          <ul>${p.list.map((x) => `<li>${icon.check}<span>${esc(x)}</span></li>`).join('')}</ul>
          <a class="btn ${p.featured ? 'btn--accent' : 'btn--outline'}" href="#contact" data-service="${esc(p.name)}">${esc(s.pricing.cta)}</a>
        </article>`).join('\n        ')}
      </div>
      <p class="fineprint reveal">${esc(s.pricing.note)}</p>
    </div>
  </section>

  <section class="about" id="about" aria-labelledby="about-title">
    <div class="wrap about-grid">
      <div class="about-copy reveal">
        <p class="eyebrow eyebrow--dark">${esc(s.about.eyebrow)}</p>
        <h2 id="about-title">${s.about.title}</h2>
        ${s.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
        <p class="signature"><strong>${esc(s.about.founderName)}</strong><span>${esc(s.about.founderRole)}</span></p>
      </div>
      <div class="about-side reveal">
        <div class="group-map">
          <p class="group-title">${esc(s.about.groupTitle)}</p>
          ${s.about.group.map((g, i) => `<div class="group-item${i === 0 ? ' is-active' : ''}">
            <span class="group-dot"></span>
            <div><strong>${esc(g[0])}</strong><span>${esc(g[1])}</span></div>
            <em>${esc(g[2])}</em>
          </div>`).join('\n          ')}
        </div>
        <ul class="principles">
          ${s.about.principles.map((p) => `<li><strong>${esc(p[0])}</strong><span>${esc(p[1])}</span></li>`).join('\n          ')}
        </ul>
      </div>
    </div>
  </section>

  <section class="faq" id="faq" aria-labelledby="faq-title">
    <div class="wrap faq-grid">
      <div class="section-head reveal">
        <p class="eyebrow">${esc(s.faq.eyebrow)}</p>
        <h2 id="faq-title">${esc(s.faq.title)}</h2>
        <p class="section-lead">${esc(s.faq.lead)}</p>
      </div>
      <div class="faq-list">
        ${s.faq.items.map((q) => `<details class="qa reveal">
          <summary><span>${esc(q[0])}</span>${icon.plus}</summary>
          <p>${esc(q[1])}</p>
        </details>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="contact" id="contact" aria-labelledby="contact-title">
    <div class="wrap contact-grid">
      <div class="contact-copy reveal">
        <p class="eyebrow eyebrow--dark">${esc(s.contact.eyebrow)}</p>
        <h2 id="contact-title">${esc(s.contact.title)}</h2>
        <p class="lead">${esc(s.contact.lead)}</p>
        <ul class="contact-links">
          <li><a href="tel:${SITE.phone}">${icon.phone}<span><small>${esc(s.contact.phone)}</small>${SITE.phoneHuman}</span></a></li>
          <li><a href="${SITE.telegram}" rel="noopener">${icon.telegram}<span><small>Telegram</small>${SITE.phoneHuman}</span></a></li>
          <li><a href="${SITE.whatsapp}" rel="noopener">${icon.whatsapp}<span><small>WhatsApp</small>${SITE.phoneHuman}</span></a></li>
          <li><span class="contact-static">${icon.pin}<span><small>${esc(s.contact.office)}</small>${esc(s.contact.city)}</span></span></li>
        </ul>
      </div>
      <form class="form reveal" data-form novalidate data-wa="${SITE.whatsappNumber}" data-intro="${esc(s.form.intro)}">
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
          <select id="f-service" name="service" data-service-select>
            ${s.form.services.map((x) => `<option>${esc(x)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="f-task">${esc(s.form.task)}</label>
          <textarea id="f-task" name="task" rows="4" placeholder="${esc(s.form.taskHint)}"></textarea>
        </div>
        <button class="btn btn--accent btn--block" type="submit">${icon.whatsapp} ${esc(s.form.submit)}</button>
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
    <p class="lead">${esc(p.lead)}</p>
    ${p.sections.map((x) => `<h2>${esc(x[0])}</h2>\n    <p>${esc(x[1])}</p>`).join('\n    ')}
    <p class="doc-date">${esc(p.updated)}</p>
  </div>
</main>
${footer(t, ctx)}`;
}
