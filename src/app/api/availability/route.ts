import { NextResponse } from "next/server";
import { resolveBookingContext, slotsForDay } from "@/lib/booking/server";
import { BOOKING_HORIZON_DAYS, bookingDayRange, nowInZone } from "@/lib/format";
import { normalizeLocale } from "@/lib/i18n/config";
import { isDatabaseConfigured } from "@/db";
import { getAvailabilitySummary } from "@/lib/booking/availability";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability
 *   ?service=<slug>&doctor=<slug|any>&day=<YYYY-MM-DD>            → slots for one day
 *   ?service=<slug>&doctor=<slug|any>&range=<n>&from=<YYYY-MM-DD> → availability per day
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const serviceSlug = url.searchParams.get("service");
  const doctorSlug = url.searchParams.get("doctor") ?? "any";
  const day = url.searchParams.get("day");
  const range = Math.min(Number(url.searchParams.get("range") ?? 0) || 0, 60);
  const locale = normalizeLocale(url.searchParams.get("locale") ?? "uz");

  if (!serviceSlug) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  try {
    const context = await resolveBookingContext(serviceSlug, doctorSlug === "any" ? "any" : doctorSlug, locale);
    if (!context) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (day) {
      const slots = await slotsForDay(context, day);
      return NextResponse.json({
        day,
        durationMinutes: context.durationMinutes,
        timezone: context.timezone,
        doctors: context.doctors,
        offline: !isDatabaseConfigured,
        slots,
      });
    }

    const from = url.searchParams.get("from") ?? nowInZone(context.timezone).day;
    const days = bookingDayRange(from, Math.max(range, BOOKING_HORIZON_DAYS));
    const summary = await getAvailabilitySummary({
      days,
      durationMinutes: context.durationMinutes,
      doctorIds: context.doctorIds,
      timezone: context.timezone,
    });
    return NextResponse.json({
      durationMinutes: context.durationMinutes,
      timezone: context.timezone,
      doctors: context.doctors,
      offline: !isDatabaseConfigured,
      days: summary,
    });
  } catch {
    return NextResponse.json({ error: "db" }, { status: 503 });
  }
}
