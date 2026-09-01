export type SlotDto = {
  time: string;
  minutes: number;
  state: "free" | "booked" | "past" | "blocked";
  label?: string;
  part: "morning" | "afternoon" | "evening";
};

export type DayAvailabilityDto = {
  date: string;
  open: boolean;
  slots: SlotDto[];
  freeCount: number;
};

/**
 * `status` separates an *unknown* schedule from an *empty* one:
 *  - "ok"              — the schedule below is real
 *  - "error"           — the schedule could not be calculated (retry)
 *  - "database"        — no database connection
 *  - "unknown-doctor"  — the requested clinician is not a real record
 * Only an empty `days` with status "ok" means "genuinely nothing free".
 */
export type AvailabilityStatus = "ok" | "error" | "database" | "unknown-doctor";

export type AvailabilityResponse = {
  doctors: {
    id: string;
    slug: string;
    code: string;
    name: string;
    specialization: string;
    photoKey: string | null;
    initials: string;
    next: { date: string; time: string } | null;
    hasSchedule?: boolean;
  }[];
  duration: number;
  days: Record<string, DayAvailabilityDto>;
  status?: AvailabilityStatus;
};
