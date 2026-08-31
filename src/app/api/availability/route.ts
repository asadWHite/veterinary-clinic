import { NextResponse } from "next/server";
import { getDoctorsWithAvailability, getServiceBySlug } from "@/lib/clinic";
import { getAvailabilityRange, todayISO } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const doctorId = url.searchParams.get("doctorId");
  const serviceSlug = url.searchParams.get("service");
  const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? 14), 1), 21);

  const service = serviceSlug ? await getServiceBySlug(serviceSlug) : null;
  const duration = service?.durationMinutes ?? 30;

  // Doctor directory + next-available labels
  const doctors = await getDoctorsWithAvailability(duration);
  if (!doctorId) {
    return NextResponse.json({ doctors, duration, days: {} });
  }

  const range = await getAvailabilityRange({
    doctorIds: [doctorId],
    startDate: todayISO(),
    days,
    durationMinutes: duration,
  });

  return NextResponse.json({
    doctors,
    duration,
    days: range[doctorId] ?? {},
  });
}
