import { addDays, daysBetween, type LocalDate } from './dates';

/**
 * Progresso que nunca zera. Uma recaída reduz a sequência atual, mas os dias sem uso já
 * conquistados continuam contando. Motivo: o "efeito de violação da abstinência" (Marlatt) —
 * ver "0 dias" depois de um lapso leva muita gente a desistir.
 */
export interface Progress {
  /** Dias acompanhados, contando hoje. */
  trackedDays: number;
  /** Total acumulado de dias sem uso. Nunca diminui por causa de um lapso. */
  cleanDays: number;
  /** cleanDays / trackedDays, de 0 a 1. */
  cleanRatio: number;
  /** Dias seguidos sem uso até hoje (hoje conta se não houve uso). */
  currentStreak: number;
  /** Maior sequência já alcançada, mostrada como recorde, não como placar. */
  bestStreak: number;
  /** Proporção de dias sem uso nos últimos 30 dias (ou menos, se o acompanhamento for mais curto). */
  last30CleanRatio: number;
}

export interface ProgressInput {
  /** Primeiro dia acompanhado: data de parada, ou o dia em que começou a usar o app. */
  startDate: LocalDate;
  today: LocalDate;
  /** Dias em que houve uso. Duplicatas e datas fora do período são ignoradas. */
  useDates: readonly LocalDate[];
}

const EMPTY: Progress = {
  trackedDays: 0,
  cleanDays: 0,
  cleanRatio: 0,
  currentStreak: 0,
  bestStreak: 0,
  last30CleanRatio: 0,
};

export function computeProgress({ startDate, today, useDates }: ProgressInput): Progress {
  const trackedDays = daysBetween(startDate, today) + 1;
  if (trackedDays <= 0) return EMPTY;

  const uses = new Set(useDates.filter((d) => d >= startDate && d <= today));

  let bestStreak = 0;
  let run = 0;
  for (let i = 0; i < trackedDays; i++) {
    if (uses.has(addDays(startDate, i))) {
      run = 0;
    } else {
      run++;
      bestStreak = Math.max(bestStreak, run);
    }
  }

  const windowDays = Math.min(30, trackedDays);
  let usesInWindow = 0;
  for (let i = 0; i < windowDays; i++) {
    if (uses.has(addDays(today, -i))) usesInWindow++;
  }

  const cleanDays = trackedDays - uses.size;
  return {
    trackedDays,
    cleanDays,
    cleanRatio: cleanDays / trackedDays,
    currentStreak: run,
    bestStreak,
    last30CleanRatio: (windowDays - usesInWindow) / windowDays,
  };
}
