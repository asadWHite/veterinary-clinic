import Link from "next/link";
import Image from "next/image";
import { FavoriteButton } from "@/features/doctors/FavoriteButton";
import { StarRating } from "@/components/ui/Bits";
import { createTranslator } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { DoctorCard as DoctorCardData } from "@/lib/types";

export function DoctorCard({
  doctor,
  locale,
  isFavorite = false,
  canFavorite = false,
  index,
  services,
  className,
}: {
  doctor: DoctorCardData;
  locale: Locale;
  isFavorite?: boolean;
  canFavorite?: boolean;
  index: number;
  services: { slug: string; title: string }[];
  className?: string;
}) {
  const { t, tList } = createTranslator(locale);
  const weekdays = tList("common.weekdaysShort");
  const doctorServices = services.filter((service) => doctor.serviceSlugs.includes(service.slug));

  return (
    <article className={`group flex h-full flex-col border border-line bg-canvas ${className ?? ""}`}>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-canvas-2">
        {doctor.photoUrl ? (
          <Image
            src={doctor.photoUrl}
            alt={doctor.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col justify-between p-6">
            <div className="flex items-start justify-between">
              <span className="section-index">{String(index).padStart(2, "0")}</span>
              {canFavorite && (
                <FavoriteButton doctorId={doctor.id} initialActive={isFavorite} />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <span className="editorial-serif text-3xl leading-tight text-forest-2 sm:text-4xl">
                {doctor.title}
              </span>
              <span className="h-px w-10 bg-sage" />
            </div>
            <span className="label-eyebrow">{doctor.languages.join(" · ").toUpperCase()}</span>
          </div>
        )}
        {doctor.photoUrl && canFavorite && (
          <div className="absolute top-4 right-4 bg-canvas/90">
            <FavoriteButton doctorId={doctor.id} initialActive={isFavorite} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xl tracking-tight text-ink">{doctor.name}</h3>
          <p className="editorial-serif text-base text-forest-2">{doctor.title}</p>
        </div>

        <p className="text-sm leading-relaxed text-ink-2">{doctor.bio}</p>

        <dl className="grid grid-cols-2 gap-4 border-t border-line pt-5 text-xs">
          <div className="flex flex-col gap-1">
            <dt className="label-eyebrow">{t("home.doctors.experience")}</dt>
            <dd className="text-sm text-ink">
              {doctor.experienceYears === null ? t("common.notConfigured") : doctor.experienceYears}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="label-eyebrow">{t("home.doctors.reviewsCount")}</dt>
            <dd className="flex items-center gap-2 text-sm text-ink">
              {doctor.reviewCount > 0 && doctor.averageRating !== null ? (
                <>
                  <StarRating value={doctor.averageRating} />
                  <span>{doctor.reviewCount}</span>
                </>
              ) : (
                <span className="text-ink-2">{t("home.doctors.noReviews")}</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2 text-xs">
          <span className="label-eyebrow">{t("home.doctors.services")}</span>
          <p className="text-sm leading-relaxed text-ink-2">
            {doctorServices.length > 0
              ? doctorServices.slice(0, 4).map((service) => service.title).join(" · ")
              : t("common.notConfigured")}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-4 border-t border-line pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="label-eyebrow">{t("home.doctors.schedule")}</span>
            <span className="flex gap-1.5">
              {weekdays.map((day, position) => (
                <span
                  key={day}
                  className={
                    doctor.weekdayBits & (1 << position)
                      ? "text-[0.65rem] tracking-[0.1em] text-forest"
                      : "text-[0.65rem] tracking-[0.1em] text-sage-2"
                  }
                >
                  {day}
                </span>
              ))}
            </span>
          </div>
          <Link
            href={`/${locale}/book?doctor=${doctor.slug}`}
            className="btn btn-ghost w-full !py-3"
          >
            {t("home.doctors.book")}
          </Link>
        </div>
      </div>
    </article>
  );
}
