import { createRng } from './rng';
import { MAX_URGE, START_URGE, buildStory, choose, ending, isOver, startStory, storyScore, turningPoint } from './story';

describe('A noite (história)', () => {
  it('monta 5 cenas, sempre iguais para a mesma semente', () => {
    const a = buildStory(createRng(7));
    const b = buildStory(createRng(7));
    expect(a).toHaveLength(5);
    expect(a.map((s) => s.id)).toEqual(b.map((s) => s.id));
    a.forEach((s) => expect(s.choices).toHaveLength(3));
  });

  it('usa o plano da pessoa nas opções', () => {
    const texts = Array.from({ length: 8 }, (_, i) => buildStory(createRng(i), { reason: 'ver meu filho crescer', plan: 'correr no parque' }))
      .flat()
      .flatMap((s) => s.choices.map((c) => c.text));
    expect(texts.some((t) => t.includes('ver meu filho crescer'))).toBe(true);
    expect(texts.some((t) => t.includes('correr no parque'))).toBe(true);
  });

  it('escolhas boas baixam a vontade e terminam a noite dormindo', () => {
    const scenes = buildStory(createRng(1));
    let s = startStory();
    for (const scene of scenes) {
      const best = [...scene.choices].sort((x, y) => x.delta - y.delta)[0];
      s = choose(s, scene, best);
    }
    expect(isOver(s, scenes)).toBe(true);
    expect(s.urge).toBeLessThan(START_URGE);
    expect(ending(s)).toBe('dormiu');
    expect(turningPoint(s)).toBeNull();
    expect(storyScore(s)).toBeGreaterThan(700);
  });

  it('a noite pode escapar antes do fim, e mostra onde mais pesou', () => {
    const scenes = buildStory(createRng(2));
    let s = startStory();
    while (!isOver(s, scenes)) {
      const worst = [...scenes[s.step].choices].sort((x, y) => y.delta - x.delta)[0];
      s = choose(s, scenes[s.step], worst);
    }
    expect(s.urge).toBe(MAX_URGE);
    expect(ending(s)).toBe('escapou');
    expect(turningPoint(s)?.delta).toBeGreaterThanOrEqual(2);
    expect(turningPoint(s)?.plan).toMatch(/^Se .+, então .+/);
    expect(storyScore(s)).toBe(0);
  });
});
