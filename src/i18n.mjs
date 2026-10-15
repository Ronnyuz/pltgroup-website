// All site text. Keys must match in every language.
// accent names: coral, blue, mint, amber, violet, sky (see --a-* in styles.css)

const ru = {
  meta: {
    code: 'ru', htmlLang: 'ru', ogLocale: 'ru_RU', langLabel: 'Язык сайта',
    title: 'PLT GROUP — сайты, Telegram-боты, CRM и аналитика в Ташкенте',
    description: 'Сайты, Telegram-боты, CRM и аналитика для бизнеса в Узбекистане. По договору, с фиксированной ценой, запуск от двух недель.',
  },
  nav: { skip: 'Перейти к содержимому', label: 'Основное меню', services: 'Услуги', process: 'Как работаем', pricing: 'Поддержка', faq: 'Вопросы', contact: 'Контакты', cta: 'Обсудить задачу', menu: 'Меню' },
  hero: {
    eyebrow: 'Digital-студия · Ташкент',
    lines: ['Порядок в'], words: [['заявках', 'coral'], ['продажах', 'blue'], ['цифрах', 'mint'], ['складе', 'amber']], after: [],
    lead: 'Сайты, Telegram-боты, CRM и аналитика для бизнеса в Узбекистане. Запуск от двух недель.',
    primary: 'Обсудить задачу', secondary: 'Услуги',
    chips: ['Договор', 'Фиксированная цена', 'Код и доступы — ваши'],
  },
  board: {
    aria: 'Как заявки из разных каналов собираются в одну таблицу',
    chaos: 'было', order: 'стало', cols: ['Канал', 'Запрос', 'Статус'],
    status: { new: 'Новая', wip: 'В работе', ok: 'Готово' },
    items: [['Telegram', 'Есть 40 шт. в наличии?', 'new'], ['Instagram', 'Какая цена оптом?', 'new'], ['Звонок', 'Пропущенный, 14:32', 'wip'], ['Excel', 'ostatki_v7_final.xlsx', 'wip'], ['WhatsApp', 'Где мой заказ?', 'ok'], ['Счёт №118', 'Ждёт оплаты', 'ok']],
  },
  marquee: ['Сайты', 'Telegram-боты', 'CRM', 'Аналитика', 'ИИ-ассистенты', 'Каталоги'],
  services: {
    eyebrow: 'Услуги', title: 'Что делаем', start: 'С чего начать',
    items: [
      { title: 'Аудит', text: 'Найдём, где теряются заявки и деньги. Стоимость засчитывается в проект.', price: '$150', term: '1 неделя', accent: 'coral', start: true },
      { title: 'Сайты', text: 'Сайт на трёх языках, который приводит заявки, а не просто существует.', price: 'от $400', term: '1–2 недели', accent: 'blue' },
      { title: 'Telegram-боты', text: 'Заказы, запись и оплата через Click и Payme прямо в Telegram.', price: 'от $500', term: '2–4 недели', accent: 'sky' },
      { title: 'CRM', text: 'amoCRM или Bitrix24 под ваш процесс. Ни одна заявка не теряется.', price: 'от $1 000', term: '3–6 недель', accent: 'violet' },
      { title: 'Аналитика', text: 'Выручка, продажи и остатки на одном экране, каждый день.', price: 'от $700', term: '2–4 недели', accent: 'mint' },
      { title: 'ИИ-ассистенты', text: 'Отвечает клиентам круглосуточно и передаёт заявки менеджеру.', price: 'от $800', term: '2–4 недели', accent: 'amber' },
    ],
  },
  process: {
    eyebrow: 'Как работаем', title: 'Четыре шага',
    steps: [
      { title: 'Разговор', time: '1–2 дня', text: 'Разбираем задачу и считаем смету.' },
      { title: 'Договор', time: '1 день', text: 'Объём, сроки и цена на бумаге. Предоплата 50%.' },
      { title: 'Запуск', time: '1–6 недель', text: 'Показываем промежуточные версии, обучаем команду.' },
      { title: 'Поддержка', time: 'каждый месяц', text: 'Следим за работой, правим, развиваем.' },
    ],
  },
  principles: [['Договор до старта', 'Объём, сроки и цена — письменно.'], ['Цена не растёт', 'Смета не меняется без вашего согласия.'], ['Всё ваше', 'Код, доступы и данные остаются у вас.']],
  pricing: {
    eyebrow: 'Поддержка', title: 'После запуска', lead: 'Первый месяц бесплатно.',
    popular: 'Чаще выбирают', perMonth: '/ мес', cta: 'Выбрать',
    plans: [
      { name: 'Старт', for: 'Сайт', price: 'от $50', list: ['Хостинг, домен, резервные копии', 'До 2 часов правок', 'Ответ в течение дня'] },
      { name: 'Бизнес', for: 'Сайт, бот и CRM', price: 'от $150', featured: true, list: ['Всё из «Старта»', 'До 6 часов правок', 'Ежемесячный отчёт', 'Ответ за 2 часа'] },
      { name: 'Партнёр', for: 'С аналитикой', price: 'от $350', list: ['Всё из «Бизнеса»', 'До 15 часов правок', 'Еженедельный отчёт по цифрам', 'Приоритет'] },
    ],
    rows: [['Хостинг, домен, резервные копии', true, true, true], ['Правки в месяц', 'до 2 часов', 'до 6 часов', 'до 15 часов'], ['Время ответа', 'в течение дня', '2 часа', '2 часа, вне очереди'], ['Мониторинг работы', null, true, true], ['Отчёт', null, 'раз в месяц', 'каждую неделю, с цифрами']],
    note: 'Цены в долларах для ориентира. В договоре — в сумах по курсу ЦБ.',
  },
  faq: {
    eyebrow: 'Вопросы', title: 'Коротко',
    items: [
      ['Сколько стоит проект?', 'Точную цену называем после короткого разговора и фиксируем в договоре.'],
      ['Как оплатить?', '50% до начала работ, 50% после приёмки. Перечислением, в сумах.'],
      ['Сколько ждать запуска?', 'Сайт — 1–2 недели, бот — 2–4, CRM и аналитика — 3–6.'],
      ['Что, если после запуска нужны правки?', 'Ошибки исправляем бесплатно 30 дней. Дальше — по подписке на поддержку или по часам.'],
      ['Работаете не только в Ташкенте?', 'Да, по всему Узбекистану и за рубежом. Встречи в Ташкенте или онлайн.'],
    ],
  },
  contact: {
    eyebrow: 'Контакты', title: 'Обсудим задачу?',
    lead: 'Ответим в течение рабочего дня. Первая консультация бесплатна.',
    email: 'Почта', phone: 'Телефон', copy: 'Скопировать', copied: 'Скопировано', city: 'Ташкент, Узбекистан',
  },
  form: {
    title: 'Заявка', name: 'Имя', contact: 'Телефон или Telegram', service: 'Что нужно', task: 'Задача',
    taskHint: 'Например: заявки из Instagram теряются, хотим видеть их в одном месте',
    services: ['Пока не знаю, нужен совет', 'Аудит', 'Сайты', 'Telegram-боты', 'CRM', 'Аналитика', 'ИИ-ассистенты', 'Поддержка'],
    required: 'Заполните это поле', submit: 'Отправить в WhatsApp',
    note: 'Сайт не хранит данные: откроется WhatsApp с готовым сообщением.',
    intro: 'Здравствуйте! Заявка с сайта PLT GROUP.',
  },
  footer: { tagline: 'Сайты, боты, CRM и аналитика для бизнеса.', privacy: 'Конфиденциальность', rights: 'Все права защищены.' },
  privacy: {
    eyebrow: 'Документы', title: 'Политика конфиденциальности',
    lead: 'Как PLT GROUP обращается с данными посетителей сайта pltgroup.uz.',
    sections: [
      ['Какие данные мы получаем', 'Сайт не собирает и не хранит персональные данные. Форма заявки составляет сообщение в вашем браузере и открывает WhatsApp. Данные попадают к нам, только когда вы сами отправляете сообщение или письмо.'],
      ['Как мы их используем', 'Только чтобы ответить на обращение и подготовить предложение. Мы не продаём и не передаём данные третьим лицам.'],
      ['Сторонние сервисы', 'Сайт загружает шрифты Google Fonts. В WhatsApp и Telegram действуют правила этих сервисов.'],
      ['Удаление данных', 'Напишите нам по любому контакту с сайта, и мы удалим переписку и данные о вашем обращении.'],
    ],
    updated: 'Редакция от 15 октября 2026 года.',
  },
};

const uz = {
  meta: {
    code: 'uz', htmlLang: 'uz', ogLocale: 'uz_UZ', langLabel: 'Sayt tili',
    title: 'PLT GROUP — saytlar, Telegram-botlar, CRM va tahlil, Toshkent',
    description: 'O‘zbekiston biznesi uchun saytlar, Telegram-botlar, CRM va tahlil. Shartnoma asosida, qat’iy narx bilan, ikki haftadan ishga tushirish.',
  },
  nav: { skip: 'Asosiy qismga o‘tish', label: 'Asosiy menyu', services: 'Xizmatlar', process: 'Ish tartibi', pricing: 'Qo‘llab-quvvatlash', faq: 'Savollar', contact: 'Aloqa', cta: 'Vazifani muhokama qilish', menu: 'Menyu' },
  hero: {
    eyebrow: 'Digital-studiya · Toshkent',
    lines: [], words: [['Arizalarda', 'coral'], ['Savdoda', 'blue'], ['Raqamlarda', 'mint'], ['Omborda', 'amber']], after: ['tartib'],
    lead: 'O‘zbekiston biznesi uchun saytlar, Telegram-botlar, CRM va tahlil. Ikki haftadan ishga tushiramiz.',
    primary: 'Vazifani muhokama qilish', secondary: 'Xizmatlar',
    chips: ['Shartnoma', 'Qat’iy narx', 'Kod va kirish — sizniki'],
  },
  board: {
    aria: 'Turli kanallardagi arizalar bitta jadvalga yig‘ilishi',
    chaos: 'avval', order: 'keyin', cols: ['Kanal', 'So‘rov', 'Holat'],
    status: { new: 'Yangi', wip: 'Jarayonda', ok: 'Tayyor' },
    items: [['Telegram', '40 dona bormi?', 'new'], ['Instagram', 'Ulgurji narxi qancha?', 'new'], ['Qo‘ng‘iroq', 'Javobsiz, 14:32', 'wip'], ['Excel', 'qoldiq_v7_final.xlsx', 'wip'], ['WhatsApp', 'Buyurtmam qayerda?', 'ok'], ['Hisob №118', 'To‘lov kutilmoqda', 'ok']],
  },
  marquee: ['Saytlar', 'Telegram-botlar', 'CRM', 'Tahlil', 'AI-yordamchilar', 'Kataloglar'],
  services: {
    eyebrow: 'Xizmatlar', title: 'Nima qilamiz', start: 'Shundan boshlang',
    items: [
      { title: 'Audit', text: 'Arizalar va pul qayerda yo‘qolishini topamiz. Narxi loyihaga qo‘shib hisoblanadi.', price: '$150', term: '1 hafta', accent: 'coral', start: true },
      { title: 'Saytlar', text: 'Shunchaki mavjud emas, ariza olib keladigan uch tilli sayt.', price: '$400 dan', term: '1–2 hafta', accent: 'blue' },
      { title: 'Telegram-botlar', text: 'Buyurtma, yozilish va Click, Payme orqali to‘lov — Telegramning o‘zida.', price: '$500 dan', term: '2–4 hafta', accent: 'sky' },
      { title: 'CRM', text: 'Jarayoningizga mos amoCRM yoki Bitrix24. Birorta ariza yo‘qolmaydi.', price: '$1 000 dan', term: '3–6 hafta', accent: 'violet' },
      { title: 'Tahlil', text: 'Tushum, savdo va qoldiqlar bitta ekranda, har kuni.', price: '$700 dan', term: '2–4 hafta', accent: 'mint' },
      { title: 'AI-yordamchilar', text: 'Mijozlarga kecha-kunduz javob beradi va arizani menejerga uzatadi.', price: '$800 dan', term: '2–4 hafta', accent: 'amber' },
    ],
  },
  process: {
    eyebrow: 'Ish tartibi', title: 'To‘rt qadam',
    steps: [
      { title: 'Suhbat', time: '1–2 kun', text: 'Vazifani tahlil qilamiz va smetani hisoblaymiz.' },
      { title: 'Shartnoma', time: '1 kun', text: 'Hajm, muddat va narx qog‘ozda. 50% oldindan to‘lov.' },
      { title: 'Ishga tushirish', time: '1–6 hafta', text: 'Oraliq versiyalarni ko‘rsatamiz, jamoani o‘qitamiz.' },
      { title: 'Qo‘llab-quvvatlash', time: 'har oy', text: 'Kuzatamiz, tuzatamiz, rivojlantiramiz.' },
    ],
  },
  principles: [['Avval shartnoma', 'Hajm, muddat va narx — yozma ravishda.'], ['Narx oshmaydi', 'Smeta roziligingizsiz o‘zgarmaydi.'], ['Hammasi sizniki', 'Kod, kirish huquqlari va ma’lumotlar sizda qoladi.']],
  pricing: {
    eyebrow: 'Qo‘llab-quvvatlash', title: 'Ishga tushgandan keyin', lead: 'Birinchi oy bepul.',
    popular: 'Ko‘p tanlanadi', perMonth: '/ oy', cta: 'Tanlash',
    plans: [
      { name: 'Start', for: 'Sayt', price: '$50 dan', list: ['Hosting, domen, zaxira nusxalar', '2 soatgacha tuzatish', 'Kun davomida javob'] },
      { name: 'Biznes', for: 'Sayt, bot va CRM', price: '$150 dan', featured: true, list: ['«Start»dagi hammasi', '6 soatgacha tuzatish', 'Oylik hisobot', '2 soatda javob'] },
      { name: 'Hamkor', for: 'Tahlil bilan', price: '$350 dan', list: ['«Biznes»dagi hammasi', '15 soatgacha tuzatish', 'Raqamlar bo‘yicha haftalik hisobot', 'Ustuvorlik'] },
    ],
    rows: [['Hosting, domen, zaxira nusxalar', true, true, true], ['Oylik tuzatishlar', '2 soatgacha', '6 soatgacha', '15 soatgacha'], ['Javob vaqti', 'kun davomida', '2 soat', '2 soat, navbatsiz'], ['Ish monitoringi', null, true, true], ['Hisobot', null, 'oyiga bir marta', 'har hafta, raqamlar bilan']],
    note: 'Narxlar mo‘ljal uchun dollarda. Shartnomada — MB kursi bo‘yicha so‘mda.',
  },
  faq: {
    eyebrow: 'Savollar', title: 'Qisqacha',
    items: [
      ['Loyiha qancha turadi?', 'Aniq narxni qisqa suhbatdan keyin aytamiz va shartnomada qayd etamiz.'],
      ['Qanday to‘lanadi?', '50% ish boshlanishidan oldin, 50% qabul qilingandan keyin. O‘tkazma orqali, so‘mda.'],
      ['Ishga tushirish qancha vaqt oladi?', 'Sayt — 1–2 hafta, bot — 2–4, CRM va tahlil — 3–6.'],
      ['Ishga tushgandan keyin tuzatish kerak bo‘lsa-chi?', 'Xatolarni 30 kun bepul tuzatamiz. Keyin — qo‘llab-quvvatlash obunasi yoki soatbay.'],
      ['Faqat Toshkentda ishlaysizmi?', 'Yo‘q, butun O‘zbekiston bo‘ylab va xorij bilan. Uchrashuvlar Toshkentda yoki onlayn.'],
    ],
  },
  contact: {
    eyebrow: 'Aloqa', title: 'Vazifani muhokama qilamizmi?',
    lead: 'Ish kuni davomida javob beramiz. Birinchi maslahat bepul.',
    email: 'Pochta', phone: 'Telefon', copy: 'Nusxa olish', copied: 'Nusxa olindi', city: 'Toshkent, O‘zbekiston',
  },
  form: {
    title: 'Ariza', name: 'Ism', contact: 'Telefon yoki Telegram', service: 'Nima kerak', task: 'Vazifa',
    taskHint: 'Masalan: Instagramdan kelgan arizalar yo‘qoladi, ularni bir joyda ko‘rmoqchimiz',
    services: ['Hali bilmayman, maslahat kerak', 'Audit', 'Saytlar', 'Telegram-botlar', 'CRM', 'Tahlil', 'AI-yordamchilar', 'Qo‘llab-quvvatlash'],
    required: 'Ushbu maydonni to‘ldiring', submit: 'WhatsApp orqali yuborish',
    note: 'Sayt ma’lumotlarni saqlamaydi: tayyor xabar bilan WhatsApp ochiladi.',
    intro: 'Assalomu alaykum! PLT GROUP saytidan ariza.',
  },
  footer: { tagline: 'Biznes uchun saytlar, botlar, CRM va tahlil.', privacy: 'Maxfiylik', rights: 'Barcha huquqlar himoyalangan.' },
  privacy: {
    eyebrow: 'Hujjatlar', title: 'Maxfiylik siyosati',
    lead: 'PLT GROUP pltgroup.uz sayti tashrifchilarining ma’lumotlari bilan qanday ishlaydi.',
    sections: [
      ['Qanday ma’lumot olamiz', 'Sayt shaxsiy ma’lumotlarni yig‘maydi va saqlamaydi. Ariza shakli xabarni brauzeringizda tuzadi va WhatsAppni ochadi. Ma’lumot bizga faqat siz o‘zingiz xabar yoki xat yuborganingizda keladi.'],
      ['Qanday foydalanamiz', 'Faqat murojaatga javob berish va taklif tayyorlash uchun. Ma’lumotlarni sotmaymiz va uchinchi shaxslarga bermaymiz.'],
      ['Uchinchi tomon xizmatlari', 'Sayt Google Fonts shriftlarini yuklaydi. WhatsApp va Telegramda ularning qoidalari amal qiladi.'],
      ['Ma’lumotlarni o‘chirish', 'Saytdagi istalgan aloqa orqali yozing — yozishma va murojaat ma’lumotlarini o‘chiramiz.'],
    ],
    updated: '2026-yil 15-oktabrdagi tahrir.',
  },
};

const en = {
  meta: {
    code: 'en', htmlLang: 'en', ogLocale: 'en_US', langLabel: 'Site language',
    title: 'PLT GROUP — websites, Telegram bots, CRM and analytics in Tashkent',
    description: 'Websites, Telegram bots, CRM and analytics for businesses in Uzbekistan. Under contract, at a fixed price, live in as little as two weeks.',
  },
  nav: { skip: 'Skip to content', label: 'Main menu', services: 'Services', process: 'Process', pricing: 'Support', faq: 'FAQ', contact: 'Contact', cta: 'Discuss a project', menu: 'Menu' },
  hero: {
    eyebrow: 'Digital studio · Tashkent',
    lines: ['Order in your'], words: [['leads', 'coral'], ['sales', 'blue'], ['numbers', 'mint'], ['stock', 'amber']], after: [],
    lead: 'Websites, Telegram bots, CRM and analytics for businesses in Uzbekistan. Live in as little as two weeks.',
    primary: 'Discuss a project', secondary: 'Services',
    chips: ['Contract', 'Fixed price', 'You own the code'],
  },
  board: {
    aria: 'How requests from different channels end up in one table',
    chaos: 'before', order: 'after', cols: ['Channel', 'Request', 'Status'],
    status: { new: 'New', wip: 'In progress', ok: 'Done' },
    items: [['Telegram', 'Do you have 40 in stock?', 'new'], ['Instagram', 'Wholesale price?', 'new'], ['Call', 'Missed, 14:32', 'wip'], ['Excel', 'stock_v7_final.xlsx', 'wip'], ['WhatsApp', 'Where is my order?', 'ok'], ['Invoice #118', 'Awaiting payment', 'ok']],
  },
  marquee: ['Websites', 'Telegram bots', 'CRM', 'Analytics', 'AI assistants', 'Catalogues'],
  services: {
    eyebrow: 'Services', title: 'What we do', start: 'Start here',
    items: [
      { title: 'Audit', text: 'We find where leads and money get lost. The fee is credited to the project.', price: '$150', term: '1 week', accent: 'coral', start: true },
      { title: 'Websites', text: 'A site in three languages that brings in leads instead of just existing.', price: 'from $400', term: '1–2 weeks', accent: 'blue' },
      { title: 'Telegram bots', text: 'Orders, bookings and Click or Payme payments right inside Telegram.', price: 'from $500', term: '2–4 weeks', accent: 'sky' },
      { title: 'CRM', text: 'amoCRM or Bitrix24 set up around your process. No lead gets lost.', price: 'from $1,000', term: '3–6 weeks', accent: 'violet' },
      { title: 'Analytics', text: 'Revenue, sales and stock on one screen, every day.', price: 'from $700', term: '2–4 weeks', accent: 'mint' },
      { title: 'AI assistants', text: 'Answers customers around the clock and hands leads to a manager.', price: 'from $800', term: '2–4 weeks', accent: 'amber' },
    ],
  },
  process: {
    eyebrow: 'Process', title: 'Four steps',
    steps: [
      { title: 'Call', time: '1–2 days', text: 'We go through the task and prepare a quote.' },
      { title: 'Contract', time: '1 day', text: 'Scope, timeline and price on paper. 50% upfront.' },
      { title: 'Launch', time: '1–6 weeks', text: 'We show interim versions and train your team.' },
      { title: 'Support', time: 'monthly', text: 'We monitor, fix and improve.' },
    ],
  },
  principles: [['Contract first', 'Scope, timeline and price in writing.'], ['Price stays fixed', 'The quote does not change without your consent.'], ['It’s all yours', 'Code, access and data stay with you.']],
  pricing: {
    eyebrow: 'Support', title: 'After launch', lead: 'The first month is free.',
    popular: 'Most popular', perMonth: '/ mo', cta: 'Choose',
    plans: [
      { name: 'Start', for: 'Website', price: 'from $50', list: ['Hosting, domain, backups', 'Up to 2 hours of changes', 'Reply within a day'] },
      { name: 'Business', for: 'Website, bot and CRM', price: 'from $150', featured: true, list: ['Everything in Start', 'Up to 6 hours of changes', 'Monthly report', 'Reply within 2 hours'] },
      { name: 'Partner', for: 'With analytics', price: 'from $350', list: ['Everything in Business', 'Up to 15 hours of changes', 'Weekly numbers report', 'Priority'] },
    ],
    rows: [['Hosting, domain, backups', true, true, true], ['Changes per month', 'up to 2 hours', 'up to 6 hours', 'up to 15 hours'], ['Response time', 'within a day', '2 hours', '2 hours, priority'], ['Uptime monitoring', null, true, true], ['Report', null, 'monthly', 'weekly, with numbers']],
    note: 'Prices in US dollars for reference. Contracts are in UZS at the Central Bank rate.',
  },
  faq: {
    eyebrow: 'FAQ', title: 'In short',
    items: [
      ['How much does a project cost?', 'We give an exact price after a short call and fix it in the contract.'],
      ['How do I pay?', '50% before work starts, 50% after acceptance. Bank transfer in UZS.'],
      ['How long until launch?', 'A website takes 1–2 weeks, a bot 2–4, CRM and analytics 3–6.'],
      ['What if I need changes after launch?', 'Bugs are fixed free for 30 days. After that, a support plan or hourly rate.'],
      ['Do you work outside Tashkent?', 'Yes, across Uzbekistan and abroad. Meetings in Tashkent or online.'],
    ],
  },
  contact: {
    eyebrow: 'Contact', title: 'Let’s talk?',
    lead: 'We reply within one business day. The first consultation is free.',
    email: 'Email', phone: 'Phone', copy: 'Copy', copied: 'Copied', city: 'Tashkent, Uzbekistan',
  },
  form: {
    title: 'Request', name: 'Name', contact: 'Phone or Telegram', service: 'What you need', task: 'Task',
    taskHint: 'For example: Instagram leads get lost, we want to see them in one place',
    services: ['Not sure yet, need advice', 'Audit', 'Websites', 'Telegram bots', 'CRM', 'Analytics', 'AI assistants', 'Support'],
    required: 'Please fill in this field', submit: 'Send via WhatsApp',
    note: 'The site stores nothing: WhatsApp opens with a ready message.',
    intro: 'Hello! Request from the PLT GROUP website.',
  },
  footer: { tagline: 'Websites, bots, CRM and analytics for business.', privacy: 'Privacy', rights: 'All rights reserved.' },
  privacy: {
    eyebrow: 'Legal', title: 'Privacy policy',
    lead: 'How PLT GROUP handles data of visitors to pltgroup.uz.',
    sections: [
      ['What data we receive', 'The site does not collect or store personal data. The request form builds a message in your browser and opens WhatsApp. We receive data only when you send a message or email yourself.'],
      ['How we use it', 'Only to reply to your request and prepare a proposal. We do not sell or share data with third parties.'],
      ['Third-party services', 'The site loads fonts from Google Fonts. WhatsApp and Telegram apply their own rules.'],
      ['Deleting data', 'Contact us through any channel on the site and we will delete our correspondence and data about your request.'],
    ],
    updated: 'Version of 15 October 2026.',
  },
};

export const dict = { ru, uz, en };
