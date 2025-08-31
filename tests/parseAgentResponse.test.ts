import { describe, it, expect } from 'vitest';

function toNum(s?: string) {
  return s ? Number(s) : NaN;
}

describe('parse agent numbers', () => {
  it('converte strings para número (4 casas úteis)', () => {
    const sample = {
      cac: { current: '29.986837', previous: '32.329272', delta_pct: '-0.072456' },
      roas: { current: '3.334797', previous: '3.093172', delta_pct: '0.078115' },
    };

    expect(toNum(sample.cac.current)).toBeCloseTo(29.986837);
    expect(toNum(sample.cac.previous)).toBeCloseTo(32.329272);
    expect(toNum(sample.cac.delta_pct)).toBeCloseTo(-0.072456);

    expect(toNum(sample.roas.current)).toBeCloseTo(3.334797);
    expect(toNum(sample.roas.previous)).toBeCloseTo(3.093172);
    expect(toNum(sample.roas.delta_pct)).toBeCloseTo(0.078115);
  });
});