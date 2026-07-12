import { describe, expect, it } from 'vitest';
import * as wanakana from 'wanakana';
import { atejiCredibility, candidatesForReading, generateAtejiCandidates } from './ateji';

function comboHasSingleKanjiSpan(combos: ReturnType<typeof generateAtejiCandidates>, kanji: string, moraKey: string) {
  return combos.some((c) => c.spans.some((s) => s.kanji === kanji && s.mora.join('') === moraKey));
}

describe('generateAtejiCandidates: variable-length mora span regression', () => {
  // These four are the explicit acceptance test from the ateji-pivot plan:
  // the reverse index must NOT be capped at 1-2 mora, or these standard
  // 3-mora kun/nanori single-kanji name readings would be silently dropped.
  it('光 (hikaru, 3-mora kun reading) appears as a single-kanji candidate', () => {
    const combos = generateAtejiCandidates(wanakana.toKatakana('hikaru'));
    expect(comboHasSingleKanjiSpan(combos, '光', 'ヒカル')).toBe(true);
  });

  it('勇 (isamu, 3-mora kun reading) appears as a single-kanji candidate', () => {
    const combos = generateAtejiCandidates(wanakana.toKatakana('isamu'));
    expect(comboHasSingleKanjiSpan(combos, '勇', 'イサム')).toBe(true);
  });

  it('守 (mamoru, 3-mora kun reading) appears as a single-kanji candidate', () => {
    const combos = generateAtejiCandidates(wanakana.toKatakana('mamoru'));
    expect(comboHasSingleKanjiSpan(combos, '守', 'マモル')).toBe(true);
  });

  it('excludes nanori-only readings from selection', () => {
    const combos = generateAtejiCandidates(wanakana.toKatakana('hajime'));
    expect(comboHasSingleKanjiSpan(combos, '一', 'ハジメ')).toBe(false);
    expect(candidatesForReading(['ハ', 'ジ', 'メ']).every((candidate) => candidate.readingType !== ('nanori' as never))).toBe(true);
  });
});

describe('generateAtejiCandidates: general behaviour', () => {
  it('returns fully-covered combinations for an easy short name', () => {
    const combos = generateAtejiCandidates('マリ');
    expect(combos.length).toBeGreaterThan(0);
    expect(combos[0].unmatchedMoraCount).toBe(0);
    expect(combos[0].spans.every((s) => s.kanji)).toBe(true);
  });

  it('flags mora with no native kanji reading as unmatched instead of failing', () => {
    // ヴォ has no kanji on/kun/nanori reading anywhere in the jōyō+jinmeiyō pool.
    const combos = generateAtejiCandidates('ヴォ');
    expect(combos.length).toBeGreaterThan(0);
    expect(combos[0].unmatchedMoraCount).toBeGreaterThan(0);
    expect(combos[0].spans.some((s) => s.kanji === null)).toBe(true);
  });

  it('ranks boosted/longer-span candidates above plain single-mora kun matches', () => {
    const combos = generateAtejiCandidates(wanakana.toKatakana('hikaru'));
    // The top-ranked combo should prefer the single 3-mora kanji span over
    // three separate 1-mora kanji, all else being reasonably equal.
    expect(combos[0].kanjiCount).toBeLessThanOrEqual(2);
  });

  it('computes per-Kanji and length-weighted combination fit', () => {
    const combos = generateAtejiCandidates('マリ', 8, [10, 30]);
    expect(combos[0].spans.map((span) => span.fitPercent)).toEqual([90, 70]);
    expect(combos[0].fitPercent).toBe(80);
  });

  it.each(['マリ', 'ルカ', 'ヒカル'])('snapshots the ranked ateji pipeline for %s', (name) => {
    const summary = generateAtejiCandidates(name, 3).map((combo) => ({
      text: combo.spans.map((span) => span.kanji ?? span.mora.join('')).join(''),
      readings: combo.spans.map((span) => span.mora.join('')),
      fit: combo.fitPercent,
    }));
    expect(summary).toMatchSnapshot();
  });

  it('returns an empty array for empty input', () => {
    expect(generateAtejiCandidates('')).toEqual([]);
  });
});

describe('atejiCredibility', () => {
  it('rates a short, all-native-sound name as high credibility', () => {
    expect(atejiCredibility('マリ').level).toBe('high');
  });

  it('rates a long name full of foreign-only mora as low credibility', () => {
    expect(atejiCredibility('ヴォルフガングディートリヒ').level).toBe('low');
  });

  it('reports mora and hard-mora counts', () => {
    const result = atejiCredibility('ヴォルフガング');
    expect(result.moraCount).toBe(6);
    expect(result.hardMoraCount).toBeGreaterThanOrEqual(1);
  });
});
