export function ProgressBar({ pct, tone = "brand" }: { pct: number; tone?: "brand" | "status" }) {
  const clamped = Math.max(0, Math.min(100, pct));
  let color = "var(--brand)";
  if (tone === "status") {
    if (pct < 0) color = "var(--status-critical)";
    else if (pct < 60) color = "var(--status-warning)";
    else color = "var(--status-good)";
  }
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-card-2">
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${clamped}%`, background: color }}
      />
    </div>
  );
}
