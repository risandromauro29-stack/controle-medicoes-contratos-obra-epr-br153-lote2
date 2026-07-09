import type { Filial } from "../types";
import type { Filters } from "../lib/metrics";
import { MultiSelect } from "./MultiSelect";

export function FiltersBar({
  filters,
  onChange,
  filiais,
  tipos,
  fornecedores,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  filiais: Filial[];
  tipos: string[];
  fornecedores: string[];
}) {
  const hasActive =
    filters.filiais.length || filters.tipos.length || filters.fornecedores.length || filters.busca;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative">
        <input
          value={filters.busca}
          onChange={(e) => onChange({ ...filters, busca: e.target.value })}
          placeholder="Buscar contrato, fornecedor, objetivo…"
          className="w-64 rounded-lg border border-border-hairline bg-surface-card px-3 py-2 text-[13px] text-ink-primary placeholder:text-ink-muted focus:border-brand focus:outline-none"
        />
      </div>
      <MultiSelect
        label="Filial"
        options={filiais.map((f) => ({ value: String(f.codigo), label: f.nome }))}
        selected={filters.filiais.map(String)}
        onChange={(vals) => onChange({ ...filters, filiais: vals.map(Number) })}
      />
      <MultiSelect
        label="Tipo de contrato"
        options={tipos.map((t) => ({ value: t, label: t }))}
        selected={filters.tipos}
        onChange={(vals) => onChange({ ...filters, tipos: vals })}
      />
      <MultiSelect
        label="Fornecedor"
        options={fornecedores.map((f) => ({ value: f, label: f }))}
        selected={filters.fornecedores}
        onChange={(vals) => onChange({ ...filters, fornecedores: vals })}
      />
      {hasActive ? (
        <button
          onClick={() => onChange({ filiais: [], tipos: [], fornecedores: [], mesInicio: null, mesFim: null, busca: "" })}
          className="text-[13px] font-medium text-ink-muted hover:text-ink-primary"
        >
          Limpar filtros
        </button>
      ) : null}
    </div>
  );
}
