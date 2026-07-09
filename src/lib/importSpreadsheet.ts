import * as XLSX from "xlsx";
import type { Contrato } from "../types";

const MONTH_NAMES: Record<string, string> = {
  jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06",
  jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12",
};

const HEADER_ALIASES: Record<string, string[]> = {
  id: ["identificação do contrato", "identificacao do contrato", "contrato"],
  tipoContrato: ["tipo de contrato"],
  filial: ["filial"],
  codigoFornecedor: ["cod.", "cod", "código", "codigo"],
  fornecedor: ["fornecedor"],
  objetivo: ["objetivo do contrato", "objetivo"],
  dataInicio: ["data do início da vigência", "data do inicio da vigencia", "data início", "data inicio"],
  valorContrato: ["valor do contrato"],
  valorAditivo: ["valor aditivo"],
  valorTotal: ["valor total do contrato"],
  saldo: ["saldo contrato", "saldo do contrato"],
  valorMedido: ["valor medido"],
};

function normalize(s: unknown): string {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function parseMonthHeader(header: string): string | null {
  const match = normalize(header).match(/^([a-z]{3})-(\d{2})$/);
  if (!match) return null;
  const [, mon, yy] = match;
  const mm = MONTH_NAMES[mon];
  if (!mm) return null;
  return `20${yy}-${mm}`;
}

function excelDateToISO(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    const mm = String(parsed.m).padStart(2, "0");
    const dd = String(parsed.d).padStart(2, "0");
    return `${parsed.y}-${mm}-${dd}`;
  }
  const asDate = new Date(String(value));
  if (!Number.isNaN(asDate.getTime())) return asDate.toISOString().slice(0, 10);
  return null;
}

function toNumber(value: unknown): number {
  if (value == null || value === "") return 0;
  if (typeof value === "number") return Math.round(value * 100) / 100;
  const n = Number(String(value).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

export interface ImportResult {
  contratos: Contrato[];
  warnings: string[];
}

export async function parseWorkbook(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const warnings: string[] = [];

  const sheetName =
    workbook.SheetNames.find((n) => normalize(n).includes("medi")) ?? workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null });

  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const rowNorm = rows[i].map(normalize);
    if (rowNorm.some((c) => c.includes("identificacao do contrato")) && rowNorm.some((c) => c.includes("fornecedor"))) {
      headerRowIdx = i;
      break;
    }
  }
  if (headerRowIdx === -1) {
    throw new Error(
      "Não foi possível localizar a linha de cabeçalho (esperado 'Identificação do contrato' e 'Fornecedor')."
    );
  }

  const headerRow = rows[headerRowIdx];
  const colIndex: Partial<Record<keyof typeof HEADER_ALIASES, number>> = {};
  const monthCols: { idx: number; mes: string }[] = [];

  headerRow.forEach((raw, idx) => {
    const norm = normalize(raw);
    if (!norm) return;
    const monthKey = parseMonthHeader(String(raw));
    if (monthKey) {
      monthCols.push({ idx, mes: monthKey });
      return;
    }
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.some((a) => norm === a || norm.startsWith(a))) {
        colIndex[field as keyof typeof HEADER_ALIASES] = idx;
      }
    }
  });

  const required: (keyof typeof HEADER_ALIASES)[] = ["id", "fornecedor", "valorTotal"];
  const missing = required.filter((k) => colIndex[k] === undefined);
  if (missing.length) {
    throw new Error(`Colunas obrigatórias não encontradas: ${missing.join(", ")}`);
  }
  if (monthCols.length === 0) {
    warnings.push("Nenhuma coluna de mês (ex: jan-26) foi reconhecida — medições mensais ficarão vazias.");
  }

  const contratos: Contrato[] = [];
  for (let r = headerRowIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const id = colIndex.id !== undefined ? row[colIndex.id] : null;
    if (id == null || String(id).trim() === "") continue;

    const medicoes = monthCols
      .map(({ idx, mes }) => ({ mes, valor: toNumber(row[idx]) }))
      .filter((m) => m.valor !== 0);

    contratos.push({
      id: String(id).trim(),
      tipoContrato: colIndex.tipoContrato !== undefined ? String(row[colIndex.tipoContrato] ?? "").trim() : "",
      filial: colIndex.filial !== undefined ? toNumber(row[colIndex.filial]) : 0,
      codigoFornecedor: colIndex.codigoFornecedor !== undefined ? toNumber(row[colIndex.codigoFornecedor]) : null,
      fornecedor: colIndex.fornecedor !== undefined ? String(row[colIndex.fornecedor] ?? "").trim() : "",
      objetivo: colIndex.objetivo !== undefined ? String(row[colIndex.objetivo] ?? "").trim() : "",
      dataInicio: colIndex.dataInicio !== undefined ? excelDateToISO(row[colIndex.dataInicio]) : null,
      valorContrato: colIndex.valorContrato !== undefined ? toNumber(row[colIndex.valorContrato]) : 0,
      valorAditivo: colIndex.valorAditivo !== undefined ? toNumber(row[colIndex.valorAditivo]) : 0,
      valorTotal: colIndex.valorTotal !== undefined ? toNumber(row[colIndex.valorTotal]) : 0,
      saldo: colIndex.saldo !== undefined ? toNumber(row[colIndex.saldo]) : 0,
      valorMedido: colIndex.valorMedido !== undefined ? toNumber(row[colIndex.valorMedido]) : 0,
      medicoes,
      planejado: [],
    });
  }

  if (contratos.length === 0) {
    warnings.push("Nenhum contrato foi encontrado abaixo do cabeçalho.");
  }

  return { contratos, warnings };
}
