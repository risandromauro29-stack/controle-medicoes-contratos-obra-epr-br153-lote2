import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BreakdownItem } from "../../lib/metrics";
import { formatCurrency, formatCurrencyPrecise, formatPercent } from "../../lib/format";

const PALETTE = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
];

function BreakdownTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d: BreakdownItem = payload[0].payload;
  const pct = d.valorTotal > 0 ? (d.valorMedido / d.valorTotal) * 100 : 0;
  return (
    <div className="rounded-lg border border-border-hairline bg-surface-card px-3 py-2 text-[12.5px] shadow-lg">
      <p className="mb-1 font-semibold text-ink-primary">{d.chave}</p>
      <p className="text-ink-secondary">
        Contratado: <span className="tabular-nums font-medium text-ink-primary">{formatCurrencyPrecise(d.valorTotal)}</span>
      </p>
      <p className="text-ink-secondary">
        Medido: <span className="tabular-nums font-medium text-ink-primary">{formatCurrencyPrecise(d.valorMedido)}</span> ({formatPercent(pct)})
      </p>
      <p className="text-ink-secondary">
        Contratos: <span className="tabular-nums font-medium text-ink-primary">{d.qtd}</span>
      </p>
    </div>
  );
}

export function BreakdownBarChart({ data, maxItems = 8 }: { data: BreakdownItem[]; maxItems?: number }) {
  const items = data.slice(0, maxItems);
  const height = Math.max(items.length * 40, 120);

  if (items.length === 0) {
    return <div className="flex h-32 items-center justify-center text-sm text-ink-muted">Sem dados.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={items} layout="vertical" margin={{ top: 4, right: 56, left: 4, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="chave"
          width={168}
          tick={{ fill: "var(--ink-secondary)", fontSize: 12.5 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: string) => (v.length > 26 ? v.slice(0, 25) + "…" : v)}
        />
        <Tooltip content={<BreakdownTooltip />} cursor={{ fill: "var(--surface-card-2)" }} />
        <Bar dataKey="valorTotal" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {items.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
          <LabelList
            dataKey="valorTotal"
            position="right"
            formatter={(v: unknown) => formatCurrency(Number(v), true)}
            fill="var(--ink-secondary)"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
