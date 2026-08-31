"use client";

import type { OptionTone } from "@/data/questions";

type AnswerOptionProps = {
  label: string;
  hint?: string;
  tone?: OptionTone;
  selected?: boolean;
  multi?: boolean;
  index?: number;
  onSelect: () => void;
  name: string;
  hintUrgent?: string;
};

const toneRing: Record<OptionTone, string> = {
  default: "",
  calm: "",
  attention: "border-[rgba(16,19,17,0.42)]",
  urgent: "border-forest bg-forest/[0.04]",
};

export function AnswerOption({
  label,
  hint,
  tone = "default",
  selected = false,
  multi = false,
  index,
  onSelect,
  name,
  hintUrgent = "Prompt attention advised",
}: AnswerOptionProps) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      aria-label={label}
      name={name}
      onClick={onSelect}
      className={`press group relative flex w-full items-start justify-between gap-4 border p-4 text-left transition-all duration-300 sm:p-5 ${
        selected ? "border-ink bg-ink text-white" : `bg-canvas hover:border-ink/45 ${toneRing[tone]}`
      }`}
    >
      <span className="flex min-w-0 flex-1 items-baseline gap-3">
        {index !== undefined ? (
          <span
            className={`label mono-num shrink-0 ${selected ? "text-white/50" : "text-ink/30"}`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
        <span className="min-w-0">
          <span className="display d5 block uppercase">{label}</span>
          {hint ? (
            <span
              className={`mt-1 block text-[0.78rem] leading-snug ${
                selected ? "text-white/60" : "text-ink/50"
              }`}
            >
              {hint}
              {tone === "urgent" && !selected ? (
                <span className="ml-2 text-forest">{hintUrgent}</span>
              ) : null}
            </span>
          ) : null}
        </span>
      </span>
      <span
        className={`mt-1 block h-3 w-3 shrink-0 border transition-all duration-300 ${
          selected ? "border-white bg-white" : "border-ink/30 group-hover:border-ink"
        }`}
        style={{ borderRadius: multi ? "50%" : 0 }}
      />
    </button>
  );
}
