export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-[var(--line)] bg-paper py-4" aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="label flex items-center gap-8 px-8 text-ink/55">
            {item}
            <span className="block h-1 w-1 bg-forest" />
          </span>
        ))}
      </div>
    </div>
  );
}
