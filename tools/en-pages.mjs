// English pages under /en/: PLT GROUP home, PLT Digital, its four services and the privacy policy.
// Layout parts (header, process, contact form, footer) come from digital/index.html, translated with the EN dictionary.
// Run after tools/service-pages.mjs and before tools/uz-and-blog.mjs: node tools/en-pages.mjs .
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = process.argv[2];
const SITE = 'https://pltgroup.uz';
const JS_VER = 'lang3';
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const write = (rel, s) => {
  if (s.includes('—')) throw new Error('em dash in ' + rel);
  mkdirSync(dirname(join(ROOT, rel)), { recursive: true });
  writeFileSync(join(ROOT, rel), s);
  console.log(rel);
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// Russian UI string -> English. Every ru/uz pair in the shared layout must be listed here.
const EN = {
  'Услуги': 'Services', 'Продукты': 'Products', 'Как работаем': 'How we work',
  'Первый результат через две недели.': 'First result in two weeks.',
  'Разговор и задание': 'Call and brief',
  'Разбираем, что мешает работать, и за одну встречу собираем техническое задание.': 'We find out what slows your business down and put together a brief in one call.',
  'Макет и договор': 'Design and contract',
  'Показываем дизайн, фиксируем функции, срок и цену.': 'We show the design and fix the features, deadline and price.',
  'Сборка': 'Development',
  'Показываем промежуточные версии, вы вносите правки по ходу.': 'You see interim versions and can request changes along the way.',
  'Запуск и поддержка': 'Launch and support',
  'Публикуем, обучаем сотрудников и остаёмся на связи.': 'We launch, train your team and stay in touch.',
  'Контакты': 'Contact', 'Ответим в течение рабочего дня.': 'We reply within one business day.',
  'Скопировать': 'Copy', 'Телефон': 'Phone', 'Ташкент, Узбекистан': 'Tashkent, Uzbekistan. We work with clients worldwide.',
  'Заявка': 'Request', 'Имя': 'Name', 'Заполните это поле': 'Please fill in this field',
  'Телефон или Telegram': 'Phone, WhatsApp or Telegram', 'Что нужно': 'What you need', 'Комментарий': 'Comment',
  'Отправить заявку': 'Send request',
  'Не получилось отправить. Позвоните или напишите нам в Telegram.': 'Could not send. Please call us or message us on Telegram or WhatsApp.',
  'Отправляя заявку, вы соглашаетесь с <a href="/privacy">политикой конфиденциальности</a>.': 'By sending a request you agree to the <a href="/en/privacy/">privacy policy</a>.',
  'Заявка отправлена': 'Request sent', 'Спасибо! Свяжемся с вами в течение рабочего дня.': 'Thank you! We will contact you within one business day.',
  'Компания группы PLT GROUP, Ташкент.': 'A PLT GROUP company, Tashkent, Uzbekistan.',
  'Компании': 'Companies', 'Услуги PLT Digital': 'PLT Digital services', 'Разработка сайтов': 'Website development',
  'Telegram-боты': 'Telegram bots', 'CRM и аналитика': 'CRM and analytics', 'ИИ-ассистенты': 'AI assistants',
  'Статьи': 'Articles', 'Политика конфиденциальности': 'Privacy policy',
};
const OPT = { 'Сайт': 'Website', 'Telegram-бот': 'Telegram bot', 'CRM': 'CRM', 'Аналитика': 'Analytics', 'ИИ-ассистент': 'AI assistant', 'Пока не знаю, нужен совет': 'Not sure yet, I need advice' };
const PH = { 'Например: заявки из Instagram теряются, хотим видеть их в одном месте': 'For example: we need a website that collects leads, or a Telegram bot for orders' };

// Replaces each <span class="ru">X</span><span class="uz">Y</span> with EN[X] (nested spans included).
function toEn(html) {
  const take = (s, i, open) => {
    let j = i + open.length, depth = 1;
    while (depth) {
      const o = s.indexOf('<span', j), c = s.indexOf('</span>', j);
      if (o !== -1 && o < c) { depth++; j = o + 5; } else { depth--; j = c + 7; }
    }
    return j;
  };
  const RU = '<span class="ru">', UZ = '<span class="uz">';
  let i;
  while ((i = html.indexOf(RU)) !== -1) {
    const j = take(html, i, RU);
    const ru = html.slice(i + RU.length, j - 7);
    let k = j;
    if (html.startsWith(UZ, j)) k = take(html, j, UZ);
    if (!(ru in EN)) throw new Error('No English for: ' + ru);
    html = html.slice(0, i) + EN[ru] + html.slice(k);
  }
  return html
    .replace(/<option([^>]*?) data-ru="([^"]*)" data-uz="[^"]*">[^<]*<\/option>/g, (m, a, ru) => { if (!(ru in OPT)) throw new Error('No option ' + ru); return `<option${a}>${OPT[ru]}</option>`; })
    .replace(/placeholder="[^"]*" data-ph-ru="([^"]*)" data-ph-uz="[^"]*"/g, (m, ru) => { if (!(ru in PH)) throw new Error('No placeholder ' + ru); return `placeholder="${esc(PH[ru])}"`; })
    .replace(/<span class="sr">Светлая<\/span>/g, '<span class="sr">Light</span>').replace(/<span class="sr">Тёмная<\/span>/g, '<span class="sr">Dark</span>').replace(/<span class="sr">Как в системе<\/span>/g, '<span class="sr">System</span>')
    .replace('title="Светлая / Kunduzgi"', 'title="Light"').replace('title="Тёмная / Tungi"', 'title="Dark"').replace('title="Как в системе / Tizimdagidek"', 'title="System"')
    .replace('aria-label="Тема"', 'aria-label="Theme"').replace('aria-label="Язык / Til"', 'aria-label="Language"');
}

const src = read('digital/index.html');
const cut = (a, b) => { const i = src.indexOf(a); return src.slice(i, src.indexOf(b, i) + b.length); };
const LANG_BTNS = '<button type="button" data-lang="ru" aria-pressed="false">RU</button>\n        <button type="button" data-lang="uz" aria-pressed="false">UZ</button>\n        <button type="button" data-lang="en" aria-pressed="true">EN</button>';
const headerDigital = toEn(cut('<header class="site-header">', '</header>'))
  .replace(/<button type="button" data-lang="ru"[\s\S]*?<\/div>/, LANG_BTNS + '\n      </div>')
  .replace('href="/digital/"', 'href="/en/digital/"')
  .replace('href="#services"', 'href="/en/digital/#services"').replace('href="#projects"', 'href="/en/digital/#projects"')
  .replace('href="#process"', 'href="/en/digital/#process"').replace('<a href="/">PLT GROUP</a>', '<a href="/en/">PLT GROUP</a>');
const process_ = toEn(cut('<section class="section" id="process">', '</section>'));
const contact = toEn(cut('<section class="section contacts-sec" id="contact">', '</section>'));
const footer = toEn(cut('<footer class="foot">', '</footer>'))
  .replace('<li><a href="/">PLT GROUP</a></li>', '<li><a href="/en/">PLT GROUP</a></li>')
  .replace('<li><a href="/digital/">PLT Digital</a></li>', '<li><a href="/en/digital/">PLT Digital</a></li>')
  .replace(/href="\/digital\/sayt\/"/g, 'href="/en/digital/website/"').replace(/href="\/digital\/(telegram-bot|crm|ai-assistant)\/"/g, 'href="/en/digital/$1/"')
  .replace(/<li><a href="\/blog\/">Articles<\/a><\/li>/, '')
  .replace('href="/privacy"', 'href="/en/privacy/"');

const ACCENT = '<style>:root { --accent: #ff5a45; --accent-dot: #ff5a45; --c3: #ff5a45; }</style>';
function head({ path, ruPath, title, desc, keywords, ld, style = ACCENT }) {
  const url = `${SITE}/${path}`;
  const alt = ruPath === null ? '' : `\n<link rel="alternate" hreflang="ru" href="${SITE}/${ruPath}">\n<link rel="alternate" hreflang="uz" href="${SITE}/uz/${ruPath}">\n<link rel="alternate" hreflang="en" href="${url}">\n<link rel="alternate" hreflang="x-default" href="${url}">`;
  return `<!doctype html>
<html lang="en" data-page-lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@300..800&display=swap">
<link rel="stylesheet" href="/assets/plt.css?v=685a323a">
${style}
<meta name="description" content="${esc(desc)}">
<meta name="keywords" content="${esc(keywords)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="yandex-verification" content="1c2475a81e074f44">
<meta name="msvalidate.01" content="AD293F32270DEEE0C09E1FC8C850A855">
<meta name="theme-color" content="#fbfbfd">
<link rel="canonical" href="${url}">${alt}
<meta property="og:type" content="website">
<meta property="og:site_name" content="PLT GROUP">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/assets/og.png">
<link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
${ld ? `<script type="application/ld+json">\n${JSON.stringify(ld, null, 1)}\n</script>\n` : ''}<script async src="https://www.googletagmanager.com/gtag/js?id=G-P5FQFGKC2T"></script>
<script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-P5FQFGKC2T');</script>
</head>
<body>
`;
}
const TAIL = `<script src="/assets/plt.js?v=${JS_VER}"></script>\n</body>\n</html>\n`;

const ORG = { '@type': 'Organization', '@id': `${SITE}/#org`, name: 'PLT GROUP', url: `${SITE}/en/`, logo: `${SITE}/assets/apple-touch-icon.png`, email: 'info@pltgroup.uz', telephone: '+998331113010',
  address: { '@type': 'PostalAddress', streetAddress: 'Amir Temur street', postalCode: '100155', addressLocality: 'Tashkent', addressCountry: 'UZ' }, hasMap: 'https://maps.google.com/?cid=6775161695992049582', alternateName: ['PLT GROUP Uzbekistan', 'PLT GROUP Tashkent'],
  disambiguatingDescription: 'IT company from Tashkent, Uzbekistan. Not related to companies with the same name in other countries.' };
const DIGITAL = { '@type': 'ProfessionalService', '@id': `${SITE}/digital/#org`, name: 'PLT Digital', url: `${SITE}/en/digital/`, image: `${SITE}/assets/og.png`,
  description: 'Websites, Telegram bots, AI assistants, CRM and analytics for businesses in Uzbekistan and worldwide.',
  email: 'info@pltgroup.uz', telephone: '+998331113010', address: { '@type': 'PostalAddress', addressLocality: 'Tashkent', addressCountry: 'UZ' },
  areaServed: [{ '@type': 'Place', name: 'Worldwide' }, { '@type': 'Country', name: 'Uzbekistan' }], parentOrganization: { '@id': `${SITE}/#org` },
  contactPoint: { '@type': 'ContactPoint', contactType: 'sales', telephone: '+998331113010', email: 'info@pltgroup.uz', availableLanguage: ['en', 'ru', 'uz'] } };
const faqLd = (id, faq) => ({ '@type': 'FAQPage', '@id': id, mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const faqBlock = (faq, bg) => `<section class="section" id="faq"${bg ? ' style="background:var(--bg-2)"' : ''}>
    <div class="wrap">
      <div class="section-top"><h2>Frequently asked questions</h2></div>
      <ul class="rules-grid${faq.length === 4 ? ' four' : ''}">${faq.map(([q, a]) => `<li><span class="rule-dot"></span><h3><strong>${q}</strong></h3><span>${a}</span></li>`).join('')}</ul>
    </div>
  </section>`;
const hero = (particles, h1, lead, cta2) => `<section class="hero">
    <canvas class="hero-canvas" data-particles="${particles}" aria-hidden="true"></canvas>
    <div class="wrap hero-copy">
      <h1 class="hero-title">${h1}</h1>
      <p class="lead">${lead}</p>
      <div class="hero-cta">
        <a class="btn btn--main" href="#contact">Discuss your project</a>
        ${cta2}
      </div>
      <p class="hero-note">Tashkent, Uzbekistan · Clients worldwide</p>
    </div>
  </section>`;

// Service rows with launch prices (same promo date as the Russian page).
const price = (from, to) => to ? `<span class="price" data-promo-until="2026-12-31"><s>from ${from}</s> <b>from ${to}</b></span>` : `<span class="price"><b>${from}</b></span>`;
const SERVICES = [
  { slug: 'website', name: 'Websites', short: 'A multilingual website that collects leads.', price: price('$800', '$400') },
  { slug: 'telegram-bot', name: 'Telegram bots', short: 'Orders and payments right in Telegram.', price: price('$1,000', '$500') },
  { slug: 'crm', name: 'CRM', short: 'All your leads in one window.', price: price('Price on request') },
  { slug: 'crm', name: 'Analytics', short: 'Revenue and stock on one screen.', price: price('$1,400', '$700') },
  { slug: 'ai-assistant', name: 'AI assistants', short: 'Answers your customers 24/7.', price: price('$1,600', '$800') },
];
const row = (s, link = true) => link
  ? `<li><a class="row" href="/en/digital/${s.slug}/"><span class="row-name">${s.name}</span><span class="row-short">${s.short}</span><span class="row-end">${s.price}</span></a></li>`
  : `<li class="row"><span class="row-name">${s.name}</span><span class="row-short">${s.short}</span><span class="row-end">${s.price}</span></li>`;

/* ---------- /en/digital/ ---------- */
{
  const faq = [
    ['What does PLT Digital do?', 'We build websites, Telegram bots, AI assistants, CRM systems and analytics for small and medium businesses in Uzbekistan and worldwide.'],
    ['Do you work with clients outside Uzbekistan?', 'Yes. We are based in Tashkent and work with clients from any country: we discuss the project online, by phone, Telegram or WhatsApp, and communicate in English, Russian or Uzbek.'],
    ['How much does it cost?', 'It depends on the scope. Starting prices for each service are listed above, CRM is priced on request. The first consultation is free, and we give the exact price after it.'],
    ['How fast will I see results?', 'First result in two weeks. You see interim versions along the way.'],
  ];
  const ld = { '@context': 'https://schema.org', '@graph': [ORG, { ...DIGITAL, hasOfferCatalog: { '@type': 'OfferCatalog', name: 'PLT Digital services', itemListElement: SERVICES.filter((s, i) => i !== 3).map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, description: s.short, url: `${SITE}/en/digital/${s.slug}/` } })) } }, faqLd(`${SITE}/en/digital/#faq`, faq)] };
  const html = head({ path: 'en/digital/', ruPath: 'digital/', title: 'Website and Telegram Bot Development | PLT Digital', desc: 'PLT Digital builds websites, Telegram bots, AI assistants and CRM for businesses worldwide. Based in Tashkent, Uzbekistan. First result in two weeks.', keywords: 'website development, web development company, create a website, Telegram bot development, create a Telegram bot, AI assistant for business, AI chatbot development, CRM development, outsourcing Uzbekistan, web studio Tashkent', ld })
  + headerDigital + `
<main>
  ${hero('DIGITAL', 'Websites, Telegram bots and AI assistants for your business', 'We bring order to your leads, sales and numbers. PLT Digital builds websites, Telegram bots, AI assistants and CRM for businesses in Uzbekistan and worldwide. First result in two weeks.', '<a class="btn btn--outline" href="#services">See prices</a>')}
  <section class="section" id="services">
    <div class="wrap">
      <div class="section-top"><h2>What we do</h2><p><span class="promo-note" data-promo-note>−50% until December 31</span> Price depends on the scope. We give the exact price after the first call.</p></div>
      <ul class="rows">${SERVICES.map((s) => row(s)).join('')}</ul>
    </div>
  </section>
  <section class="section" id="about">
    <div class="wrap about">
      <h2>Order a website, Telegram bot or AI assistant</h2>
      <div class="about-text">
        <p><strong><a href="/en/digital/website/">Website development</a>.</strong> Turnkey websites for businesses: landing pages, company websites and catalogs in English, Russian, Uzbek and other languages. Every lead from the website goes straight to your Telegram or CRM.</p>
        <p><strong><a href="/en/digital/telegram-bot/">Telegram bot development</a>.</strong> Bots for orders, bookings, payments and customer support, plus Telegram Mini Apps. The bot works 24/7 and passes leads to your team.</p>
        <p><strong><a href="/en/digital/ai-assistant/">AI assistants</a> and <a href="/en/digital/crm/">CRM</a>.</strong> An AI assistant answers customers on your website and in Telegram around the clock. CRM collects leads from your website, Telegram and Instagram in one window, analytics shows revenue and stock on one screen.</p>
      </div>
    </div>
  </section>
  <section class="section" id="projects" style="background:var(--bg-2)">
    <div class="wrap">
      <div class="section-top"><h2>Our products</h2><p>What we have built and are building for the Uzbekistan market.</p></div>
      <div class="proj-grid">
        <article class="proj"><div class="proj-top"><span class="label">Telegram</span><span class="pill pill--live">Launched</span></div><h3>AZS Radar</h3><p>Nearby fuel and EV charging stations in Tashkent with current fuel prices.</p></article>
        <article class="proj"><div class="proj-top"><span class="label">Telegram</span><span class="pill pill--live">Launched</span></div><h3>Tsvetoteka</h3><p>Flower search in Tashkent: shop prices, filters by budget and distance.</p></article>
        <article class="proj"><div class="proj-top"><span class="label">POS</span><span class="pill">In development</span></div><h3>Shop POS system</h3><p>A fast point-of-sale system for small shops with fiscalization under Uzbekistan rules.</p></article>
        <article class="proj"><div class="proj-top"><span class="label">Mini App</span><span class="pill">In development</span></div><h3>FinHelper</h3><p>Personal finance in Telegram: expenses, subscriptions and statistics.</p></article>
      </div>
    </div>
  </section>
  ${process_}
  ${faqBlock(faq, true)}

  ${contact}
</main>
${footer}
` + TAIL;
  write('en/digital/index.html', html);
}

/* ---------- service pages ---------- */
const PAGES = [
  { slug: 'website', ru: 'digital/sayt/', particles: 'WEB', option: 'Website', rows: [0],
    title: 'Website Development: Order a Business Website | PLT Digital', service: 'Website development',
    desc: 'Turnkey website development for businesses worldwide: company websites and landing pages that collect leads and send them to Telegram or CRM. First result in two weeks.',
    keywords: 'website development, create a website, order a website, business website, landing page development, web development company, website development Uzbekistan, affordable website development',
    h1: 'Website development', lead: 'Turnkey websites for businesses anywhere in the world: from brief and design to launch. Your website collects leads and sends them to Telegram or CRM.',
    items: [['Design before development', 'You see the design first, and we fix features, deadline and price in the contract.'], ['Any languages', 'English, Russian, Uzbek and other languages, so every customer understands you.'], ['No lost leads', 'Every request from the website goes straight to your Telegram or CRM.'], ['Launch and support', 'We launch the website, train your team and stay in touch.']],
    faq: [['How much does a website cost?', 'It depends on the scope; the starting price is shown above. We give the exact price after the first call.'], ['How long does it take?', 'First result in two weeks. The exact deadline is fixed in the contract.'], ['Do you work with clients from other countries?', 'Yes. We work online with clients worldwide and communicate in English, Russian or Uzbek.'], ['What do I need to start?', 'Just send a request. The first consultation is free: in one call we prepare the brief, then show the design and fix the deadline and price.']] },
  { slug: 'telegram-bot', ru: 'digital/telegram-bot/', particles: 'BOT', option: 'Telegram bot', rows: [1],
    title: 'Telegram Bot Development: Order a Telegram Bot | PLT Digital', service: 'Telegram bot development',
    desc: 'Telegram bot development for businesses worldwide: orders, payments, bookings and leads right in Telegram, plus Telegram Mini Apps. First result in two weeks.',
    keywords: 'Telegram bot development, create a Telegram bot, order a Telegram bot, Telegram bot for business, Telegram Mini App development, chatbot development, Telegram bot developer',
    h1: 'Telegram bot development', lead: 'Telegram bots for businesses worldwide: orders, payments, bookings and customer replies right in Telegram.',
    items: [['Orders and payments', 'Customers choose a product or service and pay right in Telegram.'], ['Bookings and leads', 'The bot takes requests 24/7 and passes them to your team.'], ['Telegram Mini Apps', 'An app inside Telegram: catalog, personal account, statistics.'], ['Our own bots', 'We launched our own bots AZS Radar and Tsvetoteka.']],
    faq: [['How much does a Telegram bot cost?', 'It depends on the features; the starting price is shown above. We give the exact price after the first call.'], ['How long does it take?', 'First result in two weeks. You see interim versions along the way.'], ['Can the bot accept payments?', 'Yes, orders and payments can happen right in Telegram.'], ['Will the bot pass leads to my team?', 'Yes, leads go to your team in Telegram or CRM.']] },
  { slug: 'crm', ru: 'digital/crm/', particles: 'CRM', option: 'CRM', rows: [2, 3],
    title: 'CRM and Business Analytics Development | PLT Digital', service: 'CRM and business analytics',
    desc: 'CRM and analytics for small businesses worldwide: all leads from your website, Telegram and Instagram in one window, revenue and stock on one screen.',
    keywords: 'CRM development, custom CRM, CRM for small business, business analytics dashboard, sales analytics, business automation',
    h1: 'CRM and analytics for business', lead: 'All your leads in one window and the key numbers on one screen. For small businesses in Uzbekistan and worldwide.',
    items: [['All leads in one window', 'Leads from your website, Telegram and Instagram are never lost.'], ['Revenue and stock', 'The key numbers of your business on one screen.'], ['Built around your process', 'We find what slows you down and build the system for your task.'], ['Team training', 'After launch we train your team and stay in touch.']],
    faq: [['How much does a CRM cost?', 'The price is set individually: it depends on your processes and scope. We give the exact price after the first call.'], ['Can it collect leads from Instagram and Telegram?', 'Yes, leads from your website, Telegram and Instagram arrive in one window.'], ['How fast will I see results?', 'First result in two weeks.']] },
  { slug: 'ai-assistant', ru: 'digital/ai-assistant/', particles: 'AI', option: 'AI assistant', rows: [4],
    title: 'AI Assistant and AI Chatbot for Business | PLT Digital', service: 'AI assistants',
    desc: 'AI assistants for business: answer customers 24/7 on your website and in Telegram, collect leads and pass them to your team. For companies worldwide.',
    keywords: 'AI assistant for business, AI chatbot development, AI customer support, ChatGPT bot for business, AI bot for website, AI Telegram bot',
    h1: 'AI assistants for business', lead: 'An AI assistant answers your customers 24/7 on your website or in Telegram and passes leads to your team.',
    items: [['24/7', 'Answers customers at night and on weekends.'], ['Website and Telegram', 'Works where your customers already write to you.'], ['Collects leads', 'Takes contact details and passes the request to your team.'], ['Knows your business', 'Answers about your services, prices and rules.']],
    faq: [['How much does an AI assistant cost?', 'It depends on the tasks; the starting price is shown above. We give the exact price after the first call.'], ['Will it replace my manager?', 'No. It answers common questions and collects leads 24/7, and passes complex questions to your team.'], ['Where does it work?', 'On your website or in Telegram.']] },
];
for (const p of PAGES) {
  const url = `${SITE}/en/digital/${p.slug}/`;
  const ld = { '@context': 'https://schema.org', '@graph': [ORG, DIGITAL,
    { '@type': 'Service', '@id': `${url}#service`, name: p.service, serviceType: p.service, description: p.desc, url, provider: { '@id': `${SITE}/digital/#org` }, areaServed: { '@type': 'Place', name: 'Worldwide' } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'PLT Digital', item: `${SITE}/en/digital/` }, { '@type': 'ListItem', position: 2, name: p.service, item: url }] },
    faqLd(`${url}#faq`, p.faq)] };
  const others = PAGES.filter((x) => x !== p).map((x) => `<li><a class="row" href="/en/digital/${x.slug}/"><span class="row-name">${x.h1}</span><span class="row-short">${x.lead.split(/[.:]/)[0]}.</span><span class="row-end link">Open</span></a></li>`).join('');
  const html = head({ path: `en/digital/${p.slug}/`, ruPath: p.ru, title: p.title, desc: p.desc, keywords: p.keywords, ld })
  + headerDigital + `
<main>
  ${hero(p.particles, p.h1, p.lead, '<a class="btn btn--outline" href="#price">Price</a>')}
  <section class="section" id="price">
    <div class="wrap">
      <div class="section-top"><h2>Price and what is included</h2><p>Price depends on the scope. We give the exact price after the first call.</p></div>
      <ul class="rows">${p.rows.map((i) => row(SERVICES[i], false)).join('')}</ul>
      <ul class="rules-grid four" style="margin-top:48px">${p.items.map(([t, d]) => `<li><span class="rule-dot"></span><h3><strong>${t}</strong></h3><span>${d}</span></li>`).join('')}</ul>
    </div>
  </section>
  ${process_.replace('<section class="section" id="process">', '<section class="section" id="process" style="background:var(--bg-2)">')}
  ${faqBlock(p.faq, false)}
  <section class="section" id="more" style="background:var(--bg-2)">
    <div class="wrap">
      <div class="section-top"><h2>Other services</h2></div>
      <ul class="rows">${others}</ul>
    </div>
  </section>

  ${contact.replace(`<option>${p.option}</option>`, `<option selected>${p.option}</option>`)}
</main>
${footer}
` + TAIL;
  write(`en/digital/${p.slug}/index.html`, html);
}

/* ---------- /en/ (PLT GROUP) ---------- */
{
  const faq = [
    ['What is PLT GROUP?', 'PLT GROUP is an IT company from Tashkent, Uzbekistan. Through PLT Digital we build websites, Telegram bots, AI assistants and CRM for businesses.'],
    ['Do you work with international clients?', 'Yes. We work with clients from any country online and communicate in English, Russian or Uzbek.'],
    ['How do I contact PLT GROUP?', 'Call or message us on Telegram or WhatsApp: +998 33 111 30 10. Email: info@pltgroup.uz. We reply within one business day.'],
  ];
  const ld = { '@context': 'https://schema.org', '@graph': [{ ...ORG, description: 'IT company from Tashkent, Uzbekistan: websites, Telegram bots, AI assistants and CRM for businesses worldwide.', subOrganization: [{ '@id': `${SITE}/digital/#org` }] }, { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'PLT GROUP', inLanguage: ['ru', 'uz', 'en'], publisher: { '@id': `${SITE}/#org` } }, faqLd(`${SITE}/en/#faq`, faq)] };
  const headerGroup = headerDigital.replace(/<a class="brand" href="\/en\/digital\/">([\s\S]*?)<span>PLT Digital<\/span><\/a>/, '<a class="brand" href="/en/">$1<span>PLT GROUP</span></a>')
    .replace(/<nav class="nav">[\s\S]*?<\/nav>/, '<nav class="nav"><a href="#services">Services</a><a href="#about">About</a><a href="#contact">Contact</a></nav>');
  const html = head({ path: 'en/', ruPath: '', title: 'PLT GROUP (Tashkent, Uzbekistan): Websites, Telegram Bots and AI Assistants', desc: 'PLT GROUP is an IT company from Tashkent, Uzbekistan. We build websites, Telegram bots, AI assistants and CRM for businesses worldwide.', keywords: 'PLT GROUP, PLT GROUP Uzbekistan, PLT Digital, website development, Telegram bot development, AI assistant, IT company Uzbekistan, IT outsourcing Tashkent', ld, style: '<style>:root { --accent: var(--text); }</style>' })
  + headerGroup + `
<main>
  <section class="hero">
    <canvas class="hero-canvas" data-particles="PLT" aria-hidden="true"></canvas>
    <div class="wrap hero-copy">
      <h1 class="hero-title">Websites, Telegram bots and AI assistants from Tashkent</h1>
      <p class="lead">PLT GROUP is an IT company from Uzbekistan. We build websites, Telegram bots, AI assistants and CRM for businesses worldwide.</p>
      <div class="hero-cta">
        <a class="btn btn--main" href="/en/digital/#services">Services and prices</a>
        <a class="btn btn--outline" href="#contact">Contact us</a>
      </div>
      <p class="hero-note">Tashkent, Uzbekistan · Clients worldwide</p>
    </div>
  </section>
  <section class="section" id="services" style="background:var(--bg-2)">
    <div class="wrap">
      <div class="section-top"><h2>Services</h2><p>First result in two weeks.</p></div>
      <ul class="rows">
        <li><a class="row" href="/en/digital/website/"><span class="row-name">Website development</span><span class="row-short">Turnkey websites that collect leads.</span><span class="row-end link">Open</span></a></li>
        <li><a class="row" href="/en/digital/telegram-bot/"><span class="row-name">Telegram bots</span><span class="row-short">Orders, payments and bookings right in Telegram.</span><span class="row-end link">Open</span></a></li>
        <li><a class="row" href="/en/digital/ai-assistant/"><span class="row-name">AI assistants</span><span class="row-short">Answer your customers 24/7.</span><span class="row-end link">Open</span></a></li>
        <li><a class="row" href="/en/digital/crm/"><span class="row-name">CRM and analytics</span><span class="row-short">All leads and numbers in one window.</span><span class="row-end link">Open</span></a></li>
      </ul>
    </div>
  </section>
  <section class="section" id="about">
    <div class="wrap about">
      <h2>About us</h2>
      <div class="about-text">
        <p><strong>PLT GROUP</strong> is an IT company from Tashkent. Our team at <a href="/en/digital/">PLT Digital</a> builds websites, Telegram bots, AI assistants, CRM and reports for small and medium businesses.</p>
        <p>We work with clients from Uzbekistan and other countries online, in English, Russian or Uzbek.</p>
      </div>
    </div>
  </section>
  ${faqBlock(faq, true)}

  ${contact}
</main>
${footer.replace(/<span>PLT Digital<\/span><\/div><p>A PLT GROUP company, Tashkent, Uzbekistan.<\/p>/, '<span>PLT GROUP</span></div><p>Tashkent, Uzbekistan.</p>').replace(/\n      <ul><li class="label">PLT Digital services<\/li>[\s\S]*?<\/ul>/, '').replace('© 2026 PLT Digital', '© 2026 PLT GROUP')}
` + TAIL;
  write('en/index.html', html);
}

/* ---------- /en/privacy/ ---------- */
{
  const headerGroup = headerDigital.replace(/<a class="brand" href="\/en\/digital\/">([\s\S]*?)<span>PLT Digital<\/span><\/a>/, '<a class="brand" href="/en/">$1<span>PLT GROUP</span></a>')
    .replace(/<nav class="nav">[\s\S]*?<\/nav>/, '<nav class="nav"><a href="/en/digital/">PLT Digital</a><a href="/en/#contact">Contact</a></nav>');
  const html = head({ path: 'en/privacy/', ruPath: null, title: 'Privacy Policy | PLT GROUP', desc: 'How PLT GROUP handles the data of visitors to its websites.', keywords: 'PLT GROUP privacy policy', ld: null, style: '<style>:root { --accent: var(--text); }</style>' })
    .replace('<link rel="canonical" href="https://pltgroup.uz/en/privacy/">', '<link rel="canonical" href="https://pltgroup.uz/en/privacy/">\n<link rel="alternate" hreflang="ru" href="https://pltgroup.uz/privacy">\n<link rel="alternate" hreflang="en" href="https://pltgroup.uz/en/privacy/">')
  + headerGroup + `
<main>
  <section class="section">
    <div class="wrap doc">
      <h1>Privacy policy</h1>
      <p class="lead">How PLT GROUP handles the data of visitors to its websites.</p>
      <h2>What data we receive</h2><p>When you send a request form on the PLT GROUP website or the PLT Digital, PLT Agrovia and PLT Retail websites, we receive the name, phone or Telegram, the selected option and the comment you entered. The websites do not collect any other personal data.</p>
      <h2>How we use it</h2><p>Only to reply to your request and prepare an offer. The request is stored in a secure system that only PLT GROUP staff can access, and it is sent to their work email. We do not sell or share data with third parties for their own purposes.</p>
      <h2>Third-party services</h2><p>Request emails are sent by FormSubmit. The websites run on Cloudflare, load Google Fonts and use Google Analytics, which sets cookies and collects anonymous visit statistics. Your language and theme choice is stored only in your browser. WhatsApp and Telegram have their own rules.</p>
      <h2>Deleting data</h2><p>Write to info@pltgroup.uz or call +998 33 111 30 10 and we will delete the data about your request.</p>
      <p class="small">Version of October 19, 2026.</p>
    </div>
  </section>
</main>
${footer}
` + TAIL;
  write('en/privacy/index.html', html);
}
