import Image from "next/image";
import type { DoctorWithNext } from "@/lib/clinic";

type DoctorPortraitProps = {
  doctor: Pick<DoctorWithNext, "name" | "code" | "initials" | "photoKey" | "specialization">;
  className?: string;
  priority?: boolean;
};

/**
 * Photographic portrait where supplied; a designed typographic plate where a
 * portrait is still pending. Both treatments share the same geometry so the
 * grid never breaks.
 */
export function DoctorPortrait({ doctor, className = "", priority = false }: DoctorPortraitProps) {
  if (doctor.photoKey) {
    return (
      <div className={`animal-frame ${className}`}>
        <Image
          src={doctor.photoKey}
          alt={`${doctor.name}, ${doctor.specialization}`}
          width={1024}
          height={1024}
          priority={priority}
          sizes="(max-width: 768px) 90vw, 33vw"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex aspect-[4/5] w-full items-end justify-between overflow-hidden bg-paper ${className}`}
      aria-label={`${doctor.name} portrait placeholder`}
    >
      <div className="dot-grid absolute inset-0 opacity-70" />
      <span className="display absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[26vw] leading-none text-ink/[0.07] sm:text-[13vw]">
        {doctor.initials}
      </span>
      <span className="label absolute bottom-4 left-4 text-ink/40">Portrait placeholder</span>
    </div>
  );
}
