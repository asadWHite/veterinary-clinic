import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionIndex({ children }: { children: ReactNode }) {
  return <span className="section-index">{children}</span>;
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  accent,
  lead,
  className,
  align = "left",
  as = "h2",
}: {
  index?: string;
  eyebrow?: string;
  title: string;
  accent?: string;
  lead?: string;
  className?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {(index || eyebrow) && (
        <div className="flex items-center gap-4">
          {index && <span className="section-index">{index}</span>}
          {eyebrow && <span className="label-eyebrow">{eyebrow}</span>}
          {index && <span className="hidden h-px w-10 bg-line sm:block" />}
        </div>
      )}
      <Heading className="text-h2 font-normal tracking-tight text-ink" level={as}>
        {title}
        {accent && (
          <>
            {" "}
            <span className="editorial-serif text-forest-2">{accent}</span>
          </>
        )}
      </Heading>
      {lead && (
        <p className={cn("max-w-xl text-[0.98rem] leading-relaxed text-ink-2", align === "center" && "mx-auto")}>
          {lead}
        </p>
      )}
    </div>
  );
}

function Heading({
  level,
  className,
  children,
}: {
  level: "h1" | "h2";
  className?: string;
  children: ReactNode;
}) {
  return level === "h1" ? (
    <h1 className={className}>{children}</h1>
  ) : (
    <h2 className={className}>{children}</h2>
  );
}

export function EmptyState({
  title,
  hint,
  action,
  icon = "✳",
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4 border border-line bg-canvas-2/60 px-7 py-10 sm:px-10 sm:py-14">
      <span aria-hidden className="text-2xl text-sage">
        {icon}
      </span>
      <p className="max-w-md text-lg leading-snug text-ink">{title}</p>
      {hint && <p className="max-w-md text-sm leading-relaxed text-ink-2">{hint}</p>}
      {action}
    </div>
  );
}

export function StarRating({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", size === "md" ? "text-base" : "text-xs")}
      aria-label={`${value.toFixed(1)} / 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} aria-hidden className={star <= rounded ? "text-forest" : "text-sage-2"}>
          {star - 0.5 === rounded ? "★" : star <= rounded ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: "border-clay/40 text-clay",
  confirmed: "border-forest/30 text-forest",
  completed: "border-ink/20 text-ink",
  cancelled: "border-line text-ink-2 line-through",
  no_show: "border-line text-ink-2",
  approved: "border-forest/30 text-forest",
  rejected: "border-line text-ink-2",
  routine: "border-line text-ink-2",
  soon: "border-clay/40 text-clay",
  urgent: "border-clay text-clay",
  available: "border-forest/30 text-forest",
  booked: "border-line text-ink-2",
  blocked: "border-line text-ink-2",
  past: "border-line text-sage",
};

export function StatusPill({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border px-2.5 py-1 text-[0.65rem] tracking-[0.16em] uppercase",
        STATUS_STYLES[status] ?? "border-line text-ink-2",
      )}
    >
      {label}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-block h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent",
        className,
      )}
    />
  );
}

export function FormNote({ tone = "error", children }: { tone?: "error" | "info"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "text-sm leading-relaxed",
        tone === "error" ? "text-clay" : "text-ink-2",
      )}
    >
      {children}
    </p>
  );
}
