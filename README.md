# PLT GROUP — pltgroup.uz

Corporate website of PLT GROUP: websites, Telegram bots, automation and analytics for businesses in Uzbekistan.

Static site, no framework. Languages: Russian (`/`), Uzbek (`/uz/`), English (`/en/`).

## Edit

- Text for all languages: `src/i18n.mjs`
- Phone, messengers, languages: `src/site.mjs`
- Page layout: `src/page.mjs`
- Styles and scripts: `assets/styles.css`, `assets/app.js`

## Build

```sh
node src/build.mjs
```

Regenerates `index.html`, `uz/`, `en/`, `privacy.html`, `404.html`, redirects from old page URLs and `sitemap.xml`. Commit the generated files: the host serves them as they are.
