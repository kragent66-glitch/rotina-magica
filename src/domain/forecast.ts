/**
 * Clima de hoje: uma previsão de risco feita só com os dados da pessoa, no aparelho. Olha o mesmo dia da
 * semana nas últimas 8 semanas (diário, pedidos de ajuda e usos) e diz se hoje costuma ser mais difícil,
 * em que hora a vontade aperta e qual gatilho aparece mais. Planejar o momento de risco antes dele chegar
 * é o centro da prevenção de recaída (Marlatt).
 */
import { addDays, daysBetween, type LocalDate } from './dates';

export type ForecastLevel = 'calmo' | 'atencao' | 'alto';

export interface Forecast {
  level: ForecastLevel;
  weekday: string;
  /** Hora (0 a 23) em que mais houve pedidos de ajuda; null sem dados. */
  peakHour: number | null;
  topTrigger: string | null;
  /** Quantos registros sustentam a previsão. */
  samples: number;
}

export interface ForecastInput {
  today: LocalDate;
  journal: readonly { date: LocalDate; craving: number | null; triggers: readonly string[] }[];
  cravings: readonly { occurredAt: string; date: LocalDate; intensity: number | null }[];
  useDates: readonly LocalDate[];
}

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MIN_SAMPLES = 3;

function weekdayOf(d: LocalDate): number {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).getDay();
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function forecastFor({ today, journal, cravings, useDates }: ForecastInput): Forecast | null {
  const from = addDays(today, -56);
  const wd = weekdayOf(today);
  const inWindow = (d: LocalDate) => d >= from && d < today;
  const sameDay = (d: LocalDate) => inWindow(d) && weekdayOf(d) === wd;

  const scores = journal.filter((j) => inWindow(j.date) && j.craving !== null);
  const all = avg(scores.map((j) => j.craving!));
  const same = scores.filter((j) => sameDay(j.date)).map((j) => j.craving!);
  const sameAvg = avg(same);
  const sameCravings = cravings.filter((c) => sameDay(c.date));
  const usedSameDay = useDates.some((d) => sameDay(d) && daysBetween(d, today) <= 28);
  const samples = same.length + sameCravings.length + (usedSameDay ? 1 : 0);
  if (scores.length + cravings.length < MIN_SAMPLES) return null;

  // Pedidos de ajuda neste dia da semana pesam como um sinal de risco por si só.
  const helpRate = sameCravings.length / Math.max(1, new Set(sameCravings.map((c) => c.date)).size + same.length);
  let level: ForecastLevel = 'calmo';
  if (usedSameDay || (sameAvg !== null && (sameAvg >= 7 || (all !== null && sameAvg >= all + 1.5)))) level = 'alto';
  else if ((sameAvg !== null && (sameAvg >= 5 || (all !== null && sameAvg >= all + 0.5))) || helpRate >= 0.5) level = 'atencao';

  const hours = new Map<number, number>();
  for (const c of cravings.filter((c) => inWindow(c.date))) {
    const h = new Date(c.occurredAt).getHours();
    hours.set(h, (hours.get(h) ?? 0) + 1);
  }
  const peakHour = [...hours.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0] ?? null;

  const triggers = new Map<string, number>();
  for (const j of journal.filter((j) => sameDay(j.date))) for (const t of j.triggers) triggers.set(t, (triggers.get(t) ?? 0) + 1);
  if (!triggers.size) for (const j of journal.filter((j) => inWindow(j.date))) for (const t of j.triggers) triggers.set(t, (triggers.get(t) ?? 0) + 1);
  const topTrigger = [...triggers.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { level, weekday: WEEKDAYS[wd], peakHour, topTrigger, samples };
}

const PLURAL = ['Domingos', 'Segundas', 'Terças', 'Quartas', 'Quintas', 'Sextas', 'Sábados'];

export function forecastText(f: Forecast): string {
  const i = WEEKDAYS.indexOf(f.weekday);
  const days = PLURAL[i];
  const calm = i === 0 || i === 6 ? 'tranquilos' : 'tranquilas';
  if (f.level === 'alto') return `${days} têm sido mais difíceis para você. Deixe o plano da noite pronto agora, com calma.`;
  if (f.level === 'atencao') return `${days} pedem um pouco mais de atenção. Vale decidir cedo o que fazer à noite.`;
  return `${days} costumam ser ${calm} para você. Mantenha a rotina e aproveite.`;
}
