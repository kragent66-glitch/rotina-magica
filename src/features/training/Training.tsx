import { useEffect, useState } from 'react';
import { useData } from '@/data/provider';
import { toLocalDate } from '@/domain/dates';
import { TECHNIQUES, findTechnique, techniqueOfTheDay, type TechniqueStep } from '@/domain/training';
import { Chip } from '@/ui/Chip';
import { Screen } from '@/ui/Screen';

export function TrainingList({ onOpen, onBack }: { onOpen: (id: string) => void; onBack: () => void }) {
  const { repos } = useData();
  const today = toLocalDate(new Date());
  const practices = repos.practices.list();
  const ofTheDay = techniqueOfTheDay(today, practices.map((p) => p.techniqueId), repos.settings.get('trackingStartDate', today));
  return (
    <Screen title="Treinos" onBack={onBack}>
      <p className="muted">
        3 minutos por dia, com a cabeça tranquila. O que você escreve aqui aparece no SOS quando a vontade vier.
      </p>
      <div className="stack">
        {TECHNIQUES.map((t) => {
          const times = practices.filter((p) => p.techniqueId === t.id).length;
          return (
            <button key={t.id} type="button" className="card card--button" onClick={() => onOpen(t.id)}>
              <span className="muted small">
                {t.id === ofTheDay.id ? 'Sugestão de hoje · ' : ''}
                {times ? `praticado ${times}×` : 'nunca praticado'}
              </span>
              <strong>{t.title}</strong>
              <span className="small">{t.why}</span>
            </button>
          );
        })}
      </div>
    </Screen>
  );
}

function Pause({ seconds, onEnd }: { seconds: number; onEnd: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return onEnd();
    const id = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(id);
  }, [left, onEnd]);
  return <p className="center big">{left > 0 ? `${left} s` : 'Pronto'}</p>;
}

export function TrainingSession({ id, onDone, onBack }: { id: string; onDone: () => void; onBack: () => void }) {
  const { write } = useData();
  const technique = findTechnique(id);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { text: string; option?: string }>>({});
  const [pauseDone, setPauseDone] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);

  if (!technique) {
    return (
      <Screen title="Treino não encontrado" onBack={onBack}>
        <p className="muted">Escolha um treino na lista.</p>
      </Screen>
    );
  }

  const step: TechniqueStep = technique.steps[i];
  const last = i === technique.steps.length - 1;
  const answer = answers[i] ?? { text: '' };
  const needsOption = !!step.options && !answer.option;
  const blocked = (step.capture && !answer.text.trim()) || needsOption;

  const finish = () => {
    write((r) => {
      technique.steps.forEach((s, idx) => {
        const a = answers[idx];
        if (s.capture && a?.text.trim()) {
          r.plan.add({ kind: s.capture.kind, text: a.text.trim(), extra: a.option ? { thought: a.option } : null });
        }
      });
      r.practices.add(technique.id, toLocalDate(new Date()));
    });
    setFinished(true);
  };

  if (finished) {
    const captured = technique.steps.some((s) => s.capture);
    return (
      <Screen title="Treino feito">
        <p>{captured ? 'Pronto. O que você escreveu já está no seu SOS.' : 'Pronto. Na hora da vontade, isso vai estar mais à mão.'}</p>
        <button type="button" className="btn" onClick={onDone}>
          Voltar ao início
        </button>
      </Screen>
    );
  }

  return (
    <Screen onBack={onBack}>
      <p className="muted small">
        {technique.title} · {i + 1} de {technique.steps.length}
      </p>
      <h1>{step.text}</h1>

      {step.pauseSeconds && !pauseDone[i] && (
        <Pause seconds={step.pauseSeconds} onEnd={() => setPauseDone((p) => ({ ...p, [i]: true }))} />
      )}

      {step.options && (
        <div className="chips">
          {step.options.map((o) => (
            <Chip key={o} selected={answer.option === o} onClick={() => setAnswers({ ...answers, [i]: { ...answer, option: o } })}>
              {o}
            </Chip>
          ))}
        </div>
      )}

      {step.capture && (!step.options || answer.option) && (
        <label className="field">
          {step.capture.prompt}
          <textarea
            rows={3}
            placeholder={step.capture.placeholder}
            value={answer.text}
            onChange={(e) => setAnswers({ ...answers, [i]: { ...answer, text: e.target.value } })}
          />
        </label>
      )}

      <div className="actions">
        {i > 0 && (
          <button type="button" className="btn btn--ghost" onClick={() => setI(i - 1)}>
            Voltar
          </button>
        )}
        {last ? (
          <button type="button" className="btn" disabled={blocked} onClick={finish}>
            Concluir
          </button>
        ) : (
          <button type="button" className="btn" disabled={blocked} onClick={() => setI(i + 1)}>
            {step.pauseSeconds && !pauseDone[i] ? 'Pular' : 'Continuar'}
          </button>
        )}
      </div>
    </Screen>
  );
}
