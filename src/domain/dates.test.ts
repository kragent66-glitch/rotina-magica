import { addDays, daysBetween, isLocalDate, toLocalDate } from './dates';

describe('dates', () => {
  it('formata datas locais', () => {
    expect(toLocalDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('soma dias atravessando meses e anos', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('conta dias entre datas', () => {
    expect(daysBetween('2026-10-01', '2026-10-16')).toBe(15);
    expect(daysBetween('2026-10-16', '2026-10-01')).toBe(-15);
  });

  it('valida o formato', () => {
    expect(isLocalDate('2026-10-16')).toBe(true);
    expect(isLocalDate('16/10/2026')).toBe(false);
    expect(isLocalDate('2026-02-31')).toBe(false);
  });
});
