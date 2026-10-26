// Generates PLT Digital service pages from digital/index.html: node tools/service-pages.mjs .
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.argv[2];
const SITE = 'https://pltgroup.uz';
const src = readFileSync(join(ROOT, 'digital/index.html'), 'utf8');
const cut = (a, b) => { const i = src.indexOf(a); const j = src.indexOf(b, i); return src.slice(i, j + b.length); };

const header = cut('<header class="site-header">', '</header>')
  .replace('href="#services"', 'href="/digital/#services"')
  .replace('href="#projects"', 'href="/digital/#projects"')
  .replace('href="#process"', 'href="/digital/#process"');
const process_ = cut('<section class="section" id="process">', '</section>');
const contact = cut('<section class="section contacts-sec" id="contact">', '</section>');
const footer = cut('<footer class="foot">', '</footer>');
const tail = '<script src="/assets/plt.js?v=0bb341ba"></script>\n</body>\n</html>\n';
const rows = [...src.matchAll(/<li class="row">[\s\S]*?<\/li>/g)].map((m) => m[0]);
const rowOf = (name) => rows.find((r) => r.includes(`<span class="ru">${name}</span>`) || r.includes(`<span class="row-name">${name}</span>`));

const ru = (r, u) => `<span class="ru">${r}</span><span class="uz">${u}</span>`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const PAGES = [
  {
    slug: 'sayt', particles: 'WEB', option: 'Сайт', rows: ['Сайты'],
    title: 'Разработка сайтов в Ташкенте: создать сайт под ключ | PLT Digital',
    desc: 'Создание сайтов в Ташкенте под ключ: сайт компании или лендинг, который собирает заявки и отправляет их в Telegram или CRM. Первый результат через две недели.',
    keywords: 'разработка сайтов, разработка сайтов Ташкент, создание сайтов, создать сайт, заказать сайт, сайт под ключ, сделать сайт для бизнеса, лендинг, сайт компании, веб-студия Ташкент, разработка сайтов Узбекистан, sayt yaratish, sayt ochish, web sayt yaratish, sayt buyurtma qilish, сделать сайт, сайт сделать недорого, нужен сайт, кто делает сайты Ташкент, сколько стоит сайт, сайт цена, сайт для магазина, сайт для кафе, сайт для салона, сайт визитка, программист Ташкент, айти компания Ташкент, веб разработка, sayt qilish, sayt kerak, arzon sayt, sayt narxi, sayt qildirish, website development Tashkent, create website, make a website, website Uzbekistan, web development Uzbekistan',
    service: 'Разработка сайтов', serviceEn: 'Website development',
    h1: ru('Разработка сайтов в Ташкенте', 'Toshkentda sayt yaratish'),
    lead: ru('Создаём сайты под ключ для бизнеса: от задания и дизайна до запуска. Сайт собирает заявки и отправляет их вам в Telegram или CRM.', 'Biznes uchun saytlarni to‘liq tayyorlab beramiz: topshiriq va dizayndan ishga tushirishgacha. Sayt arizalarni yig‘adi va ularni sizga Telegram yoki CRMga yuboradi.'),
    items: [
      [ru('Дизайн до начала работ', 'Ish boshlanishidan oldin dizayn'), ru('Показываем макет и фиксируем функции, срок и цену в договоре.', 'Maketni ko‘rsatamiz, funksiyalar, muddat va narxni shartnomada belgilaymiz.')],
      [ru('Несколько языков', 'Bir nechta til'), ru('Сайт на русском, узбекском и английском, чтобы вас находили все клиенты.', 'Barcha mijozlar sizni topishi uchun rus, o‘zbek va ingliz tillaridagi sayt.')],
      [ru('Заявки не теряются', 'Arizalar yo‘qolmaydi'), ru('Каждая заявка с сайта сразу приходит вам в Telegram или CRM.', 'Saytdagi har bir ariza darhol Telegram yoki CRMga keladi.')],
      [ru('Запуск и поддержка', 'Ishga tushirish va qo‘llab-quvvatlash'), ru('Публикуем сайт, обучаем сотрудников и остаёмся на связи.', 'Saytni e’lon qilamiz, xodimlarni o‘rgatamiz va aloqada qolamiz.')],
    ],
    faq: [
      ['Сколько стоит создать сайт?', 'Sayt yaratish qancha turadi?', 'Цена зависит от объёма работ, ориентир указан выше. Точную сумму назовём после первой встречи.', 'Narx ish hajmiga bog‘liq, taxminiy narx yuqorida ko‘rsatilgan. Aniq summani birinchi uchrashuvdan keyin aytamiz.'],
      ['Сколько времени делается сайт?', 'Sayt qancha vaqtda tayyor bo‘ladi?', 'Первый результат через две недели. Точный срок фиксируем в договоре.', 'Birinchi natija ikki haftada. Aniq muddatni shartnomada belgilaymiz.'],
      ['На каких языках можно сделать сайт?', 'Sayt qaysi tillarda bo‘lishi mumkin?', 'На русском, узбекском и английском, по вашему выбору.', 'Tanlovingizga ko‘ra rus, o‘zbek va ingliz tillarida.'],
      ['Вы работаете только в Ташкенте?', 'Faqat Toshkentda ishlaysizmi?', 'Мы находимся в Ташкенте и работаем с бизнесом в Узбекистане.', 'Biz Toshkentda joylashganmiz va O‘zbekistondagi biznes bilan ishlaymiz.'],
      ['Нужен сайт: к кому обратиться в Ташкенте?', 'Sayt kerak: Toshkentda kimga murojaat qilish kerak?', 'Напишите или позвоните в PLT Digital: +998 33 111 30 10, Telegram и WhatsApp по этому же номеру. Ответим в течение рабочего дня.', 'PLT Digitalga yozing yoki qo‘ng‘iroq qiling: +998 33 111 30 10, Telegram va WhatsApp ham shu raqamda. Ish kuni davomida javob beramiz.'],
      ['Можно сделать сайт недорого?', 'Arzon sayt qilish mumkinmi?', 'Да. Начните с простого сайта, который собирает заявки, а потом добавляйте функции. Ориентир цены указан выше.', 'Ha. Arizalarni yig‘adigan oddiy saytdan boshlang, keyin funksiyalar qo‘shing. Taxminiy narx yuqorida ko‘rsatilgan.'],
      ['Сделаете сайт для магазина, кафе или салона?', 'Do‘kon, kafe yoki salon uchun sayt qilasizmi?', 'Да, мы делаем сайты для малого бизнеса. На первой встрече разберём, что нужно именно вам.', 'Ha, kichik biznes uchun saytlar qilamiz. Birinchi uchrashuvda aynan sizga nima kerakligini aniqlaymiz.'],
      ['Что нужно, чтобы заказать сайт?', 'Sayt buyurtma qilish uchun nima kerak?', 'Только оставить заявку. За одну встречу соберём техническое задание, покажем макет и зафиксируем срок и цену в договоре.', 'Faqat ariza qoldiring. Bitta uchrashuvda texnik topshiriq tuzamiz, maketni ko‘rsatamiz, muddat va narxni shartnomada belgilaymiz.'],
    ],
    en: '<strong>Website development in Tashkent.</strong> PLT Digital creates business websites in Uzbekistan: design, multilingual content (Russian, Uzbek, English) and lead forms connected to Telegram or CRM. Want to create a website? Call +998 33 111 30 10.',
  },
  {
    slug: 'telegram-bot', particles: 'BOT', option: 'Telegram-бот', rows: ['Telegram-боты'],
    title: 'Создание Telegram-ботов в Ташкенте: заказать телеграм-бота | PLT Digital',
    desc: 'Создание Telegram-ботов для бизнеса в Ташкенте: заказы, оплата, запись и заявки прямо в Telegram, а также Telegram Mini App. Первый результат через две недели.',
    keywords: 'создать телеграм бота, создать тг бота, создание телеграм ботов, разработка телеграм ботов, заказать телеграм бота, телеграм бот для бизнеса, тг бот, бот для заказов, бот для записи, Telegram Mini App, чат-бот Ташкент, разработка ботов Узбекистан, telegram bot yaratish, bot yasash, tg bot yaratish, telegram bot buyurtma, телеграмм бот, телеграмм бот заказать, сделать бота в телеграм, как сделать бота, бот для телеграм, бот для магазина, бот для заказов еды, нужен бот, тг бот заказать, бот цена, telegram bot qilish, bot kerak, telegram bot narxi, telegram bot development, create telegram bot, make telegram bot, telegram bot Tashkent',
    service: 'Создание Telegram-ботов', serviceEn: 'Telegram bot development',
    h1: ru('Создание Telegram-ботов', 'Telegram-bot yaratish'),
    lead: ru('Делаем телеграм-ботов для бизнеса в Ташкенте и по Узбекистану: заказы, оплата, запись и ответы клиентам прямо в Telegram.', 'Toshkent va O‘zbekiston bo‘ylab biznes uchun Telegram-botlar yaratamiz: buyurtma, to‘lov, yozilish va mijozlarga javob to‘g‘ridan-to‘g‘ri Telegramda.'),
    items: [
      [ru('Заказы и оплата', 'Buyurtma va to‘lov'), ru('Клиент выбирает товар или услугу и оплачивает прямо в Telegram.', 'Mijoz mahsulot yoki xizmatni tanlaydi va to‘g‘ridan-to‘g‘ri Telegramda to‘laydi.')],
      [ru('Запись и заявки', 'Yozilish va arizalar'), ru('Бот принимает заявки круглосуточно и передаёт их сотрудникам.', 'Bot arizalarni kecha-kunduz qabul qiladi va xodimlarga uzatadi.')],
      [ru('Telegram Mini App', 'Telegram Mini App'), ru('Приложение внутри Telegram: каталог, личный кабинет, статистика.', 'Telegram ichidagi ilova: katalog, shaxsiy kabinet, statistika.')],
      [ru('Свой опыт', 'O‘z tajribamiz'), ru('Мы запустили своих ботов: AZS Radar (АЗС и цены на топливо) и Цветотека (поиск цветов в Ташкенте).', 'O‘z botlarimizni ishga tushirdik: AZS Radar (shoxobchalar va yoqilg‘i narxlari) va Цветотека (Toshkentda gul qidirish).')],
    ],
    faq: [
      ['Сколько стоит создать Telegram-бота?', 'Telegram-bot yaratish qancha turadi?', 'Цена зависит от функций бота, ориентир указан выше. Точную сумму назовём после первой встречи.', 'Narx bot funksiyalariga bog‘liq, taxminiy narx yuqorida ko‘rsatilgan. Aniq summani birinchi uchrashuvdan keyin aytamiz.'],
      ['Сколько времени делается бот?', 'Bot qancha vaqtda tayyor bo‘ladi?', 'Первый результат через две недели. Промежуточные версии показываем по ходу работы.', 'Birinchi natija ikki haftada. Oraliq versiyalarni ish jarayonida ko‘rsatamiz.'],
      ['Можно принимать оплату в боте?', 'Botda to‘lov qabul qilish mumkinmi?', 'Да, заказы и оплата могут проходить прямо в Telegram.', 'Ha, buyurtma va to‘lov to‘g‘ridan-to‘g‘ri Telegramda amalga oshishi mumkin.'],
      ['Бот будет передавать заявки сотрудникам?', 'Bot arizalarni xodimlarga uzatadimi?', 'Да, заявки приходят сотрудникам в Telegram или в CRM.', 'Ha, arizalar xodimlarga Telegram yoki CRM orqali keladi.'],
      ['Где заказать телеграмм бота в Ташкенте?', 'Toshkentda Telegram botni qayerdan buyurtma qilish mumkin?', 'В PLT Digital: +998 33 111 30 10, Telegram и WhatsApp по этому же номеру. Ответим в течение рабочего дня.', 'PLT Digitalda: +998 33 111 30 10, Telegram va WhatsApp ham shu raqamda. Ish kuni davomida javob beramiz.'],
      ['Как сделать бота в Телеграм для бизнеса?', 'Biznes uchun Telegramda bot qanday qilinadi?', 'Самому долго и сложно. Опишите задачу, а мы за одну встречу соберём задание и покажем первый результат через две недели.', 'O‘zingiz qilishingiz uzoq va qiyin. Vazifani yozing, biz bitta uchrashuvda topshiriq tuzamiz va ikki haftada birinchi natijani ko‘rsatamiz.'],
      ['Нужен простой тг бот для заказов, сделаете?', 'Buyurtmalar uchun oddiy tg bot kerak, qilasizmi?', 'Да. Можно начать с простого бота для заказов и заявок, а потом добавить оплату и другие функции.', 'Ha. Buyurtma va arizalar uchun oddiy botdan boshlab, keyin to‘lov va boshqa funksiyalarni qo‘shish mumkin.'],
      ['Чем бот лучше сайта?', 'Bot saytdan nimasi bilan yaxshi?', 'Клиенту не нужно ничего искать: он заказывает прямо в Telegram, где уже переписывается. Часто бизнесу нужны и сайт, и бот, их можно связать.', 'Mijoz hech narsa qidirmaydi: u allaqachon yozishib turgan Telegramda buyurtma beradi. Ko‘pincha biznesga sayt ham, bot ham kerak, ularni bog‘lash mumkin.'],
    ],
    en: '<strong>Telegram bot development in Tashkent.</strong> PLT Digital creates Telegram bots and Telegram Mini Apps for businesses in Uzbekistan: orders, payments, bookings and lead handling. Want to create a Telegram bot? Call +998 33 111 30 10.',
  },
  {
    slug: 'crm', particles: 'CRM', option: 'CRM', rows: ['CRM', 'Аналитика'],
    title: 'CRM и аналитика для бизнеса в Ташкенте: внедрение CRM | PLT Digital',
    desc: 'Внедрение CRM и аналитики для бизнеса в Ташкенте: все заявки из сайта, Telegram и Instagram в одном окне, выручка и остатки на одном экране.',
    keywords: 'CRM Ташкент, внедрение CRM, CRM для бизнеса, CRM система Узбекистан, CRM для малого бизнеса, учёт заявок, аналитика продаж, дашборд, отчёты для бизнеса, автоматизация бизнеса Ташкент, CRM tizimi, biznes avtomatlashtirish, CRM development Uzbekistan, business analytics Tashkent',
    service: 'CRM и аналитика', serviceEn: 'CRM and business analytics',
    h1: ru('CRM и аналитика для бизнеса', 'Biznes uchun CRM va analitika'),
    lead: ru('Собираем все заявки в одном окне и показываем выручку и остатки на одном экране. Для малого бизнеса в Ташкенте и по Узбекистану.', 'Barcha arizalarni bitta oynada yig‘amiz, tushum va qoldiqlarni bitta ekranda ko‘rsatamiz. Toshkent va O‘zbekistondagi kichik biznes uchun.'),
    items: [
      [ru('Все заявки в одном окне', 'Barcha arizalar bitta oynada'), ru('Заявки из сайта, Telegram и Instagram больше не теряются.', 'Sayt, Telegram va Instagramdan kelgan arizalar endi yo‘qolmaydi.')],
      [ru('Выручка и остатки', 'Tushum va qoldiqlar'), ru('Главные цифры бизнеса на одном экране.', 'Biznesning asosiy raqamlari bitta ekranda.')],
      [ru('Под ваши процессы', 'Jarayonlaringizga mos'), ru('Разбираем, что мешает работать, и делаем систему под задачу.', 'Ishga nima xalaqit berayotganini aniqlaymiz va vazifaga mos tizim yaratamiz.')],
      [ru('Обучение сотрудников', 'Xodimlarni o‘qitish'), ru('После запуска обучаем команду и остаёмся на связи.', 'Ishga tushirgandan keyin jamoani o‘rgatamiz va aloqada qolamiz.')],
    ],
    faq: [
      ['Сколько стоит внедрение CRM?', 'CRM joriy qilish qancha turadi?', 'Цена договорная: она зависит от ваших процессов и объёма работ. Точную сумму назовём после первой встречи.', 'Narx kelishiladi: u jarayonlaringiz va ish hajmiga bog‘liq. Aniq summani birinchi uchrashuvdan keyin aytamiz.'],
      ['Можно собрать заявки из Instagram и Telegram?', 'Instagram va Telegramdan arizalarni yig‘ish mumkinmi?', 'Да, заявки из сайта, Telegram и Instagram попадают в одно окно.', 'Ha, sayt, Telegram va Instagramdan arizalar bitta oynaga tushadi.'],
      ['Как быстро будет результат?', 'Natija qachon bo‘ladi?', 'Первый результат через две недели.', 'Birinchi natija ikki haftada.'],
    ],
    en: '<strong>CRM and business analytics in Tashkent.</strong> PLT Digital builds CRM systems and dashboards for small businesses in Uzbekistan: all leads in one place, revenue and stock on one screen. Call +998 33 111 30 10.',
  },
  {
    slug: 'ai-assistant', particles: 'AI', option: 'ИИ-ассистент', rows: ['ИИ-ассистенты'],
    title: 'ИИ-ассистент и чат-бот для бизнеса в Ташкенте | PLT Digital',
    desc: 'ИИ-ассистенты для бизнеса в Ташкенте: отвечают клиентам круглосуточно на сайте и в Telegram, собирают заявки и передают их сотрудникам.',
    keywords: 'ИИ ассистент для бизнеса, чат-бот с искусственным интеллектом, AI бот, нейросеть для бизнеса, автоответчик для клиентов, ИИ чат-бот Ташкент, sun’iy intellekt bot, SI assistent, AI assistant for business, AI chatbot Tashkent',
    service: 'ИИ-ассистенты', serviceEn: 'AI assistants',
    h1: ru('ИИ-ассистенты для бизнеса', 'Biznes uchun SI-assistentlar'),
    lead: ru('ИИ-ассистент отвечает вашим клиентам круглосуточно на сайте или в Telegram и передаёт заявки сотрудникам.', 'SI-assistent mijozlaringizga saytda yoki Telegramda kecha-kunduz javob beradi va arizalarni xodimlarga uzatadi.'),
    items: [
      [ru('Круглосуточно', 'Kecha-kunduz'), ru('Отвечает клиентам ночью и в выходные.', 'Mijozlarga tunda va dam olish kunlari ham javob beradi.')],
      [ru('На сайте и в Telegram', 'Saytda va Telegramda'), ru('Работает там, где вам пишут клиенты.', 'Mijozlar sizga yozadigan joyda ishlaydi.')],
      [ru('Собирает заявки', 'Arizalarni yig‘adi'), ru('Записывает контакты и передаёт заявку сотруднику.', 'Kontaktlarni yozib oladi va arizani xodimga uzatadi.')],
      [ru('Знает ваш бизнес', 'Biznesingizni biladi'), ru('Отвечает по вашим услугам, ценам и правилам.', 'Xizmatlaringiz, narxlar va qoidalaringiz bo‘yicha javob beradi.')],
    ],
    faq: [
      ['Сколько стоит ИИ-ассистент?', 'SI-assistent qancha turadi?', 'Цена зависит от задач, ориентир указан выше. Точную сумму назовём после первой встречи.', 'Narx vazifalarga bog‘liq, taxminiy narx yuqorida ko‘rsatilgan. Aniq summani birinchi uchrashuvdan keyin aytamiz.'],
      ['Заменит ли ассистент менеджера?', 'Assistent menejerni almashtiradimi?', 'Он отвечает на частые вопросы и собирает заявки круглосуточно, а сложные вопросы передаёт сотрудникам.', 'U ko‘p beriladigan savollarga javob beradi va kecha-kunduz arizalarni yig‘adi, murakkab savollarni esa xodimlarga uzatadi.'],
      ['Где работает ассистент?', 'Assistent qayerda ishlaydi?', 'На вашем сайте или в Telegram.', 'Saytingizda yoki Telegramda.'],
    ],
    en: '<strong>AI assistants for business in Tashkent.</strong> PLT Digital builds AI chat assistants for websites and Telegram that answer customers 24/7 and pass leads to your team. Call +998 33 111 30 10.',
  },
];

const others = (slug) => PAGES.filter((p) => p.slug !== slug)
  .map((p) => `<li><a class="row" href="/digital/${p.slug}/"><span class="row-name">${p.h1}</span><span class="row-short">${p.lead.replace(/<span class="ru">([^<]*?)[.:][\s\S]*?<\/span><span class="uz">([^<]*?)[.:][\s\S]*?<\/span>/, ru('$1.', '$2.'))}</span><span class="row-end link">${ru('Открыть', 'Ochish')}</span></a></li>`).join('');

for (const p of PAGES) {
  const url = `${SITE}/digital/${p.slug}/`;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${SITE}/#org`, name: 'PLT GROUP', url: `${SITE}/`, logo: `${SITE}/assets/apple-touch-icon.png` },
      { '@type': 'ProfessionalService', '@id': `${SITE}/digital/#org`, name: 'PLT Digital', url: `${SITE}/digital/`, telephone: '+998331113010', email: 'info@pltgroup.uz', address: { '@type': 'PostalAddress', addressLocality: 'Ташкент', addressCountry: 'UZ' }, parentOrganization: { '@id': `${SITE}/#org` } },
      { '@type': 'Service', '@id': `${url}#service`, name: p.service, alternateName: p.serviceEn, serviceType: p.service, description: p.desc, url, provider: { '@id': `${SITE}/digital/#org` }, areaServed: [{ '@type': 'City', name: 'Ташкент' }, { '@type': 'Country', name: 'Узбекистан' }], inLanguage: ['ru', 'uz', 'en'] },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'PLT GROUP', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'PLT Digital', item: `${SITE}/digital/` },
        { '@type': 'ListItem', position: 3, name: p.service, item: url },
      ] },
      { '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: p.faq.map(([q, , a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    ],
  };
  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${p.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@300..800&display=swap">
<link rel="stylesheet" href="/assets/plt.css?v=685a323a">
<style>:root { --accent: #ff5a45; --accent-dot: #ff5a45; --c3: #ff5a45; }</style>
<meta name="description" content="${esc(p.desc)}">
<meta name="keywords" content="${esc(p.keywords)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="yandex-verification" content="1c2475a81e074f44">
<meta name="msvalidate.01" content="AD293F32270DEEE0C09E1FC8C850A855">
<meta name="theme-color" content="#fbfbfd">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="PLT GROUP">
<meta property="og:locale" content="ru_RU">
<meta property="og:locale:alternate" content="uz_UZ">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(p.desc)}">
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
${header}
<main>
  <section class="hero">
    <canvas class="hero-canvas" data-particles="${p.particles}" aria-hidden="true"></canvas>
    <div class="wrap hero-copy">
      <h1 class="hero-title">${p.h1}</h1>
      <p class="lead">${p.lead}</p>
      <div class="hero-cta">
        <a class="btn btn--main" href="#contact">${ru('Обсудить задачу', 'Vazifani muhokama qilish')}</a>
        <a class="btn btn--outline" href="#price">${ru('Цена', 'Narx')}</a>
      </div>
      <p class="hero-note"><a href="/digital/">PLT Digital</a> · ${ru('Ташкент, Узбекистан', 'Toshkent, O‘zbekiston')}</p>
    </div>
  </section>
  <section class="section" id="price">
    <div class="wrap">
      <div class="section-top"><h2>${ru('Что входит', 'Nimalar kiradi')}</h2><p>${ru('Цена зависит от объёма работ. Точную сумму назовём после первой встречи.', 'Narx ish hajmiga bog‘liq. Aniq summani birinchi uchrashuvdan keyin aytamiz.')}</p></div>
      <ul class="rows">${p.rows.map(rowOf).join('')}</ul>
      <ul class="rules-grid four" style="margin-top:48px">${p.items.map(([t, d]) => `<li><span class="rule-dot"></span><h3><strong>${t}</strong></h3><span>${d}</span></li>`).join('')}</ul>
    </div>
  </section>
  ${process_.replace('<section class="section" id="process">', '<section class="section" id="process" style="background:var(--bg-2)">')}
  <section class="section" id="faq">
    <div class="wrap">
      <div class="section-top"><h2>${ru('Частые вопросы', 'Ko‘p beriladigan savollar')}</h2></div>
      <ul class="rules-grid${p.faq.length === 4 ? ' four' : ''}">${p.faq.map(([q, qu, a, au]) => `<li><span class="rule-dot"></span><h3><strong>${ru(q, qu)}</strong></h3><span>${ru(a, au)}</span></li>`).join('')}</ul>
    </div>
  </section>
  <section class="section" id="more" style="background:var(--bg-2)">
    <div class="wrap">
      <div class="section-top"><h2>${ru('Другие услуги', 'Boshqa xizmatlar')}</h2></div>
      <ul class="rows">${others(p.slug)}</ul>
    </div>
  </section>

  ${contact.replace(`<option data-ru="${p.option}"`, `<option selected data-ru="${p.option}"`)}
</main>
${footer}
${tail}`;
  if (html.includes('—')) throw new Error('em dash in ' + p.slug);
  mkdirSync(join(ROOT, 'digital', p.slug), { recursive: true });
  writeFileSync(join(ROOT, 'digital', p.slug, 'index.html'), html);
  console.log('digital/' + p.slug + '/index.html');
}
