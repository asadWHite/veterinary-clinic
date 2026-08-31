import { getI18n } from "@/i18n/server";
import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "An editorial gallery of our studio photography: dogs, cats, kittens, rabbits and birds, all isolated on pure white.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const { t } = await getI18n();
  return (
    <>
      <section className="shell grid grid-cols-1 gap-8 py-14 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-7">
          <p className="label text-ink/40">{t("nav.gallery")}</p>
          <h1 className="display d1 mt-6 uppercase">
            {t("gallery.title1")}
            <br />
            <span className="display-serif d1-serif text-moss">{t("gallery.title2")}</span>
          </h1>
        </div>
        <div className="lg:col-span-5 lg:pt-24">
          <p className="body-lg max-w-md">{t("gallery.intro")}</p>
          <p className="label mt-6 leading-[1.9] text-ink/35">{t("gallery.hint")}</p>
        </div>
      </section>

      <div className="border-t border-[var(--line)] py-12 lg:py-16">
        <GalleryGrid />
      </div>
    </>
  );
}
