import { useEffect, useMemo, useRef, useState } from 'react';
import { ANSWER_MS, buildRound, scoreAnswer } from '@/domain/games/rebate';
import { createRng } from '@/domain/games/rng';
import type { GameOutcome } from './record';
import { vibrate } from './record';

export function RebateGame({ personal, onFinish }: { personal: Record<string, string>; onFinish: (o: GameOutcome) => void }) {
  const round = useMemo(() => buildRound(createRng(Date.now() % 2147483647), personal), [personal]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hits, setHits] = useState(0);
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [picked, setPicked] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const q = round[Math.min(i, round.length - 1)];
  const done = i >= round.length;
  const left = ANSWER_MS - (now - shownAt);

  const choose = (option: string | null) => {
    if (picked !== null || done) return;
    const ok = option === q.correct;
    vibrate(ok ? 20 : [40, 40, 40]);
    setPicked(option ?? '');
    setScore((s) => s + scoreAnswer(ok, left, streak));
    setStreak((s) => (ok ? s + 1 : 0));
    if (ok) setHits((h) => h + 1);
    setTimeout(() => {
      setPicked(null);
      setI((x) => x + 1);
      setShownAt(Date.now());
    }, ok ? 700 : 2200);
  };
  const chooseRef = useRef(choose);
  chooseRef.current = choose;

  useEffect(() => {
    if (done || picked !== null) return;
    const id = setInterval(() => {
      setNow(Date.now());
      if (Date.now() - shownAt >= ANSWER_MS) chooseRef.current(null);
    }, 100);
    return () => clearInterval(id);
  }, [done, picked, shownAt]);

  useEffect(() => {
    if (done) onFinish({ score, durationMs: Date.now() - startedAt, extra: { hits, total: round.length } });
  }, [done]); // eslint-disable-line

  if (done) return null;
  const ok = picked !== null && picked === q.correct;

  return (
    <div className="game rebate">
      <div className="game__hud">
        <span>
          <strong>{score}</strong> pontos
        </span>
        <span>{streak >= 2 ? `sequência ${streak}` : ' '}</span>
        <span>
          {i + 1}/{round.length}
        </span>
      </div>
      <div className={`thought${picked !== null ? (ok ? ' thought--broken' : ' thought--strong') : ''}`}>
        <span className="muted small">O pensamento diz:</span>
        <strong>"{q.thought}"</strong>
        <div className="timebar">
          <span style={{ width: `${picked === null ? Math.max(0, (left / ANSWER_MS) * 100) : 0}%` }} />
        </div>
      </div>
      <p className="center small muted">Qual resposta derruba esse pensamento?</p>
      <div className="stack">
        {q.options.map((o) => (
          <button
            key={o}
            type="button"
            className={`option${picked !== null && o === q.correct ? ' option--right' : ''}${picked === o && !ok ? ' option--wrong' : ''}`}
            onClick={() => choose(o)}
          >
            {o}
          </button>
        ))}
      </div>
      <p className={`center feedback${picked !== null ? (ok ? ' ok' : ' bad') : ''}`} aria-live="polite">
        {picked === null ? ' ' : ok ? 'Derrubado!' : picked === '' ? 'O tempo acabou. A resposta forte está marcada.' : 'Essa deixa a porta aberta. A forte está marcada.'}
      </p>
    </div>
  );
}
