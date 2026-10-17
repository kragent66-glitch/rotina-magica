import { rankStrategies, scoreStrategies } from './strategies';

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('SOS que aprende', () => {
  it('sem histórico mantém a ordem padrão', () => {
    expect(rankStrategies(items, []).map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('o que funcionou sobe; o que falhou desce', () => {
    const history = [
      { coping: 'c', outcome: 'passou' as const },
      { coping: 'c', outcome: 'passou' as const },
      { coping: 'a', outcome: 'usei' as const },
    ];
    expect(rankStrategies(items, history).map((i) => i.id)).toEqual(['c', 'b', 'a']);
  });

  it('ignora fissuras ainda em andamento', () => {
    const [a] = scoreStrategies(['a'], [{ coping: 'a', outcome: 'em_andamento' }]);
    expect(a).toEqual({ id: 'a', tries: 0, worked: 0, estimate: 0.5 });
  });
});

describe('o que baixa a vontade', () => {
  it('calcula a queda média por estratégia, ignorando notas faltando', async () => {
    const { averageDrops } = await import('./strategies');
    const drops = averageDrops([
      { coping: 'jogo:blocos', intensity: 8, intensityAfter: 4 },
      { coping: 'jogo:blocos', intensity: 6, intensityAfter: 4 },
      { coping: 'sair', intensity: 7, intensityAfter: 6 },
      { coping: 'sair', intensity: null, intensityAfter: 2 },
    ]);
    expect(drops).toEqual([
      { coping: 'jogo:blocos', times: 2, averageDrop: 3 },
      { coping: 'sair', times: 1, averageDrop: 1 },
    ]);
  });
});
