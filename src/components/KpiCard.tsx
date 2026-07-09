import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  sublabel?: string;
  trend?: { direction: "up" | "down" | "flat"; label: string };
  accent?: boolean;
  icon?: ReactNode;
}

export function KpiCard({ label, value, sublabel, trend, accent, icon }: KpiCardProps) {
  return (
    <div
      className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border-hairline bg-surface-card p-5"
      style={
        accent
          ? { background: "linear-gradient(160deg, var(--brand-soft), transparent 60%)" }
          : undefined
      }
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium uppercase tracking-wide text-ink-muted">
          {label}
        </span>
        {icon && <span className="text-ink-muted">{icon}</span>}
      </div>
      <div className="tabular-nums text-3xl font-bold text-ink-primary">{value}</div>
      <div className="flex items-center gap-2 text-[13px]">
        {sublabel && <span className="text-ink-secondary">{sublabel}</span>}
        {trend && (
          <span
            className="tabular-nums font-medium"
            style={{
              color:
                trend.direction === "up"
                  ? "var(--status-good)"
                  : trend.direction === "down"
                    ? "var(--status-critical)"
                    : "var(--ink-muted)",
            }}
          >
            {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "–"} {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
