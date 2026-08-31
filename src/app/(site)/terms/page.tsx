import type { Metadata } from "next";
import { LegalPage } from "@/app/(site)/legal";
import { getI18n } from "@/i18n/server";
import { pickL } from "@/i18n/localized";

export const metadata: Metadata = {
  title: "terms",
  alternates: { canonical: "/terms" },
};

const SECTIONS = [
  {
    heading: { uz: 'Qabullar', ru: 'Приёмы', en: 'Appointments' },
    body: { uz: 'Yozilish — ko‘rsatilgan davomiylik uchun shifokor vaqtini band qilish. Kechikib kelish tashrifni qisqartirishi mumkin.', ru: 'Запись — это бронирование времени врача на указанную длительность. Опоздание скорее сократит визит, чем сдвинет следующий.', en: "A booking is a reservation of a clinician's time for the duration shown. Arriving late may shorten the visit rather than extend it past the next appointment." },
  },
  {
    heading: { uz: 'Bekor qilish', ru: 'Отмена', en: 'Cancelling' },
    body: { uz: 'Imkon qadar erta xabar bering. Takroriy kelmaslik keyingi yozilishlar oldidan kafolat so‘rashimizga olib kelishi mumkin.', ru: 'Сообщите как можно раньше. Систематические неявки могут привести к депозиту перед следующими записями.', en: 'Let us know as early as you can. Repeated non-attendance may mean we ask for a deposit before future bookings.' },
  },
  {
    heading: { uz: 'Onlayn tashxis yo‘q', ru: 'Без онлайн-диагноза', en: 'No online diagnosis' },
    body: { uz: 'Saytdagi hech narsa — yozilishdagi savollar ham — tashxis yoki davolash rejasi emas. Tavsiyalar faqat mos keladigan tashrifni tasvirlaydi.', ru: 'Ничто на этом сайте, включая вопросы при записи, не является диагнозом или планом лечения.', en: 'Nothing on this site — including the questions we ask during booking — is a diagnosis or a treatment plan. Recommendations only describe the right kind of visit.' },
  },
  {
    heading: { uz: 'Shoshilinch holatlar', ru: 'Срочные случаи', en: 'Urgent situations' },
    body: { uz: 'Hamroh shoshilinch yordamga muhtoj bo‘lishi mumkin bo‘lsa, onlayn yozilishga tayanmasdan klinikaga qo‘ng‘iroq qiling.', ru: 'Если питомцу может потребоваться срочная помощь, позвоните в клинику, а не надейтесь на онлайн-запись.', en: 'If a companion may need urgent attention, call the clinic rather than relying on an online booking.' },
  },
];

export default async function TermsPage() {
  const { t, locale } = await getI18n();
  return (
    <LegalPage
      title={t("legal.termsTitle")}
      intro={t("legal.termsIntro")}
      sections={SECTIONS.map((s) => ({
        heading: pickL(s.heading, locale),
        body: pickL(s.body, locale),
      }))}
    />
  );
}
