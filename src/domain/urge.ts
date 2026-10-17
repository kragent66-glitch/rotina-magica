/**
 * "Surfar a fissura": a vontade sobe, chega a um pico e passa, normalmente em minutos.
 * O timer dá um horizonte concreto; a respiração lenta (expiração mais longa que a inspiração)
 * ajuda a baixar a ativação enquanto a onda passa.
 */
export const URGE_WAVE_MS = 15 * 60 * 1000;

export type BreathStep = 'inspire' | 'segure' | 'solte';

const CYCLE: readonly { step: BreathStep; ms: number }[] = [
  { step: 'inspire', ms: 4000 },
  { step: 'segure', ms: 2000 },
  { step: 'solte', ms: 6000 },
];
const CYCLE_MS = CYCLE.reduce((sum, s) => sum + s.ms, 0);

export function breathAt(elapsedMs: number): { step: BreathStep; progress: number } {
  let t = ((elapsedMs % CYCLE_MS) + CYCLE_MS) % CYCLE_MS;
  for (const { step, ms } of CYCLE) {
    if (t < ms) return { step, progress: t / ms };
    t -= ms;
  }
  return { step: 'inspire', progress: 0 };
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
