import { and, gte, inArray, lte, ne, or, isNull, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, availabilityRules, blockedSlots } from "@/db/schema";

export const SLOT_STEP = 30;
/** Minimum notice before an appointment can start. */
export const LEAD_MINUTES = 90;

export type SlotState = "free" | "booked" | "past" | "blocked";
export type DayPart = "morning" | "afternoon" | "evening";

export type Slot = {
  time: string;
  minutes: number;
  state: SlotState;
  label?: string;
  part: DayPart;
};

export type DayAvailability = {
  date: string;
  open: boolean;
  slots: Slot[];
  freeCount: number;
};

/* ------------------------------------------------------------------ */
/* Time helpers — clinic-local, stored as "HH:MM" text                 */
/* ------------------------------------------------------------------ */

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((v) => Number.parseInt(v, 10));
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function weekdayOf(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).getDay();
}

export function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function partOf(minutes: number): DayPart {
  if (minutes < 12 * 60) return "morning";
  if (minutes < 17 * 60) return "afternoon";
  return "evening";
}

/* ------------------------------------------------------------------ */
/* Range calculation                                                   */
/* ------------------------------------------------------------------ */

type Interval = { start: number; end: number; kind: SlotState; label?: string };

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Real slot calculation.
 * Availability = doctor schedule − blocked periods − existing appointments,
 * with service duration respected (a slot only appears if the whole
 * appointment fits inside uninterrupted free time).
 */
export async function getAvailabilityRange(params: {
  doctorIds: string[];
  startDate: string;
  days: number;
  durationMinutes: number;
}): Promise<Record<string, Record<string, DayAvailability>>> {
  const { doctorIds, startDate, days, durationMinutes } = params;
  const result: Record<string, Record<string, DayAvailability>> = {};
  if (doctorIds.length === 0) return result;

  const endDate = addDaysISO(startDate, days - 1);
  const dateList = Array.from({ length: days }, (_, i) => addDaysISO(startDate, i));

  const [rules, blocks, booked] = await Promise.all([
    db.select().from(availabilityRules).where(inArray(availabilityRules.doctorId, doctorIds)),
    db
      .select()
      .from(blockedSlots)
      .where(
        and(
          inArray(blockedSlots.doctorId, doctorIds),
          or(isNull(blockedSlots.date), gte(blockedSlots.date, startDate)),
        ),
      ),
    db
      .select({
        doctorId: appointments.doctorId,
        date: appointments.date,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
      })
      .from(appointments)
      .where(
        and(
          inArray(appointments.doctorId, doctorIds),
          ne(appointments.status, "cancelled"),
          gte(appointments.date, startDate),
          lte(appointments.date, endDate),
        ),
      ),
  ]);

  const today = todayISO();
  const current = nowMinutes();

  for (const doctorId of doctorIds) {
    result[doctorId] = {};
    const doctorRules = rules.filter((r) => r.doctorId === doctorId);

    for (const iso of dateList) {
      const weekday = weekdayOf(iso);
      const windows = doctorRules.filter((r) => r.weekday === weekday);
      const busy: Interval[] = [];

      for (const block of blocks) {
        if (block.doctorId !== doctorId) continue;
        const isDateMatch = block.date === iso;
        const isRecurringMatch = block.date === null && block.weekday === weekday;
        if (!isDateMatch && !isRecurringMatch) continue;
        busy.push({
          start: timeToMinutes(block.startTime),
          end: timeToMinutes(block.endTime),
          kind: "blocked",
          label: block.label,
        });
      }

      for (const appt of booked) {
        if (appt.doctorId !== doctorId || appt.date !== iso) continue;
        busy.push({
          start: timeToMinutes(appt.startTime),
          end: timeToMinutes(appt.endTime),
          kind: "booked",
          label: "Booked",
        });
      }

      const slots: Slot[] = [];
      for (const window of windows) {
        const open = timeToMinutes(window.startTime);
        const close = timeToMinutes(window.endTime);
        for (let t = open; t + durationMinutes <= close; t += SLOT_STEP) {
          const end = t + durationMinutes;
          let state: SlotState = "free";
          let label: string | undefined;

          const conflicting = busy.find((b) => overlaps(t, end, b.start, b.end));
          if (conflicting) {
            state = conflicting.kind;
            label = conflicting.label;
          }

          if (iso < today || (iso === today && t < current + LEAD_MINUTES)) {
            if (state === "free") {
              state = "past";
              label = "Past";
            }
          }

          slots.push({
            time: minutesToTime(t),
            minutes: t,
            state,
            label,
            part: partOf(t),
          });
        }
      }

      result[doctorId][iso] = {
        date: iso,
        open: windows.length > 0,
        slots,
        freeCount: slots.filter((s) => s.state === "free").length,
      };
    }
  }

  return result;
}

export async function getDoctorDay(doctorId: string, date: string, durationMinutes: number) {
  const range = await getAvailabilityRange({
    doctorIds: [doctorId],
    startDate: date,
    days: 1,
    durationMinutes,
  });
  return range[doctorId]?.[date] ?? { date, open: false, slots: [], freeCount: 0 };
}

/** Next bookable slot for each doctor, used for "next available" labels. */
export function findNextAvailable(
  availability: Record<string, Record<string, DayAvailability>>,
): Record<string, { date: string; time: string } | null> {
  const out: Record<string, { date: string; time: string } | null> = {};
  const doctorIds = Object.keys(availability);
  for (const doctorId of doctorIds) {
    const days = Object.values(availability[doctorId] ?? {}).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    let found: { date: string; time: string } | null = null;
    for (const day of days) {
      const slot = day.slots.find((s) => s.state === "free");
      if (slot) {
        found = { date: day.date, time: slot.time };
        break;
      }
    }
    out[doctorId] = found;
  }
  return out;
}

/** Server-side guard used before writing an appointment. */
export async function assertSlotFree(params: {
  doctorId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
}): Promise<{ ok: true } | { ok: false; reason: "past" | "unavailable" }> {
  const day = await getDoctorDay(params.doctorId, params.date, params.durationMinutes);
  const slot = day.slots.find((s) => s.time === params.startTime);
  if (!slot) return { ok: false, reason: "unavailable" };
  if (slot.state === "past") return { ok: false, reason: "past" };
  if (slot.state !== "free") return { ok: false, reason: "unavailable" };
  return { ok: true };
}

export const dayParts: { id: DayPart; label: string; hint: string }[] = [
  { id: "morning", label: "Morning", hint: "09:00 — 12:00" },
  { id: "afternoon", label: "Afternoon", hint: "13:00 — 17:00" },
  { id: "evening", label: "Evening", hint: "17:00 — 19:00" },
];

export { eq };
