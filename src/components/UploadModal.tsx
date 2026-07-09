import { useRef, useState } from "react";
import type { Contrato } from "../types";
import { parseWorkbook } from "../lib/importSpreadsheet";

export function UploadModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (contratos: Contrato[]) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ contratos: Contrato[]; warnings: string[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const parsed = await parseWorkbook(file);
      setResult(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao ler a planilha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-hairline bg-surface-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-primary">Atualizar dados da obra</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink-primary">
            ✕
          </button>
        </div>

        {!result && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              dragOver ? "border-brand bg-brand-soft" : "border-border-hairline"
            }`}
          >
            <span className="text-2xl">📊</span>
            <p className="text-sm font-medium text-ink-primary">
              Arraste a planilha .xlsx aqui ou clique para selecionar
            </p>
            <p className="text-[12.5px] text-ink-muted">
              Mesmo layout da Cópia de Controle de Medição Mensal (linha de cabeçalho com
              "Identificação do contrato", "Fornecedor" etc.)
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        )}

        {loading && <p className="mt-4 text-sm text-ink-secondary">Lendo planilha…</p>}

        {error && (
          <div
            className="mt-4 rounded-lg border-l-2 px-3 py-2 text-[13px]"
            style={{ borderColor: "var(--status-critical)", color: "var(--status-critical)" }}
          >
            {error}
          </div>
        )}

        {result && (
          <div className="mt-2">
            <p className="text-sm text-ink-primary">
              <span className="font-semibold">{result.contratos.length}</span> contratos
              identificados. Isso vai <strong>substituir</strong> os dados atuais desta obra.
            </p>
            {result.warnings.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {result.warnings.map((w, i) => (
                  <li
                    key={i}
                    className="rounded-lg border-l-2 px-3 py-1.5 text-[12.5px]"
                    style={{ borderColor: "var(--status-warning)", color: "var(--ink-secondary)" }}
                  >
                    {w}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setResult(null)}
                className="rounded-lg border border-border-hairline px-3.5 py-2 text-[13px] font-medium text-ink-secondary hover:bg-surface-card-2"
              >
                Escolher outro arquivo
              </button>
              <button
                onClick={() => onImport(result.contratos)}
                className="rounded-lg px-3.5 py-2 text-[13px] font-semibold text-white"
                style={{ background: "var(--brand)" }}
              >
                Confirmar atualização
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
