import type { Localized } from "@/i18n/localized";

export type CareItem = {
  index: string;
  title: Localized<string>;
  serviceSlug: string;
  summary: Localized<string>;
  detail: Localized<string>;
  assetId: string;
  points: Localized<string>[];
};

export const careItems: CareItem[] = [
  {
    index: "01",
    title: { uz: "Umumiy ko‘rik", ru: "Общий приём", en: "General care" },
    serviceSlug: "general-examination",
    summary: {
      uz: "Boshqa hammasi shu ko‘rik ustiga quriladi.",
      ru: "Всё остальное строится на этом осмотре.",
      en: "The examination that everything else is built on.",
    },
    detail: {
      uz: "Shoshilmas burundan dumgacha ko‘rik: vazn, harorat, yurak va nafas tezligi, quloqlar, ko‘zlar, tishlar, teri, bo‘g‘imlar va qorin. So‘ng gaplashishga vaqt.",
      ru: "Неторопливый осмотр от носа до хвоста: вес, температура, пульс и дыхание, уши, глаза, зубы, кожа, суставы и живот. Потом время поговорить.",
      en: "An unhurried nose-to-tail examination: weight, temperature, heart and respiratory rate, ears, eyes, teeth, skin, joints and abdomen. Then time to talk.",
    },
    assetId: "golden-retriever",
    points: [
      { uz: "To‘liq jismoniy ko‘rik", ru: "Полный физический осмотр", en: "Full physical examination" },
      { uz: "Tarix va turmush tarzi ko‘rishi", ru: "Разбор истории и образа жизни", en: "History and lifestyle review" },
      { uz: "Keyinchalik yozma xulosa", ru: "Письменная summaries после", en: "Written summary afterwards" },
    ],
  },
  {
    index: "02",
    title: { uz: "Emlash", ru: "Вакцинация", en: "Vaccination" },
    serviceSlug: "vaccination",
    summary: { uz: "Doim yangi, hech qachon shoshilmaymiz.", ru: "Всегда актуально, без спешки.", en: "Kept current, never rushed." },
    detail: {
      uz: "Avval qisqa ko‘rik, so‘ng tur va turmush tarziga mos vaksinalar — hech narsa o‘tkazib yuborilmasligi uchun eslatmalar bilan.",
      ru: "Сначала короткий осмотр, затем вакцины по виду и образу жизни — с напоминаниями, чтобы ничего не пропало.",
      en: "A short examination first, then the vaccines appropriate to species and lifestyle — with reminders scheduled so nothing slips.",
    },
    assetId: "puppy",
    points: [
      { uz: "Tur va turmush tarziga asoslangan", ru: "По виду и образу жизни", en: "Species and lifestyle based" },
      { uz: "Sertifikatlar beriladi", ru: "Выдаём сертификаты", en: "Certificates issued" },
      { uz: "Avtomatik eslatmalar", ru: "Автоматические напоминания", en: "Automatic reminders" },
    ],
  },
  {
    index: "03",
    title: { uz: "Tashxis", ru: "Диагностика", en: "Diagnostics" },
    serviceSlug: "diagnostic-consultation",
    summary: { uz: "Klinikadagi laboratoriya va tasvirli diagnostika.", ru: "Лаборатория и визуальная диагностика в клинике.", en: "In-house laboratory and imaging." },
    detail: {
      uz: "Qon tahlili, sitologiya, ultratovush va rentgen. Nima tekshirayotganimizni, bu nima aytadi va nima aytmaydi — tushuntiramiz.",
      ru: "Анализы крови, цитология, УЗИ и рентген. Мы объясняем, что проверяем, что это покажет и чего не покажет.",
      en: "Bloodwork, cytology, ultrasound and radiology. We explain what we are checking, what it will tell us, and what it will not.",
    },
    assetId: "british-shorthair",
    points: [
      { uz: "Klinikadagi laboratoriya", ru: "Лаборатория в клинике", en: "In-house laboratory" },
      { uz: "Ultratovush va rentgen", ru: "УЗИ и рентген", en: "Ultrasound and radiology" },
      { uz: "Natijalar oddiy tilda", ru: "Результаты простыми словами", en: "Results explained in plain language" },
    ],
  },
  {
    index: "04",
    title: { uz: "Stomatologiya", ru: "Стоматология", en: "Dental" },
    serviceSlug: "dental-assessment",
    summary: { uz: "Qulay ovqatlanish — hayot sifati.", ru: "Комфортная еда — качество жизни.", en: "Comfortable eating is quality of life." },
    detail: {
      uz: "Hujjatlashtirilgan tish kartalari, zarur bo‘lganda tozalash va tortib olish, hamda takroriy protsedurani oldini oladigan uy parvarishi.",
      ru: "Оформленные dental-карты, чистка и удаление там, где это действительно нужно, и домашний уход, предотвращающий повторную процедуру.",
      en: "Documented dental charts, prophylaxis and extractions where genuinely needed, plus the home care that prevents a repeat procedure.",
    },
    assetId: "french-bulldog",
    points: [
      { uz: "Tish kartasi", ru: "Dental-карта", en: "Dental charting" },
      { uz: "Tozalash va sayqallash", ru: "Чистка и полировка", en: "Scaling and polishing" },
      { uz: "Uyda parvarish o‘rgatish", ru: "Обучение домашнему уходу", en: "Home-care coaching" },
    ],
  },
  {
    index: "05",
    title: { uz: "Jarrohlik", ru: "Хирургия", en: "Surgery" },
    serviceSlug: "surgical-consultation",
    summary: { uz: "Ortopediya va yumshoq to‘qimalar.", ru: "Ортопедия и мягкие ткани.", en: "Orthopaedic and soft tissue." },
    detail: {
      uz: "Zamonaviy anesteziya monitoringi, individual protseduralar va uyda haqiqatan bajarish mumkin bo‘lgan parvarish ko‘rsatmalari.",
      ru: "Современный контроль анестезии, индивидуальные протоколы и понятные инструкции по уходу дома.",
      en: "Modern anaesthesia monitoring, individualised protocols and clear aftercare instructions you can actually follow at home.",
    },
    assetId: "siamese",
    points: [
      { uz: "Anesteziya rejasi", ru: "План анестезии", en: "Anaesthesia planning" },
      { uz: "Ortopediya va yumshoq to‘qimalar", ru: "Ортопедия и мягкие ткани", en: "Orthopaedic and soft tissue" },
      { uz: "Tuzilgan parvarish", ru: "Структурированный уход", en: "Structured aftercare" },
    ],
  },
  {
    index: "06",
    title: { uz: "Dermatologiya", ru: "Дерматология", en: "Dermatology" },
    serviceSlug: "dermatology",
    summary: { uz: "Teri, jun, quloqlar va to‘xtamaydigan qichishish.", ru: "Кожа, шерсть, уши и неутихающий зуд.", en: "Skin, coat, ears and the itch that will not stop." },
    detail: {
      uz: "Sitologiya, allergiya tekshiruvi va quloq davolash — bir martalik qabul emas, reja sifatida tuziladi.",
      ru: "Цитология, аллергическое обследование и лечение ушей — выстроено как план, а не один приём.",
      en: "Cytology, allergy work-ups and ear treatment — structured as a plan, not a single appointment.",
    },
    assetId: "rabbit",
    points: [
      { uz: "Klinikada sitologiya", ru: "Цитология в клинике", en: "Cytology in clinic" },
      { uz: "Allergiya tekshiruvi", ru: "Аллергическое обследование", en: "Allergy work-up" },
      { uz: "Quloq davolash rejalari", ru: "Планы лечения ушей", en: "Ear treatment plans" },
    ],
  },
];
