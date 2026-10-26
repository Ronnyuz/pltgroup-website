// Uzbek page copies under /uz/, hreflang on Russian pages, blog articles in both languages.
// Run after tools/service-pages.mjs: node tools/uz-and-blog.mjs .
import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { ARTICLES } from './articles.mjs';

const ROOT = process.argv[2];
const SITE = 'https://pltgroup.uz';
const JS_VER = 'lang3';
const DATE = '2026-10-26';
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const write = (rel, s) => {
  if (s.includes('—')) throw new Error('em dash in ' + rel);
  mkdirSync(dirname(join(ROOT, rel)), { recursive: true });
  writeFileSync(join(ROOT, rel), s);
  console.log(rel);
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const ru = (r, u) => `<span class="ru">${r}</span><span class="uz">${u}</span>`;

// Removes (or unwraps) every <span class="cls">...</span>, nested spans included.
function spans(html, cls, unwrap) {
  const open = `<span class="${cls}">`;
  let i, from = 0;
  while ((i = html.indexOf(open, from)) !== -1) {
    let j = i + open.length, depth = 1;
    while (depth) {
      const o = html.indexOf('<span', j), c = html.indexOf('</span>', j);
      if (o !== -1 && o < c) { depth++; j = o + 5; } else { depth--; j = c + 7; }
    }
    const inner = html.slice(i + open.length, j - 7);
    html = html.slice(0, i) + (unwrap ? inner : '') + html.slice(j);
    from = i;
  }
  return html;
}
const onlyUz = (h) => spans(spans(h, 'ru', false), 'uz', true)
  .replace(/(<option[^>]*data-uz="([^"]*)"[^>]*>)[^<]*<\/option>/g, '$1$2</option>')
  .replace(/placeholder="[^"]*"( data-ph-ru="[^"]*" data-ph-uz="([^"]*)")/g, 'placeholder="$2"$1')
  .replace(/<span class="sr">Светлая<\/span>/g, '<span class="sr">Kunduzgi</span>')
  .replace(/<span class="sr">Тёмная<\/span>/g, '<span class="sr">Tungi</span>')
  .replace(/<span class="sr">Как в системе<\/span>/g, '<span class="sr">Tizimdagidek</span>')
  .replace('aria-label="Тема"', 'aria-label="Mavzu"');
const uzLinks = (h) => h.replace(/href="\/(digital\/|agrovia\/|retail\/|blog\/|")/g, (m, p) => `href="/uz/${p === '"' ? '"' : p}`);

function setMeta(h, m) {
  const r = (re, v) => { h = h.replace(re, v); };
  r(/<title>[^<]*<\/title>/, `<title>${m.title}</title>`);
  r(/(<meta name="description" content=")[^"]*/, `$1${esc(m.desc)}`);
  if (m.keywords) {
    if (/<meta name="keywords"/.test(h)) r(/(<meta name="keywords" content=")[^"]*/, `$1${esc(m.keywords)}`);
    else r(/(<meta name="robots")/, `<meta name="keywords" content="${esc(m.keywords)}">\n$1`);
  }
  r(/(<meta property="og:title" content=")[^"]*/, `$1${esc(m.title)}`);
  r(/(<meta property="og:description" content=")[^"]*/, `$1${esc(m.desc)}`);
  r(/(<meta name="twitter:title" content=")[^"]*/, `$1${esc(m.title)}`);
  r(/(<meta name="twitter:description" content=")[^"]*/, `$1${esc(m.desc)}`);
  return h;
}
// English versions exist for the PLT GROUP home page and PLT Digital (tools/en-pages.mjs).
const EN_OF = { '': 'en/', 'digital/': 'en/digital/', 'digital/sayt/': 'en/digital/website/', 'digital/telegram-bot/': 'en/digital/telegram-bot/', 'digital/crm/': 'en/digital/crm/', 'digital/ai-assistant/': 'en/digital/ai-assistant/' };
function hreflang(h, ruUrl, uzUrl, self, enUrl) {
  h = h.replace(/\n<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, '');
  h = h.replace(/(<link rel="canonical" href=")[^"]*(">)/, `$1${self}$2\n<link rel="alternate" hreflang="ru" href="${ruUrl}">\n<link rel="alternate" hreflang="uz" href="${uzUrl}">${enUrl ? `\n<link rel="alternate" hreflang="en" href="${enUrl}">` : ''}\n<link rel="alternate" hreflang="x-default" href="${enUrl || ruUrl}">`);
  h = h.replace(/(<meta property="og:url" content=")[^"]*/, `$1${self}`);
  return h;
}
// FAQPage in JSON-LD rebuilt from the visible FAQ block, so the markup matches the page language.
function syncFaq(h) {
  const sec = h.match(/<section class="section" id="faq"[\s\S]*?<\/section>/);
  if (!sec) return h;
  const qa = [...sec[0].matchAll(/<h3><strong>([\s\S]*?)<\/strong><\/h3><span>([\s\S]*?)<\/span><\/li>/g)].map((m) => [strip(m[1]), strip(m[2])]);
  return h.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (all, json) => {
    const ld = JSON.parse(json);
    for (const n of ld['@graph'] || []) if (n['@type'] === 'FAQPage') n.mainEntity = qa.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }));
    return `<script type="application/ld+json">\n${JSON.stringify(ld, null, 1)}\n</script>`;
  });
}

const KW_DIGITAL_UZ = 'sayt yaratish, sayt qilish, sayt ochish, sayt buyurtma qilish, arzon sayt, sayt narxi, telegram bot yaratish, tg bot yaratish, bot yasash, bot qilish, telegram bot narxi, CRM tizimi, SI assistent, sun’iy intellekt bot, IT kompaniya Toshkent, veb sayt Toshkent';
const UZ = {
  '': { title: 'PLT GROUP: Toshkentda sayt, Telegram-bot va SI-assistent yaratish', desc: 'PLT GROUP (Toshkent, O‘zbekiston): IT kompaniya. O‘zbekiston va butun dunyodagi biznes uchun sayt, Telegram-bot, SI-assistent va CRM yaratish.', keywords: 'PLT GROUP, PLT GROUP Toshkent, PLT GROUP O‘zbekiston, PLT Digital, IT kompaniya Toshkent, sayt yaratish Toshkent, telegram bot yaratish, SI assistent, CRM' },
  'digital/': { title: 'Toshkentda sayt va Telegram-bot yaratish | PLT Digital', desc: 'Toshkentda sayt va Telegram-bot yaratish: biznes uchun saytlar, botlar, CRM, analitika va SI-assistentlar. Birinchi natija ikki haftada.', keywords: KW_DIGITAL_UZ },
  'digital/sayt/': { title: 'Toshkentda sayt yaratish: biznes uchun sayt buyurtma qilish | PLT Digital', desc: 'Toshkentda sayt yaratish: arizalarni yig‘adigan va ularni Telegram yoki CRMga yuboradigan kompaniya sayti yoki lending. Birinchi natija ikki haftada.', keywords: 'sayt yaratish, sayt yaratish Toshkent, sayt qilish, sayt ochish, sayt buyurtma qilish, sayt qildirish, arzon sayt, sayt narxi, lending, kompaniya sayti, veb sayt yaratish, website development Tashkent' },
  'digital/telegram-bot/': { title: 'Telegram-bot yaratish Toshkentda: bot buyurtma qilish | PLT Digital', desc: 'Biznes uchun Telegram-bot yaratish: buyurtma, to‘lov, yozilish va arizalar to‘g‘ridan-to‘g‘ri Telegramda, shuningdek Telegram Mini App. Birinchi natija ikki haftada.', keywords: 'telegram bot yaratish, tg bot yaratish, bot yasash, bot qilish, telegram bot buyurtma, telegram bot narxi, biznes uchun bot, buyurtma boti, Telegram Mini App, telegram bot development Tashkent' },
  'digital/crm/': { title: 'Biznes uchun CRM va analitika Toshkentda | PLT Digital', desc: 'Toshkentda biznes uchun CRM va analitika: sayt, Telegram va Instagramdan arizalar bitta oynada, tushum va qoldiqlar bitta ekranda.', keywords: 'CRM tizimi, CRM Toshkent, biznes uchun CRM, biznesni avtomatlashtirish, savdo analitikasi, hisobotlar' },
  'digital/ai-assistant/': { title: 'Biznes uchun SI-assistent va chat-bot Toshkentda | PLT Digital', desc: 'Biznes uchun SI-assistentlar: saytda va Telegramda mijozlarga kecha-kunduz javob beradi, arizalarni yig‘adi va xodimlarga uzatadi.', keywords: 'SI assistent, sun’iy intellekt bot, AI bot, chat-bot Toshkent, mijozlarga avtomatik javob' },
  'agrovia/': { title: 'PLT Agrovia: Toshkentda tuxum va broyler go‘shti ulgurji', desc: 'PLT Agrovia fermasi: Toshkentdagi do‘konlar, kafe, restoranlar, oshxonalar, mehmonxonalar va ulgurji bazalar uchun yangi tuxum va broyler go‘shti.', keywords: 'tuxum ulgurji Toshkent, broyler go‘shti, tovuq go‘shti ulgurji, parrandachilik fermasi, do‘konlarga tuxum yetkazib berish' },
  'retail/': { title: 'PLT Retail: Toshkentda maishiy kimyo yetkazib berish', desc: 'PLT Retail: Toshkent bo‘ylab yetkazib berish yoki o‘zi olib ketish bilan maishiy kimyo va uy uchun mahsulotlar.', keywords: 'maishiy kimyo Toshkent, maishiy kimyo yetkazib berish, kir yuvish kukuni, idish yuvish vositasi, uy uchun mahsulotlar' },
};

// 1. Script version and blog link in footers of every page.
const htmlFiles = [];
(function walk(dir) {
  for (const f of readdirSync(join(ROOT, dir))) {
    const rel = dir ? `${dir}/${f}` : f;
    if (/^(\.git|node_modules|admin|functions|src|content|assets|uz|en|tools)$/.test(f) && !dir) continue;
    if (statSync(join(ROOT, rel)).isDirectory()) walk(rel); else if (f.endsWith('.html')) htmlFiles.push(rel);
  }
})('');
const BLOG_LI = `<li><a href="/blog/">${ru('Статьи', 'Maqolalar')}</a></li>`;
for (const f of htmlFiles) {
  let h = read(f);
  const before = h;
  h = h.replace(/plt\.js\?v=[\w]+/, `plt.js?v=${JS_VER}`);
  if (!h.includes('data-lang="en"')) h = h.replace(/(<button type="button" data-lang="uz" aria-pressed="(?:true|false)">UZ<\/button>)/, '$1\n        <button type="button" data-lang="en" aria-pressed="false">EN</button>');
  if (!h.includes('href="/blog/"')) h = h.replace(/(<li><a href="\/digital\/ai-assistant\/">[\s\S]*?<\/a><\/li>)(<\/ul>)/, `$1${BLOG_LI}$2`);
  if (h !== before) writeFileSync(join(ROOT, f), h);
}

// 2. Blog pages, built from the PLT Digital page layout.
const tplSrc = read('digital/index.html');
const cut = (a, b) => { const i = tplSrc.indexOf(a); return tplSrc.slice(i, tplSrc.indexOf(b, i) + b.length); };
const header = cut('<header class="site-header">', '</header>')
  .replace('href="#services"', 'href="/digital/#services"').replace('href="#projects"', 'href="/blog/"')
  .replace(ru('Продукты', 'Mahsulotlar'), ru('Статьи', 'Maqolalar'))
  .replace('href="#process"', 'href="/digital/#process"');
const contact = cut('<section class="section contacts-sec" id="contact">', '</section>');
const footer = cut('<footer class="foot">', '</footer>');
const POST_CSS = '<style>:root { --accent: #ff5a45; --accent-dot: #ff5a45; --c3: #ff5a45; } .post { max-width: 46em; } .post h2 { font-size: clamp(26px, 3vw, 36px); margin: 44px 0 14px; } .post p, .post li { color: var(--muted); font-size: 18px; line-height: 1.65; } .post p + p { margin-top: 12px; } .post ul, .post ol { padding-left: 24px; display: grid; gap: 8px; } .post ul { list-style: disc; } .post ol { list-style: decimal; } .post a { color: var(--text); } .post-meta { color: var(--muted); margin-top: 18px; }</style>';

function head({ title, desc, keywords, url, ruUrl, uzUrl, lang, ld }) {
  return `<!doctype html>
<html lang="${lang}" data-page-lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@300..800&display=swap">
<link rel="stylesheet" href="/assets/plt.css?v=685a323a">
${POST_CSS}
<meta name="description" content="${esc(desc)}">
<meta name="keywords" content="${esc(keywords)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="yandex-verification" content="1c2475a81e074f44">
<meta name="msvalidate.01" content="AD293F32270DEEE0C09E1FC8C850A855">
<meta name="theme-color" content="#fbfbfd">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="ru" href="${ruUrl}">
<link rel="alternate" hreflang="uz" href="${uzUrl}">
<link rel="alternate" hreflang="x-default" href="${ruUrl}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="PLT GROUP">
<meta property="og:locale" content="${lang === 'uz' ? 'uz_UZ' : 'ru_RU'}">
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
<script type="application/ld+json">
${JSON.stringify(ld, null, 1)}
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-P5FQFGKC2T"></script>
<script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-P5FQFGKC2T');</script>
</head>
<body>
`;
}
const TAIL = `<script src="/assets/plt.js?v=${JS_VER}"></script>\n</body>\n</html>\n`;
const localize = (h, lang) => (lang === 'uz' ? uzLinks(onlyUz(h)) : h);
const T = {
  ru: { blog: 'Статьи', blogTitle: 'Статьи о сайтах, Telegram-ботах и ИИ-ассистентах | PLT Digital', blogDesc: 'Статьи PLT Digital: сколько стоит сайт, как создать Telegram-бота, что выбрать бизнесу и как внедрить ИИ-ассистента.', blogLead: 'Простые ответы на вопросы о сайтах, Telegram-ботах и ИИ-ассистентах для бизнеса в Узбекистане.', faq: 'Частые вопросы', more: 'Читайте также', read: 'Читать', date: '26 октября 2026', cta: 'Обсудить задачу', ctaService: 'Подробнее об услуге' },
  uz: { blog: 'Maqolalar', blogTitle: 'Sayt, Telegram-bot va SI-assistentlar haqida maqolalar | PLT Digital', blogDesc: 'PLT Digital maqolalari: sayt qancha turadi, Telegram-bot qanday yaratiladi, biznes uchun nimani tanlash va SI-assistentni qanday joriy qilish.', blogLead: 'O‘zbekistondagi biznes uchun saytlar, Telegram-botlar va SI-assistentlar haqida oddiy javoblar.', faq: 'Ko‘p beriladigan savollar', more: 'Shuningdek o‘qing', read: 'O‘qish', date: '2026-yil 26-oktabr', cta: 'Vazifani muhokama qilish', ctaService: 'Xizmat haqida batafsil' },
};
const prefix = (lang) => (lang === 'uz' ? '/uz' : '');
const section = (s) => `<h2>${s.h}</h2>${(s.p || []).map((p) => `<p>${p}</p>`).join('')}${s.ul ? `<ul>${s.ul.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}${s.ol ? `<ol>${s.ol.map((x) => `<li>${x}</li>`).join('')}</ol>` : ''}`;
const card = (a, lang) => `<li><a class="row" href="${prefix(lang)}/blog/${a.slug}/"><span class="row-name">${a[lang].title}</span><span class="row-short">${a[lang].lead}</span><span class="row-end link">${T[lang].read}</span></a></li>`;

for (const lang of ['ru', 'uz']) {
  const t = T[lang], p = prefix(lang);
  for (const a of ARTICLES) {
    const c = a[lang];
    const ruUrl = `${SITE}/blog/${a.slug}/`, uzUrl = `${SITE}/uz/blog/${a.slug}/`, url = lang === 'uz' ? uzUrl : ruUrl;
    const ld = { '@context': 'https://schema.org', '@graph': [
      { '@type': 'Article', '@id': `${url}#article`, headline: c.title, description: c.desc, inLanguage: lang, datePublished: DATE, dateModified: DATE, image: `${SITE}/assets/og.png`, mainEntityOfPage: url,
        author: { '@type': 'Organization', name: 'PLT Digital', url: `${SITE}/digital/` }, publisher: { '@type': 'Organization', name: 'PLT GROUP', url: `${SITE}/`, logo: { '@type': 'ImageObject', url: `${SITE}/assets/apple-touch-icon.png` } } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'PLT Digital', item: `${SITE}${p}/digital/` },
        { '@type': 'ListItem', position: 2, name: t.blog, item: `${SITE}${p}/blog/` },
        { '@type': 'ListItem', position: 3, name: c.title, item: url } ] },
      { '@type': 'FAQPage', mainEntity: c.faq.map(([q, ans]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: ans } })) },
    ] };
    const body = c.sections.map(section).join('');
    const others = ARTICLES.filter((x) => x !== a).map((x) => card(x, lang)).join('');
    const html = head({ title: `${c.title} | PLT Digital`, desc: c.desc, keywords: c.keywords, url, ruUrl, uzUrl, lang, ld }) + localize(`${header}
<main>
  <section class="hero">
    <canvas class="hero-canvas" data-particles="PLT" aria-hidden="true"></canvas>
    <div class="wrap hero-copy">
      <h1 class="hero-title">${c.title}</h1>
      <p class="lead">${c.lead}</p>
      <div class="hero-cta">
        <a class="btn btn--main" href="#contact">${t.cta}</a>
        <a class="btn btn--outline" href="/digital/${a.service}/">${t.ctaService}</a>
      </div>
      <p class="hero-note"><a href="/blog/">${t.blog}</a> · PLT Digital · ${t.date}</p>
    </div>
  </section>
  <section class="section">
    <div class="wrap"><article class="post">${body}</article></div>
  </section>
  <section class="section" id="faq" style="background:var(--bg-2)">
    <div class="wrap">
      <div class="section-top"><h2>${t.faq}</h2></div>
      <ul class="rules-grid">${c.faq.map(([q, ans]) => `<li><span class="rule-dot"></span><h3><strong>${q}</strong></h3><span>${ans}</span></li>`).join('')}</ul>
    </div>
  </section>
  <section class="section" id="more">
    <div class="wrap">
      <div class="section-top"><h2>${t.more}</h2></div>
      <ul class="rows">${others}</ul>
    </div>
  </section>

  ${contact}
</main>
${footer}
`, lang).replace(/href="\/uz\/blog\/"([^>]*)>\/uz\/blog/g, 'href="/uz/blog/"$1>/uz/blog') + TAIL;
    write(`${lang === 'uz' ? 'uz/' : ''}blog/${a.slug}/index.html`, html);
  }
  // Blog index
  const ruUrl = `${SITE}/blog/`, uzUrl = `${SITE}/uz/blog/`, url = lang === 'uz' ? uzUrl : ruUrl;
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Blog', '@id': `${url}#blog`, name: t.blogTitle, description: t.blogDesc, url, inLanguage: lang, publisher: { '@type': 'Organization', name: 'PLT GROUP', url: `${SITE}/` },
      blogPost: ARTICLES.map((a) => ({ '@type': 'BlogPosting', headline: a[lang].title, url: `${SITE}${p}/blog/${a.slug}/`, datePublished: DATE })) },
  ] };
  const html = head({ title: t.blogTitle, desc: t.blogDesc, keywords: lang === 'uz' ? KW_DIGITAL_UZ : 'статьи о сайтах, как создать сайт, как создать телеграм бота, сколько стоит сайт, ИИ ассистент для бизнеса', url, ruUrl, uzUrl, lang, ld }).replace('og:type" content="article"', 'og:type" content="website"') + localize(`${header}
<main>
  <section class="hero">
    <canvas class="hero-canvas" data-particles="PLT" aria-hidden="true"></canvas>
    <div class="wrap hero-copy">
      <h1 class="hero-title">${t.blog}</h1>
      <p class="lead">${t.blogLead}</p>
      <div class="hero-cta"><a class="btn btn--main" href="#contact">${t.cta}</a></div>
      <p class="hero-note"><a href="/digital/">PLT Digital</a></p>
    </div>
  </section>
  <section class="section">
    <div class="wrap"><ul class="rows">${ARTICLES.map((a) => card(a, lang)).join('')}</ul></div>
  </section>

  ${contact}
</main>
${footer}
`, lang) + TAIL;
  write(`${lang === 'uz' ? 'uz/' : ''}blog/index.html`, html);
}

// 3. Russian pages get hreflang; Uzbek copies are written to /uz/.
for (const [path, m] of Object.entries(UZ)) {
  const rel = `${path}index.html`;
  const ruUrl = `${SITE}/${path}`, uzUrl = `${SITE}/uz/${path}`, enUrl = EN_OF[path] !== undefined ? `${SITE}/${EN_OF[path]}` : null;
  let h = read(rel).replace(/<html lang="ru"[^>]*>/, '<html lang="ru" data-page-lang="ru">');
  h = hreflang(h, ruUrl, uzUrl, ruUrl, enUrl);
  writeFileSync(join(ROOT, rel), h);
  let u = uzLinks(onlyUz(h)).replace('<html lang="ru" data-page-lang="ru">', '<html lang="uz" data-page-lang="uz">');
  u = setMeta(u, m);
  u = hreflang(u, ruUrl, uzUrl, uzUrl, enUrl)
    .replace('<meta property="og:locale" content="ru_RU">\n<meta property="og:locale:alternate" content="uz_UZ">', '<meta property="og:locale" content="uz_UZ">\n<meta property="og:locale:alternate" content="ru_RU">');
  u = syncFaq(u);
  write(`uz/${rel}`, u);
}
