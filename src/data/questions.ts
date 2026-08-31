import type { Localized } from "@/i18n/localized";
import type { Locale } from "@/i18n/config";

export type SpeciesKey = "dog" | "cat" | "small" | "bird" | "other";

export type Answers = Record<string, string | string[]>;

export type OptionTone = "default" | "calm" | "attention" | "urgent";

export type AnswerOption = {
  value: string;
  label: Localized<string>;
  hint?: Localized<string>;
  tone?: OptionTone;
};

export type QuestionDef = {
  id: string;
  group: "context" | "history" | "triage";
  title: Localized<string>;
  prompt?: Localized<string>;
  type: "single" | "multi" | "text";
  options?: AnswerOption[];
  placeholder?: Localized<string>;
  /** Only ask when this predicate passes. Logic is language-independent. */
  when?: (a: Answers) => boolean;
  optional?: boolean;
};

const has = (a: Answers, key: string, ...values: string[]) => {
  const value = a[key];
  if (Array.isArray(value)) return value.some((v) => values.includes(v));
  return value !== undefined && values.includes(value);
};

const equals = (a: Answers, key: string, ...values: string[]) => {
  const value = a[key];
  if (Array.isArray(value)) return false;
  return value !== undefined && values.includes(value);
};

/** Concerns where something is objectively not right. */
const PROBLEM_CONCERNS = ["something-wrong", "injury", "eating-drinking-change", "digestive"];
const SIGN_CONCERNS = ["skin-coat", "dental", "behavior"];

/**
 * Adaptive questionnaire. Questions are declarative: the engine asks only the
 * ones whose `when` predicate passes, so nobody sees all of them. Internal
 * values stay language-independent so the recommendation engine is untouched.
 */
export const questions: QuestionDef[] = [
  {
    id: "noticed",
    group: "context",
    title: { uz: "Nima sezdingiz?", ru: "Что вы заметили?", en: "What have you noticed?" },
    prompt: {
      uz: "Mos keladiganlarning hammasini tanlang — bir nechtasini ham bo‘ladi.",
      ru: "Выберите всё, что подходит — можно несколько вариантов.",
      en: "Select everything that applies — you can choose more than one.",
    },
    type: "multi",
    options: [
      { value: "not-eating", label: { uz: "Ovqat yemayapti", ru: "Не ест", en: "Not eating" } },
      { value: "vomiting", label: { uz: "Qusish", ru: "Рвота", en: "Vomiting" } },
      { value: "diarrhea", label: { uz: "Ich ketishi", ru: "Понос", en: "Diarrhoea" } },
      { value: "coughing", label: { uz: "Yo‘tal", ru: "Кашель", en: "Coughing" } },
      { value: "breathing", label: { uz: "Nafasi o‘zgargan", ru: "Дыхание изменилось", en: "Breathing differently" } },
      { value: "low-energy", label: { uz: "Kuchsizlik", ru: "Вялость", en: "Low energy" } },
      { value: "pain", label: { uz: "Og‘riq belgilari", ru: "Признаки боли", en: "Signs of pain" } },
      { value: "limping", label: { uz: "Cho‘kish", ru: "Хромота", en: "Limping" } },
      { value: "skin", label: { uz: "Teri muammosi", ru: "Проблема с кожей", en: "Skin problem" } },
      { value: "behaviour", label: { uz: "Xulq o‘zgarishi", ru: "Изменение поведения", en: "Behaviour change" } },
      { value: "bleeding", label: { uz: "Qon ketishi", ru: "Кровотечение", en: "Bleeding" } },
      { value: "other", label: { uz: "Boshqa narsa", ru: "Другое", en: "Something else" } },
    ],
    when: (a) =>
      PROBLEM_CONCERNS.some((c) => equals(a, "concern", c)) ||
      SIGN_CONCERNS.some((c) => equals(a, "concern", c)),
  },
  {
    id: "onset",
    group: "context",
    title: { uz: "Bu qancha vaqtdan beri davom etmoqda?", ru: "Как давно это продолжается?", en: "How long has this been going on?" },
    type: "single",
    options: [
      { value: "today", label: { uz: "Bugun boshlandi", ru: "Началось сегодня", en: "Started today" } },
      { value: "one-two-days", label: { uz: "1–2 kun", ru: "1–2 дня", en: "1–2 days" } },
      { value: "several-days", label: { uz: "Bir necha kun", ru: "Несколько дней", en: "Several days" } },
      { value: "longer", label: { uz: "Bir haftadan ko‘p", ru: "Больше недели", en: "Longer than a week" } },
      { value: "unsure", label: { uz: "Aniq emas", ru: "Не уверен", en: "Not sure" } },
    ],
    when: (a) => Array.isArray(a.noticed) && a.noticed.length > 0,
  },
  {
    id: "vomitCount",
    group: "context",
    title: { uz: "Necha marta qusdi?", ru: "Сколько раз была рвота?", en: "How many times have they vomited?" },
    type: "single",
    options: [
      { value: "once", label: { uz: "Bir marta", ru: "Один раз", en: "Once" } },
      { value: "two-three", label: { uz: "2–3 marta", ru: "2–3 раза", en: "2–3 times" } },
      { value: "several", label: { uz: "Bir necha marta", ru: "Несколько раз", en: "Several times" }, tone: "attention" },
      { value: "unsure", label: { uz: "Aniq emas", ru: "Не уверен", en: "Not sure" } },
    ],
    when: (a) => has(a, "noticed", "vomiting"),
  },
  {
    id: "limpingOnset",
    group: "context",
    title: { uz: "Cho‘kish qachon boshlandi?", ru: "Когда началась хромота?", en: "When did the limping start?" },
    type: "single",
    options: [
      { value: "today", label: { uz: "Bugun", ru: "Сегодня", en: "Today" } },
      { value: "one-two-days", label: { uz: "1–2 kun", ru: "1–2 дня", en: "1–2 days" } },
      { value: "longer", label: { uz: "Uzoqroq", ru: "Дольше", en: "Longer" } },
      { value: "after-incident", label: { uz: "Yiqilish yoki baxtsiz hodisadan keyin", ru: "После падения или травмы", en: "After a fall or accident" }, tone: "attention" },
    ],
    when: (a) => has(a, "noticed", "limping"),
  },
  {
    id: "breathingNow",
    group: "triage",
    title: { uz: "Hozir nafasi qanday?", ru: "Как сейчас дыхание?", en: "How is their breathing right now?" },
    type: "single",
    options: [
      { value: "normal", label: { uz: "Dam olganda normal", ru: "В покое нормальное", en: "Normal while resting" } },
      { value: "faster", label: { uz: "Oddiydan tezroq", ru: "Быстрее обычного", en: "Faster than usual" } },
      { value: "laboured", label: { uz: "Og‘ir yoki shovqinli", ru: "Затруднённое или шумное", en: "Laboured or noisy" }, tone: "urgent" },
    ],
    when: (a) => has(a, "noticed", "breathing"),
  },
  {
    id: "eating",
    group: "history",
    title: { uz: "Ovqatni oddiydagidek yeyaptimi?", ru: "Аппетит как обычно?", en: "Are they eating normally?" },
    type: "single",
    options: [
      { value: "yes", label: { uz: "Ha, oddiydagidek", ru: "Да, как обычно", en: "Yes, normally" }, tone: "calm" },
      { value: "less", label: { uz: "Oddiyidan kam", ru: "Меньше обычного", en: "Less than usual" } },
      { value: "no", label: { uz: "Umuman yemayapti", ru: "Совсем не ест", en: "Not at all" }, tone: "attention" },
    ],
    when: (a) =>
      PROBLEM_CONCERNS.some((c) => equals(a, "concern", c)) ||
      has(a, "noticed", "not-eating", "vomiting", "diarrhea"),
  },
  {
    id: "drinking",
    group: "history",
    title: { uz: "Suvni oddiydagidek ichyaptimi?", ru: "Пьёт как обычно?", en: "Are they drinking normally?" },
    type: "single",
    options: [
      { value: "yes", label: { uz: "Ha, oddiydagidek", ru: "Да, как обычно", en: "Yes, normally" }, tone: "calm" },
      { value: "less", label: { uz: "Oddiyidan kam", ru: "Меньше обычного", en: "Less than usual" } },
      { value: "more", label: { uz: "Oddiyidan ko‘p", ru: "Больше обычного", en: "More than usual" } },
      { value: "no", label: { uz: "Deyarli ichmayapti", ru: "Почти не пьёт", en: "Barely drinking" }, tone: "attention" },
    ],
    when: (a) => has(a, "noticed", "vomiting", "diarrhea") || equals(a, "concern", "eating-drinking-change"),
  },
  {
    id: "bleeding",
    group: "triage",
    title: { uz: "Qon ketish bormi?", ru: "Есть ли кровотечение?", en: "Is there any bleeding?" },
    type: "single",
    options: [
      { value: "none", label: { uz: "Yo‘q", ru: "Нет", en: "No" }, tone: "calm" },
      { value: "minor", label: { uz: "Kam miqdorda", ru: "Небольшое", en: "A small amount" } },
      { value: "ongoing", label: { uz: "Davomli yoki ko‘p", ru: "Продолжается или сильное", en: "Ongoing or heavy" }, tone: "urgent" },
    ],
    when: (a) => equals(a, "concern", "injury") || has(a, "noticed", "bleeding", "limping"),
  },
  {
    id: "lastVisit",
    group: "history",
    title: { uz: "Oxirgi tashrif qachon bo‘lgan?", ru: "Когда был последний визит?", en: "When was their last visit?" },
    type: "single",
    options: [
      { value: "first", label: { uz: "Bu birinchi tashrifi", ru: "Это первый визит", en: "This is their first visit" } },
      { value: "recent", label: { uz: "Oxirgi 6 oy ichida", ru: "В последние 6 месяцев", en: "Within 6 months" } },
      { value: "year", label: { uz: "6–12 oy oldin", ru: "6–12 месяцев назад", en: "6–12 months ago" } },
      { value: "longer", label: { uz: "Bir yildan ko‘p oldin", ru: "Больше года назад", en: "More than a year ago" } },
      { value: "unsure", label: { uz: "Aniq emas", ru: "Не уверен", en: "Not sure" } },
    ],
    when: (a) => equals(a, "concern", "check-up", "vaccination", "other"),
  },
  {
    id: "vaccinationStatus",
    group: "history",
    title: { uz: "Emlashlari bajrilganmi?", ru: "Прививки актуальны?", en: "Are their vaccinations up to date?" },
    type: "single",
    options: [
      { value: "yes", label: { uz: "Ha", ru: "Да", en: "Yes" } },
      { value: "no", label: { uz: "Yo‘q, vaqti keldi", ru: "Нет, пора", en: "No, due now" } },
      { value: "unsure", label: { uz: "Aniq emas", ru: "Не уверен", en: "Not sure" } },
    ],
    when: (a) => equals(a, "concern", "vaccination"),
  },
  {
    id: "medication",
    group: "history",
    title: { uz: "Biror dori ichyaptimi?", ru: "Принимает ли лекарства?", en: "Are they taking any medication?" },
    type: "single",
    options: [
      { value: "none", label: { uz: "Yo‘q", ru: "Нет", en: "None" } },
      { value: "yes", label: { uz: "Ha, shifokor buyurgan", ru: "Да, назначенные", en: "Yes, prescribed" } },
      { value: "supplement", label: { uz: "Faqat qo‘shimchalar", ru: "Только добавки", en: "Supplements only" } },
      { value: "unsure", label: { uz: "Aniq emas", ru: "Не уверен", en: "Not sure" } },
    ],
    when: (a) => !equals(a, "concern", "vaccination", "check-up"),
  },
  {
    id: "previousVet",
    group: "history",
    title: { uz: "Buning uchun allaqachon ko‘rildimi?", ru: "По этому поводу уже были на приёме?", en: "Have they already been seen for this?" },
    type: "single",
    options: [
      { value: "no", label: { uz: "Yo‘q, birinchi marta bo‘ladi", ru: "Нет, это будет первый раз", en: "No, this would be the first time" } },
      { value: "here", label: { uz: "Ha, shu klinikada", ru: "Да, в этой клинике", en: "Yes, at this clinic" } },
      { value: "elsewhere", label: { uz: "Ha, boshqa joyda", ru: "Да, в другом месте", en: "Yes, elsewhere" } },
    ],
    when: (a) => PROBLEM_CONCERNS.some((c) => equals(a, "concern", c)) || Array.isArray(a.noticed) === true,
  },
  {
    id: "anythingElse",
    group: "context",
    title: { uz: "Yana bilishimiz kerak bo‘lgan narsa bormi?", ru: "Что-то ещё нам стоит знать?", en: "Anything else we should know?" },
    prompt: {
      uz: "Majburiy emas. Shifokor tashrifdan oldin o‘qishi kerak bo‘lgan narsalar.",
      ru: "Необязательно. Всё, что врач должен прочитать до визита.",
      en: "Optional. Anything you want the clinician to read before the visit.",
    },
    type: "text",
    optional: true,
    placeholder: {
      uz: "Odatlar, sabablar, uyda boshqa hayvonlar, sizni bezovta qilgan narsalar…",
      ru: "Привычки, поводы, другие животные дома, всё, что вас беспокоит…",
      en: "Habits, triggers, other animals at home, anything that worries you…",
    },
  },
  {
    id: "urgency",
    group: "triage",
    title: { uz: "U hozir qanday holatda?", ru: "Как он сейчас?", en: "How are they right now?" },
    prompt: {
      uz: "Jasorat qilmasdan ayting — bu qancha vaqt ajratishimizni belgilaydi.",
      ru: "Скажите честно, а не храбро — так мы подберём нужное время.",
      en: "Be honest rather than brave — this helps us pick the right amount of time.",
    },
    type: "single",
    options: [
      { value: "normal", label: { uz: "Normal", ru: "Как обычно", en: "Normal" }, hint: { uz: "O‘zida, faqat ko‘rikka", ru: "Как всегда, просто осмотр", en: "Themselves, just due for a visit" } },
      { value: "slightly-different", label: { uz: "Bir oz boshqacha", ru: "Немного другой", en: "A little different" } },
      { value: "uncomfortable", label: { uz: "Noqulay holatda", ru: "Испытывает дискомфорт", en: "Uncomfortable" } },
      { value: "very-uncomfortable", label: { uz: "Juda noqulay holatda", ru: "Очень тяжело", en: "Very uncomfortable" } },
      { value: "urgent", label: { uz: "Shoshilinch", ru: "Срочно", en: "Urgent" }, hint: { uz: "Iltimos, qo‘ng‘iroq ham qiling", ru: "Пожалуйста, позвоните тоже", en: "Please call us as well" }, tone: "urgent" },
    ],
  },
];

export const visibleQuestions = (answers: Answers): QuestionDef[] =>
  questions.filter((q) => !q.when || q.when(answers));

export const questionById = (id: string) => questions.find((q) => q.id === id);

export function optionLabel(questionId: string, value: string, locale: Locale = "en"): string {
  const q = questionById(questionId);
  const match = q?.options?.find((o) => o.value === value);
  if (!match) return value;
  return match.label[locale] ?? match.label.en;
}

export const answerList = (value: string | string[] | undefined): string[] =>
  Array.isArray(value) ? value : value ? [value] : [];
