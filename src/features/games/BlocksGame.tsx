import { useCallback, useEffect, useRef, useState } from 'react';
import { COLS, ROWS, SHAPES, cells, ghost, gravityMs, hardDrop, move, newGame, rotatePiece, tick, type BlocksState } from '@/domain/games/blocks';
import { formatRemaining } from '@/domain/urge';
import type { GameOutcome } from './record';
import { vibrate } from './record';

const COLORS = ['', '#7FC8A9', '#E8C15B', '#B68CE8', '#6FB7E8', '#E8875B', '#5B8DE8', '#E8A35B'];

interface Props {
  /** Com duração (modo SOS), o jogo não acaba quando enche: recomeça e o relógio manda. */
  durationMs?: number;
  onFinish: (o: GameOutcome) => void;
}

export function BlocksGame({ durationMs, onFinish }: Props) {
  const endless = durationMs !== undefined;
  const [state, setState] = useState<BlocksState>(() => newGame(Date.now() % 2147483647));
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);
  const canvas = useRef<HTMLCanvasElement>(null);
  const finished = useRef(false);
  const drag = useRef<{ x: number; y: number; t: number; moved: number } | null>(null);

  const act = useCallback((fn: (s: BlocksState) => BlocksState) => setState((s) => fn(s)), []);

  const finish = useCallback(
    (s: BlocksState) => {
      if (finished.current) return;
      finished.current = true;
      onFinish({ score: s.score, durationMs: Date.now() - startedAt, extra: { lines: s.lines, level: s.level } });
    },
    [onFinish, startedAt],
  );

  // Gravidade.
  useEffect(() => {
    if (state.over) return;
    const id = setTimeout(() => setState((s) => tick(s, endless)), gravityMs(state.level));
    return () => clearTimeout(id);
    // Só reinicia quando a peça desce ou muda: mexer para os lados não segura a gravidade para sempre.
  }, [state.piece.y, state.piece.type, state.board, state.level, state.over, endless]);

  // Relógio do modo SOS.
  useEffect(() => {
    if (!endless) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [endless]);

  const remaining = endless ? durationMs - (now - startedAt) : Infinity;
  useEffect(() => {
    if (state.over || remaining <= 0) finish(state);
  }, [state, remaining, finish]);

  // Vibra a cada linha feita.
  const lines = useRef(0);
  useEffect(() => {
    if (state.lines > lines.current) vibrate(30);
    lines.current = state.lines;
  }, [state.lines]);

  // Teclado (para testar no PC).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, (s: BlocksState) => BlocksState> = {
        ArrowLeft: (s) => move(s, -1),
        ArrowRight: (s) => move(s, 1),
        ArrowUp: rotatePiece,
        ArrowDown: (s) => tick(s, endless),
        ' ': (s) => hardDrop(s, endless),
      };
      if (map[e.key]) {
        e.preventDefault();
        act(map[e.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [act, endless]);

  // Desenho.
  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext?.('2d');
    if (!c || !ctx) return;
    const size = c.width / COLS;
    ctx.fillStyle = '#0d1316';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#1a2428';
    for (let x = 0; x <= COLS; x++) ctx.strokeRect(x * size, 0, 0, c.height);
    const draw = (x: number, y: number, color: string, alpha = 1) => {
      if (y < 0) return;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      ctx.globalAlpha = 1;
    };
    state.board.forEach((row, y) => row.forEach((v, x) => v && draw(x, y, COLORS[v])));
    const color = COLORS[Object.keys(SHAPES).indexOf(state.piece.type) + 1];
    cells(ghost(state)).forEach(([x, y]) => draw(x, y, color, 0.18));
    cells(state.piece).forEach(([x, y]) => draw(x, y, color));
  }, [state]);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, t: Date.now(), moved: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !canvas.current) return;
    const cell = canvas.current.getBoundingClientRect().width / COLS;
    const steps = Math.trunc((e.clientX - d.x) / cell);
    if (steps !== 0) {
      act((s) => move(s, Math.sign(steps)));
      d.x += Math.sign(steps) * cell;
      d.moved++;
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dy = e.clientY - d.y;
    if (dy > 60 && Date.now() - d.t < 400) act((s) => hardDrop(s, endless));
    else if (d.moved === 0 && Math.abs(dy) < 15) act(rotatePiece);
  };

  const next = SHAPES[state.next];

  return (
    <div className="game">
      <div className="game__hud">
        <span>
          <strong>{state.score}</strong> pontos
        </span>
        <span>{state.lines} linhas</span>
        {endless ? <span>{formatRemaining(remaining)}</span> : <span>nível {state.level}</span>}
        <span className="next" aria-label={`Próxima peça ${state.next}`}>
          {next.map((row, y) => (
            <span key={y} className="next__row">
              {row.map((v, x) => (
                <i key={x} style={{ background: v ? COLORS[Object.keys(SHAPES).indexOf(state.next) + 1] : 'transparent' }} />
              ))}
            </span>
          ))}
        </span>
      </div>
      <canvas
        ref={canvas}
        className="blocks"
        width={COLS * 24}
        height={ROWS * 24}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label="Tabuleiro: toque para girar, arraste para os lados, deslize para baixo para soltar"
      />
      <div className="pad">
        <button type="button" aria-label="Esquerda" onClick={() => act((s) => move(s, -1))}>
          ◀
        </button>
        <button type="button" aria-label="Girar" onClick={() => act(rotatePiece)}>
          ⟳
        </button>
        <button type="button" aria-label="Direita" onClick={() => act((s) => move(s, 1))}>
          ▶
        </button>
        <button type="button" aria-label="Soltar" onClick={() => act((s) => hardDrop(s, endless))}>
          ⤓
        </button>
      </div>
      {state.toppedOut > 0 && endless && <p className="center small muted">Encheu? Sem problema, recomeça sozinho. Continue.</p>}
    </div>
  );
}
