import { checkDatabase } from "@/db";
import { getI18n } from "@/i18n/server";

const COPY = {
  uz: {
    title: "Ma’lumot bazasi ulanmagan",
    body: "Sayt ko‘rinyapti, lekin qabulga yozilish hozir ishlamaydi. Serverda DATABASE_URL o‘rnatilmagan yoki baza yetib bo‘lmaydi.",
    hint: "Vercel → Settings → Environment Variables → DATABASE_URL (masalan Neon yoki Supabase). Keyin Redeploy qiling.",
  },
  ru: {
    title: "База данных не подключена",
    body: "Сайт открывается, но запись на приём сейчас не работает. На сервере не задан DATABASE_URL или база недоступна.",
    hint: "Vercel → Settings → Environment Variables → DATABASE_URL (например, Neon или Supabase). Затем Redeploy.",
  },
  en: {
    title: "Database not connected",
    body: "The site is rendering, but booking is unavailable right now. DATABASE_URL is not set on the server, or the database is unreachable.",
    hint: "Vercel → Settings → Environment Variables → DATABASE_URL (e.g. Neon or Supabase), then Redeploy.",
  },
} as const;

/**
 * Slim, non-blocking banner shown only when the database is unreachable.
 * Keeps a deploy readable instead of returning a server error.
 */
export async function DbNotice() {
  const status = await checkDatabase();
  if (status.ok) return null;

  const { locale } = await getI18n();
  const copy = COPY[locale] ?? COPY.en;

  return (
    <div
      role="status"
      className="border-b border-[var(--line)] bg-cream px-[var(--gutter)] py-3"
    >
      <p className="label text-forest">{copy.title}</p>
      <p className="small mt-1 max-w-3xl">{copy.body}</p>
      <p className="caption mt-1">{copy.hint}</p>
    </div>
  );
}
