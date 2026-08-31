import type { Locale } from "@/i18n/config";
import type { Localized } from "@/i18n/localized";
import { pickL } from "@/i18n/localized";

export type SpeciesKey = "dog" | "cat" | "small" | "bird" | "other";

export type AnimalAsset = {
  id: string;
  /** Species this portrait represents. */
  species: SpeciesKey;
  title: string;
  breed: string;
  src: string;
  alt: string;
};

/**
 * One campaign, one visual language.
 * Every portrait is a studio subject isolated on pure white.
 */
export const animalAssets: AnimalAsset[] = [
  {
    id: "golden-retriever",
    species: "dog",
    title: "Golden Retriever",
    breed: "Golden Retriever",
    src: "/images/animals/dog-golden-retriever-white.jpg",
    alt: "Golden retriever sitting calmly, studio portrait on a pure white background",
  },
  {
    id: "puppy",
    species: "dog",
    title: "Puppy",
    breed: "Labrador (young)",
    src: "/images/animals/puppy-white-background.jpg",
    alt: "Small labrador puppy sitting, studio portrait on a pure white background",
  },
  {
    id: "french-bulldog",
    species: "dog",
    title: "French Bulldog",
    breed: "French Bulldog",
    src: "/images/animals/dog-french-bulldog-white.jpg",
    alt: "Cream french bulldog sitting, studio portrait on a pure white background",
  },
  {
    id: "british-shorthair",
    species: "cat",
    title: "British Shorthair",
    breed: "British Shorthair",
    src: "/images/animals/cat-british-shorthair-white.jpg",
    alt: "Grey british shorthair cat sitting, studio portrait on a pure white background",
  },
  {
    id: "siamese",
    species: "cat",
    title: "Siamese",
    breed: "Siamese",
    src: "/images/animals/cat-siamese-white.jpg",
    alt: "Siamese cat with blue eyes sitting, studio portrait on a pure white background",
  },
  {
    id: "kitten",
    species: "cat",
    title: "Kitten",
    breed: "Domestic shorthair (young)",
    src: "/images/animals/kitten-white-background.jpg",
    alt: "Small grey tabby kitten sitting, studio portrait on a pure white background",
  },
  {
    id: "rabbit",
    species: "small",
    title: "Rabbit",
    breed: "Lop-eared rabbit",
    src: "/images/animals/rabbit-white-background.jpg",
    alt: "Grey lop-eared rabbit sitting, studio portrait on a pure white background",
  },
  {
    id: "cockatiel",
    species: "bird",
    title: "Cockatiel",
    breed: "Cockatiel",
    src: "/images/animals/bird-cockatiel-white.jpg",
    alt: "Cockatiel perched on a minimal white perch against a pure white background",
  },
];

export const assetById = (id: string): AnimalAsset =>
  animalAssets.find((a) => a.id === id) ?? animalAssets[0];

export const heroAsset = assetById("puppy");

export const speciesMeta: Record<
  SpeciesKey,
  { label: Localized<string>; assetId: string; blurb: Localized<string>; count: Localized<string> }
> = {
  dog: {
    label: { uz: "Itlar", ru: "Собаки", en: "Dogs" },
    assetId: "puppy",
    blurb: {
      uz: "Birinchi emlashdan qari bo‘g‘imlargacha. Har bir zot va tabiat uchun profilaktika, tashxis va jarrohlik.",
      ru: "От первых прививок до суставов в старости. Профилактика, диагностика и хирургия для любой породы и характера.",
      en: "From first vaccinations to senior joints. Preventive care, diagnostics and surgery for every breed and temperament.",
    },
    count: { uz: "O‘tgan yili 42 zot ko‘rilgan", ru: "За прошлый год — 42 породы", en: "42 breeds seen last year" },
  },
  cat: {
    label: { uz: "Mushuklar", ru: "Кошки", en: "Cats" },
    assetId: "british-shorthair",
    blurb: {
      uz: "Tinch yondashuv, kam stressli muomala va mushuklarga xos tashxis. Mushuk — kichik it emas, biz uni shunday ko‘ramiz.",
      ru: "Тихий подход, обращение с минимумом стресса и кошачья диагностика. Кошка — не маленькая собака.",
      en: "A quiet approach, low-stress handling and feline-specific diagnostics. Cats are not small dogs — we treat them that way.",
    },
    count: { uz: "Faqat mushuklar uchun xona", ru: "Отдельный кабинет для кошек", en: "Feline-only consultation room" },
  },
  small: {
    label: { uz: "Mayda hamrohlar", ru: "Мелкие питомцы", en: "Small companions" },
    assetId: "rabbit",
    blurb: {
      uz: "Quyonlar, dengizchilar, sichqonlar va norkalar. Malakali shifokorlar, to‘g‘ri dozalash, muloyim anesteziya.",
      ru: "Кролики, морские свинки, хомяки и хорьки. Компетентные врачи, точные дозы, бережная анестезия.",
      en: "Rabbits, guinea pigs, hamsters and ferrets. Exotic-competent clinicians, correct dosing, gentle anaesthesia.",
    },
    count: { uz: "Mayda sutemizuvchilar anesteziyasi", ru: "Протокол анестезии для мелких", en: "Small-mammal anaesthesia protocol" },
  },
  bird: {
    label: { uz: "Qushlar", ru: "Птицы", en: "Birds" },
    assetId: "cockatiel",
    blurb: {
      uz: "To‘tilar, kanareykalar va boshqalar. Ovqatlanish bo‘yicha maslahat, pat va nafas baholashi — oldindan yozilgan holda.",
      ru: "Попугаи, канарейки и другие. Питание, оценка перьев и дыхания — по предварительной записи.",
      en: "Parrots, parakeets and canaries. Nutritional guidance, feather and respiratory assessment by appointment.",
    },
    count: { uz: "Qushlar uchun qabul — chorshanba", ru: "Приём птиц — по средам", en: "Avian consults on Wednesdays" },
  },
  other: {
    label: { uz: "Boshqalar", ru: "Другие", en: "Other" },
    assetId: "rabbit",
    blurb: {
      uz: "Sudralib yuruvchilar va boshqa hamrohlar. Kim kelishini ayting — biz mos shifokorni tanlaymiz.",
      ru: "Рептилии и другие питомцы. Скажите, кто приедет — мы подберём подходящего врача.",
      en: "Reptiles and other companions. Tell us who is coming and we will match you with the right clinician.",
    },
    count: { uz: "Turga mos shifokor", ru: "Врач под вид", en: "Species-matched clinician" },
  },
};

/** Locale-resolved species information. */
export function speciesInfo(species: SpeciesKey, locale: Locale) {
  const meta = speciesMeta[species] ?? speciesMeta.dog;
  return {
    label: pickL(meta.label, locale),
    blurb: pickL(meta.blurb, locale),
    count: pickL(meta.count, locale),
    assetId: meta.assetId,
  };
}

export const assetForSpecies = (species: SpeciesKey): AnimalAsset =>
  assetById(speciesMeta[species].assetId);

/** Portrait plate used when a photographic portrait is not yet supplied. */
export const portraitFallback = (initials: string) => initials;
