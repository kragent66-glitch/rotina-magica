/**
 * Segura a onda: respiração guiada que vira jogo de ritmo. Segurar o dedo enquanto puxa o ar (4 s)
 * e segura (2 s); soltar e expirar devagar (6 s). Expiração longa acalma o corpo; acertar o ritmo
 * dá pontos e faz a "onda" da vontade baixar na tela.
 */
export const HOLD_TARGET_MS = 6000;
export const EXHALE_TARGET_MS = 6000;
export const CYCLES = 6;

function accuracy(actual: number, target: number): number {
  return Math.max(0, 1 - Math.abs(actual - target) / target);
}

export interface CycleResult {
  points: number;
  holdAccuracy: number;
  exhaleAccuracy: number;
  tip: string;
}

export function scoreCycle(holdMs: number, exhaleMs: number): CycleResult {
  const holdAccuracy = accuracy(holdMs, HOLD_TARGET_MS);
  const exhaleAccuracy = accuracy(exhaleMs, EXHALE_TARGET_MS);
  const points = Math.round(((holdAccuracy + exhaleAccuracy) / 2) * 100);
  let tip = 'No ritmo. Continue assim.';
  if (holdMs < HOLD_TARGET_MS * 0.75) tip = 'Segure um pouco mais antes de soltar.';
  else if (holdMs > HOLD_TARGET_MS * 1.25) tip = 'Pode soltar um pouco antes.';
  else if (exhaleMs < EXHALE_TARGET_MS * 0.75) tip = 'Solte o ar mais devagar, sem pressa.';
  return { points, holdAccuracy, exhaleAccuracy, tip };
}

/** Altura da onda de 100 a 0: cada ciclo bem feito baixa a onda. */
export function waveHeight(results: readonly CycleResult[]): number {
  const drop = results.reduce((sum, r) => sum + (r.points / 100) * (100 / CYCLES), 0);
  return Math.max(0, Math.round(100 - drop));
}
