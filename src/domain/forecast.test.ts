import { addDays } from './dates';
import { forecastFor, forecastText } from './forecast';

// 2026-10-16 é uma sexta-feira.
const today = '2026-10-16';
const fridays = [7, 14, 21, 28].map((n) => addDays(today, -n));
const others = [1, 2, 3, 4, 5, 6].map((n) => addDays(today, -n));

describe('clima de hoje', () => {
  it('sem dados suficientes, não arrisca previsão', () => {
    expect(forecastFor({ today, journal: [], cravings: [], useDates: [] })).toBeNull();
  });

  it('marca alto quando o mesmo dia da semana tem vontade bem acima da média', () => {
    const journal = [
      ...fridays.map((date) => ({ date, craving: 8, triggers: ['Tédio'] })),
      ...others.map((date) => ({ date, craving: 3, triggers: ['Estresse'] })),
    ];
    const cravings = fridays.map((date) => ({ occurredAt: `${date}T19:20:00`, date, intensity: 7 }));
    const f = forecastFor({ today, journal, cravings, useDates: [] })!;
    expect(f).toMatchObject({ level: 'alto', weekday: 'sexta', peakHour: 19, topTrigger: 'Tédio' });
    expect(forecastText(f)).toMatch(/^Sextas têm sido mais difíceis/);
  });

  it('um uso no mesmo dia da semana nas últimas 4 semanas já pede atenção máxima', () => {
    const journal = others.map((date) => ({ date, craving: 2, triggers: [] }));
    expect(forecastFor({ today, journal, cravings: [], useDates: [fridays[1]] })?.level).toBe('alto');
  });

  it('dia tranquilo quando o histórico do dia é baixo', () => {
    const journal = [...fridays, ...others].map((date) => ({ date, craving: 2, triggers: [] }));
    const f = forecastFor({ today, journal, cravings: [], useDates: [] })!;
    expect(f.level).toBe('calmo');
    expect(forecastText(f)).toMatch(/Sextas costumam ser tranquilas/);
  });
});
