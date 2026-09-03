import { db, isDatabaseConfigured } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Health endpoint. Returns 200 when the application is running.
 * `database` reports whether a PostgreSQL connection is available — the site
 * itself renders from the bundled ELVET clinic content when it is not.
 */
export async function GET() {
  if (!isDatabaseConfigured) {
    return Response.json({ ok: true, database: "not_configured" });
  }
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, database: "connected" });
  } catch {
    return Response.json({ ok: true, database: "unreachable" });
  }
}
