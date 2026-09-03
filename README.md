# ELVET — Veterinary Clinic · Tashkent

Premium editorial website + booking platform for **ELVET Veterinary Clinic**
(Yakkasaroy, Shoxjahon 4A, Tashkent).

* **Editorial art direction** — warm off-white canvas, deep forest green, sage and charcoal;
  numbered sections (01 / CARE …), hairline separators, generous whitespace, studio animal photography.
* **UZ / RU / EN** — every interface string, question, answer, status and error is translated
  (`src/locales/*.json`). Database values stay language-neutral.
* **10-step booking flow** — animal → pet passport → age → reason → adaptive questions →
  recommendation (never a diagnosis) → doctor → date → **real available time** → client details →
  summary → confirmation with booking ID and `.ics` export.
* **Real availability** — schedule − breaks − blocked periods − existing appointments, with a
  "last appointment 18:30" cap and database-enforced double-booking protection.
* **Accounts** — pet passports, appointments, reviews, favourites, settings; guest booking supported.
* **Admin** — dashboard, searchable appointments with a readable questionnaire timeline,
  schedule/blocked-period management, review moderation, journal CMS, clinic data.

---

## Clinic data

All clinic information lives in **`src/clinic-content.json`** (the single source of truth):

| Field | Value |
| --- | --- |
| Brand | ELVET · Ветеринарная клиника ELVET · ELVET Veterinary Clinic |
| Address | Yakkasaroy, Shoxjahon 4A, Tashkent, Uzbekistan |
| Phones | +998 99 406 46 40 · +998 98 700 46 40 (clickable `tel:` links) |
| Instagram | [@elvet.uz](https://instagram.com/elvet.uz) |
| Hours | Mon–Fri 10:00–19:00 · Sat–Sun 11:00–19:00 |
| Last appointment | 18:30 |
| Website | elvet.uz |

When a database is connected, values stored in `clinic_settings` **override** these defaults
(edit them in `/uz/admin/settings`). When it is not connected, the bundled content is used, so
the site never renders empty placeholders.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via Drizzle ORM |
| Auth | Cookie sessions, scrypt password hashing (httpOnly, SameSite=Lax) |
| Fonts | Manrope + Lora (next/font, latin + cyrillic subsets) |

---

## Getting started

```bash
npm install
cp .env.example .env          # set DATABASE_URL
npx drizzle-kit push          # create the schema
node scripts/seed.mjs         # ELVET services, doctors, schedule, journal, settings
npm run dev
```

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | for booking/accounts/admin | PostgreSQL connection string. Without it the site runs from the bundled clinic content and booking submission is disabled (visitors are shown the clinic phone numbers). |
| `SITE_URL` | optional | Canonical URL for metadata, sitemap and structured data (defaults to `https://elvet.uz`). |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | optional | Admin account created by the seed script. |

No secret is ever committed: `.env` is git-ignored, and only `.env.example` is tracked.

### Database

`npx drizzle-kit push` creates 19 tables (profiles, sessions, pets, services, doctors,
availability, blocked_slots, appointments, appointment_answers, reviews, favourites,
journal_posts, notifications, medical records, vaccinations, documents, clinic_settings…).

Double-booking is prevented twice: an exclusion constraint
(`appointments_no_overlap`, `btree_gist`) plus `pg_advisory_xact_lock` inside the insert
transaction. Re-apply the constraint after a fresh `push`:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE appointments ADD CONSTRAINT appointments_no_overlap
  EXCLUDE USING gist (doctor_id WITH =, int4range(start_minute, end_minute) WITH &&)
  WHERE (status IN ('pending','confirmed'));
```

---

## Deployment (Vercel)

1. Import the repository — framework preset **Next.js** (`vercel.json` already sets
   `framework: nextjs`, `buildCommand: npm run build`).
2. Add `DATABASE_URL` (Vercel Postgres, Neon or Supabase connection string) and, optionally,
   `SITE_URL=https://elvet.uz`.
3. Run the schema + seed once against that database:
   `npx drizzle-kit push && node scripts/seed.mjs` (with `DATABASE_URL` exported locally).
4. Deploy. `/api/health` returns `{"ok":true}` when the database responds.

Without `DATABASE_URL` the deployment still builds and serves the complete marketing site,
booking is limited to choosing a time from the real ELVET schedule, and submission asks
visitors to call the clinic — no availability is ever faked.

---

## Project structure

```
src/
  app/                     routes ([locale] segment, api, sitemap, robots)
    api/availability       real slot computation (also works from the bundled schedule)
    api/appointments       transactional booking creation (409 on conflict)
  components/              layout (header/footer) + ui primitives
  features/
    booking/               BookingFlow, steps, questionnaire engine, labels
    doctors/ account/ admin/ auth/ reviews/ home/
  lib/
    booking/               questions, recommendation, availability, server context
    clinic.ts              typed access to clinic-content.json (offline source of truth)
    queries.ts             data access with offline fallback
    auth.ts format.ts settings.ts i18n/
  locales/                 uz.json · ru.json · en.json
  db/                      schema + lazy client
scripts/seed.mjs           idempotent ELVET seed
```

## Quality gates

```bash
npm run lint
npm run typecheck
npm run build
```

Accessibility: semantic landmarks, skip link, visible focus rings, `aria-pressed` on every
option button, `prefers-reduced-motion` support, native cursor (no custom cursor).
