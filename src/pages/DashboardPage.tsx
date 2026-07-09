import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { KpiCard } from "../components/KpiCard";
import { AlertsPanel } from "../components/AlertsPanel";
import { FiltersBar } from "../components/FiltersBar";
import { ContractsTable } from "../components/ContractsTable";
import { UploadModal } from "../components/UploadModal";
import { MonthlyTrendChart } from "../components/charts/MonthlyTrendChart";
import { BreakdownBarChart } from "../components/charts/BreakdownBarChart";
import { localObraRepository } from "../lib/store";
import {
  applyFilters,
  computeAlerts,
  computeBreakdown,
  computeKpis,
  computeMonthlySeries,
  distinct,
  EMPTY_FILTERS,
  type Filters,
} from "../lib/metrics";
import { formatCurrencyPrecise, formatDate, formatPercent } from "../lib/format";
import type { Contrato, Obra } from "../types";

const DEFAULT_FILIAIS = [
  { codigo: 156, sigla: "PV", nome: "156 - PV" },
  { codigo: 157, sigla: "FD", nome: "157 - FD (Faturamento Direto)" },
];

export function DashboardPage() {
  const { obraId } = useParams<{ obraId: string }>();
  const [obra, setObra] = useState<Obra | undefined>(() => localObraRepository.get(obraId ?? ""));
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showUpload, setShowUpload] = useState(false);

  const filiais = obra?.filiais && obra.filiais.length > 0 ? obra.filiais : DEFAULT_FILIAIS;

  const tipos = useMemo(() => (obra ? distinct(obra.contratos, (c) => c.tipoContrato).filter(Boolean).sort() : []), [obra]);
  const fornecedores = useMemo(
    () => (obra ? distinct(obra.contratos, (c) => c.fornecedor).filter(Boolean).sort() : []),
    [obra]
  );

  const filtered = useMemo(() => (obra ? applyFilters(obra.contratos, filters) : []), [obra, filters]);
  const kpis = useMemo(() => computeKpis(filtered, filters), [filtered, filters]);
  const alertas = useMemo(() => computeAlerts(filtered), [filtered]);
  const monthly = useMemo(() => computeMonthlySeries(filtered), [filtered]);
  const byTipo = useMemo(() => computeBreakdown(filtered, (c) => c.tipoContrato || "Sem tipo"), [filtered]);
  const byFilial = useMemo(
    () =>
      computeBreakdown(filtered, (c) => {
        const f = filiais.find((f) => f.codigo === c.filial);
        return f ? f.nome : `Filial ${c.filial}`;
      }),
    [filtered, filiais]
  );
  const byFornecedor = useMemo(() => computeBreakdown(filtered, (c) => c.fornecedor || "Sem fornecedor"), [filtered]);

  if (!obra) {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-ink-secondary">Obra não encontrada.</p>
          <Link to="/" className="text-brand hover:underline">
            Voltar para obras
          </Link>
        </div>
      </Layout>
    );
  }

  function handleImport(contratos: Contrato[]) {
    if (!obra) return;
    const filiaisDetectadas = distinct(contratos, (c) => c.filial).filter((f) => f);
    const filiaisFinal =
      obra.filiais.length > 0
        ? obra.filiais
        : filiaisDetectadas.map((codigo) => {
            const known = DEFAULT_FILIAIS.find((f) => f.codigo === codigo);
            return known ?? { codigo, sigla: String(codigo), nome: `Filial ${codigo}` };
          });
    const updated: Obra = {
      ...obra,
      contratos,
      filiais: filiaisFinal,
      atualizadoEm: new Date().toISOString(),
    };
    localObraRepository.save(updated);
    setObra(updated);
    setShowUpload(false);
    setFilters(EMPTY_FILTERS);
  }

  const saldoNegativoCount = filtered.filter((c) => c.saldo < 0).length;

  return (
    <Layout
      right={
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 rounded-lg border border-border-hairline px-3 py-2 text-[13px] font-medium text-ink-secondary hover:bg-surface-card-2"
        >
          ⬆ Atualizar dados
        </button>
      }
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/" className="text-[12.5px] text-ink-muted hover:text-brand">
            ← Obras
          </Link>
          <h1 className="mt-1 text-xl font-bold text-ink-primary">{obra.nome}</h1>
          <p className="text-[13px] text-ink-secondary">
            {obra.contratos.length} contratos · atualizado em {formatDate(obra.atualizadoEm.slice(0, 10))}
          </p>
        </div>
      </div>

      {obra.contratos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-hairline py-20 text-center">
          <span className="text-3xl">📈</span>
          <p className="text-ink-primary">Essa obra ainda não tem dados.</p>
          <button
            onClick={() => setShowUpload(true)}
            className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
            style={{ background: "var(--brand)" }}
          >
            Importar planilha
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Valor total contratado" value={formatCurrencyPrecise(kpis.valorTotalContratado)} accent />
            <KpiCard
              label="Valor total medido"
              value={formatCurrencyPrecise(kpis.valorTotalMedido)}
              sublabel={`${formatPercent(kpis.percentualExecucao)} do contratado`}
            />
            <KpiCard label="Saldo a medir" value={formatCurrencyPrecise(kpis.saldoAMedir)} />
            <KpiCard
              label="Contratos"
              value={String(kpis.qtdContratos)}
              sublabel={saldoNegativoCount > 0 ? `${saldoNegativoCount} estourado(s)` : "todos dentro do saldo"}
            />
          </div>

          <AlertsPanel alertas={alertas} />

          <FiltersBar filters={filters} onChange={setFilters} filiais={filiais} tipos={tipos} fornecedores={fornecedores} />

          <div className="rounded-2xl border border-border-hairline bg-surface-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-ink-primary">Medição mensal e acumulado</h3>
            <MonthlyTrendChart data={monthly} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border-hairline bg-surface-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-ink-primary">Por tipo de contrato</h3>
              <BreakdownBarChart data={byTipo} />
            </div>
            <div className="rounded-2xl border border-border-hairline bg-surface-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-ink-primary">Por filial</h3>
              <BreakdownBarChart data={byFilial} />
            </div>
          </div>

          <div className="rounded-2xl border border-border-hairline bg-surface-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-ink-primary">Top fornecedores por valor contratado</h3>
            <BreakdownBarChart data={byFornecedor} maxItems={10} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-ink-primary">Contratos ({filtered.length})</h3>
            <ContractsTable contratos={filtered} filiais={filiais} />
          </div>
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onImport={handleImport} />}
    </Layout>
  );
}
