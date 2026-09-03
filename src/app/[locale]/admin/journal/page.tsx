import { EmptyState } from "@/components/ui/Bits";
import { deleteJournalPostAction, saveJournalPostAction } from "@/features/admin/actions";
import { getJournalPosts } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { formatDateShort } from "@/lib/format";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type Post = Awaited<ReturnType<typeof getJournalPosts>>[number];

function PostForm({ locale, post }: { locale: Locale; post?: Post }) {
  const { t } = createTranslator(locale);
  return (
    <form action={saveJournalPostAction} className="flex flex-col gap-6 border border-line bg-canvas-2/40 p-6">
      {post && <input type="hidden" name="id" value={post.id} />}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="label-eyebrow">{t("admin.journal.slug")}</span>
          <input name="slug" required defaultValue={post?.slug ?? ""} className="field-input" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="label-eyebrow">{t("admin.journal.category")}</span>
          <input name="categoryKey" defaultValue={post?.categoryKey ?? "prevention"} className="field-input" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="label-eyebrow">{t("admin.journal.minutes")}</span>
          <input
            name="readingMinutes"
            type="number"
            min="1"
            defaultValue={post?.readingMinutes ?? 5}
            className="field-input"
          />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-3">
          <span className="label-eyebrow">{t("admin.journal.cover")}</span>
          <input name="coverUrl" defaultValue={post?.coverUrl ?? ""} className="field-input" />
        </label>
        {(["uz", "ru", "en"] as const).map((code) => (
          <label key={`title-${code}`} className="flex flex-col gap-2">
            <span className="label-eyebrow">
              {code === "uz" ? t("admin.journal.titleUz") : code === "ru" ? t("admin.journal.titleRu") : t("admin.journal.titleEn")}
            </span>
            <input
              name={`title${code.toUpperCase()}`}
              defaultValue={post ? (post.title as unknown as Record<string, string>)?.[code] ?? "" : ""}
              className="field-input"
            />
          </label>
        ))}
        {(["uz", "ru", "en"] as const).map((code) => (
          <label key={`excerpt-${code}`} className="flex flex-col gap-2">
            <span className="label-eyebrow">
              {t("admin.journal.excerpt")} ({code.toUpperCase()})
            </span>
            <input name={`excerpt${code.toUpperCase()}`} className="field-input" />
          </label>
        ))}
      </div>

      {(["uz", "ru", "en"] as const).map((code) => (
        <label key={`body-${code}`} className="flex flex-col gap-2">
          <span className="label-eyebrow">
            {t("admin.journal.body")} ({code.toUpperCase()})
          </span>
          <textarea
            name={`body${code.toUpperCase()}`}
            rows={6}
            className="field-input resize-y"
            defaultValue={post ? (post.body as unknown as Record<string, string>)?.[code] ?? "" : ""}
          />
        </label>
      ))}

      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" name="isPublished" defaultChecked={post ? true : true} className="accent-[#183B32]" />
          {t("admin.journal.publish")}
        </label>
        <button type="submit" className="btn btn-primary !py-3">
          {t("common.save")}
        </button>
        {post && (
          <span className="text-xs text-ink-2">{formatDateShort(post.publishedAt.toISOString().slice(0, 10), locale)}</span>
        )}
      </div>
    </form>
  );
}

export default async function AdminJournalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "uz";
  const { t } = createTranslator(locale);
  const user = await getCurrentUser();
  if (!user || user.role === "user") return null;
  const posts = await getJournalPosts(locale);

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <span className="label-eyebrow">{t("admin.title")}</span>
        <h1 className="text-h2 font-normal tracking-tight text-ink">{t("admin.journal.title")}</h1>
      </header>

      <section className="flex flex-col gap-5">
        <span className="label-eyebrow">{t("admin.journal.new")}</span>
        <PostForm locale={locale} />
      </section>

      <section className="flex flex-col gap-5">
        <span className="label-eyebrow">
          {t("nav.journal")} · {posts.length}
        </span>
        {posts.length === 0 ? (
          <EmptyState title={t("admin.journal.empty")} />
        ) : (
          <div className="flex flex-col gap-8">
            {posts.map((post) => (
              <div key={post.id} className="flex flex-col gap-4 border-t border-line pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-base text-ink">{post.title}</span>
                  <form action={deleteJournalPostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <button type="submit" className="link-underline text-xs text-ink-2 uppercase">
                      {t("admin.journal.delete")}
                    </button>
                  </form>
                </div>
                <PostForm locale={locale} post={post} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
