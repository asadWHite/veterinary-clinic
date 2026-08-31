"use client";
import { useI18n } from "@/i18n/I18nProvider";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { assetById } from "@/data/animals";
import { galleryItems, type GalleryItem } from "@/data/gallery";

const spanClass: Record<GalleryItem["span"], string> = {
  wide: "sm:col-span-2",
  tall: "row-span-2",
  square: "",
  small: "",
};

export function GalleryGrid() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = openIndex === null ? null : galleryItems[openIndex];

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null ? null : (current + delta + galleryItems.length) % galleryItems.length,
      ),
    [],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, step]);

  return (
    <>
      <div className="shell grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {galleryItems.map((item, i) => {
          const asset = assetById(item.assetId);
          const tall = item.span === "tall";
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`${t("common.view")} ${item.caption}`}
              className={`press group relative overflow-hidden border border-[var(--line)] bg-canvas ${
                tall ? "row-span-2" : ""
              } ${spanClass[item.span]}`}
            >
              <Image
                src={asset.src}
                alt={asset.alt}
                width={1024}
                height={1024}
                sizes="(max-width: 640px) 45vw, 24vw"
                className={`h-full w-full select-none object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] ${
                  tall ? "min-h-[280px]" : "min-h-[140px]"
                }`}
                style={{ mixBlendMode: "multiply" }}
              />
              <span className="label absolute bottom-2 left-2 bg-canvas/90 px-2 py-1 text-ink/50">
                {item.caption}
              </span>
            </button>
          );
        })}
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.caption}
          className="fixed inset-0 z-[100] flex flex-col bg-canvas/98 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-[var(--gutter)] py-4">
            <p className="label text-ink/45">
              {String((openIndex ?? 0) + 1).padStart(2, "0")} / {String(galleryItems.length).padStart(2, "0")}
            </p>
            <button type="button" onClick={close} className="label border border-[var(--line)] px-4 py-3 hover:border-ink">
              {t("common.close")}
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
            <Image
              src={assetById(open.assetId).src}
              alt={assetById(open.assetId).alt}
              width={1024}
              height={1024}
              sizes="90vw"
              className="h-auto max-h-[78vh] w-auto select-none"
              style={{ mixBlendMode: "multiply" }}
            />
            <button
              type="button"
              aria-label="Previous"
              onClick={() => step(-1)}
              className="label absolute left-[var(--gutter)] top-1/2 -translate-y-1/2 border border-[var(--line)] bg-canvas px-4 py-4 hover:border-ink"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => step(1)}
              className="label absolute right-[var(--gutter)] top-1/2 -translate-y-1/2 border border-[var(--line)] bg-canvas px-4 py-4 hover:border-ink"
            >
              →
            </button>
          </div>
          <p className="label border-t border-[var(--line)] px-[var(--gutter)] py-4 text-ink/45">
            {open.caption} — studio photography on pure white
          </p>
        </div>
      ) : null}
    </>
  );
}
