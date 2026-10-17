/**
 * Datas locais no formato `AAAA-MM-DD`. Todo o app raciocina em "dias do calendário do usuário",
 * nunca em UTC, para que um uso às 23h conte no dia certo.
 */
export type LocalDate = string;

const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isLocalDate(value: string): value is LocalDate {
  return LOCAL_DATE.test(value) && toLocalDate(parse(value)) === value;
}

export function toLocalDate(date: Date): LocalDate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parse(value: LocalDate): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(value: LocalDate, days: number): LocalDate {
  const date = parse(value);
  date.setDate(date.getDate() + days);
  return toLocalDate(date);
}

/** Dias de `from` até `to` (positivo se `to` for depois). Imune a horário de verão. */
export function daysBetween(from: LocalDate, to: LocalDate): number {
  const a = parse(from);
  const b = parse(to);
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
    Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86_400_000);
}
