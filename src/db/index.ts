import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Database connection.
 *
 * Designed to work in three places without changes:
 *  - local development (DATABASE_URL in .env, or the local fallback below)
 *  - the preview sandbox
 *  - serverless hosts such as Vercel, where the database is remote and
 *    requires TLS, and where the connection may genuinely be unavailable
 *
 * A missing or unreachable database must never crash the process at import
 * time — pages degrade gracefully instead.
 */
const FALLBACK_URL = "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const databaseUrl = process.env.DATABASE_URL ?? FALLBACK_URL;

if (!process.env.DATABASE_URL) {
  console.warn(
    "[db] DATABASE_URL is not set — using the local development default.\n" +
      "[db] Copy .env.example to .env (locally) or set DATABASE_URL in your host's\n" +
      "[db] environment variables (Vercel → Project → Settings → Environment Variables).",
  );
}

function isLocal(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return true;
  }
}

/**
 * Hosted Postgres (Neon, Supabase, Vercel Postgres, RDS, …) requires TLS.
 * Local Postgres normally rejects it, so TLS is enabled only for remote hosts.
 */
const requiresSsl = !isLocal(databaseUrl);

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __dbStatus?: { ok: boolean; error?: string; checkedAt: number };
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
    // Serverless-friendly. Supabase's session-mode pooler allows only 15
    // clients per project, so keep a single connection per instance.
    max: Number(process.env.PG_POOL_MAX ?? 1),
    connectionTimeoutMillis: 4000,
    idleTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);

const STATUS_TTL_MS = 30_000;

/**
 * Cheap connectivity probe. Cached briefly so a busy page does not ping the
 * database on every render. Never throws.
 */
export async function checkDatabase(): Promise<{ ok: boolean; error?: string }> {
  const cached = globalForDb.__dbStatus;
  if (cached && Date.now() - cached.checkedAt < STATUS_TTL_MS) {
    return { ok: cached.ok, error: cached.error };
  }
  try {
    await pool.query("select 1");
    globalForDb.__dbStatus = { ok: true, checkedAt: Date.now() };
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[db] connection check failed:", message);
    globalForDb.__dbStatus = { ok: false, error: message, checkedAt: Date.now() };
    return { ok: false, error: message };
  }
}

/**
 * True when a recent probe failed. Used to skip further attempts so a page
 * renders instantly instead of waiting for a connection timeout per query.
 */
export function isDatabaseDown(): boolean {
  const cached = globalForDb.__dbStatus;
  return Boolean(cached && !cached.ok && Date.now() - cached.checkedAt < STATUS_TTL_MS);
}

/** Run a database call, falling back to a value when the database is down. */
export async function safeQuery<T>(
  run: () => Promise<T>,
  fallback: T,
  label: string,
): Promise<T> {
  if (isDatabaseDown()) return fallback;
  try {
    return await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[db] ${label} failed, using fallback:`, message);
    return fallback;
  }
}
