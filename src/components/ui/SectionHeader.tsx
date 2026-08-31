import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

type SectionHeaderProps = {
  index: string;
  label: string;
  children?: ReactNode;
  className?: string;
};

export function SectionHeader({ index, label, children, className = "" }: SectionHeaderProps) {
  return (
    <div className={`shell border-t border-[var(--line)] pt-5 ${className}`}>
      <div className="flex items-baseline justify-between gap-6">
        <span className="display d3 mono-num text-ink/20">{index}</span>
        <span className="label text-ink/50">{label}</span>
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

export function SectionTitle({
  lines,
  className = "",
  accentIndex,
}: {
  lines: string[];
  className?: string;
  accentIndex?: number;
}) {
  return (
    <h2 className={`display d2 ${className}`}>
      {lines.map((line, i) => (
        <Reveal key={line} variant="clip" delay={i * 90}>
          <span className="block">
            {line}
            {accentIndex === i ? <span className="text-forest">.</span> : null}
          </span>
        </Reveal>
      ))}
    </h2>
  );
}
