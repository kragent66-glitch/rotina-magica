/**
 * Desvia: treino de aproximação e esquiva (Approach-Avoidance Training) com controle inibitório.
 * Empurrar para longe o que leva ao uso e puxar para perto o que a pessoa quer, rápido e muitas
 * vezes, retreina a tendência automática de "ir na direção" do gatilho. Evidência: reduziu recaída
 * em álcool (Wiers 2011, Eberl 2013); para cocaína, resultados iniciais. O jogo é rápido de propósito.
 */
import { shuffle, type Rng } from './rng';

export type CueKind = 'risco' | 'bom';
export interface Cue {
  text: string;
  kind: CueKind;
}
export type Direction = 'empurrar' | 'puxar';

export const RISK_CUES = [
  'Sozinho em casa sem plano',
  'Mensagem do contato',
  'PIX liberado à noite',
  'Só hoje',
  'Mais uma cerveja',
  'Passar naquele lugar',
  'Dinheiro sobrando',
  'Eu mereço depois do dia',
  'Ninguém vai saber',
  'Acordado às 4h',
  'Sexta à noite à toa',
  'Dessa vez eu controlo',
] as const;

export const GOOD_CUES = [
  'Dormir bem',
  'Acordar inteiro',
  'Dinheiro guardado',
  'Treino de hoje',
  'Jantar com alguém',
  'Cabeça leve',
  'Respeito por mim',
  'Domingo tranquilo',
  'Caminhar no fim da tarde',
  'Ter controle da minha vida',
] as const;

export const ROUND_SIZE = 30;

/** Monta o baralho: metade risco, metade bom, embaralhado, com as palavras da própria pessoa. */
export function buildDeck(rng: Rng, personalGood: readonly string[] = [], size = ROUND_SIZE): Cue[] {
  // Palavras pessoais que lembram um gatilho ("Dinheiro" ≈ "Dinheiro sobrando") confundiriam o treino.
  const clash = (w: string) => RISK_CUES.some((r) => r.toLowerCase().includes(w.toLowerCase()));
  const good = [...new Set([...personalGood.filter((w) => !clash(w)), ...GOOD_CUES])];
  const risk = shuffle(RISK_CUES, rng);
  const goods = shuffle(good, rng);
  const half = Math.floor(size / 2);
  const deck: Cue[] = [];
  for (let i = 0; i < half; i++) deck.push({ text: risk[i % risk.length], kind: 'risco' });
  for (let i = 0; i < size - half; i++) deck.push({ text: goods[i % goods.length], kind: 'bom' });
  return shuffle(deck, rng);
}

export function correctDirection(cue: Cue): Direction {
  return cue.kind === 'risco' ? 'empurrar' : 'puxar';
}

/** Tempo para decidir cada carta: começa folgado e aperta conforme a rodada avança. */
export function cardTimeMs(index: number): number {
  return Math.max(900, 2600 - index * 60);
}

export interface SwipeState {
  index: number;
  score: number;
  combo: number;
  bestCombo: number;
  hits: number;
  misses: number;
}

export const initialSwipe: SwipeState = { index: 0, score: 0, combo: 0, bestCombo: 0, hits: 0, misses: 0 };

/** Resposta a uma carta. `direction` null = tempo esgotado. */
export function answer(s: SwipeState, cue: Cue, direction: Direction | null, reactionMs: number): SwipeState {
  const ok = direction === correctDirection(cue);
  if (!ok) return { ...s, index: s.index + 1, combo: 0, misses: s.misses + 1 };
  const combo = s.combo + 1;
  const speed = Math.max(0, 10 - Math.floor(reactionMs / 150));
  const points = (10 + speed) * Math.min(5, 1 + Math.floor(combo / 5));
  return { index: s.index + 1, score: s.score + points, combo, bestCombo: Math.max(s.bestCombo, combo), hits: s.hits + 1, misses: s.misses };
}
