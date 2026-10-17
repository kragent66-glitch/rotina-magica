/**
 * O SOS aprende o que funciona para você. Cada vez que você usa uma ação e diz se a vontade passou,
 * o app guarda. As ações são ordenadas pela chance estimada de funcionar (média com uma dose de
 * otimismo para as que ainda não foram testadas), então o que mais funcionou aparece primeiro.
 */

export interface StrategyOutcome {
  coping: string | null;
  outcome: 'passou' | 'ainda_forte' | 'usei' | 'em_andamento';
}

export interface StrategyScore {
  id: string;
  tries: number;
  worked: number;
  /** Estimativa da chance de funcionar, de 0 a 1 (média de Beta(1,1)). */
  estimate: number;
}

export function scoreStrategies(ids: readonly string[], history: readonly StrategyOutcome[]): StrategyScore[] {
  return ids.map((id) => {
    const done = history.filter((h) => h.coping === id && h.outcome !== 'em_andamento');
    const worked = done.filter((h) => h.outcome === 'passou').length;
    return { id, tries: done.length, worked, estimate: (worked + 1) / (done.length + 2) };
  });
}

/** Ordena mantendo a ordem original em empate (quem não tem histórico fica na ordem padrão). */
export function rankStrategies<T extends { id: string }>(items: readonly T[], history: readonly StrategyOutcome[]): T[] {
  const scores = new Map(scoreStrategies(items.map((i) => i.id), history).map((s) => [s.id, s]));
  return items
    .map((item, index) => ({ item, index, s: scores.get(item.id)! }))
    .sort((a, b) => b.s.estimate - a.s.estimate || b.s.tries - a.s.tries || a.index - b.index)
    .map((x) => x.item);
}

export interface DropStat {
  coping: string;
  times: number;
  /** Queda média da nota da vontade (0–10), antes − depois. */
  averageDrop: number;
}

/** Quanto cada estratégia baixa a vontade, com as notas antes/depois dadas no SOS. */
export function averageDrops(history: readonly { coping: string | null; intensity: number | null; intensityAfter: number | null }[]): DropStat[] {
  const map = new Map<string, number[]>();
  for (const h of history) {
    if (!h.coping || h.intensity === null || h.intensityAfter === null) continue;
    map.set(h.coping, [...(map.get(h.coping) ?? []), h.intensity - h.intensityAfter]);
  }
  return [...map.entries()]
    .map(([coping, drops]) => ({ coping, times: drops.length, averageDrop: Math.round((drops.reduce((a, b) => a + b, 0) / drops.length) * 10) / 10 }))
    .sort((a, b) => b.averageDrop - a.averageDrop);
}
