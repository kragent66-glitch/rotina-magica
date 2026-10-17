import { computeProgress } from './progress';

describe('computeProgress', () => {
  it('conta hoje como dia sem uso quando não houve uso', () => {
    const p = computeProgress({ startDate: '2026-10-16', today: '2026-10-16', useDates: [] });
    expect(p).toMatchObject({ trackedDays: 1, cleanDays: 1, currentStreak: 1, bestStreak: 1 });
  });

  it('não zera os dias acumulados depois de um lapso', () => {
    const p = computeProgress({
      startDate: '2026-10-01',
      today: '2026-10-10',
      useDates: ['2026-10-08'],
    });
    expect(p.trackedDays).toBe(10);
    expect(p.cleanDays).toBe(9);
    expect(p.currentStreak).toBe(2);
    expect(p.bestStreak).toBe(7);
    expect(p.cleanRatio).toBeCloseTo(0.9);
  });

  it('zera só a sequência atual quando o uso foi hoje', () => {
    const p = computeProgress({
      startDate: '2026-10-01',
      today: '2026-10-05',
      useDates: ['2026-10-05'],
    });
    expect(p.currentStreak).toBe(0);
    expect(p.cleanDays).toBe(4);
  });

  it('ignora duplicatas e datas fora do período', () => {
    const p = computeProgress({
      startDate: '2026-10-01',
      today: '2026-10-03',
      useDates: ['2026-09-30', '2026-10-02', '2026-10-02', '2026-10-04'],
    });
    expect(p.cleanDays).toBe(2);
  });

  it('calcula os últimos 30 dias numa janela móvel', () => {
    const p = computeProgress({
      startDate: '2026-08-01',
      today: '2026-10-10',
      useDates: ['2026-08-15', '2026-10-01', '2026-10-05', '2026-10-09'],
    });
    expect(p.last30CleanRatio).toBeCloseTo(27 / 30);
  });

  it('atravessa a virada de mês e o fim do horário de verão', () => {
    const p = computeProgress({ startDate: '2026-02-20', today: '2026-03-05', useDates: [] });
    expect(p.trackedDays).toBe(14);
  });

  it('retorna vazio quando o início é no futuro', () => {
    const p = computeProgress({ startDate: '2026-10-20', today: '2026-10-16', useDates: [] });
    expect(p.trackedDays).toBe(0);
    expect(p.cleanRatio).toBe(0);
  });
});
