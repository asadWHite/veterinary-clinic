"use client";

import type { ReactNode } from "react";
import { useBooking } from "@/components/booking/BookingContext";

type StageFrameProps = {
  eyebrow: string;
  title: string;
  prompt?: string;
  children: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
};

/** Shared frame so every step of the flow feels like one continuous chapter. */
export function StageFrame({ eyebrow, title, prompt, children, aside, footer }: StageFrameProps) {
  const { state , t, locale } = useBooking();
  const lines = title.split("\n").filter((line) => line.trim().length > 0);

  return (
    <div key={state.stage} className="hero-rise">
      <p className="label text-ink/40">{eyebrow}</p>
      <h1 className="display d3 mt-5 uppercase">
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>
      {prompt ? <p className="body-lg mt-5 max-w-xl">{prompt}</p> : null}
      {aside}
      <div className="mt-10">{children}</div>
      {footer ? <div className="mt-10">{footer}</div> : null}
    </div>
  );
}
