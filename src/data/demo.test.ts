import { createDemoRepositories, isDemo } from './demo';

describe('modo demonstração', () => {
  it('liga só com ?demo no link', () => {
    expect(isDemo('?demo')).toBe(true);
    expect(isDemo('?x=1&demo=1')).toBe(true);
    expect(isDemo('')).toBe(false);
  });

  it('cria três semanas de dados de exemplo sem tocar no armazenamento real', () => {
    window.localStorage.clear();
    const repos = createDemoRepositories(new Date('2026-10-16T12:00:00'));
    expect(repos.settings.get('onboardingDone', false)).toBe(true);
    expect(repos.checkins.listBetween('2026-09-26', '2026-10-16')).toHaveLength(21);
    expect(repos.useEvents.useDatesBetween('2026-09-26', '2026-10-16')).toHaveLength(2);
    expect(repos.cravings.listBetween('2026-09-26', '2026-10-16').length).toBeGreaterThan(8);
    expect(repos.games.list()).toHaveLength(21);
    expect(window.localStorage.length).toBe(0);
  });
});
