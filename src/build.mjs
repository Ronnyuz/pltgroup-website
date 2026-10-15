// Generates the static site: node src/build.mjs
// Output: index.html, privacy.html (ru), uz/…, en/…, sitemap.xml
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dict } from './i18n.mjs';
import { LANGS, SITE } from './site.mjs';
import { home, privacy } from './page.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function write(rel, html) {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log('  ' + rel);
}

const urls = [];
for (const l of LANGS) {
  const t = dict[l.code];
  const root = l.path ? '../' : '';
  write(l.path + 'index.html', home(t, { root, langPath: l.path, page: 'home', t }));
  write(l.path + 'privacy.html', privacy(t, { root, langPath: l.path, page: 'privacy', t }));
  urls.push(`${SITE.url}/${l.path}`, `${SITE.url}/${l.path}privacy.html`);
}

// Old site pages → sections of the new home page, so existing links keep working.
const redirects = { 'solutions.html': '#services', 'industries.html': '#services', 'process.html': '#process', 'about.html': '#about', 'contact.html': '#contact' };
for (const [from, hash] of Object.entries(redirects)) {
  write(from, `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>PLT GROUP</title><meta name="robots" content="noindex"><link rel="canonical" href="${SITE.url}/${hash}"><meta http-equiv="refresh" content="0; url=./${hash}"></head><body><a href="./${hash}">PLT GROUP</a></body></html>\n`);
}

// 404 (GitHub Pages and most static hosts serve /404.html). Absolute paths: it can be shown at any depth.
write('404.html', `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Страница не найдена — PLT GROUP</title><meta name="robots" content="noindex">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/styles.css"></head>
<body class="page-404"><main class="hero" style="min-height:100vh;display:flex;align-items:center"><div class="hero-glow" aria-hidden="true"></div><div class="wrap" style="position:relative">
<p class="eyebrow eyebrow--dark">404</p><h1>Страница не найдена</h1><p class="lead" style="color:var(--on-night-muted);margin-bottom:32px">Sahifa topilmadi · Page not found</p>
<a class="btn btn--accent" href="/">На главную</a></div></main></body></html>
`);

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
