/**
 * Blocos: jogo de encaixe no estilo Tetris. Estudos de Skorka-Brown, Andrade e May (2014, 2015)
 * mostraram que 3 minutos de Tetris reduzem a força da fissura (inclusive por drogas) em cerca de
 * 20%: o jogo ocupa a mesma "tela mental" onde a vontade monta suas imagens.
 * Motor puro, sem React: estado entra, estado sai.
 */
import { createRng, shuffle, type Rng } from './rng';

export const ROWS = 20;
export const COLS = 10;
export type Board = number[][];
export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

const SHAPES: Record<PieceType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};
const TYPES = Object.keys(SHAPES) as PieceType[];
export const COLOR_INDEX: Record<PieceType, number> = { I: 1, O: 2, T: 3, S: 4, Z: 5, J: 6, L: 7 };

export interface Piece {
  type: PieceType;
  shape: number[][];
  x: number;
  y: number;
}

export interface BlocksState {
  board: Board;
  piece: Piece;
  next: PieceType;
  bag: PieceType[];
  score: number;
  lines: number;
  level: number;
  /** Quantas vezes o tabuleiro encheu. No modo SOS o jogo recomeça sozinho em vez de acabar. */
  toppedOut: number;
  over: boolean;
  seed: number;
}

export function emptyBoard(rows = ROWS, cols = COLS): Board {
  return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

export function rotate(shape: number[][]): number[][] {
  const n = shape.length;
  return shape.map((row, y) => row.map((_, x) => shape[n - 1 - x][y]));
}

export function cells(p: Piece): [number, number][] {
  const out: [number, number][] = [];
  p.shape.forEach((row, dy) => row.forEach((v, dx) => v && out.push([p.x + dx, p.y + dy])));
  return out;
}

export function collides(board: Board, p: Piece): boolean {
  return cells(p).some(([x, y]) => x < 0 || x >= board[0].length || y >= board.length || (y >= 0 && board[y][x] !== 0));
}

function spawn(type: PieceType, cols: number): Piece {
  const shape = SHAPES[type].map((r) => [...r]);
  return { type, shape, x: Math.floor((cols - shape.length) / 2), y: type === 'I' ? -1 : 0 };
}

function takeNext(bag: PieceType[], rng: Rng): { type: PieceType; bag: PieceType[] } {
  const filled = bag.length ? bag : shuffle(TYPES, rng);
  return { type: filled[0], bag: filled.slice(1) };
}

export function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((v) => v === 0));
  const cleared = board.length - kept.length;
  const fresh = Array.from({ length: cleared }, () => new Array(board[0].length).fill(0));
  return { board: [...fresh, ...kept], cleared };
}

const LINE_POINTS = [0, 100, 300, 500, 800];

export function gravityMs(level: number): number {
  return Math.max(120, 800 - (level - 1) * 65);
}

export function newGame(seed: number): BlocksState {
  const rng = createRng(seed);
  const first = takeNext([], rng);
  const second = takeNext(first.bag, rng);
  return {
    board: emptyBoard(),
    piece: spawn(first.type, COLS),
    next: second.type,
    bag: second.bag,
    score: 0,
    lines: 0,
    level: 1,
    toppedOut: 0,
    over: false,
    seed: Math.floor(rng() * 2 ** 31),
  };
}

export function move(s: BlocksState, dx: number): BlocksState {
  const piece = { ...s.piece, x: s.piece.x + dx };
  return s.over || collides(s.board, piece) ? s : { ...s, piece };
}

export function rotatePiece(s: BlocksState): BlocksState {
  if (s.over) return s;
  const shape = rotate(s.piece.shape);
  // Pequenos "chutes" na parede para a rotação não travar encostada na borda.
  for (const kick of [0, -1, 1, -2, 2]) {
    const piece = { ...s.piece, shape, x: s.piece.x + kick };
    if (!collides(s.board, piece)) return { ...s, piece };
  }
  return s;
}

function lock(s: BlocksState, endless: boolean): BlocksState {
  const board = s.board.map((r) => [...r]);
  let toppedOut = s.toppedOut;
  for (const [x, y] of cells(s.piece)) {
    if (y < 0) toppedOut = -1;
    else board[y][x] = COLOR_INDEX[s.piece.type];
  }
  const { board: clearedBoard, cleared } = clearLines(board);
  const lines = s.lines + cleared;
  const level = 1 + Math.floor(lines / 10);
  const score = s.score + LINE_POINTS[cleared] * s.level;
  const rng = createRng(s.seed);
  const nextTake = takeNext(s.bag, rng);
  let piece = spawn(s.next, COLS);
  let finalBoard = clearedBoard;
  let over = false;
  if (toppedOut === -1 || collides(clearedBoard, piece)) {
    if (endless) {
      finalBoard = emptyBoard();
      piece = spawn(s.next, COLS);
      toppedOut = s.toppedOut + 1;
    } else {
      over = true;
      toppedOut = s.toppedOut + 1;
    }
  }
  return {
    ...s,
    board: finalBoard,
    piece,
    next: nextTake.type,
    bag: nextTake.bag,
    lines,
    level,
    score,
    toppedOut,
    over,
    seed: Math.floor(rng() * 2 ** 31),
  };
}

/** Um passo de gravidade: desce uma linha ou trava a peça. */
export function tick(s: BlocksState, endless = false): BlocksState {
  if (s.over) return s;
  const piece = { ...s.piece, y: s.piece.y + 1 };
  return collides(s.board, piece) ? lock(s, endless) : { ...s, piece };
}

export function hardDrop(s: BlocksState, endless = false): BlocksState {
  if (s.over) return s;
  let piece = s.piece;
  let dropped = 0;
  while (!collides(s.board, { ...piece, y: piece.y + 1 })) {
    piece = { ...piece, y: piece.y + 1 };
    dropped++;
  }
  return lock({ ...s, piece, score: s.score + dropped * 2 }, endless);
}

/** Onde a peça cairia (sombra). */
export function ghost(s: BlocksState): Piece {
  let piece = s.piece;
  while (!collides(s.board, { ...piece, y: piece.y + 1 })) piece = { ...piece, y: piece.y + 1 };
  return piece;
}

export { SHAPES };
