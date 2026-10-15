// Site text lives in content/<lang>.json (editable in the admin panel).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = (code) => JSON.parse(readFileSync(join(ROOT, `content/${code}.json`), 'utf8'));

export const dict = { ru: load('ru'), uz: load('uz'), en: load('en') };
