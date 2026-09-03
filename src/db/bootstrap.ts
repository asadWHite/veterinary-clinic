import type { PoolClient } from "pg";
import { pool } from "@/db";
import { SCHEMA_STATEMENTS } from "@/db/schema.sql";
import content from "@/clinic-content.json";
import { hashPassword } from "@/lib/password";

/**
 * Self-provisioning schema.
 *
 * A deployment may point DATABASE_URL at a completely empty database (for
 * example a freshly created Vercel Postgres). Instead of failing, the first
 * request provisions the schema and seeds the ELVET clinic content.
 * Everything is idempotent and every failure degrades to the bundled clinic
 * content instead of throwing.
 */

type BootstrapResult = { ok: boolean; reason?: string };

let bootstrapPromise: Promise<BootstrapResult> | null = null;

function toMinutes(value: string): number {
  const [h, m] = value.split(":").map((part) => Number.parseInt(part, 10));
  return h * 60 + (m || 0);
}

function intervalsFor(weekday: number) {
  const list = weekday >= 5 ? content.schedule.weekend : content.schedule.weekdays;
  return list.map((interval) => ({
    start: toMinutes(interval.start),
    end: toMinutes(interval.end),
  }));
}

function weekdaysForPattern(pattern: string): number[] {
  if (pattern === "weekdays") return [0, 1, 2, 3, 4];
  if (pattern === "weekdaysPlusSaturday") return [0, 1, 2, 3, 4, 5];
  return [0, 1, 2, 3, 4, 5, 6];
}

async function tableExists(client: PoolClient, name: string): Promise<boolean> {
  const result = await client.query(
    "select to_regclass($1) is not null as present",
    [`public.${name}`],
  );
  return Boolean(result.rows[0]?.present);
}

async function applySchema(client: PoolClient): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    try {
      await client.query(statement);
    } catch {
      // Statements are idempotent; anything that still fails (for example a
      // pre-existing object from another project) is skipped so that the rest
      // of the schema can still be created.
    }
  }
}

async function seedClinic(client: PoolClient): Promise<void> {
  for (const service of content.services) {
    await client.query(
      `insert into services (slug, title, summary, description, duration_minutes, sort_order, is_published)
       values ($1,$2,$3,$4,$5,$6,true)
       on conflict (slug) do nothing`,
      [
        service.slug,
        JSON.stringify(service.title),
        JSON.stringify(service.summary),
        JSON.stringify(service.description),
        service.duration,
        service.order,
      ],
    );
  }

  for (const doctor of content.doctors) {
    await client.query(
      `insert into doctors (slug, name, title, bio, languages, is_placeholder, is_published, sort_order)
       values ($1,$2,$3,$4,$5,true,true,$6)
       on conflict (slug) do nothing`,
      [
        doctor.slug,
        JSON.stringify(doctor.name),
        JSON.stringify(doctor.title),
        JSON.stringify(doctor.bio),
        JSON.stringify(doctor.languages),
        doctor.order,
      ],
    );
  }

  const services = await client.query<{ id: number; slug: string }>("select id, slug from services");
  const doctors = await client.query<{ id: number; slug: string }>("select id, slug from doctors");
  const serviceId = (slug: string) => services.rows.find((row) => row.slug === slug)?.id;
  const doctorId = (slug: string) => doctors.rows.find((row) => row.slug === slug)?.id;

  for (const doctor of content.doctors) {
    const id = doctorId(doctor.slug);
    if (!id) continue;
    for (const slug of doctor.services) {
      const sid = serviceId(slug);
      if (!sid) continue;
      await client.query(
        `insert into doctor_services (doctor_id, service_id) values ($1,$2)
         on conflict (doctor_id, service_id) do nothing`,
        [id, sid],
      );
    }
    for (const weekday of weekdaysForPattern(doctor.schedulePattern)) {
      for (const interval of intervalsFor(weekday)) {
        await client.query(
          `insert into availability (doctor_id, weekday, kind, start_minute, end_minute, is_active)
           select $1,$2,'work',$3,$4,true
           where not exists (
             select 1 from availability
             where doctor_id = $1 and weekday = $2 and start_minute = $3 and end_minute = $4
           )`,
          [id, weekday, interval.start, interval.end],
        );
      }
    }
  }

  for (const post of content.journal) {
    await client.query(
      `insert into journal_posts (slug, title, excerpt, body, category_key, cover_url, reading_minutes, is_published, published_at)
       values ($1,$2,$3,$4,$5,$6,$7,true, now() + ($8 || ' days')::interval)
       on conflict (slug) do nothing`,
      [
        post.slug,
        JSON.stringify(post.title),
        JSON.stringify(post.excerpt),
        JSON.stringify(post.body),
        post.category,
        post.cover,
        post.minutes,
        String(post.publishedOffsetDays),
      ],
    );
  }

  const brand = content.brand;
  const settings: Array<[string, unknown]> = [
    ["clinicName", brand.fullName],
    ["phone", brand.phones[0] ?? ""],
    ["phone2", brand.phones[1] ?? ""],
    ["email", brand.email ?? ""],
    ["address", brand.address],
    ["hours", brand.hours],
    ["emergencyPhone", brand.phones[0] ?? ""],
    ["instagram", brand.instagramHandle],
    ["lastAppointment", brand.lastAppointment],
    ["timezone", brand.timezone],
  ];
  for (const [key, value] of settings) {
    await client.query(
      `insert into clinic_settings (key, value) values ($1,$2)
       on conflict (key) do nothing`,
      [key, JSON.stringify(value)],
    );
  }

  // An admin account is only created when credentials are provided through the
  // environment — never hardcoded.
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword && adminPassword.length >= 8) {
    await client.query(
      `insert into profiles (email, password_hash, full_name, role, locale)
       values ($1,$2,$3,'admin','uz')
       on conflict (email) do update set role = 'admin'`,
      [adminEmail, await hashPassword(adminPassword), "ELVET admin"],
    );
  }
}

async function run(): Promise<BootstrapResult> {
  if (!pool) return { ok: false, reason: "not_configured" };

  const client = await pool.connect();
  try {
    if (!(await tableExists(client, "clinic_settings"))) {
      await applySchema(client);
    }
    const seeded = await client.query<{ total: string }>(
      "select count(*)::text as total from clinic_settings",
    );
    if (Number(seeded.rows[0]?.total ?? 0) === 0) {
      await seedClinic(client);
    }
    return { ok: true };
  } finally {
    client.release();
  }
}

/** Provisions the schema once per process. Never throws. */
export function ensureDatabase(): Promise<BootstrapResult> {
  if (!bootstrapPromise) {
    bootstrapPromise = run().catch((error: unknown) => {
      bootstrapPromise = null; // allow a retry on the next request
      console.warn(
        "[elvet] database bootstrap failed, using bundled clinic content:",
        error instanceof Error ? error.message : error,
      );
      return { ok: false, reason: "unavailable" };
    });
  }
  return bootstrapPromise;
}
