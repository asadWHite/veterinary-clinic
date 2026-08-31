import { NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResets, sessions, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  let payload: { token?: string; password?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = (payload.token ?? "").trim();
  const password = payload.password ?? "";
  if (!token) return NextResponse.json({ error: "Missing reset token." }, { status: 400 });
  if (password.length < 8)
    return NextResponse.json({ error: "Use at least 8 characters." }, { status: 400 });

  const rows = await db
    .select()
    .from(passwordResets)
    .where(
      and(eq(passwordResets.token, token), isNull(passwordResets.usedAt), gt(passwordResets.expiresAt, new Date())),
    )
    .limit(1);

  const record = rows[0];
  if (!record) return NextResponse.json({ error: "This link has expired." }, { status: 400 });

  await db
    .update(users)
    .set({ passwordHash: hashPassword(password) })
    .where(eq(users.id, record.userId));
  await db
    .update(passwordResets)
    .set({ usedAt: new Date() })
    .where(eq(passwordResets.token, token));
  // Invalidate every existing session for this account.
  await db.delete(sessions).where(eq(sessions.userId, record.userId));

  return NextResponse.json({ ok: true });
}
