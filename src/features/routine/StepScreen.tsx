import { useState } from 'react';
import { useData } from '@/data/provider';
import { toLocalDate } from '@/domain/dates';
import { DEFAULT_OATH, PRACTICES, findStep, practiceSeconds, type RoutineStyle } from '@/domain/routine';
import { navigate } from '@/router';
import { Screen } from '@/ui/Screen';
import { PracticePlayer } from './PracticePlayer';

/** Um passo da rotina: como fazer, a prática guiada (se houver) e "Feito". */
export function StepScreen({ id, onBack }: { id: string; onBack: () => void }) {
  const { repos, write } = useData();
  const [playing, setPlaying] = useState(false);
  const step = findStep(id, repos.settings.get<RoutineStyle>('routineStyle', 'magica'));
  if (!step) return <Screen title="Passo não encontrado" onBack={onBack}>{null}</Screen>;
  const today = toLocalDate(new Date());
  const done = repos.routine.doneOn(today).includes(step.id);
  const practice = step.practice ? PRACTICES[step.practice] : null;
  const finish = () => {
    write((r) => r.routine.toggle(today, step.id, true));
    onBack();
  };

  if (playing && practice)
    return (
      <main className="screen">
        <PracticePlayer practice={practice} onStop={() => setPlaying(false)} onDone={finish} />
      </main>
    );

  return (
    <Screen onBack={onBack}>
      <p className="eyebrow">{step.minutes} min</p>
      <h1>{step.title}</h1>
      {step.how.map((t) => (
        <p key={t}>{t}</p>
      ))}

      {step.practice === 'juramento' && (
        <blockquote className="oath oath--read">{repos.settings.get('oath', DEFAULT_OATH)}</blockquote>
      )}

      {practice && practice.phases.length > 0 && (
        <button type="button" className="btn" onClick={() => setPlaying(true)}>
          Começar guiado · {Math.round(practiceSeconds(practice) / 60)} min
        </button>
      )}
      {step.link === 'arsenal' && (
        <button type="button" className="btn" onClick={() => navigate('sos')}>
          Abrir a ajuda agora
        </button>
      )}

      <div className="actions">
        <button type="button" className={done ? 'btn btn--ghost' : 'btn'} onClick={done ? () => write((r) => r.routine.toggle(today, step.id, false)) : finish}>
          {done ? 'Feito hoje ✓ (desfazer)' : step.practice === 'juramento' ? 'Li em voz alta' : 'Feito'}
        </button>
      </div>
    </Screen>
  );
}
