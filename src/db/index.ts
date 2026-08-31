import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Database connection.
 *
 * DATABASE_URL is read from the environment. When it is absent (for example a
 * fresh clone of this repository) we fall back to the local development
 * default instead of throwing at import time, so the app still builds and the
 * developer gets a clear, actionable message rather than a crash.
 */
const FALLBACK_URL = "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const databaseUrl = process.env.DATABASE_URL ?? FALLBACK_URL;

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production") {
  console.warn(
    "[db] DATABASE_URL is not set — using the local development default.\n" +
      "[db] Copy .env.example to .env and set DATABASE_URL for your own database.",
  );
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

// Never keep an unusable pool alive across hot reloads in development.
if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
