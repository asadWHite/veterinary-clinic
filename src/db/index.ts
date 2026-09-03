import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * The pg Pool is lazy — it only opens a socket on the first query — so creating
 * it eagerly is safe. When DATABASE_URL is missing we keep `pool`/`db` null and
 * the application falls back to the bundled clinic content instead of failing
 * at build time. Every read path guards with isDatabaseConfigured().
 */
const databaseUrl = process.env.DATABASE_URL;
export const isDatabaseConfigured = Boolean(databaseUrl && databaseUrl.trim().length > 0);

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool: Pool | null = isDatabaseConfigured
  ? (globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
      max: 5,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 8_000,
    }))
  : null;

if (pool && !globalForDb.__arenaNextJsPostgresqlPool && process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

type DbClient = ReturnType<typeof drizzle>;

/**
 * Drizzle client. Null at runtime when no database is configured — callers
 * must check isDatabaseConfigured() first (all read paths do, inside try/catch).
 */
export const db = (pool ? drizzle(pool) : null) as unknown as DbClient;
