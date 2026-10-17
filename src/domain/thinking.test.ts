import { TRAPS, bodyTip, trapCounts } from './thinking';

describe('desatar um pensamento', () => {
  it('cada armadilha tem id único e uma pergunta', () => {
    expect(new Set(TRAPS.map((t) => t.id)).size).toBe(TRAPS.length);
    TRAPS.forEach((t) => expect(t.question.length).toBeGreaterThan(10));
  });

  it('dá a dica do corpo só quando há alguma necessidade', () => {
    expect(bodyTip(['Tudo bem'])).toBeNull();
    expect(bodyTip(['Fome', 'Sono'])).toMatch(/coma algo, deite um pouco/);
  });

  it('conta as armadilhas mais frequentes', () => {
    const r = trapCounts([{ traps: ['permissao', 'rotulo'] }, { traps: ['permissao'] }]);
    expect(r.map((x) => [x.trap.id, x.count])).toEqual([
      ['permissao', 2],
      ['rotulo', 1],
    ]);
  });
});
