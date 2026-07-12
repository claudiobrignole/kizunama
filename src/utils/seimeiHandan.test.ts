import { describe, expect, it } from 'vitest';
import { classifyKakusu, computeSeimeiHandan } from './seimeiHandan';

describe('computeSeimeiHandan', () => {
  it('matches the "Rossi/Claudio" worked example from the redesign report (羅氏 + 久良)', () => {
    // 羅=19, 氏=4 (surname ateji) / 久=3, 良=7 (given-name ateji).
    const result = computeSeimeiHandan([19, 4], [3, 7]);
    expect(result.tenkaku.strokes).toBe(23);
    expect(result.chikaku.strokes).toBe(10);
    expect(result.jinkaku.strokes).toBe(7);
    expect(result.soukaku.strokes).toBe(33);
    expect(result.gaikaku.strokes).toBe(26);
  });

  it('matches the "Curie/Marie" worked example from the redesign report (久里 + 真理)', () => {
    // 久=3, 里=7 (surname ateji) / 真=10, 理=11 (given-name ateji).
    const result = computeSeimeiHandan([3, 7], [10, 11]);
    expect(result.tenkaku.strokes).toBe(10);
    expect(result.chikaku.strokes).toBe(21);
    expect(result.jinkaku.strokes).toBe(17);
    expect(result.soukaku.strokes).toBe(31);
    expect(result.gaikaku.strokes).toBe(14);
  });

  it('applies the +1 reisū correction to Tenkaku for a single-kanji surname', () => {
    const result = computeSeimeiHandan([5], [8, 3]);
    expect(result.tenkaku.strokes).toBe(6); // 5 + reisū(1)
    expect(result.chikaku.strokes).toBe(11); // 8 + 3, no correction (2 kanji)
    expect(result.jinkaku.strokes).toBe(13); // last-of-surname(5) + first-of-given(8)
    expect(result.soukaku.strokes).toBe(17); // tenkaku + chikaku
    expect(result.gaikaku.strokes).toBe(4); // soukaku - jinkaku
  });

  it('applies the +1 reisū correction to Chikaku for a single-kanji given name', () => {
    const result = computeSeimeiHandan([6, 9], [12]);
    expect(result.chikaku.strokes).toBe(13); // 12 + reisū(1)
    expect(result.tenkaku.strokes).toBe(15); // 6 + 9, no correction
  });

  it('handles no surname at all (given-name-only mode)', () => {
    const result = computeSeimeiHandan([], [7, 5]);
    expect(result.tenkaku.strokes).toBe(0);
    expect(result.chikaku.strokes).toBe(12);
    expect(result.jinkaku.strokes).toBe(7); // last-of-surname(0) + first-of-given(7)
  });
});

describe('classifyKakusu', () => {
  it('classifies values within 1-81 directly from the table', () => {
    expect(classifyKakusu(1)).toBe('daikichi');
    expect(classifyKakusu(81)).toBe('daikichi');
    expect(classifyKakusu(10)).toBe('daikyou');
  });

  it('wraps values above 81 back into the 1-80 cycle', () => {
    expect(classifyKakusu(82)).toBe(classifyKakusu(2));
    expect(classifyKakusu(91)).toBe(classifyKakusu(11));
  });
});
