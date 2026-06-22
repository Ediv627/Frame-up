type MarqueeProps = {
  items: string[];
  className?: string;
};

export function Marquee({ items, className = "" }: MarqueeProps) {
  const doubled = [...items, ...items];
  return (
    <div className={`overflow-hidden border-y border-border bg-foreground text-background ${className}`}>
      <div className="marquee flex whitespace-nowrap py-3">
        {doubled.map((item, i) => (
          <span key={i} className="mx-6 text-sm font-medium tracking-wide">
            {item} <span className="mx-4 inline-block opacity-40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
