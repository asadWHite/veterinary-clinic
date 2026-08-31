export const site = {
  /** Placeholder clinic information — replace before launch. */
  name: "[CLINIC NAME]",
  legalName: "[CLINIC LEGAL NAME]",
  tagline: "Veterinary care",
  address: "[ADDRESS]",
  city: "[CITY]",
  phone: "[PHONE]",
  phoneHref: "tel:[PHONE]",
  email: "[EMAIL]",
  hours: "[WORKING HOURS]",
  instagram: "[INSTAGRAM]",
  telegram: "[TELEGRAM]",
  url: "https://example.com",
} as const;

/** `label` is an i18n key under `nav.` */
export const navItems = [
  { label: "about", href: "/about" },
  { label: "care", href: "/care" },
  { label: "doctors", href: "/doctors" },
  { label: "pets", href: "/pets" },
  { label: "journal", href: "/journal" },
  { label: "gallery", href: "/gallery" },
  { label: "contact", href: "/contact" },
] as const;

/** `label` is an i18n key under `account.` */
export const accountNav = [
  { label: "overview", href: "/account" },
  { label: "appointments", href: "/account/appointments" },
  { label: "pets", href: "/pets" },
  { label: "reviews", href: "/account/reviews" },
  { label: "favorites", href: "/account/favorites" },
  { label: "settings", href: "/account/settings" },
] as const;

export const bookingSteps = [
  { id: "companion", index: "01", label: "companion" },
  { id: "age", index: "02", label: "age" },
  { id: "concern", index: "03", label: "concern" },
  { id: "context", index: "04", label: "context" },
  { id: "care", index: "05", label: "care" },
  { id: "doctor", index: "06", label: "doctor" },
  { id: "time", index: "07", label: "time" },
  { id: "confirm", index: "08", label: "confirm" },
] as const;

export type BookingStepId = (typeof bookingSteps)[number]["id"];
