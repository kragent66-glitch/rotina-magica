import type { Repositories } from '@/data/repositories/types';
import { toLocalDate } from '@/domain/dates';
import { bestScore, levelFor, totalXp, xpForGame, type GameId } from '@/domain/progression';

export interface GameOutcome {
  score: number;
  durationMs: number;
  extra?: Record<string, unknown>;
}

export interface RecordedGame {
  xp: number;
  record: boolean;
  levelUp: boolean;
  level: ReturnType<typeof levelFor>;
}

/** Grava a partida e diz o que mudou (XP ganho, recorde, nível novo). */
export function recordGame(repos: Repositories, gameId: GameId, outcome: GameOutcome): RecordedGame {
  const before = repos.games.list();
  const techniques = repos.practices.list().length;
  const previousBest = bestScore(before, gameId);
  const levelBefore = levelFor(totalXp(before, techniques)).level;
  const xp = xpForGame(gameId, outcome.score);
  repos.games.add({
    date: toLocalDate(new Date()),
    gameId,
    score: outcome.score,
    xp,
    durationMs: outcome.durationMs,
    extra: outcome.extra ?? null,
  });
  const level = levelFor(totalXp(repos.games.list(), techniques));
  return { xp, record: outcome.score > previousBest && before.some((s) => s.gameId === gameId), levelUp: level.level > levelBefore, level };
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Sem vibração, segue o jogo.
  }
}
