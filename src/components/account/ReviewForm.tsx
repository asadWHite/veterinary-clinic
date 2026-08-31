"use client";

import { useState } from "react";

export function ReviewForm({ appointmentId }: { appointmentId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (message) {
    return <span className="label text-forest">{message}</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="label link-underline text-forest"
      >
        Write a review
      </button>
    );
  }

  return (
    <form
      className="mt-4 w-full border border-[var(--line)] p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ appointmentId, rating, body }),
        });
        const data = (await res.json()) as { error?: string };
        setBusy(false);
        setMessage(res.ok ? "Thank you — review saved." : (data.error ?? "Could not save."));
      }}
    >
      <p className="label text-ink/40">How was the visit?</p>
      <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} star${value === 1 ? "" : "s"}`}
            onClick={() => setRating(value)}
            className={`press h-11 w-11 border text-lg transition-colors ${
              value <= rating ? "border-forest bg-forest text-white" : "border-[var(--line)] text-ink/40"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <label htmlFor={`review-${appointmentId}`} className="label mt-5 block text-ink/45">
        A few words
      </label>
      <textarea
        id={`review-${appointmentId}`}
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="mt-3 w-full resize-none border border-[var(--line)] p-4 text-sm outline-none focus:border-ink"
        placeholder="Optional"
      />
      <div className="mt-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="label bg-ink px-6 py-4 text-white disabled:opacity-40"
        >
          {busy ? "Saving…" : "Save review"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="label text-ink/45">
          Cancel
        </button>
      </div>
    </form>
  );
}
