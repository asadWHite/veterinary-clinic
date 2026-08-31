import type { Metadata } from "next";
import { LegalPage } from "@/app/(site)/legal";
import { getI18n } from "@/i18n/server";
import { pickL } from "@/i18n/localized";

export const metadata: Metadata = {
  title: "privacy",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    heading: { uz: 'Nima saqlaymiz', ru: 'Что мы храним', en: 'What we collect' },
    body: { uz: 'Ismingiz va aloqa ma’lumotlaringiz, ro‘yxatdan o‘tkazgan hayvonlaringiz, tashriflar tarixi va yozilish paytida aytganlaringiz. Boshqa hech narsa.', ru: 'Ваше имя и контакты, зарегистрированные питомцы, история визитов и то, что вы сами рассказали при записи. Ничего больше.', en: 'Your name and contact details, the companions you register, appointment history, and anything you choose to tell us during booking. Nothing more.' },
  },
  {
    heading: { uz: 'Nega saqlaymiz', ru: 'Зачем мы это храним', en: 'Why we collect it' },
    body: { uz: 'Mos keladigan tashrifni tayyorlash, siz bilan bog‘lanish va hamrohingizga tegishli klinik yozuvni saqlash uchun.', ru: 'Чтобы подготовить подходящий визит, связаться с вами и вести клиническую запись, принадлежащую вашему питомцу.', en: 'To prepare the right kind of visit, to contact you about it, and to keep a clinical record that belongs with your companion.' },
  },
  {
    heading: { uz: 'Kim ko‘radi', ru: 'Кто это видит', en: 'Who can see it' },
    body: { uz: 'Siz va tashrifda qatnashgan klinika jamoasi. Kabinetlar shaxsiy: bitta eganing ma’lumotlari boshqasiga ko‘rinmaydi.', ru: 'Вы и команда клиники, участвующая в визите. Кабинеты личные: данные одного владельца не видны другому.', en: 'You, and the clinic team involved in the visit. Accounts are private: pets, appointments and notes belonging to one owner are not exposed to another.' },
  },
  {
    heading: { uz: 'Nimani so‘rashingiz mumkin', ru: 'Что вы можете попросить', en: 'What you can ask for' },
    body: { uz: 'Saqlangan ma’lumotlarning nusxasi, tuzatish yoki saqlash qoidalari ruxsat berganda o‘chirish. Buni qabulxona yoki klinika email orqali so‘rang.', ru: 'Копию хранимых данных, исправление или удаление, где позволяют сроки хранения. Попросите на ресепшене или письмом.', en: 'A copy of the data we hold, a correction, or a deletion where retention rules allow it. Ask at reception or write to the clinic email.' },
  },
];

export default async function PrivacyPage() {
  const { t, locale } = await getI18n();
  return (
    <LegalPage
      title={t("legal.privacyTitle")}
      intro={t("legal.privacyIntro")}
      sections={SECTIONS.map((s) => ({
        heading: pickL(s.heading, locale),
        body: pickL(s.body, locale),
      }))}
    />
  );
}
