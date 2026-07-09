import type { Alerta, Contrato, Obra } from "../types";
import { addMonths, compareMonths, monthKey } from "./format";

export interface Filters {
  filiais: number[];
  tipos: string[];
  fornecedores: string[];
  mesInicio: string | null;
  mesFim: string | null;
  busca: string;
}

export const EMPTY_FILTERS: Filters = {
  filiais: [],
  tipos: [],
  fornecedores: [],
  mesInicio: null,
  mesFim: null,
  busca: "",
};

export function applyFilters(contratos: Contrato[], f: Filters): Contrato[] {
  const busca = f.busca.trim().toLowerCase();
  return contratos.filter((c) => {
    if (f.filiais.length && !f.filiais.includes(c.filial)) return false;
    if (f.tipos.length && !f.tipos.includes(c.tipoContrato)) return false;
    if (f.fornecedores.length && !f.fornecedores.includes(c.fornecedor)) return false;
    if (busca) {
      const haystack = `${c.id} ${c.fornecedor} ${c.objetivo} ${c.tipoContrato}`.toLowerCase();
      if (!haystack.includes(busca)) return false;
    }
    return true;
  });
}

function medicoesInRange(c: Contrato, mesInicio: string | null, mesFim: string | null) {
  return c.medicoes.filter((m) => {
    if (mesInicio && compareMonths(m.mes, mesInicio) < 0) return false;
    if (mesFim && compareMonths(m.mes, mesFim) > 0) return false;
    return true;
  });
}

export interface Kpis {
  valorTotalContratado: number;
  valorTotalMedido: number;
  saldoAMedir: number;
  percentualExecucao: number;
  qtdContratos: number;
  medidoNoPeriodo: number;
}

export function computeKpis(contratos: Contrato[], f: Filters): Kpis {
  const valorTotalContratado = contratos.reduce((s, c) => s + c.valorTotal, 0);
  const valorTotalMedido = contratos.reduce((s, c) => s + c.valorMedido, 0);
  const saldoAMedir = contratos.reduce((s, c) => s + c.saldo, 0);
  const percentualExecucao = valorTotalContratado > 0 ? (valorTotalMedido / valorTotalContratado) * 100 : 0;
  const medidoNoPeriodo = contratos.reduce((sum, c) => {
    const range = medicoesInRange(c, f.mesInicio, f.mesFim);
    return sum + range.reduce((s, m) => s + m.valor, 0);
  }, 0);

  return {
    valorTotalContratado,
    valorTotalMedido,
    saldoAMedir,
    percentualExecucao,
    qtdContratos: contratos.length,
    medidoNoPeriodo,
  };
}

export interface MonthlyPoint {
  mes: string;
  medido: number;
  planejado: number | null;
  acumulado: number;
}

export function computeMonthlySeries(contratos: Contrato[]): MonthlyPoint[] {
  const totals = new Map<string, { medido: number; planejado: number }>();
  for (const c of contratos) {
    for (const m of c.medicoes) {
      const entry = totals.get(m.mes) ?? { medido: 0, planejado: 0 };
      entry.medido += m.valor;
      totals.set(m.mes, entry);
    }
    for (const p of c.planejado) {
      const entry = totals.get(p.mes) ?? { medido: 0, planejado: 0 };
      entry.planejado += p.valor;
      totals.set(p.mes, entry);
    }
  }
  const meses = [...totals.keys()].sort(compareMonths);
  let acumulado = 0;
  return meses.map((mes) => {
    const t = totals.get(mes)!;
    acumulado += t.medido;
    return { mes, medido: t.medido, planejado: t.planejado || null, acumulado };
  });
}

export interface BreakdownItem {
  chave: string;
  valorTotal: number;
  valorMedido: number;
  saldo: number;
  qtd: number;
}

export function computeBreakdown(
  contratos: Contrato[],
  keyFn: (c: Contrato) => string
): BreakdownItem[] {
  const map = new Map<string, BreakdownItem>();
  for (const c of contratos) {
    const chave = keyFn(c);
    const item = map.get(chave) ?? { chave, valorTotal: 0, valorMedido: 0, saldo: 0, qtd: 0 };
    item.valorTotal += c.valorTotal;
    item.valorMedido += c.valorMedido;
    item.saldo += c.saldo;
    item.qtd += 1;
    map.set(chave, item);
  }
  return [...map.values()].sort((a, b) => b.valorTotal - a.valorTotal);
}

export function computeAlerts(contratos: Contrato[], hoje: Date = new Date()): Alerta[] {
  const alertas: Alerta[] = [];
  const mesRef = monthKey(hoje);
  const limiteAtraso = addMonths(mesRef, -2);

  contratos.forEach((c, idx) => {
    const uid = `${c.id}-${c.filial}-${idx}`;
    if (c.saldo < 0) {
      alertas.push({
        id: `estourado-${uid}`,
        severidade: "critico",
        titulo: "Contrato estourado",
        descricao: `${c.id} (${c.fornecedor}) mediu ${Math.abs(c.saldo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} acima do valor contratado.`,
        contratoId: c.id,
      });
      return;
    }

    const pctSaldo = c.valorTotal > 0 ? (c.saldo / c.valorTotal) * 100 : 0;
    if (pctSaldo > 0 && pctSaldo < 10) {
      alertas.push({
        id: `saldo-baixo-${uid}`,
        severidade: "atencao",
        titulo: "Saldo abaixo de 10%",
        descricao: `${c.id} (${c.fornecedor}) tem apenas ${pctSaldo.toFixed(1)}% de saldo restante.`,
        contratoId: c.id,
      });
    }

    const ultimaMedicao = [...c.medicoes].sort((a, b) => compareMonths(b.mes, a.mes))[0];
    const iniciouHaMuito = c.dataInicio ? compareMonths(c.dataInicio.slice(0, 7), limiteAtraso) < 0 : false;
    if (c.saldo > 0 && iniciouHaMuito && (!ultimaMedicao || compareMonths(ultimaMedicao.mes, limiteAtraso) < 0)) {
      alertas.push({
        id: `sem-medicao-${uid}`,
        severidade: "atencao",
        titulo: "Sem medição recente",
        descricao: `${c.id} (${c.fornecedor}) não tem medição lançada nos últimos 2 meses.`,
        contratoId: c.id,
      });
    }
  });

  return alertas.sort((a, b) => {
    const order = { critico: 0, atencao: 1, info: 2 };
    return order[a.severidade] - order[b.severidade];
  });
}

export function distinct<T, K>(items: T[], keyFn: (item: T) => K): K[] {
  return [...new Set(items.map(keyFn))];
}

export { medicoesInRange };
export type { Obra };
