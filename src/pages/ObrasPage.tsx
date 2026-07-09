import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { localObraRepository } from "../lib/store";
import { computeKpis, EMPTY_FILTERS } from "../lib/metrics";
import { formatCurrency, formatDate } from "../lib/format";
import type { Obra } from "../types";

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ObrasPage() {
  const navigate = useNavigate();
  const [obras, setObras] = useState<Obra[]>(() => localObraRepository.list());
  const [creating, setCreating] = useState(false);
  const [nome, setNome] = useState("");

  const cards = useMemo(
    () =>
      obras.map((o) => ({
        obra: o,
        kpis: computeKpis(o.contratos, EMPTY_FILTERS),
      })),
    [obras]
  );

  function createObra() {
    if (!nome.trim()) return;
    const id = `${slugify(nome)}-${Date.now().toString(36)}`;
    const novaObra: Obra = {
      id,
      nome: nome.trim(),
      descricao: "Controle de Contratos / Medições",
      filiais: [],
      atualizadoEm: new Date().toISOString(),
      contratos: [],
    };
    localObraRepository.save(novaObra);
    setObras(localObraRepository.list());
    setCreating(false);
    setNome("");
    navigate(`/obra/${id}`);
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-primary">Obras</h1>
          <p className="text-sm text-ink-secondary">Selecione uma obra para ver o painel de contratos e medições.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
          style={{ background: "var(--brand)" }}
        >
          + Nova obra
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ obra, kpis }) => (
          <button
            key={obra.id}
            onClick={() => navigate(`/obra/${obra.id}`)}
            className="flex flex-col gap-3 rounded-2xl border border-border-hairline bg-surface-card p-5 text-left transition-colors hover:border-brand"
          >
            <div>
              <h2 className="font-semibold text-ink-primary">{obra.nome}</h2>
              <p className="text-[12.5px] text-ink-muted">{obra.descricao}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-border-hairline pt-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-ink-muted">Contratado</p>
                <p className="tabular-nums text-sm font-semibold text-ink-primary">
                  {formatCurrency(kpis.valorTotalContratado, true)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-ink-muted">Medido</p>
                <p className="tabular-nums text-sm font-semibold text-ink-primary">
                  {formatCurrency(kpis.valorTotalMedido, true)}
                </p>
              </div>
            </div>
            <p className="text-[12px] text-ink-muted">
              {obra.contratos.length} contratos · atualizado em {formatDate(obra.atualizadoEm.slice(0, 10))}
            </p>
          </button>
        ))}

        <button
          onClick={() => setCreating(true)}
          className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border-hairline text-ink-muted hover:border-brand hover:text-brand"
        >
          <span className="text-2xl">+</span>
          <span className="text-[13px] font-medium">Nova obra</span>
        </button>
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border-hairline bg-surface-card p-6">
            <h2 className="mb-3 text-base font-semibold text-ink-primary">Nova obra</h2>
            <input
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createObra()}
              placeholder="Ex: OBRA 210 - Rodovia XYZ"
              className="w-full rounded-lg border border-border-hairline bg-surface-card px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setCreating(false)}
                className="rounded-lg border border-border-hairline px-3.5 py-2 text-[13px] font-medium text-ink-secondary hover:bg-surface-card-2"
              >
                Cancelar
              </button>
              <button
                onClick={createObra}
                className="rounded-lg px-3.5 py-2 text-[13px] font-semibold text-white"
                style={{ background: "var(--brand)" }}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
