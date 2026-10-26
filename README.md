# PLT GROUP | pltgroup.uz

Corporate website of PLT GROUP: websites, Telegram bots, CRM and analytics for businesses in Uzbekistan.

Static site, no framework. Hosted on Cloudflare Pages.

## Structure

- `/` PLT GROUP, `/agrovia/` PLT Agrovia (poultry farm), `/retail/` PLT Retail (household chemicals), `/privacy.html`: static pages edited by hand. Shared styles and script: `assets/plt.css`, `assets/plt.js` (form settings at the top of the form block: FormSubmit email, optional Telegram worker, company details).
- `/digital/` PLT Digital: a static page in the same design. The old generated IT pages are switched off (`BUILD_IT_PAGES` in `src/build.mjs`); their texts stay in `content/*.json`.
- Old addresses (`/services.html`, `/uz/`, `/en/`, `/digital/prices.html` and so on) redirect to `/digital/` through `_redirects`.
- Forms on all pages save requests to `/api/lead`, so they all appear in `/admin`.

## Content

- Site text and prices per language: `content/ru.json`, `content/uz.json`, `content/en.json`
- Contacts: `content/site.json`
- Cases and news: `content/posts/<slug>.json`
- Page layout: `src/page.mjs`; styles and scripts: `assets/styles.css`, `assets/app.js`

All of the above, except layout and styles, is edited in the admin panel at `/admin`.

## Build

```sh
node src/build.mjs
```

Regenerates all pages, redirects from old URLs, `404.html` and `sitemap.xml`.

## Admin panel

`/admin` (files in `admin/`, API in `functions/`, Cloudflare Pages Functions).

- Requests from the site form are stored in Cloudflare D1.
- Texts, prices, cases and news are saved as commits to this repository; Cloudflare rebuilds the site.
- Sign-in by login and password. The owner creates staff accounts and chooses what each one can open.

### Cloudflare setup (once)

1. **Workers & Pages → D1 → Create database**, name `pltgroup`.
2. Pages project **pltgroup-website → Settings → Bindings → Add → D1 database**: variable name `DB`, database `pltgroup`.
3. **Settings → Variables and secrets** (Production):
   - `OWNER_LOGIN` (text): owner login, e.g. `kamran`
   - `OWNER_PASSWORD` (secret): owner password for the first sign-in, at least 8 characters
   - `GITHUB_TOKEN` (secret): fine-grained GitHub token, repository `Ronnyuz/pltgroup-website`, permission **Contents: Read and write**
   - `GITHUB_REPO` (text): `Ronnyuz/pltgroup-website`
   - `GITHUB_BRANCH` (text): `main`
4. **Settings → Build**: build command `node src/build.mjs`, build output directory `/`.
5. **Deployments → Retry deployment** on the latest one.

The first sign-in with `OWNER_LOGIN` and `OWNER_PASSWORD` creates the owner account. After that the password lives in the database; change it in the panel under «Мой профиль».

### Local run

```sh
npx wrangler pages dev . --d1 DB=pltgroup
```

with `OWNER_LOGIN`, `OWNER_PASSWORD`, `GITHUB_TOKEN`, `GITHUB_REPO` in `.dev.vars`.

## SEO pages (October 2026)

- Service pages `/digital/sayt/`, `/digital/telegram-bot/`, `/digital/crm/`, `/digital/ai-assistant/` are generated from `digital/index.html`: `node tools/service-pages.mjs .`
- English pages under `/en/` (home, PLT Digital, services, privacy): `node tools/en-pages.mjs .` (run it after `tools/uz-and-blog.mjs`).
- PLT Agrovia (`/agrovia/`) is kept but hidden: `noindex`, not linked, not in the sitemap. PLT Retail is linked quietly (footer, one line on the home page).
- Uzbek copies of all main pages under `/uz/` (with hreflang) and the blog `/blog/`, `/uz/blog/` (texts in `tools/articles.mjs`): `node tools/uz-and-blog.mjs .`
- After editing `index.html`, `digital/index.html`, `agrovia/index.html` or `retail/index.html`, run both commands in this order so `/uz/` stays in sync, then commit.
- `llms.txt` describes the company for AI search; `096f69b6d9ea6b70d6b279f08c149197.txt` is the public IndexNow key (Bing, Yandex).
