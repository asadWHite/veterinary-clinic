"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toggleFavoriteAction } from "@/features/account/actions";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";

export function FavoriteButton({
  doctorId,
  initialActive,
  variant = "icon",
  className,
}: {
  doctorId: number;
  initialActive: boolean;
  variant?: "icon" | "button";
  className?: string;
}) {
  const { t } = useI18n();
  const [active, setActive] = useState(initialActive);
  const [optimistic, setOptimistic] = useOptimistic(active);
  const [pending, startTransition] = useTransition();

  const isOn = optimistic;

  function toggle() {
    startTransition(async () => {
      setOptimistic(!isOn);
      try {
        const result = await toggleFavoriteAction(doctorId);
        setActive(result.active);
      } catch {
        setOptimistic(active);
      }
    });
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={isOn}
        className={cn(
          "btn btn-quiet w-full !py-3",
          isOn && "border-forest text-forest",
          className,
        )}
      >
        {isOn ? `★ ${t("home.doctors.unfavorite")}` : `☆ ${t("home.doctors.favorite")}`}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={isOn}
      aria-label={isOn ? t("home.doctors.unfavorite") : t("home.doctors.favorite")}
      className={cn(
        "flex h-9 w-9 items-center justify-center border transition-colors",
        isOn ? "border-forest text-forest" : "border-line text-ink-2 hover:border-forest hover:text-forest",
        className,
      )}
    >
      <span aria-hidden>{isOn ? "★" : "☆"}</span>
    </button>
  );
}
