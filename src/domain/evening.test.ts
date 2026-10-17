import { buildEveningPlans, parseTime } from './evening';

describe('buildEveningPlans', () => {
  it('prioriza o que tira de casa e envolve gente', () => {
    const plans = buildEveningPlans(['serie', 'academia', 'amigos']);
    expect(plans.map((p) => p.activityId)).toEqual(['amigos', 'academia', 'serie']);
  });

  it('usa planos padrão quando nada foi escolhido', () => {
    const plans = buildEveningPlans([]);
    expect(plans.length).toBeGreaterThan(0);
    expect(plans.every((p) => p.leavesHome)).toBe(true);
  });

  it('inclui atividades escritas pela pessoa e limita a 4 planos', () => {
    const plans = buildEveningPlans(['academia', 'corrida', 'comer_fora'], ['Skate', '  ', 'Pescar']);
    expect(plans).toHaveLength(4);
    expect(plans[3]).toMatchObject({ title: 'Skate', activityId: null });
  });

  it('só atividades próprias também bastam', () => {
    expect(buildEveningPlans([], ['Skate'])).toEqual([
      expect.objectContaining({ title: 'Skate' }),
    ]);
  });
});

describe('parseTime', () => {
  it.each([
    ['18', '18:00'],
    ['18h', '18:00'],
    ['1830', '18:30'],
    ['18:3', '18:03'],
    ['7:45', '07:45'],
    ['25', null],
    ['18:61', null],
    ['', null],
  ])('%s → %s', (input, expected) => {
    expect(parseTime(input)).toBe(expected);
  });
});
