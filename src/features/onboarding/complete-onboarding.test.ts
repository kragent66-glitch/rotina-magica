import { createTestRepositories } from '@/data/test-repos';
import { buildEveningPlans } from '@/domain/evening';
import { completeOnboarding } from './complete-onboarding';

describe('completeOnboarding', () => {
  const answers = {
    workEndTime: '18:00',
    activityIds: ['academia', 'serie'],
    customActivities: ['Skate'],
    reasons: ['Dinheiro', 'Minha saúde'],
    plans: buildEveningPlans(['academia', 'serie'], ['Skate']),
  };

  it('grava planos, razões e horário e marca o primeiro uso como feito', () => {
    const repos = createTestRepositories();
    completeOnboarding(repos, answers);
    expect(repos.settings.get('onboardingDone', false)).toBe(true);
    expect(repos.settings.get('workEndTime', '')).toBe('18:00');
    expect(repos.plan.list('razao').map((r) => r.text)).toEqual(['Dinheiro', 'Minha saúde']);
    const plans = repos.plan.list('plano_noite');
    expect(plans[0]).toMatchObject({ text: 'Academia ou treino', extra: { leavesHome: true } });
    expect(plans).toHaveLength(3);
  });

  it('refazer substitui em vez de duplicar', () => {
    const repos = createTestRepositories();
    completeOnboarding(repos, answers);
    completeOnboarding(repos, { ...answers, reasons: ['Família'] });
    expect(repos.plan.list('razao').map((r) => r.text)).toEqual(['Família']);
    expect(repos.plan.list('plano_noite')).toHaveLength(3);
  });
});
