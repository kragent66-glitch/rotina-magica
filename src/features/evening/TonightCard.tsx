import { useState } from 'react';
import { useData } from '@/data/provider';
import { toLocalDate } from '@/domain/dates';

export function TonightCard() {
  const { repos, write } = useData();
  const today = toLocalDate(new Date());
  const plans = repos.plan.list('plano_noite');
  const choice = repos.evenings.getForDate(today);
  const chosen = plans.find((p) => p.id === choice?.planItemId);
  const [picking, setPicking] = useState(false);

  if (!plans.length) return null;

  if (chosen && !picking) {
    return (
      <section className="card card--accent">
        <p className="muted small">Sua noite de hoje</p>
        <h2>{chosen.text}</h2>
        <p>
          <span className="muted small">Primeiro passo: </span>
          {String(chosen.extra?.firstStep ?? '')}
        </p>
        <button type="button" className="link" onClick={() => setPicking(true)}>
          Trocar plano
        </button>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Como vai ser sua noite?</h2>
      <p className="muted small">Decida agora, antes de chegar em casa.</p>
      <div className="stack">
        {plans.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`option${p.id === chosen?.id ? ' option--on' : ''}`}
            onClick={() => {
              write((r) => r.evenings.choose(today, p.id));
              setPicking(false);
            }}
          >
            {p.text}
          </button>
        ))}
      </div>
    </section>
  );
}
