"use client";

import { useState, useTransition } from "react";

export function FavoriteToggle({ doctorId }: { doctorId: string }) {
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from favourites" : "Save to favourites"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        startTransition(async () => {
          try {
            const res = await fetch("/api/favorites", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ doctorId }),
            });
            const data = (await res.json()) as { saved?: boolean };
            if (typeof data.saved === "boolean") setSaved(data.saved);
          } catch {
            /* keep the previous state */
          }
        });
      }}
      className={`label flex items-center gap-2 border px-3 py-2 transition-all duration-300 ${
        saved ? "border-forest text-forest" : "border-[var(--line)] text-ink/45 hover:border-ink"
      } ${pending ? "opacity-60" : ""}`}
    >
      <span aria-hidden="true">{saved ? "★" : "☆"}</span>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
