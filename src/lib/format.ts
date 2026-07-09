const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const currencyFormatterPrecise = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number, compact = false): string {
  if (compact) return compactCurrencyFormatter.format(value);
  return currencyFormatter.format(value);
}

export function formatCurrencyPrecise(value: number): string {
  return currencyFormatterPrecise.format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun",
  "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

export function formatMonth(ym: string): string {
  const [year, month] = ym.split("-");
  return `${MONTH_LABELS[month] ?? month}/${year.slice(2)}`;
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function addMonths(ym: string, delta: number): string {
  const [year, month] = ym.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return monthKey(d);
}

export function compareMonths(a: string, b: string): number {
  return a.localeCompare(b);
}
