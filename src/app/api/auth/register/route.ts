import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  let payload: { name?: string; email?: string; password?: string; phone?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = (payload.name ?? "").trim();
  const email = (payload.email ?? "").trim().toLowerCase();
  const password = payload.password ?? "";
  const phone = (payload.phone ?? "").trim() || null;

  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (password.length < 8)
    return NextResponse.json({ error: "Use at least 8 characters." }, { status: 400 });

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(sql`lower(${users.email})`, email))
    .limit(1);
  if (existing.length > 0)
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const [user] = await db
    .insert(users)
    .values({ name, email, phone, passwordHash: hashPassword(password) })
    .returning({ id: users.id, name: users.name, email: users.email });

  await createSession(user.id);
  return NextResponse.json({ user });
}
