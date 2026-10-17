import { needsBackup } from './backup-nudge';

describe('lembrete de backup', () => {
  it('só aparece depois de uma semana de uso', () => {
    expect(needsBackup('2026-10-20', '2026-10-16', null, null)).toBe(false);
    expect(needsBackup('2026-10-23', '2026-10-16', null, null)).toBe(true);
  });
  it('some por 14 dias depois de um backup e respeita o "agora não"', () => {
    expect(needsBackup('2026-11-01', '2026-10-01', '2026-10-25', null)).toBe(false);
    expect(needsBackup('2026-11-08', '2026-10-01', '2026-10-25', null)).toBe(true);
    expect(needsBackup('2026-11-08', '2026-10-01', null, '2026-11-10')).toBe(false);
  });
});
