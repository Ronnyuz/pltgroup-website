// Generates the static site: node src/build.mjs
// Per language: index, services, process, prices, contacts, privacy. Plus 404, redirects, sitemap.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dict } from './i18n.mjs';
import { LANGS, SITE } from './site.mjs';
import * as tpl from './page.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const write = (rel, html) => {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log('  ' + rel);
};

const FILES = { home: 'index.html', services: 'services.html', process: 'process.html', prices: 'prices.html', contacts: 'contacts.html', privacy: 'privacy.html' };
const urls = [];
for (const l of LANGS) {
  const t = dict[l.code];
  for (const [page, file] of Object.entries(FILES)) {
    const ctx = { t, page, root: l.path ? '../' : '', langPath: l.path };
    write(l.path + file, tpl[page === 'home' ? 'home' : page](ctx));
    urls.push(`${SITE.url}/${l.path}${page === 'home' ? '' : file}`);
  }
}

// Old URLs from the first version of the site.
const redirects = { 'about.html': './', 'contact.html': 'contacts.html', 'solutions.html': 'services.html', 'industries.html': 'services.html' };
for (const [from, to] of Object.entries(redirects)) {
  write(from, `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>PLT GROUP</title><meta name="robots" content="noindex"><link rel="canonical" href="${SITE.url}/${to === './' ? '' : to}"><meta http-equiv="refresh" content="0; url=${to}"></head><body><a href="${to}">PLT GROUP</a></body></html>\n`);
}

write('404.html', tpl.notFound({ t: dict.ru }));

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
