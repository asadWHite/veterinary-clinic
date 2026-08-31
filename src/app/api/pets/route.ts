import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { pets } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { getPetsForUser } from "@/lib/clinic";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ pets: [] });
  return NextResponse.json({ pets: await getPetsForUser(user.id) });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  let payload: Record<string, string | number | null>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(payload.name ?? "").trim();
  const species = String(payload.species ?? "dog");
  if (name.length < 1) return NextResponse.json({ error: "Please add a name." }, { status: 400 });

  const [pet] = await db
    .insert(pets)
    .values({
      userId: user.id,
      name,
      species,
      breed: String(payload.breed ?? "").trim() || null,
      ageStage: String(payload.ageStage ?? "").trim() || null,
      birthYear: payload.birthYear ? Number(payload.birthYear) : null,
      weightKg: payload.weightKg ? Number(payload.weightKg) : null,
      sex: String(payload.sex ?? "").trim() || null,
      photoAssetId: String(payload.photoAssetId ?? "").trim() || null,
      notes: String(payload.notes ?? "").trim() || null,
    })
    .returning();

  return NextResponse.json({ pet });
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  await db.delete(pets).where(and(eq(pets.id, id), eq(pets.userId, user.id)));
  return NextResponse.json({ ok: true });
}
