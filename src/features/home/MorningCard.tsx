import { useState } from 'react';
import { useData } from '@/data/provider';
import { addDays, daysBetween, toLocalDate } from '@/domain/dates';

/**
 * Registro de 10 segundos sobre a noite anterior. É o que alimenta o laboratório: sem isso o app
 * não sabe quais planos funcionam para você.
 */
export function MorningCard() {
  const { repos, write } = useData();
  const today = toLocalDate(new Date());
  const yesterday = addDays(today, -1);
  const start = repos.settings.get('trackingStartDate', today);
  const [used, setUsed] = useState<boolean | null>(null);
  const [thanks, setThanks] = useState<string | null>(null);

  if (thanks) return <p className="card muted">{thanks}</p>;
  // De madrugada a noite de ontem ainda não acabou: só perguntamos a partir das 5h.
  if (new Date().getHours() < 5 || daysBetween(start, yesterday) < 0 || repos.checkins.getByDate(yesterday)) return null;

  const save = (alcohol: boolean | null) => {
    write((r) => {
      r.checkins.upsertForDate({
        date: yesterday,
        used,
        alcohol,
        mood: null,
        craving: null,
        sleepQuality: null,
        stress: null,
        note: null,
      });
      if (used !== null && r.evenings.getForDate(yesterday)) r.evenings.setOutcome(yesterday, used ? 'usei' : 'sem_uso');
      if (used && !r.useEvents.useDatesBetween(yesterday, yesterday).length) {
        r.useEvents.add({ occurredAt: `${yesterday}T23:00:00`, amountSpent: null, note: null });
      }
    });
    setThanks(
      used
        ? 'Anotado, sem julgamento. Hoje o app cuida de você, e nada do seu progresso foi apagado.'
        : 'Mais uma noite no seu laboratório. Anotado.',
    );
  };

  if (used === null) {
    return (
      <section className="card">
        <h2>Como foi ontem à noite?</h2>
        <div className="row">
          <button type="button" className="option" onClick={() => setUsed(false)}>
            Passei sem usar
          </button>
          <button type="button" className="option" onClick={() => setUsed(true)}>
            Usei
          </button>
        </div>
      </section>
    );
  }
  return (
    <section className="card">
      <h2>Teve álcool?</h2>
      <div className="row">
        <button type="button" className="option" onClick={() => save(true)}>
          Sim
        </button>
        <button type="button" className="option" onClick={() => save(false)}>
          Não
        </button>
        <button type="button" className="option" onClick={() => save(null)}>
          Pular
        </button>
      </div>
    </section>
  );
}
