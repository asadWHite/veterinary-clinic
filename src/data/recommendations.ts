import type { Answers } from "@/data/questions";
import { answerList, optionLabel } from "@/data/questions";
import { serviceBySlug } from "@/data/services";
import type { Locale } from "@/i18n/config";
import { pickL, type Localized } from "@/i18n/localized";
import { translate } from "@/i18n/dictionaries";

export type UrgencyLevel = "routine" | "soon" | "urgent";

export type Recommendation = {
  serviceSlug: string;
  serviceName: string;
  durationMinutes: number;
  urgency: UrgencyLevel;
  headline: string;
  reason: string;
  focusSpecialty: string;
  evidence: string[];
  safety: string | null;
};

export const SPECIALTY: Record<string, Localized<string>> = {
  general: {
    uz: "Umumiy amaliyot va profilaktika",
    ru: "Общая практика и профилактика",
    en: "General Practice & Preventive Care",
  },
  internal: {
    uz: "Ichki kasalliklar va tashxis",
    ru: "Внутренние болезни и диагностика",
    en: "Internal Medicine & Diagnostics",
  },
  surgery: {
    uz: "Jarrohlik va anesteziya",
    ru: "Хирургия и анестезия",
    en: "Surgery & Anaesthesia",
  },
  dental: {
    uz: "Stomatologiya va og‘iz bo‘shlig‘i",
    ru: "Стоматология и полость рта",
    en: "Dentistry & Oral Care",
  },
};

export const specialtyLabel = (key: keyof typeof SPECIALTY, locale: Locale) =>
  pickL(SPECIALTY[key], locale);

const eq = (a: Answers, key: string, ...values: string[]) => {
  const v = a[key];
  return typeof v === "string" && values.includes(v);
};

const inList = (a: Answers, key: string, ...values: string[]) => {
  const v = a[key];
  return Array.isArray(v) && v.some((item) => values.includes(item));
};

const hasNotice = (a: Answers, ...values: string[]) => inList(a, "noticed", ...values);

type Branch = {
  serviceSlug: string;
  urgency: UrgencyLevel;
  headline: Localized<string>;
  reason: Localized<string>;
  specialty: keyof typeof SPECIALTY;
  safety?: Localized<string>;
  safetyCondition?: (a: Answers) => boolean;
};

const BRANCHES: { match: (a: Answers) => boolean; branch: Branch }[] = [
  {
    match: (a) =>
      eq(a, "urgency", "urgent") ||
      eq(a, "breathingNow", "laboured") ||
      eq(a, "bleeding", "ongoing") ||
      eq(a, "urgency", "very-uncomfortable"),
    branch: {
      serviceSlug: "urgent-assessment",
      urgency: "urgent",
      specialty: "internal",
      headline: { uz: "Tezkor veterinariya e’tibori", ru: "Срочное внимание ветеринара", en: "Prompt veterinary attention" },
      reason: {
        uz: "Aytganlaringizga asoslanib, {species}ni tez ko‘rish kerak. Shifokar oddiy qabullarni kutib turmasdan ko‘rishi uchun ustuvor ko‘rik vaqtini ajratdik.",
        ru: "На основе того, что вы рассказали, {species} стоит осмотреть без промедления. Мы выделили приоритетное время, чтобы врач принял его вне очереди.",
        en: "Based on what you have told us, {species} should be seen promptly. We have reserved a prioritised assessment slot so a clinician can examine them without waiting behind routine visits.",
      },
      safety: {
        uz: "Bu tezkor veterinariya yordamini talab qilishi mumkin. Yetib kelishdan oldin tayyor turishimiz uchun klinikaga to‘g‘ridan-to‘g‘ri qo‘ng‘iroq qiling.",
        ru: "Это может потребовать срочной ветеринарной помощи. Позвоните в клинику напрямую, чтобы мы подготовились до вашего приезда.",
        en: "This may require prompt veterinary attention. Please contact the clinic directly so we can prepare before you arrive.",
      },
    },
  },
  {
    match: (a) => eq(a, "concern", "injury") || hasNotice(a, "limping", "pain", "bleeding") || eq(a, "limpingOnset", "after-incident"),
    branch: {
      serviceSlug: "surgical-consultation",
      urgency: "soon",
      specialty: "surgery",
      headline: { uz: "Harakat va jarohat baholashi", ru: "Оценка движений и травмы", en: "Movement and injury assessment" },
      reason: {
        uz: "Siz harakatdagi o‘zgarishni yoki mumkin bo‘lgan jarohatni tasvirladingiz. Buning uchun to‘g‘ri keyingi qadam — kerak bo‘lganda tasvirli diagnostika bilan ortopedik ko‘rik.",
        ru: "Вы описали изменение в движении или возможную травму. Правильный следующий шаг — ортопедический осмотр со снимками, если они нужны.",
        en: "You described a change in movement or a possible injury. An orthopaedic examination with imaging where it is useful is the appropriate next step.",
      },
      safety: undefined,
    },
  },
  {
    match: (a) => eq(a, "concern", "skin-coat") || hasNotice(a, "skin"),
    branch: {
      serviceSlug: "dermatology",
      urgency: "soon",
      specialty: "general",
      headline: { uz: "Teri va jun baholashi", ru: "Оценка кожи и шерсти", en: "Skin and coat assessment" },
      reason: {
        uz: "Qichishish, jun tushishi yoki teri o‘zgarishlarining bir nechta keng uchraydigan sababi bor. Klinikadagi testlar bilan tuzilgan dermatologik ko‘rik masalani toraytirish yo‘li.",
        ru: "У зуда, выпадения шерсти и изменений кожи несколько частых причин. Структурированный дерматологический осмотр с тестами в клинике сужает круг.",
        en: "Itching, hair loss or skin changes have several common causes. A structured dermatology examination with in-clinic testing is how we narrow it down.",
      },
    },
  },
  {
    match: (a) => eq(a, "concern", "dental"),
    branch: {
      serviceSlug: "dental-assessment",
      urgency: "soon",
      specialty: "dental",
      headline: { uz: "Og‘iz bo‘shlig‘i qulayligi baholashi", ru: "Оценка комфорта полости рта", en: "Oral comfort assessment" },
      reason: {
        uz: "Tishdagi noqulaylik odatda ochiq og‘riq emas, balki ovqat oldida ikkilanish sifatida ko‘rinadi. Boshlash uchun to‘g‘ri joy — hujjatlashtirilgan og‘iz ko‘rigi.",
        ru: "Зубная боль обычно проявляется не явно, а как hesitant attitude к еде. Правильная отправная точка — оформленный осмотр полости рта.",
        en: "Dental discomfort usually shows up as hesitation around food rather than obvious pain. A documented oral examination is the right starting point.",
      },
    },
  },
  {
    match: (a) =>
      eq(a, "concern", "digestive", "eating-drinking-change", "something-wrong") ||
      hasNotice(a, "vomiting", "diarrhea", "not-eating", "low-energy"),
    branch: {
      serviceSlug: "diagnostic-consultation",
      urgency: "soon",
      specialty: "internal",
      headline: { uz: "Kengaytirilgan tashxis vaqti", ru: "Увеличенное диагностическое время", en: "Extended diagnostic time" },
      reason: {
        uz: "Ishtaha, suv yoki hazm qilishdagi o‘zgarishning ko‘p sababi bo‘lishi mumkin. Kerak bo‘lsa tahlillar shu tashrifda bajarilishi uchun kengaytirilgan vaqt ajratdik.",
        ru: "У изменения аппетита, питья или пищеварения может быть много причин. Мы выделили увеличенное время, чтобы анализы при необходимости сделали в тот же визит.",
        en: "A change in appetite, drinking or digestion can have many explanations. We have booked extended consultation time so laboratory work can be done in the same visit if needed.",
      },
      safety: {
        uz: "Agar umuman suv ichmayotgan bo‘lsa yoki holsiz ko‘rinsa, tashrifni kutmasdan klinikaga qo‘ng‘iroq qiling.",
        ru: "Если он совсем перестал пить или стал вялым, позвоните в клинику, не дожидаясь приёма.",
        en: "If they stop drinking entirely or become lethargic, please contact the clinic rather than waiting for the appointment.",
      },
      safetyCondition: (a) =>
        eq(a, "vomitCount", "several") || eq(a, "drinking", "no"),
    },
  },
  {
    match: (a) => hasNotice(a, "coughing", "breathing"),
    branch: {
      serviceSlug: "diagnostic-consultation",
      urgency: "soon",
      specialty: "internal",
      headline: { uz: "Nafas yo‘llari baholashi", ru: "Оценка дыхательной системы", en: "Respiratory assessment" },
      reason: {
        uz: "Yo‘tal yoki nafas o‘zgarishi auskultatsiyani va kerak bo‘lsa tasvirli diagnostikani talab qiladi. Shu tashrifga tashxis vaqtini ajratdik.",
        ru: "Кашель или изменение дыхания требуют аускультации и, если нужно, снимков. Мы выделили диагностическое время в тот же визит.",
        en: "A cough or a change in breathing deserves auscultation and, where useful, imaging. We have allowed diagnostic time in the same visit.",
      },
    },
  },
  {
    match: (a) => eq(a, "concern", "behavior") || hasNotice(a, "behaviour"),
    branch: {
      serviceSlug: "general-examination",
      urgency: "soon",
      specialty: "general",
      headline: { uz: "Avval ko‘rik, so‘ng xulq", ru: "Сначала осмотр, потом поведение", en: "Assessment first, then behaviour" },
      reason: {
        uz: "Xulq o‘zgarishlari ko‘pincha jismoniy sababdan boshlanadi. Xulq rejasini muhokama qilishdan oldin to‘liq ko‘rikdan boshlaymiz.",
        ru: "Изменения поведения часто начинаются с физической причины. Мы начинаем с полного осмотра, прежде чем обсуждать план поведения.",
        en: "Behaviour changes can begin with something physical. We start with a full examination before discussing a behaviour plan.",
      },
    },
  },
  {
    match: (a) => eq(a, "concern", "vaccination"),
    branch: {
      serviceSlug: "vaccination",
      urgency: "routine",
      specialty: "general",
      headline: { uz: "Birinchi tashrif va rivojlanish ko‘rigi", ru: "Первый визит и осмотр развития", en: "First visit and development check" },
      reason: {
        uz: "Profilaktika — biz qiladigan eng kam dramatik, eng foydali ish. Bugun nima bajarilishini tasdiqlaymiz va qolgani uchun eslatmalarni sozlaymiz.",
        ru: "Профилактика — самая незаметная и самая полезная часть нашей работы. Подтвердим, что нужно сегодня, и настроим напоминания на остальное.",
        en: "Preventive care is the least dramatic and most useful thing we do. We will confirm what is due today and set up reminders for the rest.",
      },
    },
  },
  {
    match: (a) => eq(a, "concern", "check-up", "follow-up", "other") && (typeof a.age === "string" ? a.age : "adult") === "senior",
    branch: {
      serviceSlug: "senior-care",
      urgency: "routine",
      specialty: "internal",
      headline: { uz: "Qari hayvon ko‘rigi", ru: "Осмотр пожилого питомца", en: "Senior care assessment" },
      reason: {
        uz: "Keyingi yillardagi hamrohlarda ko‘rikni qon tahlili va qon bosimi bilan birlashtiramiz, chunki erta o‘zgarishlar jim bo‘ladi.",
        ru: "Для питомцев в поздние годы мы совмещаем осмотр с анализами крови и давлением, потому что ранние изменения тихие.",
        en: "For companions in their later years we combine examination with bloodwork and blood pressure, because early changes are quiet.",
      },
    },
  },
  {
    match: (a) => eq(a, "concern", "check-up", "follow-up", "other"),
    branch: {
      serviceSlug: "general-examination",
      urgency: "routine",
      specialty: "general",
      headline: { uz: "Umumiy veterinariya ko‘rigi", ru: "Общий ветеринарный осмотр", en: "General veterinary examination" },
      reason: {
        uz: "{concern} — shoshilmas burundan dumgacha ko‘rik, so‘ng uyda nima sezganingizni gaplashishga vaqt.",
        ru: "{concern} — неторопливый осмотр от носа до хвоста, а потом время обсудить то, что вы заметили дома.",
        en: "{concern} — an unhurried nose-to-tail examination, then time to talk through anything you have noticed at home.",
      },
    },
  },
];

const FALLBACK: Branch = {
  serviceSlug: "general-examination",
  urgency: "routine",
  specialty: "general",
  headline: { uz: "Umumiy veterinariya ko‘rigi", ru: "Общий ветеринарный осмотр", en: "General veterinary examination" },
  reason: {
    uz: "{species} uchun to‘liq ko‘rik — to‘g‘ri boshlanish nuqtasi.",
    ru: "Полный осмотр — правильная отправная точка для {species}.",
    en: "A full examination is the right starting point for {species}.",
  },
};

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => vars[name] ?? `{${name}}`);
}

/**
 * Maps what the owner described to the right kind of appointment.
 * This never produces a diagnosis — it only chooses time, clinician and tone.
 */
export function recommend(a: Answers, locale: Locale = "en"): Recommendation {
  const speciesValue = typeof a.species === "string" ? a.species : "dog";
  const species = translate(locale, `species.${speciesValue}`);
  const concernValue = typeof a.concern === "string" ? a.concern : "check-up";
  const concern = translate(locale, `concern.${concernValue}`);

  const evidence: string[] = [];
  const notices = answerList(a.noticed);
  if (notices.length > 0)
    evidence.push(
      `${translate(locale, "rec.evidence.noticed")}: ${notices
        .map((v) => optionLabel("noticed", v, locale).toLowerCase())
        .join(", ")}`,
    );
  if (a.onset)
    evidence.push(`${translate(locale, "rec.evidence.duration")}: ${optionLabel("onset", String(a.onset), locale).toLowerCase()}`);
  if (a.eating)
    evidence.push(`${translate(locale, "rec.evidence.appetite")}: ${optionLabel("eating", String(a.eating), locale).toLowerCase()}`);
  if (a.drinking)
    evidence.push(`${translate(locale, "rec.evidence.drinking")}: ${optionLabel("drinking", String(a.drinking), locale).toLowerCase()}`);
  if (a.breathingNow)
    evidence.push(`${translate(locale, "rec.evidence.breathing")}: ${optionLabel("breathingNow", String(a.breathingNow), locale).toLowerCase()}`);
  if (a.urgency)
    evidence.push(`${translate(locale, "rec.evidence.now")}: ${optionLabel("urgency", String(a.urgency), locale).toLowerCase()}`);
  if (a.vaccinationStatus)
    evidence.push(`${translate(locale, "rec.evidence.vaccinations")}: ${optionLabel("vaccinationStatus", String(a.vaccinationStatus), locale).toLowerCase()}`);
  if (a.lastVisit)
    evidence.push(`${translate(locale, "rec.evidence.lastVisit")}: ${optionLabel("lastVisit", String(a.lastVisit), locale).toLowerCase()}`);

  const found = BRANCHES.find((entry) => entry.match(a));
  const branch = found?.branch ?? FALLBACK;
  const service = serviceBySlug(branch.serviceSlug);
  const useFallbackService = found === undefined || service.slug !== branch.serviceSlug;
  const serviceName = useFallbackService
    ? pickL(service.name, locale)
    : pickL(service.name, locale);

  let safety: string | null = null;
  if (branch.safety) {
    safety =
      !branch.safetyCondition || branch.safetyCondition(a) ? pickL(branch.safety, locale) : null;
  }
  if (branch.urgency === "urgent" && branch.safety) {
    safety = pickL(branch.safety, locale);
  }

  return {
    serviceSlug: service.slug,
    serviceName,
    durationMinutes: service.durationMinutes,
    urgency: branch.urgency,
    headline: pickL(branch.headline, locale),
    reason: fill(pickL(branch.reason, locale), { species, concern }),
    focusSpecialty: pickL(SPECIALTY[branch.specialty], locale),
    evidence,
    safety,
  };
}

export const urgencyMeta: Record<UrgencyLevel, { labelKey: string; noteKey: string }> = {
  routine: { labelKey: "booking.urgency.routine", noteKey: "booking.urgency.routineNote" },
  soon: { labelKey: "booking.urgency.soon", noteKey: "booking.urgency.soonNote" },
  urgent: { labelKey: "booking.urgency.urgent", noteKey: "booking.urgency.urgentNote" },
};
