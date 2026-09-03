/**
 * Idempotent seed for the ELVET clinic.
 *
 * Content is read from src/clinic-content.json so the database and the bundled
 * offline fallback always describe the same clinic. Reviews and appointments
 * are never invented.
 *
 * Run: node scripts/seed.mjs
 */
import { readFileSync } from "node:fs";
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";

const scrypt = promisify(scryptCb);
const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const content = JSON.parse(readFileSync(new URL("../src/clinic-content.json", import.meta.url), "utf8"));

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

function toMinutes(value) {
  const [h, m] = value.split(":").map((part) => Number.parseInt(part, 10));
  return h * 60 + (m || 0);
}

/** Mon–Fri = 0–4, Sat = 5, Sun = 6 */
function intervalsFor(weekday) {
  const list = weekday >= 5 ? content.schedule.weekend : content.schedule.weekdays;
  return list.map((interval) => ({
    start: toMinutes(interval.start),
    end: toMinutes(interval.end),
  }));
}

function weekdaysForPattern(pattern) {
  if (pattern === "weekdays") return [0, 1, 2, 3, 4];
  if (pattern === "weekdaysPlusSaturday") return [0, 1, 2, 3, 4, 5];
  return [0, 1, 2, 3, 4, 5, 6];
}

async function main() {
  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    await client.query("begin");

    /* ---------------------------------------------------------------- services */
    for (const service of content.services) {
      await client.query(
        `insert into services (slug, title, summary, description, duration_minutes, sort_order, is_published)
         values ($1,$2,$3,$4,$5,$6,true)
         on conflict (slug) do update set title = excluded.title, summary = excluded.summary,
           description = excluded.description, duration_minutes = excluded.duration_minutes,
           sort_order = excluded.sort_order`,
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
    const serviceIds = new Map(
      (await client.query("select id, slug from services")).rows.map((row) => [row.slug, row.id]),
    );

    /* ----------------------------------------------------------------- doctors */
    for (const doctor of content.doctors) {
      await client.query(
        `insert into doctors (slug, name, title, bio, languages, is_placeholder, is_published, sort_order)
         values ($1,$2,$3,$4,$5,true,true,$6)
         on conflict (slug) do update set name = excluded.name, title = excluded.title, bio = excluded.bio,
           languages = excluded.languages, sort_order = excluded.sort_order`,
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
    const doctorIds = new Map(
      (await client.query("select id, slug from doctors")).rows.map((row) => [row.slug, row.id]),
    );

    for (const doctor of content.doctors) {
      const doctorId = doctorIds.get(doctor.slug);
      for (const serviceSlug of doctor.services) {
        const serviceId = serviceIds.get(serviceSlug);
        if (!serviceId) continue;
        await client.query(
          `insert into doctor_services (doctor_id, service_id) values ($1,$2)
           on conflict (doctor_id, service_id) do nothing`,
          [doctorId, serviceId],
        );
      }
    }

    /* ------------------------------------------------------------ availability */
    const expected = [];
    for (const doctor of content.doctors) {
      const doctorId = doctorIds.get(doctor.slug);
      for (const weekday of weekdaysForPattern(doctor.schedulePattern)) {
        for (const interval of intervalsFor(weekday)) {
          expected.push(`${doctorId}:${weekday}:work:${interval.start}-${interval.end}`);
        }
      }
    }
    const stored = (
      await client.query(
        "select doctor_id, weekday, kind, start_minute, end_minute from availability order by doctor_id, weekday, start_minute",
      )
    ).rows.map(
      (row) => `${row.doctor_id}:${row.weekday}:${row.kind}:${row.start_minute}-${row.end_minute}`,
    );
    const sameSet =
      expected.length === stored.length && expected.every((value) => stored.includes(value));

    if (!sameSet) {
      await client.query("delete from availability");
      for (const entry of expected) {
        const [doctorId, weekday, , range] = entry.split(":");
        const [start, end] = range.split("-").map(Number);
        await client.query(
          `insert into availability (doctor_id, weekday, kind, start_minute, end_minute, is_active)
           values ($1,$2,'work',$3,$4,true)`,
          [Number(doctorId), Number(weekday), start, end],
        );
      }
      console.log(`[seed] schedule synchronised with ELVET working hours (${expected.length} rules)`);
    } else {
      console.log("[seed] schedule already matches ELVET working hours");
    }

    /* --------------------------------------------------------------- journal */
    for (const post of content.journal) {
      await client.query(
        `insert into journal_posts (slug, title, excerpt, body, category_key, cover_url, reading_minutes, is_published, published_at)
         values ($1,$2,$3,$4,$5,$6,$7,true, now() + ($8 || ' days')::interval)
         on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt,
           body = excluded.body, category_key = excluded.category_key, cover_url = excluded.cover_url,
           reading_minutes = excluded.reading_minutes`,
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

    /* -------------------------------------------------------- clinic settings */
    const brand = content.brand;
    const settings = [
      { key: "clinicName", value: brand.fullName },
      { key: "phone", value: brand.phones[0] ?? "" },
      { key: "phone2", value: brand.phones[1] ?? "" },
      { key: "email", value: brand.email ?? "" },
      { key: "address", value: brand.address },
      { key: "hours", value: brand.hours },
      { key: "emergencyPhone", value: brand.phones[0] ?? "" },
      { key: "instagram", value: brand.instagramHandle },
      { key: "lastAppointment", value: brand.lastAppointment },
      { key: "timezone", value: brand.timezone },
    ];
    for (const setting of settings) {
      await client.query(
        `insert into clinic_settings (key, value) values ($1,$2)
         on conflict (key) do update set value = excluded.value, updated_at = now()`,
        [setting.key, JSON.stringify(setting.value)],
      );
    }

    /* ------------------------------------------------------------ admin user */
    const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@elvet.uz").toLowerCase();
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "elvet-admin-2026";
    const existingAdmin = await client.query("select id from profiles where email = $1", [adminEmail]);
    if (existingAdmin.rowCount === 0) {
      const hash = await hashPassword(adminPassword);
      await client.query(
        `insert into profiles (email, password_hash, full_name, role, locale)
         values ($1,$2,$3,'admin','uz')`,
        [adminEmail, hash, "ELVET admin"],
      );
      console.log(`[seed] admin account created: ${adminEmail}`);
    } else {
      await client.query("update profiles set role = 'admin' where email = $1", [adminEmail]);
      console.log(`[seed] admin account present: ${adminEmail}`);
    }

    await client.query("commit");
    console.log("[seed] ELVET clinic configuration is in place");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
