// Contacts come from content/site.json (editable in the admin panel). Languages are fixed here.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(ROOT, 'content/site.json'), 'utf8'));
const digits = (s) => String(s || '').replace(/\D/g, '');

export const SITE = {
  url: 'https://pltgroup.uz',
  email: site.email,
  phone: '+' + digits(site.phone),
  phoneHuman: site.phoneHuman,
  whatsappNumber: digits(site.whatsappNumber),
  whatsapp: `https://wa.me/${digits(site.whatsappNumber)}`,
  telegram: site.telegram,
  gaId: /^G-[A-Z0-9]+$/.test(site.googleAnalytics || '') ? site.googleAnalytics : '',
};

// path: folder relative to the site root. The IT site (PLT Digital) lives under /digital/;
// the site root holds the PLT GROUP page and the other companies (static files, not built here).
export const LANGS = [
  { code: 'ru', short: 'RU', path: 'digital/' },
  { code: 'uz', short: 'UZ', path: 'digital/uz/' },
  { code: 'en', short: 'EN', path: 'digital/en/' },
];
