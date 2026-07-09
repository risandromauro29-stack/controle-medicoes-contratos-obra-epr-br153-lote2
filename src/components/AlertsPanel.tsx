import { useState } from "react";
import type { Alerta } from "../types";

const SEVERITY_STYLE: Record<Alerta["severidade"], { color: string; label: string; icon: string }> = {
  critico: { color: "var(--status-critical)", label: "Crítico", icon: "⛔" },
  atencao: { color: "var(--status-warning)", label: "Atenção", icon: "⚠" },
  info: { color: "var(--status-info)", label: "Info", icon: "ℹ" },
};

export function AlertsPanel({ alertas }: { alertas: Alerta[] }) {
  const [expanded, setExpanded] = useState(false);
  if (alertas.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border-hairline bg-surface-card p-4">
        <span style={{ color: "var(--status-good)" }} className="text-lg">
          ✓
        </span>
        <p className="text-sm text-ink-secondary">
          Nenhum alerta ativo — todos os contratos estão dentro do esperado.
        </p>
      </div>
    );
  }

  const visible = expanded ? alertas : alertas.slice(0, 4);
  const criticos = alertas.filter((a) => a.severidade === "critico").length;
  const atencoes = alertas.filter((a) => a.severidade === "atencao").length;

  return (
    <div className="rounded-2xl border border-border-hairline bg-surface-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-primary">Alertas</h3>
        <div className="flex gap-2 text-[12px] font-medium tabular-nums">
          {criticos > 0 && (
            <span
              className="rounded-full px-2 py-0.5"
              style={{ background: "var(--status-critical)", color: "#fff" }}
            >
              {criticos} críticos
            </span>
          )}
          {atencoes > 0 && (
            <span
              className="rounded-full px-2 py-0.5"
              style={{ background: "var(--status-warning)", color: "#1a1200" }}
            >
              {atencoes} atenção
            </span>
          )}
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {visible.map((a) => {
          const s = SEVERITY_STYLE[a.severidade];
          return (
            <li
              key={a.id}
              className="flex items-start gap-2.5 rounded-lg border-l-2 bg-surface-card-2/60 px-3 py-2"
              style={{ borderColor: s.color }}
            >
              <span aria-hidden style={{ color: s.color }}>
                {s.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink-primary">{a.titulo}</p>
                <p className="truncate text-[12.5px] text-ink-secondary">{a.descricao}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {alertas.length > 4 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 text-[13px] font-medium text-brand hover:underline"
        >
          {expanded ? "Mostrar menos" : `Ver todos (${alertas.length})`}
        </button>
      )}
    </div>
  );
}
