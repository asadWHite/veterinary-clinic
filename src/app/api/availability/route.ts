import { NextResponse } from "next/server";
import { checkDatabase } from "@/db";
import { getDoctorsWithAvailabilitySafe, getServiceBySlug } from "@/lib/clinic";
import { getAvailabilityRange, isUuid, todayISO } from "@/lib/availability";
import type { DayAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const doctorId = url.searchParams.get("doctorId");
  const serviceSlug = url.searchParams.get("service");
  const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? 14), 1), 21);

  const service = await getServiceBySlug(serviceSlug ?? "");
  const duration = service?.durationMinutes ?? 30;
  const { doctors, scheduleUnavailable } = await getDoctorsWithAvailabilitySafe(duration);

  const status = await checkDatabase();
  if (!status.ok) {
    // Degrade gracefully: the UI renders an empty schedule instead of failing.
    return NextResponse.json(
      { doctors, duration, days: {}, status: "database" },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  }

  if (!doctorId) {
    return NextResponse.json(
      { doctors, duration, days: {}, status: scheduleUnavailable ? "error" : "ok" },
      { headers: { "cache-control": "no-store" } },
    );
  }

  // Placeholder ids (`offline-…`) come from the static fallback and have no
  // real schedule behind them — report that instead of querying for a UUID
  // that does not exist and blowing the whole request up.
  if (!isUuid(doctorId)) {
    return NextResponse.json(
      { doctors, duration, days: {}, status: "unknown-doctor" },
      { headers: { "cache-control": "no-store" } },
    );
  }

  let schedule: Record<string, DayAvailability> = {};
  try {
    const range = await getAvailabilityRange({
      doctorIds: [doctorId],
      startDate: todayISO(),
      days,
      durationMinutes: duration,
    });
    schedule = range[doctorId] ?? {};
  } catch (error) {
    console.error("[availability] range failed:", error);
    return NextResponse.json(
      { doctors, duration, days: {}, status: "error" },
      { headers: { "cache-control": "no-store" } },
    );
  }

  return NextResponse.json(
    { doctors, duration, days: schedule, status: "ok" },
    { headers: { "cache-control": "no-store" } },
  );
}
