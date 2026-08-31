import { getI18n } from "@/i18n/server";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export async function FinalCta() {
  const { t } = await getI18n();
  return (
    <section className="relative overflow-hidden border-t border-[var(--line)]">
      <div className="shell grid grid-cols-1 items-center gap-8 py-16 lg:grid-cols-12 lg:py-20">
        <div className="relative z-10 lg:col-span-7">
          <p className="label text-ink/40">{t("home.finalCta.label")}</p>
          <h2 className="display d1 mt-6 uppercase">
            <span className="block">{t("home.finalCta.title1")}</span>
            <span
              className="display-serif d1-serif block pl-[6%] text-moss"
            >
              {t("home.finalCta.title2")}
            </span>
            <span className="block pl-[12%]">
              {t("home.finalCta.title3").replace(".", "")}
              <span className="text-forest">.</span>
            </span>
          </h2>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/booking"
              className="label arrow-forward group flex items-center justify-between gap-6 bg-ink px-8 py-6 text-white transition-colors hover:bg-forest"
            >
              <span className="display d5 uppercase">{t("home.finalCta.book")}</span>
              <span className="arrow text-2xl leading-none">→</span>
            </Link>
            <Link
              href="/contact"
              className="label arrow-forward flex items-center gap-3 px-2 py-4 text-ink/70 hover:text-ink"
            >
              {t("home.finalCta.ask")}
              <span className="arrow">→</span>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5">
          <Reveal variant="scale">
            <Image
              src="/images/animals/dog-golden-retriever-white.jpg"
              alt="Golden retriever sitting on a pure white background"
              width={1024}
              height={1024}
              sizes="(max-width: 1024px) 90vw, 40vw"
              priority={false}
              className="h-auto w-full select-none"
              style={{ mixBlendMode: "multiply" }}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
