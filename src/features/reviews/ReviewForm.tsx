"use client";

import { useActionState, useState } from "react";
import { createReviewAction, type ActionState } from "@/features/account/actions";
import { FormNote, Spinner } from "@/components/ui/Bits";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";

export function ReviewForm({
  appointments,
}: {
  appointments: { id: number; publicId: string; day: string; doctorName: string }[];
}) {
  const { t, locale } = useI18n();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createReviewAction, {});
  const [rating, setRating] = useState(5);

  if (state.ok) {
    return (
      <div className="flex flex-col gap-3 border border-forest/30 bg-canvas-2/60 p-6">
        <span className="label-eyebrow">{t("reviewsPage.thanks")}</span>
        <p className="text-sm leading-relaxed text-ink-2">{t("reviewsPage.pending")}</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col gap-3 border border-line bg-canvas-2/40 p-6">
        <p className="text-sm leading-relaxed text-ink-2">{t("reviewsPage.notEligible")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6 border border-line bg-canvas-2/40 p-6 sm:p-8">
      <div className="flex flex-col gap-3">
        <span className="label-eyebrow">{t("reviewsPage.rating")}</span>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} / 5`}
              aria-pressed={rating === value}
              className={cn(
                "text-2xl leading-none transition-colors",
                value <= rating ? "text-forest" : "text-sage-2",
              )}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("account.appointments.title")}</span>
        <select name="appointmentId" className="field-input" defaultValue={String(appointments[0].id)}>
          {appointments.map((appointment) => (
            <option key={appointment.id} value={appointment.id}>
              {appointment.publicId} · {appointment.doctorName} · {appointment.day}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="label-eyebrow">{t("reviewsPage.body")}</span>
        <textarea
          name="body"
          rows={5}
          required
          minLength={10}
          className="field-input resize-none"
          placeholder={t("reviewsPage.bodyPlaceholder")}
        />
      </label>

      {state.error && <FormNote>{t(state.error)}</FormNote>}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? (
            <>
              <Spinner /> {t("common.saving")}
            </>
          ) : (
            t("reviewsPage.submit")
          )}
        </button>
        <span className="text-xs text-ink-2">{locale.toUpperCase()}</span>
      </div>
    </form>
  );
}


