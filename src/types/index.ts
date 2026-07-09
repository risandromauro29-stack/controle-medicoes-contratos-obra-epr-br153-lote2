export interface Medicao {
  mes: string; // "YYYY-MM"
  valor: number;
}

export interface Contrato {
  id: string;
  tipoContrato: string;
  filial: number;
  codigoFornecedor: number | null;
  fornecedor: string;
  objetivo: string;
  dataInicio: string | null; // ISO date
  valorContrato: number;
  valorAditivo: number;
  valorTotal: number;
  saldo: number;
  valorMedido: number;
  medicoes: Medicao[];
  /** Reservado para orçamento/cronograma planejado por mês — ainda não coletado na fonte. */
  planejado: Medicao[];
}

export interface Filial {
  codigo: number;
  sigla: string;
  nome: string;
}

export interface Obra {
  id: string;
  nome: string;
  descricao: string;
  filiais: Filial[];
  atualizadoEm: string;
  contratos: Contrato[];
}

export type AlertSeverity = "critico" | "atencao" | "info";

export interface Alerta {
  id: string;
  severidade: AlertSeverity;
  titulo: string;
  descricao: string;
  contratoId?: string;
}
