/**
 * Em que parte do dia a pessoa está, em relação ao fim do expediente. A tela inicial usa isso para
 * mostrar primeiro o que serve agora: decidir a noite na saída, atravessar a noite, contar como foi.
 */
export type DayPhase = 'manha' | 'tarde' | 'saida' | 'noite' | 'madrugada';

function minutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function dayPhase(now: Date, workEndTime: string): DayPhase {
  const t = now.getHours() * 60 + now.getMinutes();
  const end = minutes(workEndTime);
  if (t < 5 * 60) return 'madrugada';
  if (t < 12 * 60 && t < end - 60) return 'manha';
  if (t < end - 60) return 'tarde';
  if (t < end + 60) return 'saida';
  return 'noite';
}
