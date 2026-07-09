import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyPoint } from "../../lib/metrics";
import { formatCurrency, formatCurrencyPrecise, formatMonth } from "../../lib/format";

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const medido = payload.find((p: any) => p.dataKey === "medido")?.value ?? 0;
  const acumulado = payload.find((p: any) => p.dataKey === "acumulado")?.value ?? 0;
  const planejado = payload.find((p: any) => p.dataKey === "planejado")?.value;
  return (
    <div className="rounded-lg border border-border-hairline bg-surface-card px-3 py-2 text-[12.5px] shadow-lg">
      <p className="mb-1.5 font-semibold text-ink-primary">{formatMonth(label)}</p>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-sm" style={{ background: "var(--series-1)" }} />
        <span className="text-ink-secondary">Medido no mês</span>
        <span className="ml-auto tabular-nums font-medium text-ink-primary">
          {formatCurrencyPrecise(medido)}
        </span>
      </div>
      {planejado != null && (
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-3 rounded-full" style={{ background: "var(--ink-muted)" }} />
          <span className="text-ink-secondary">Planejado</span>
          <span className="ml-auto tabular-nums font-medium text-ink-primary">
            {formatCurrencyPrecise(planejado)}
          </span>
        </div>
      )}
      <div className="mt-1 flex items-center gap-2 border-t border-border-hairline pt-1">
        <span className="h-0.5 w-3 rounded-full" style={{ background: "var(--brand)" }} />
        <span className="text-ink-secondary">Acumulado</span>
        <span className="ml-auto tabular-nums font-medium text-ink-primary">
          {formatCurrencyPrecise(acumulado)}
        </span>
      </div>
    </div>
  );
}

export function MonthlyTrendChart({ data }: { data: MonthlyPoint[] }) {
  const hasPlanejado = data.some((d) => d.planejado != null);

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-ink-muted">
        Sem medições lançadas para o período filtrado.
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={288}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis
            dataKey="mes"
            tickFormatter={formatMonth}
            tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
            axisLine={{ stroke: "var(--gridline)" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatCurrency(v, true)}
            tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ fill: "var(--surface-card-2)" }} />
          <Bar dataKey="medido" name="Medido no mês" fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={36} />
          <Line
            type="monotone"
            dataKey="acumulado"
            name="Acumulado"
            stroke="var(--brand)"
            strokeWidth={2}
            dot={false}
          />
          {hasPlanejado && (
            <Line
              type="monotone"
              dataKey="planejado"
              name="Planejado"
              stroke="var(--ink-muted)"
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={false}
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-1 flex flex-wrap items-center gap-4 text-[12.5px] text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm" style={{ background: "var(--series-1)" }} /> Medido no mês
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded-full" style={{ background: "var(--brand)" }} /> Acumulado
        </span>
        {hasPlanejado ? (
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded-full border-t-2 border-dashed" style={{ borderColor: "var(--ink-muted)" }} />
            Planejado
          </span>
        ) : (
          <span className="text-ink-muted">
            Planejado: sem dados ainda — pronto para receber o cronograma físico-financeiro.
          </span>
        )}
      </div>
    </div>
  );
}
