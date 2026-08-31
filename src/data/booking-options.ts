import type { OptionTone } from "@/data/questions";
import type { Localized } from "@/i18n/localized";

export type ChoiceOption = {
  value: string;
  label: Localized<string>;
  hint?: Localized<string>;
  tone?: OptionTone;
};

export const speciesOptions: ChoiceOption[] = [
  {
    value: "dog",
    label: { uz: "It", ru: "Собака", en: "Dog" },
    hint: { uz: "Kuchikdan qarigacha", ru: "От щенка до пожилого", en: "Puppy to senior" },
  },
  {
    value: "cat",
    label: { uz: "Mushuk", ru: "Кошка", en: "Cat" },
    hint: { uz: "Mushukchadan qarigacha", ru: "От котёнка до пожилой", en: "Kitten to senior" },
  },
  {
    value: "small",
    label: { uz: "Quyon", ru: "Кролик", en: "Rabbit" },
    hint: { uz: "Mayda hayvon", ru: "Мелкий питомец", en: "Small companion" },
  },
  {
    value: "bird",
    label: { uz: "Qush", ru: "Птица", en: "Bird" },
    hint: { uz: "Qushlar", ru: "Пернатые", en: "Avian" },
  },
  {
    value: "other",
    label: { uz: "Boshqa", ru: "Другое", en: "Other" },
    hint: { uz: "Kim kelishini ayting", ru: "Скажите, кто приедет", en: "Tell us who's coming" },
  },
];

export const ageOptions: ChoiceOption[] = [
  {
    value: "baby",
    label: { uz: "Kuchik / mushukcha", ru: "Щенок / котёнок", en: "Puppy / Kitten" },
    hint: { uz: "12 oydan kichik", ru: "До 12 месяцев", en: "Under 12 months" },
  },
  { value: "young", label: { uz: "Yosh", ru: "Молодой", en: "Young" }, hint: { uz: "1–3 yosh", ru: "1–3 года", en: "1–3 years" } },
  { value: "adult", label: { uz: "Voyaga yetgan", ru: "Взрослый", en: "Adult" }, hint: { uz: "3–8 yosh", ru: "3–8 лет", en: "3–8 years" } },
  { value: "senior", label: { uz: "Qari", ru: "Пожилой", en: "Senior" }, hint: { uz: "8+ yosh", ru: "8+ лет", en: "8+ years" } },
];

export const concernOptions: ChoiceOption[] = [
  {
    value: "check-up",
    label: { uz: "Oddiy ko‘rik", ru: "Профилактический осмотр", en: "Just a check-up" },
    hint: { uz: "Alohida narsa yo‘q", ru: "Ничего конкретного", en: "Nothing specific" },
  },
  {
    value: "vaccination",
    label: { uz: "Emlash", ru: "Вакцинация", en: "Vaccination" },
    hint: { uz: "Profilaktika", ru: "Профилактика", en: "Preventive care" },
  },
  {
    value: "something-wrong",
    label: { uz: "Bir narsa noto‘g‘ri", ru: "Что-то не так", en: "Something seems wrong" },
    hint: { uz: "Nomini aytolmayman", ru: "Не могу точно назвать", en: "I can't quite name it" },
  },
  {
    value: "injury",
    label: { uz: "Jarohat", ru: "Травма", en: "Injury" },
    hint: { uz: "Yiqilish, kesilish, cho‘kish", ru: "Падение, порез, хромота", en: "A fall, a cut, a limp" },
  },
  {
    value: "eating-drinking-change",
    label: { uz: "Ovqat yoki suv o‘zgarishi", ru: "Изменился приём пищи или воды", en: "Eating or drinking change" },
  },
  { value: "skin-coat", label: { uz: "Teri yoki jun", ru: "Кожа или шерсть", en: "Skin or coat" } },
  { value: "dental", label: { uz: "Tishlar", ru: "Зубы", en: "Dental" } },
  { value: "digestive", label: { uz: "Ovqat hazm qilish", ru: "Пищеварение", en: "Digestive" } },
  { value: "behavior", label: { uz: "Xulq-atvor", ru: "Поведение", en: "Behaviour" } },
  { value: "follow-up", label: { uz: "Qayta ko‘rik", ru: "Повторный визит", en: "Follow-up" } },
  { value: "other", label: { uz: "Boshqa", ru: "Другое", en: "Other" } },
];

export function labelOf(options: ChoiceOption[], value: string | undefined | null, locale: string) {
  const match = options.find((o) => o.value === value);
  if (!match) return "";
  return match.label[(locale as "uz" | "ru" | "en") ?? "en"] ?? match.label.en;
}
