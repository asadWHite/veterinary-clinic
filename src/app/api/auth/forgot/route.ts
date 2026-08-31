import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { passwordResets, users } from "@/db/schema";

/**
 * No mail provider is configured in this build, so the reset token is returned
 * to the client and shown on screen. Replace with a real email delivery step.
 */
export async function POST(request: Request) {
  let payload: { email?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (payload.email ?? "").trim().toLowerCase();
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(sql`lower(${users.email})`, email))
    .limit(1);

  if (rows.length === 0) {
    // Do not reveal whether the address exists.
    return NextResponse.json({ ok: true, token: null });
  }

  const token = randomBytes(24).toString("hex");
  await db.insert(passwordResets).values({
    token,
    userId: rows[0].id,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  return NextResponse.json({ ok: true, token });
}
