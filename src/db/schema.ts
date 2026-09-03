import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** A value translated per locale. Language-neutral storage, UI-side resolution. */
export type LocalizedText = {
  uz: string;
  ru: string;
  en: string;
};

export type LocaleCode = "uz" | "ru" | "en";

export const userRole = pgEnum("user_role", ["user", "doctor", "admin"]);
export const appointmentStatus = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);
export const urgencyLevel = pgEnum("urgency_level", ["routine", "soon", "urgent"]);
export const reviewStatus = pgEnum("review_status", ["pending", "approved", "rejected"]);
export const slotKind = pgEnum("slot_kind", ["work", "break"]);
export const notificationStatus = pgEnum("notification_status", ["queued", "sent", "failed"]);
export const speciesKey = pgEnum("species_key", ["dog", "cat", "other"]);

/* ------------------------------------------------------------------ profiles */

export const profiles = pgTable(
  "profiles",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name").notNull(),
    phone: text("phone"),
    role: userRole("role").notNull().default("user"),
    locale: text("locale").notNull().default("uz"),
    doctorId: integer("doctor_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("profiles_email_unique").on(table.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    token: text("token").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

export const passwordResets = pgTable(
  "password_resets",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("password_resets_token_unique").on(table.tokenHash)],
);

/* ---------------------------------------------------------------------- pets */

export const pets = pgTable(
  "pets",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    species: speciesKey("species").notNull(),
    breed: text("breed"),
    sex: text("sex"),
    birthDate: date("birth_date", { mode: "string" }),
    weightGrams: integer("weight_grams"),
    photoUrl: text("photo_url"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("pets_user_idx").on(table.userId)],
);

/* ------------------------------------------------------------------ services */

export const services = pgTable(
  "services",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: jsonb("title").$type<LocalizedText>().notNull(),
    summary: jsonb("summary").$type<LocalizedText>().notNull(),
    description: jsonb("description").$type<LocalizedText>().notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(30),
    sortOrder: integer("sort_order").notNull().default(0),
    isBookable: boolean("is_bookable").notNull().default(true),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("services_slug_unique").on(table.slug)],
);

/* ------------------------------------------------------------------- doctors */

export const doctors = pgTable(
  "doctors",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: jsonb("name").$type<LocalizedText>().notNull(),
    title: jsonb("title").$type<LocalizedText>().notNull(),
    bio: jsonb("bio").$type<LocalizedText>().notNull(),
    photoUrl: text("photo_url"),
    /** Only real, verified values. Rendered only when not null. */
    experienceYears: integer("experience_years"),
    /** ISO-like language codes: uz, ru, en */
    languages: jsonb("languages").$type<string[]>().notNull().default([]),
    /** Set to true while the clinic has not published the real team yet. */
    isPlaceholder: boolean("is_placeholder").notNull().default(true),
    isPublished: boolean("is_published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("doctors_slug_unique").on(table.slug)],
);

export const doctorServices = pgTable(
  "doctor_services",
  {
    id: serial("id").primaryKey(),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("doctor_services_unique").on(table.doctorId, table.serviceId)],
);

/* -------------------------------------------------------------- availability */

/** Recurring weekly schedule. kind = work | break. Times are minutes from midnight. */
export const availability = pgTable(
  "availability",
  {
    id: serial("id").primaryKey(),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    /** 0 = Monday … 6 = Sunday */
    weekday: integer("weekday").notNull(),
    kind: slotKind("kind").notNull().default("work"),
    startMinute: integer("start_minute").notNull(),
    endMinute: integer("end_minute").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("availability_doctor_idx").on(table.doctorId, table.weekday)],
);

/** One-off blocked periods per doctor and calendar day. */
export const blockedSlots = pgTable(
  "blocked_slots",
  {
    id: serial("id").primaryKey(),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    day: date("day", { mode: "string" }).notNull(),
    startMinute: integer("start_minute").notNull(),
    endMinute: integer("end_minute").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("blocked_slots_doctor_day_idx").on(table.doctorId, table.day)],
);

/* -------------------------------------------------------------- appointments */

export const appointments = pgTable(
  "appointments",
  {
    id: serial("id").primaryKey(),
    publicId: text("public_id").notNull(),
    userId: integer("user_id").references(() => profiles.id, { onDelete: "set null" }),
    petId: integer("pet_id").references(() => pets.id, { onDelete: "set null" }),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "restrict" }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "restrict" }),
    day: date("day", { mode: "string" }).notNull(),
    startMinute: integer("start_minute").notNull(),
    endMinute: integer("end_minute").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    status: appointmentStatus("status").notNull().default("pending"),
    urgency: urgencyLevel("urgency").notNull().default("routine"),
    /** language-neutral reason key, e.g. something_wrong / vaccination */
    reasonKey: text("reason_key").notNull(),
    species: speciesKey("species").notNull(),
    lifeStage: text("life_stage").notNull(),
    petName: text("pet_name"),
    petBreed: text("pet_breed"),
    notes: text("notes"),
    guestName: text("guest_name"),
    guestPhone: text("guest_phone"),
    guestEmail: text("guest_email"),
    clientName: text("client_name").notNull(),
    clientPhone: text("client_phone").notNull(),
    clientEmail: text("client_email"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("appointments_public_id_unique").on(table.publicId),
    index("appointments_day_idx").on(table.day, table.doctorId),
    index("appointments_user_idx").on(table.userId),
  ],
);

export const appointmentAnswers = pgTable(
  "appointment_answers",
  {
    id: serial("id").primaryKey(),
    appointmentId: integer("appointment_id")
      .notNull()
      .references(() => appointments.id, { onDelete: "cascade" }),
    /** Order in the questionnaire flow. */
    stepIndex: integer("step_index").notNull().default(0),
    /** Language-neutral question key, e.g. not_eating_duration */
    questionKey: text("question_key").notNull(),
    /** Language-neutral answer value(s), comma separated for multi-select. */
    answerValue: text("answer_value").notNull(),
    isFreeText: boolean("is_free_text").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("appointment_answers_idx").on(table.appointmentId)],
);

/* ----------------------------------------------------- reviews & favourites */

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    appointmentId: integer("appointment_id")
      .notNull()
      .references(() => appointments.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    status: reviewStatus("status").notNull().default("pending"),
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("reviews_appointment_unique").on(table.appointmentId),
    index("reviews_status_idx").on(table.status),
  ],
);

export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("favorites_unique").on(table.userId, table.doctorId)],
);

/* ------------------------------------------------------------------- journal */

export const journalPosts = pgTable(
  "journal_posts",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: jsonb("title").$type<LocalizedText>().notNull(),
    excerpt: jsonb("excerpt").$type<LocalizedText>().notNull(),
    body: jsonb("body").$type<LocalizedText>().notNull(),
    categoryKey: text("category_key").notNull(),
    coverUrl: text("cover_url"),
    readingMinutes: integer("reading_minutes"),
    isPublished: boolean("is_published").notNull().default(true),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("journal_posts_slug_unique").on(table.slug)],
);

/* --------------------------------------------------- medical records & docs */

export const medicalRecords = pgTable(
  "medical_records",
  {
    id: serial("id").primaryKey(),
    petId: integer("pet_id")
      .notNull()
      .references(() => pets.id, { onDelete: "cascade" }),
    appointmentId: integer("appointment_id").references(() => appointments.id, {
      onDelete: "set null",
    }),
    doctorId: integer("doctor_id").references(() => doctors.id, { onDelete: "set null" }),
    title: jsonb("title").$type<LocalizedText>().notNull(),
    body: jsonb("body").$type<LocalizedText>().notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("medical_records_pet_idx").on(table.petId)],
);

export const vaccinations = pgTable(
  "vaccinations",
  {
    id: serial("id").primaryKey(),
    petId: integer("pet_id")
      .notNull()
      .references(() => pets.id, { onDelete: "cascade" }),
    vaccineKey: text("vaccine_key").notNull(),
    administeredAt: date("administered_at", { mode: "string" }),
    nextDueAt: date("next_due_at", { mode: "string" }),
    doctorId: integer("doctor_id").references(() => doctors.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("vaccinations_pet_idx").on(table.petId)],
);

export const documents = pgTable(
  "documents",
  {
    id: serial("id").primaryKey(),
    petId: integer("pet_id")
      .notNull()
      .references(() => pets.id, { onDelete: "cascade" }),
    kind: text("kind").notNull().default("other"),
    title: jsonb("title").$type<LocalizedText>().notNull(),
    fileUrl: text("file_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("documents_pet_idx").on(table.petId)],
);

/* ------------------------------------------------- notifications & settings */

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => profiles.id, { onDelete: "cascade" }),
    appointmentId: integer("appointment_id").references(() => appointments.id, {
      onDelete: "cascade",
    }),
    /** appointment_created | appointment_confirmed | appointment_cancelled | reminder | review_request */
    type: text("type").notNull(),
    /** internal | sms | email — providers are pluggable, nothing is claimed as configured */
    channel: text("channel").notNull().default("internal"),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    status: notificationStatus("status").notNull().default("queued"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("notifications_user_idx").on(table.userId)],
);

/** Configurable clinic data — never hardcode contact details in the UI. */
export const clinicSettings = pgTable("clinic_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<LocalizedText | string | string[]>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type Pet = typeof pets.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Doctor = typeof doctors.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type AppointmentAnswer = typeof appointmentAnswers.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type JournalPost = typeof journalPosts.$inferSelect;
export type AvailabilityRule = typeof availability.$inferSelect;
export type BlockedSlot = typeof blockedSlots.$inferSelect;
