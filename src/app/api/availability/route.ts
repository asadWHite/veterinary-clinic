import { NextResponse } from "next/server";
import { checkDatabase, safeQuery } from "@/db";
import { getDoctorsWithAvailability, getServiceBySlug } from "@/lib/clinic";
import { getAvailabilityRange, todayISO } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const doctorId = url.searchParams.get("doctorId");
  const serviceSlug = url.searchParams.get("service");
  const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? 14), 1), 21);

  const service = await getServiceBySlug(serviceSlug ?? "");
  const duration = service?.durationMinutes ?? 30;
  const doctors = await getDoctorsWithAvailability(duration);

  if (!doctorId) {
    return NextResponse.json({ doctors, duration, days: {} });
  }

  const status = await checkDatabase();
  if (!status.ok) {
    // Degrade gracefully: the UI renders an empty schedule instead of failing.
    return NextResponse.json(
      { doctors, duration, days: {}, database: "unavailable" },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  }

  const range = await safeQuery(
    () =>
      getAvailabilityRange({
        doctorIds: [doctorId],
        startDate: todayISO(),
        days,
        durationMinutes: duration,
      }),
    {},
    "availability",
  );

  return NextResponse.json(
    { doctors, duration, days: range[doctorId] ?? {} },
    { headers: { "cache-control": "no-store" } },
  );
}
