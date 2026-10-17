import { breathAt, formatRemaining, URGE_WAVE_MS } from './urge';

describe('urge', () => {
  it('percorre inspire → segure → solte em ciclos de 12 s', () => {
    expect(breathAt(0).step).toBe('inspire');
    expect(breathAt(3999).step).toBe('inspire');
    expect(breathAt(4000).step).toBe('segure');
    expect(breathAt(6000).step).toBe('solte');
    expect(breathAt(12_000).step).toBe('inspire');
    expect(breathAt(9000).progress).toBeCloseTo(0.5);
  });

  it('formata o tempo restante', () => {
    expect(formatRemaining(URGE_WAVE_MS)).toBe('15:00');
    expect(formatRemaining(61_500)).toBe('1:02');
    expect(formatRemaining(-5)).toBe('0:00');
  });
});
