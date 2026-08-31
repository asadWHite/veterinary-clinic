import { NextResponse } from "next/server";
import { checkDatabase } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const database = await checkDatabase();
  return NextResponse.json(
    {
      ok: true,
      database: database.ok ? "connected" : "unavailable",
      ...(database.error ? { databaseError: database.error } : {}),
    },
    { status: 200, headers: { "cache-control": "no-store" } },
  );
}
