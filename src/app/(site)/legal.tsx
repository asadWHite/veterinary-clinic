import type { ReactNode } from "react";

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <div className="shell grid grid-cols-1 gap-10 py-14 lg:grid-cols-12 lg:py-20">
      <div className="lg:col-span-4">
        <p className="label text-ink/40">Legal</p>
        <h1 className="display d3 mt-5 uppercase">{title}</h1>
        <p className="body-lg mt-6 max-w-sm">{intro}</p>
      </div>
      <div className="lg:col-span-8 lg:border-l lg:border-[var(--line)] lg:pl-10">
        {sections.map((section, i) => (
          <section key={section.heading} className="border-t border-[var(--line)] py-8 first:border-t-0">
            <p className="label mono-num text-ink/30">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="display d5 mt-3 uppercase">{section.heading}</h2>
            <p className="body-lg mt-4 max-w-2xl">{section.body}</p>
          </section>
        ))}
        <p className="label mt-8 leading-[1.9] text-ink/35">
          Placeholder document. Replace with reviewed legal text before launch.
        </p>
      </div>
    </div>
  );
}

export type LegalSection = { heading: string; body: string };
export type LegalLayoutProps = { children: ReactNode };
