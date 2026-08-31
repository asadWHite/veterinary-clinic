"use client";

import { useState } from "react";

export function ProfileForm({
  name,
  phone,
  email,
}: {
  name: string;
  phone: string;
  email: string;
}) {
  const [form, setForm] = useState({ name, phone });
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage(null);
        const res = await fetch("/api/account/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = (await res.json()) as { error?: string };
        setBusy(false);
        setMessage(res.ok ? "Saved." : (data.error ?? "Could not save."));
      }}
    >
      <div>
        <label htmlFor="profile-name" className="label text-ink/45">
          Name
        </label>
        <input
          id="profile-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="mt-3 w-full border-b border-ink/25 bg-transparent pb-3 text-lg font-semibold outline-none focus:border-ink"
        />
      </div>
      <div>
        <label htmlFor="profile-phone" className="label text-ink/45">
          Phone
        </label>
        <input
          id="profile-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="[PHONE]"
          className="mt-3 w-full border-b border-ink/25 bg-transparent pb-3 text-lg font-semibold outline-none placeholder:text-ink/25 focus:border-ink"
        />
      </div>
      <div>
        <label htmlFor="profile-email" className="label text-ink/45">
          Email
        </label>
        <input
          id="profile-email"
          type="email"
          value={email}
          readOnly
          className="mt-3 w-full border-b border-ink/15 bg-transparent pb-3 text-lg font-semibold text-ink/45 outline-none"
        />
        <p className="label mt-3 text-ink/30">Email is fixed once the account exists.</p>
      </div>

      <div className="flex items-center gap-4 border-t border-[var(--line)] pt-6">
        <button
          type="submit"
          disabled={busy}
          className="label bg-ink px-8 py-5 text-white transition-colors hover:bg-forest disabled:opacity-40"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
        {message ? <span className="label text-forest">{message}</span> : null}
      </div>
    </form>
  );
}
