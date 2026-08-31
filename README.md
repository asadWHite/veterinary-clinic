# [CLINIC NAME] — Veterinary Care

Ultra-premium veterinary clinic website with an intelligent booking system and full
**UZ / RU / EN** multilingual support.

- **Editorial art direction** — white canvas, natural green palette, controlled brutalist grid
- **Studio animal photography** — every portrait isolated on pure white
- **Satoshi** type system (self-hosted) + Instrument Serif editorial accents
- **Intelligent booking** — starts with *who your companion is*, asks only relevant questions,
  recommends the right kind of visit (never a diagnosis), then real doctor / date / time selection
- **Real availability** — schedule − breaks − blocked periods − existing appointments,
  with database-enforced double-booking protection
- **Accounts** — pets, appointments, reviews, favorites, settings; guest booking supported

---

## Tech stack

| Layer      | Choice |
| ---------- | ------ |
| Framework  | Next.js (App Router) |
| Language   | TypeScript |
| Styling    | Tailwind CSS v4 |
| Database   | PostgreSQL via Drizzle ORM |
| Auth       | Cookie sessions, scrypt password hashing |
| Fonts      | Satoshi (self-hosted woff2) + Instrument Serif |

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure the database

```bash
cp .env.example .env
```

Set `DATABASE_URL` to your PostgreSQL instance:

```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

### 3. Create the tables

```bash
npx drizzle-kit push
```

The clinic (clinicians, services, schedules, blocked periods and demo appointments) is seeded
automatically and idempotently on first request.

### 4. Run

```bash
npm run dev      # development
npm run build && npm run start   # production
```

Open http://localhost:3000

---

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npx drizzle-kit push` | Apply the schema to the database |

---

## Project structure

```
src/
  app/                      # routes (App Router)
    (site)/                 # marketing pages: home, about, care, doctors, journal, gallery, contact
    account/                # personal area: overview, appointments, reviews, favorites, settings
    pets/                   # companion profiles
    booking/                # the booking experience
    appointments/[publicId] # appointment reference page
    api/                    # auth, availability, bookings, pets, reviews, favorites, health
  components/
    hero/  home/  booking/  doctors/  account/  pets/  gallery/  navigation/  footer/  ui/
  data/                     # questions, recommendations, services, care, journal, animals
  db/                       # schema + idempotent seed
  i18n/                     # provider, server helpers, localized type helpers
  locales/                  # uz.json · ru.json · en.json
  lib/                      # availability engine, auth, clinic queries, formatting
  types/  hooks/
public/images/              # animals/ · doctors/ (all on pure white)
```

---

## Multilingual (UZ / RU / EN)

- Default language: **Uzbek**
- Locale is stored in a cookie (`vc_locale`) and lives in React state, so switching language
  re-renders the tree **without losing booking state** — answers, questionnaire position,
  recommendation, doctor, date and time all survive.
- Localized entry URLs work too: `/?lang=ru`, `/?lang=en` (middleware persists the cookie).
- Internal values stay language-independent (`dog`, `adult`, `vomiting`), so the questionnaire
  and recommendation engines are identical in every language.

---

## Important

All clinic information is a **placeholder** pending launch: `[CLINIC NAME]`, `Dr. [DOCTOR NAME]`,
`[ADDRESS]`, `[PHONE]`, `[EMAIL]`, `[WORKING HOURS]`. No real clinicians, credentials, ratings or
reviews are published anywhere in this project.

The booking system never diagnoses. It only recommends the appropriate *kind* of visit.
