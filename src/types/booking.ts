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
  }[];
  duration: number;
  days: Record<string, DayAvailabilityDto>;
};
