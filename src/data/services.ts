import type { Localized } from "@/i18n/localized";

export type ServiceSeed = {
  slug: string;
  name: Localized<string>;
  category: Localized<string>;
  summary: Localized<string>;
  description: Localized<string>;
  durationMinutes: number;
  priceFrom: string;
  sortOrder: number;
};

/** Care taxonomy — one record per service, localized fields. */
export const serviceSeeds: ServiceSeed[] = [
  {
    slug: "general-examination",
    name: { uz: "Umumiy veterinariya ko‘rigi", ru: "Общий ветеринарный осмотр", en: "General Veterinary Examination" },
    category: { uz: "Umumiy", ru: "Общий приём", en: "General care" },
    summary: {
      uz: "Burundan dumgacha to‘liq ko‘rik va shoshilmas suhbat.",
      ru: "Полный осмотр от носа до хвоста и неторопливый разговор.",
      en: "A full nose-to-tail examination and an unhurried conversation.",
    },
    description: {
      uz: "Vazn, harorat, yurak va nafas tezligi, quloqlar, ko‘zlar, tishlar, teri, bo‘g‘imlar va qorin — so‘ng uyda nima sezganingiz haqida gaplashishga vaqt.",
      ru: "Вес, температура, пульс и дыхание, уши, глаза, зубы, кожа, суставы и живот — а потом время обсудить то, что вы заметили дома.",
      en: "Weight, temperature, heart and respiratory rate, ears, eyes, teeth, skin, joints and abdomen — then time to talk through what you have noticed at home.",
    },
    durationMinutes: 30,
    priceFrom: "[NARX]",
    sortOrder: 1,
  },
  {
    slug: "first-visit",
    name: { uz: "Birinchi tashrif va rivojlanish ko‘rigi", ru: "Первый визит и осмотр развития", en: "First Visit & Development Check" },
    category: { uz: "Umumiy", ru: "Общий приём", en: "General care" },
    summary: { uz: "Oiladagi eng yangi a’zolar uchun.", ru: "Для самых новых членов семьи.", en: "For the newest members of the family." },
    description: {
      uz: "Muloyim birinchi qabul: to‘liq ko‘rik, rivojlanish tekshiruvi, parazitlardan himoya rejalashtirishi va yoshiga mos emlash jadvali.",
      ru: "Бережный первый приём: полный осмотр, оценка развития, план защиты от паразитов и график прививок по возрасту.",
      en: "A gentle first appointment: full examination, development check, parasite prevention planning and a vaccination schedule built around their age.",
    },
    durationMinutes: 40,
    priceFrom: "[NARX]",
    sortOrder: 2,
  },
  {
    slug: "vaccination",
    name: { uz: "Emlash va profilaktika", ru: "Вакцинация и профилактика", en: "Vaccination & Preventive Care" },
    category: { uz: "Profilaktika", ru: "Профилактика", en: "Prevention" },
    summary: { uz: "Doim yangi, hech qachon shoshilmaymiz.", ru: "Всегда актуально, без спешки.", en: "Kept current, never rushed." },
    description: {
      uz: "Emlashdan oldin qisqa ko‘rik, tur va turmush tarziga mos vaksinalar va qolganlari uchun avtomatik eslatmalar.",
      ru: "Короткий осмотр перед прививкой, вакцины по виду и образу жизни и автоматические напоминания об остальных.",
      en: "A short examination before vaccination, the vaccines appropriate to species and lifestyle, and reminders scheduled automatically.",
    },
    durationMinutes: 20,
    priceFrom: "[NARX]",
    sortOrder: 3,
  },
  {
    slug: "diagnostic-consultation",
    name: { uz: "Tashxislovchi konsultatsiya", ru: "Диагностическая консультация", en: "Diagnostic Consultation" },
    category: { uz: "Tashxis", ru: "Диагностика", en: "Diagnostics" },
    summary: { uz: "Bir narsa aniqlanmayotgan holatlar uchun.", ru: "Для случаев, где что-то неясно.", en: "For something that is not quite right." },
    description: {
      uz: "Shifokor bilan kengaytirilgan vaqt, klinikadagi laboratoriya tekshiruvlari va haqiqatan kerak bo‘lganda tasvirli diagnostika. Nima va nega tekshirayotganimizni tushuntiramiz.",
      ru: "Увеличенное время с врачом, лаборатория в клинике и визуальная диагностика там, где она действительно нужна. Мы объясняем, что и зачем проверяем.",
      en: "Extended time with a clinician, in-house laboratory work and imaging where it is genuinely useful. We explain what we are checking and why.",
    },
    durationMinutes: 45,
    priceFrom: "[NARX]",
    sortOrder: 4,
  },
  {
    slug: "urgent-assessment",
    name: { uz: "Shoshilinch ko‘rik", ru: "Срочный осмотр", en: "Urgent Care Assessment" },
    category: { uz: "Shoshilinch", ru: "Срочно", en: "Urgent" },
    summary: { uz: "Kuta olmaydigan hayvonlar uchun.", ru: "Для тех, кто не может ждать.", en: "For companions who cannot wait." },
    description: {
      uz: "Ustuvor ko‘rik va barqarorlashtirish. Yetib kelishdan oldin tayyor turishimiz uchun klinikaga qo‘ng‘iroq qiling.",
      ru: "Приоритетный осмотр и стабилизация. Позвоните в клинику, чтобы мы подготовились до вашего приезда.",
      en: "Prioritised assessment and stabilisation. Please call the clinic directly so we can prepare before you arrive.",
    },
    durationMinutes: 30,
    priceFrom: "[NARX]",
    sortOrder: 5,
  },
  {
    slug: "dental-assessment",
    name: { uz: "Tish ko‘rigi", ru: "Стоматологический осмотр", en: "Dental Assessment" },
    category: { uz: "Stomatologiya", ru: "Стоматология", en: "Dental" },
    summary: { uz: "Tishlar, milk va ovqatlanish qulayligi.", ru: "Зубы, дёсны и комфорт при еде.", en: "Teeth, gums and the comfort of eating." },
    description: {
      uz: "Og‘iz bo‘shligi ko‘rigi, hujjatlashtirilgan tish kartasi va nimani uyda boshqarish, nimagа protsedura kerakligi haqida halol suhbat.",
      ru: "Осмотр полости рта, оформленная dental-карта и честный разговор о том, что решается дома, а что требует процедуры.",
      en: "Oral examination, a documented dental chart and an honest conversation about what can be managed at home and what needs a procedure.",
    },
    durationMinutes: 40,
    priceFrom: "[NARX]",
    sortOrder: 6,
  },
  {
    slug: "dermatology",
    name: { uz: "Dermatologik konsultatsiya", ru: "Дерматологическая консультация", en: "Dermatology Consultation" },
    category: { uz: "Dermatologiya", ru: "Дерматология", en: "Dermatology" },
    summary: { uz: "Teri, jun, quloqlar va qichishish.", ru: "Кожа, шерсть, уши и зуд.", en: "Skin, coat, ears and itching." },
    description: {
      uz: "Teri va quloq ko‘rigi, zarur bo‘lsa sitologiya va siz sezgan qichishish, jun tushishi yoki noqulaylik uchun tuzilgan reja.",
      ru: "Осмотр кожи и ушей, цитология по показаниям и структурированный план для зуда, выпадения шерсти или дискомфорта.",
      en: "Skin and ear examination, cytology where indicated, and a structured plan for the itching, hair loss or discomfort you have noticed.",
    },
    durationMinutes: 30,
    priceFrom: "[NARX]",
    sortOrder: 7,
  },
  {
    slug: "surgical-consultation",
    name: { uz: "Jarrohlik konsultatsiyasi", ru: "Хирургическая консультация", en: "Surgical Consultation" },
    category: { uz: "Jarrohlik", ru: "Хирургия", en: "Surgery" },
    summary: { uz: "Ortopediya va yumshoq to‘qimalar rejalashtirishi.", ru: "Ортопедия и мягкие ткани.", en: "Orthopaedic and soft tissue planning." },
    description: {
      uz: "Jarohat yoki shish baholash, tasvirli diagnostika natijalari, anesteziya rejasi va risklar hamda parvarish haqida tushunarli tushuntirish.",
      ru: "Оценка травмы или образования, обзор снимков, план анестезии и понятное объяснение рисков и ухода.",
      en: "Assessment of an injury or lump, imaging review, anaesthesia planning and a clear explanation of risks and aftercare.",
    },
    durationMinutes: 45,
    priceFrom: "[NARX]",
    sortOrder: 8,
  },
  {
    slug: "senior-care",
    name: { uz: "Qari hayvonlar ko‘rigi", ru: "Осмотр пожилых питомцев", en: "Senior Care Assessment" },
    category: { uz: "Umumiy", ru: "Общий приём", en: "General care" },
    summary: { uz: "Qulaylik, harakat va erta aniqlash.", ru: "Комфорт, подвижность и раннее выявление.", en: "Comfort, mobility and early detection." },
    description: {
      uz: "Keyingi yillardagi hamrohlar uchun qon tahlili, qon bosimi, bo‘g‘im va vazn baholashi — hayot sifatiga qaratilgan reja bilan.",
      ru: "Для питомцев в поздние годы: анализы крови, давление, оценка суставов и веса — с планом, направленным на качество жизни.",
      en: "Bloodwork, blood pressure, joint and weight assessment for companions in their later years, with a plan focused on quality of life.",
    },
    durationMinutes: 45,
    priceFrom: "[NARX]",
    sortOrder: 9,
  },
  {
    slug: "nutrition",
    name: { uz: "Ovqatlanish va vazn konsultatsiyasi", ru: "Консультация по питанию и весу", en: "Nutrition & Weight Consultation" },
    category: { uz: "Profilaktika", ru: "Профилактика", en: "Prevention" },
    summary: { uz: "Ovqat — davolash rejasining bir qismi.", ru: "Питание как часть плана лечения.", en: "Food as part of the treatment plan." },
    description: {
      uz: "Tana holatini baholash, hozirgi ratsionni ko‘rib chiqish va sizning uy sharoilingizga mos, real ovqatlanish rejasi.",
      ru: "Оценка кондиции, разбор текущего рациона и реалистичный план кормления, который подходит именно вашему дому.",
      en: "Body condition scoring, a review of the current diet and a realistic feeding plan that fits your household.",
    },
    durationMinutes: 30,
    priceFrom: "[NARX]",
    sortOrder: 10,
  },
];

export const serviceBySlug = (slug: string) =>
  serviceSeeds.find((s) => s.slug === slug) ?? serviceSeeds[0];
