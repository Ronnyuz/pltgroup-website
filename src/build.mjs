// Generates the static site: node src/build.mjs
// Per language: index, services, process, prices, contacts, privacy. Plus 404, redirects, sitemap.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

// Work and news posts: content/posts/*.json, newest first; drafts (published: false) are skipped.
const POSTS_DIR = join(ROOT, 'content/posts');
const posts = (existsSync(POSTS_DIR) ? readdirSync(POSTS_DIR) : [])
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ slug: f.replace(/\.json$/, ''), ...JSON.parse(readFileSync(join(POSTS_DIR, f), 'utf8')) }))
  .map((p) => ({ ...p, slug: String(p.slug || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') }))
  .filter((p) => p.published !== false && p.slug)
  .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

// Remove pages of posts that were deleted or unpublished.
for (const l of LANGS) {
  const dir = join(ROOT, l.path, 'work');
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  if (!posts.length && existsSync(join(ROOT, l.path, 'work.html'))) rmSync(join(ROOT, l.path, 'work.html'));
}

const FILES = { home: 'index.html', services: 'services.html', process: 'process.html', prices: 'prices.html', contacts: 'contacts.html', privacy: 'privacy.html', ...(posts.length ? { work: 'work.html' } : {}) };
const urls = [];
// The PLT Digital page (/digital/) is now a static page in the PLT GROUP design, like /agrovia/ and /retail/.
// The generated IT pages are switched off; set this to true to build them again from content/*.json.
const BUILD_IT_PAGES = false;
for (const l of BUILD_IT_PAGES ? LANGS : []) {
  const t = dict[l.code];
  const root = '../'.repeat(l.path.split('/').filter(Boolean).length);
  for (const [page, file] of Object.entries(FILES)) {
    const ctx = { t, page, root, langPath: l.path, posts };
    write(l.path + file, tpl[page](ctx));
    urls.push(`${SITE.url}/${l.path}${page === 'home' ? '' : file}`);
  }
  for (const p of posts) {
    write(`${l.path}work/${p.slug}.html`, tpl.post({ t, page: 'post', post: p, root: root + '../', langPath: l.path, posts }));
    urls.push(`${SITE.url}/${l.path}work/${p.slug}.html`);
  }
}

// Old URLs from the first version of the site.
const redirects = { 'about.html': 'digital/', 'contact.html': 'digital/#contact', 'solutions.html': 'digital/#services', 'industries.html': 'digital/#services' };
for (const [from, to] of Object.entries(redirects)) {
  write(from, `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>PLT GROUP</title><meta name="robots" content="noindex"><link rel="canonical" href="${SITE.url}/${to}"><meta http-equiv="refresh" content="0; url=${to}"></head><body><a href="${to}">PLT GROUP</a></body></html>\n`);
}

write('404.html', tpl.notFound({ t: dict.ru, page: '404', posts }));

const today = new Date().toISOString().slice(0, 10);
// Static pages of the group (index.html, agrovia/, retail/, privacy.html) are kept by hand.
// Each of them also has an Uzbek copy under /uz/.
const STATIC = ['', 'digital/', 'digital/sayt/', 'digital/telegram-bot/', 'digital/crm/', 'digital/ai-assistant/',
  'blog/', 'blog/skolko-stoit-sayt/', 'blog/kak-sozdat-telegram-bota/', 'blog/sayt-ili-telegram-bot/', 'blog/ii-assistent-dlya-biznesa/',
  'agrovia/', 'retail/'];
urls.unshift(...STATIC.map((u) => `${SITE.url}/${u}`), `${SITE.url}/privacy`, ...STATIC.map((u) => `${SITE.url}/uz/${u}`));

write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
