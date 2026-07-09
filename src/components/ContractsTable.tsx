import { useMemo, useState } from "react";
import type { Contrato, Filial } from "../types";
import { formatCurrencyPrecise, formatDate, formatPercent } from "../lib/format";
import { ProgressBar } from "./ProgressBar";

type SortKey = "id" | "fornecedor" | "valorTotal" | "valorMedido" | "saldo" | "pct";

export function ContractsTable({ contratos, filiais }: { contratos: Contrato[]; filiais: Filial[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("valorTotal");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filialMap = useMemo(() => new Map(filiais.map((f) => [f.codigo, f])), [filiais]);

  const sorted = useMemo(() => {
    const withPct = contratos.map((c) => ({
      ...c,
      pct: c.valorTotal > 0 ? (c.valorMedido / c.valorTotal) * 100 : 0,
    }));
    withPct.sort((a, b) => {
      let av: number | string = a[sortKey];
      let bv: number | string = b[sortKey];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return withPct;
  }, [contratos, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const columns: { key: SortKey; label: string; align?: "right" }[] = [
    { key: "id", label: "Contrato" },
    { key: "fornecedor", label: "Fornecedor" },
    { key: "valorTotal", label: "Valor total", align: "right" },
    { key: "valorMedido", label: "Medido", align: "right" },
    { key: "saldo", label: "Saldo", align: "right" },
    { key: "pct", label: "Execução", align: "right" },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-hairline bg-surface-card">
      <table className="w-full min-w-[860px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-border-hairline text-left text-ink-muted">
            <th className="px-4 py-3 font-medium">Filial</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className={`cursor-pointer select-none px-4 py-3 font-medium hover:text-ink-primary ${col.align === "right" ? "text-right" : "text-left"}`}
              >
                {col.label} {sortKey === col.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
            ))}
            <th className="px-4 py-3 font-medium">Início</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, idx) => {
            const filial = filialMap.get(c.filial);
            const estourado = c.saldo < 0;
            return (
              <tr key={`${c.id}-${c.filial}-${idx}`} className="border-b border-border-hairline/60 last:border-0 hover:bg-surface-card-2/60">
                <td className="px-4 py-3 text-ink-secondary">{filial ? filial.nome : c.filial}</td>
                <td className="px-4 py-3 text-ink-secondary">{c.tipoContrato}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink-primary">{c.id}</div>
                </td>
                <td className="px-4 py-3 text-ink-secondary">{c.fornecedor}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-primary">
                  {formatCurrencyPrecise(c.valorTotal)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-primary">
                  {formatCurrencyPrecise(c.valorMedido)}
                </td>
                <td
                  className="px-4 py-3 text-right tabular-nums font-medium"
                  style={{ color: estourado ? "var(--status-critical)" : "var(--ink-primary)" }}
                >
                  {formatCurrencyPrecise(c.saldo)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <span className="w-12 shrink-0 text-right tabular-nums text-ink-secondary">
                      {formatPercent(c.pct, 0)}
                    </span>
                    <div className="w-20">
                      <ProgressBar pct={estourado ? 100 : c.pct} tone="status" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-muted">{formatDate(c.dataInicio)}</td>
              </tr>
            );
          })}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-10 text-center text-ink-muted">
                Nenhum contrato encontrado para os filtros aplicados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
