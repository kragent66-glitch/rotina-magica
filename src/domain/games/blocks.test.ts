import { COLS, ROWS, clearLines, collides, emptyBoard, hardDrop, move, newGame, rotate, rotatePiece, tick, type BlocksState } from './blocks';

describe('Blocos', () => {
  it('começa com tabuleiro vazio e peça no topo', () => {
    const s = newGame(1);
    expect(s.board).toHaveLength(ROWS);
    expect(s.board[0]).toHaveLength(COLS);
    expect(collides(s.board, s.piece)).toBe(false);
  });

  it('é reproduzível com a mesma semente', () => {
    expect(newGame(42).piece.type).toBe(newGame(42).piece.type);
    expect(newGame(42).next).toBe(newGame(42).next);
  });

  it('gira uma matriz 90 graus', () => {
    expect(rotate([[1, 0], [1, 1]])).toEqual([[1, 1], [1, 0]]);
  });

  it('não atravessa paredes', () => {
    let s = newGame(3);
    for (let i = 0; i < 20; i++) s = move(s, -1);
    expect(Math.min(...s.piece.shape.flatMap((r) => r.map((v, dx) => (v ? s.piece.x + dx : 99))))).toBe(0);
    const rotated = rotatePiece(s);
    expect(collides(rotated.board, rotated.piece)).toBe(false);
  });

  it('limpa linhas completas e desce o resto', () => {
    const board = emptyBoard(4, 3);
    board[3] = [1, 1, 1];
    board[2] = [1, 0, 1];
    const out = clearLines(board);
    expect(out.cleared).toBe(1);
    expect(out.board[3]).toEqual([1, 0, 1]);
    expect(out.board[0]).toEqual([0, 0, 0]);
  });

  it('peça desce com a gravidade e trava no chão', () => {
    let s = newGame(5);
    const y = s.piece.y;
    s = tick(s);
    expect(s.piece.y).toBe(y + 1);
    s = hardDrop(s);
    expect(s.board.flat().some((v) => v !== 0)).toBe(true);
    expect(s.score).toBeGreaterThan(0);
  });

  it('pontua linhas e sobe de nível', () => {
    const base = newGame(7);
    const board = emptyBoard();
    board[ROWS - 1] = new Array(COLS).fill(1);
    board[ROWS - 1][0] = 0;
    // Uma peça I deitada não completa sozinha; força uma linha quase completa para testar a pontuação.
    const s: BlocksState = { ...base, board, piece: { type: 'O', shape: [[1]], x: 0, y: ROWS - 2 }, lines: 9 };
    const out = tick(tick(s));
    expect(out.lines).toBe(10);
    expect(out.level).toBe(2);
    expect(out.score).toBe(100);
  });

  it('no modo sem fim, encher o tabuleiro recomeça em vez de acabar', () => {
    let s = newGame(9);
    let endless = s;
    for (let i = 0; i < 60; i++) s = hardDrop(s);
    expect(s.over).toBe(true);
    for (let i = 0; i < 60; i++) endless = hardDrop(endless, true);
    expect(endless.over).toBe(false);
    expect(endless.toppedOut).toBeGreaterThan(0);
  });
});
