import { and, eq, inArray } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { appointments, availability, blockedSlots } from "@/db/schema";
import {
  BOOKING_LEAD_MINUTES,
  SLOT_STEP_MINUTES,
  minutesToTime,
  nowInZone,
  weekdayOf,
} from "@/lib/format";
import type { AvailabilitySlot, SlotState } from "@/lib/types";
import { clinicIntervalsForWeekday } from "@/lib/clinic";
import { getClinicSettings } from "@/lib/settings";
import { timeToMinutes } from "@/lib/format";

export type Interval = { start: number; end: number };

export type DoctorDayPlan = {
  doctorId: number;
  work: Interval[];
  breaks: Interval[];
  blocked: Interval[];
  booked: Interval[];
};

export type DayStructure = {
  day: string;
  doctors: DoctorDayPlan[];
  timezone: string;
};

const ACTIVE_STATUSES = ["pending", "confirmed"] as const;

function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

function insideInterval(candidate: Interval, intervals: Interval[]): boolean {
  return intervals.some((interval) => candidate.start >= interval.start && candidate.end <= interval.end);
}

export async function getDayStructure(
  day: string,
  doctorIds: number[],
): Promise<DayStructure> {
  const weekday = weekdayOf(day);
  if (doctorIds.length === 0) {
    return { day, doctors: [], timezone: "UTC" };
  }
  const [rules, blocks, booked] = await Promise.all([
    db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.weekday, weekday),
          eq(availability.isActive, true),
          inArray(availability.doctorId, doctorIds),
        ),
      ),
    db
      .select()
      .from(blockedSlots)
      .where(and(eq(blockedSlots.day, day), inArray(blockedSlots.doctorId, doctorIds))),
    db
      .select({
        doctorId: appointments.doctorId,
        startMinute: appointments.startMinute,
        endMinute: appointments.endMinute,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.day, day),
          inArray(appointments.doctorId, doctorIds),
          inArray(appointments.status, [...ACTIVE_STATUSES]),
        ),
      ),
  ]);

  const plans: DoctorDayPlan[] = doctorIds.map((doctorId) => ({
    doctorId,
    work: rules
      .filter((rule) => rule.doctorId === doctorId && rule.kind === "work")
      .map((rule) => ({ start: rule.startMinute, end: rule.endMinute })),
    breaks: rules
      .filter((rule) => rule.doctorId === doctorId && rule.kind === "break")
      .map((rule) => ({ start: rule.startMinute, end: rule.endMinute })),
    blocked: blocks
      .filter((block) => block.doctorId === doctorId)
      .map((block) => ({ start: block.startMinute, end: block.endMinute })),
    booked: booked
      .filter((appointment) => appointment.doctorId === doctorId)
      .map((appointment) => ({
        start: appointment.startMinute,
        end: appointment.endMinute,
      })),
  }));

  return { day, doctors: plans, timezone: "clinic" };
}

/** Schedule from the bundled ELVET clinic data (used when no database exists). */
function offlineStructure(day: string, doctorIds: number[]): DayStructure {
  const intervals = clinicIntervalsForWeekday(weekdayOf(day));
  return {
    day,
    timezone: "clinic",
    doctors: doctorIds.map((doctorId) => ({
      doctorId,
      work: intervals,
      breaks: [],
      blocked: [],
      booked: [],
    })),
  };
}

/**
 * Builds real availability for one calendar day.
 *
 * A slot is only "available" when the whole service duration fits inside
 * working hours, outside breaks, blocked periods and existing appointments,
 * and after the booking lead time for today.
 */
export async function getAvailabilityForDay(input: {
  day: string;
  durationMinutes: number;
  doctorIds: number[];
  timezone: string;
}): Promise<AvailabilitySlot[]> {
  const { day, durationMinutes } = input;
  const doctorIds = input.doctorIds.filter((id, index, list) => list.indexOf(id) === index);
  if (doctorIds.length === 0) return [];

  const settings = await getClinicSettings();
  const lastStartMinute = timeToMinutes(settings.lastAppointment ?? "18:30");
  let structure: DayStructure;
  if (!isDatabaseConfigured) {
    structure = offlineStructure(day, doctorIds);
  } else {
    try {
      structure = await getDayStructure(day, doctorIds);
    } catch {
      structure = offlineStructure(day, doctorIds);
    }
  }
  const now = nowInZone(input.timezone);
  const isToday = day === now.day;

  const gridStart = Math.min(
    ...structure.doctors.flatMap((plan) => plan.work.map((interval) => interval.start)),
  );
  const gridEnd = Math.max(
    ...structure.doctors.flatMap((plan) => plan.work.map((interval) => interval.end)),
  );
  if (!Number.isFinite(gridStart) || !Number.isFinite(gridEnd)) return [];

  const slots: AvailabilitySlot[] = [];
  const firstSlot = Math.ceil(gridStart / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES;

  const latestStart = Math.min(gridEnd, lastStartMinute);
  for (let minute = firstSlot; minute + durationMinutes <= latestStart; minute += SLOT_STEP_MINUTES) {
    const candidate: Interval = { start: minute, end: minute + durationMinutes };
    const availableDoctors: number[] = [];
    let anyBooked = false;
    let anyBlocked = false;
    let anyWork = false;

    for (const plan of structure.doctors) {
      if (plan.work.length === 0) continue;
      if (!insideInterval(candidate, plan.work)) continue;
      anyWork = true;
      if (plan.breaks.some((interval) => overlaps(candidate, interval))) continue;
      if (plan.blocked.some((interval) => overlaps(candidate, interval))) {
        anyBlocked = true;
        continue;
      }
      if (plan.booked.some((interval) => overlaps(candidate, interval))) {
        anyBooked = true;
        continue;
      }
      availableDoctors.push(plan.doctorId);
    }

    let state: SlotState;
    if (availableDoctors.length > 0) {
      state = "available";
    } else if (isToday && minute < now.minute + BOOKING_LEAD_MINUTES) {
      state = "past";
    } else if (anyBooked) {
      state = "booked";
    } else if (anyBlocked) {
      state = "blocked";
    } else if (!anyWork) {
      state = "unavailable";
    } else {
      state = "unavailable";
    }

    if (isToday && minute < now.minute + BOOKING_LEAD_MINUTES && state === "available") {
      state = "past";
    }

    slots.push({ minute, label: minutesToTime(minute), state, doctorIds: availableDoctors });
  }

  return slots;
}

/** Days within the booking horizon that have at least one available slot. */
export async function getAvailabilitySummary(input: {
  days: string[];
  durationMinutes: number;
  doctorIds: number[];
  timezone: string;
}): Promise<{ day: string; availableCount: number; doctorIds: number[] }[]> {
  const results = await Promise.all(
    input.days.map(async (day) => {
      const slots = await getAvailabilityForDay({
        day,
        durationMinutes: input.durationMinutes,
        doctorIds: input.doctorIds,
        timezone: input.timezone,
      });
      return {
        day,
        availableCount: slots.filter((slot) => slot.state === "available").length,
        doctorIds: Array.from(new Set(slots.flatMap((slot) => slot.doctorIds))),
      };
    }),
  );
  return results;
}
