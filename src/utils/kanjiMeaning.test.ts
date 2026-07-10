import { describe, expect, it } from 'vitest';
import { generateKanjiOptions } from './kanjiMeaning';
import type { KanjiConceptIndex } from '../types';

const index: KanjiConceptIndex = {
  generatedAt: '2026-01-01',
  source: 'test',
  kanjiConsidered: 3,
  traits: [
    {
      id: 'courage',
      label: 'Courage',
      icon: '🗡️',
      kanji: [
        { char: '勇', meaning: 'courage, bravery', on: [], kun: [], jlpt: 3, freq: 800 },
        { char: '胆', meaning: 'boldness', on: [], kun: [], jlpt: null, freq: 1500 },
      ],
    },
    {
      id: 'light',
      label: 'Light',
      icon: '🔆',
      kanji: [
        { char: '明', meaning: 'bright, light', on: [], kun: [], jlpt: 4, freq: 100 },
        { char: '勇', meaning: 'courage, bravery', on: [], kun: [], jlpt: 3, freq: 800 },
      ],
    },
  ],
};

describe('generateKanjiOptions', () => {
  it('returns nothing when no traits are selected', () => {
    const result = generateKanjiOptions([], index);
    expect(result.singles).toHaveLength(0);
    expect(result.combos).toHaveLength(0);
  });

  it('ranks kanji matching multiple selected traits first', () => {
    const result = generateKanjiOptions(['courage', 'light'], index);
    expect(result.singles[0].char).toBe('勇'); // matches both traits
  });

  it('builds two-kanji combos across selected traits', () => {
    const result = generateKanjiOptions(['courage', 'light'], index);
    expect(result.combos.length).toBeGreaterThan(0);
    for (const combo of result.combos) {
      expect(combo.chars).toHaveLength(2);
      expect(combo.chars[0].char).not.toBe(combo.chars[1].char);
    }
  });

  it('builds combos from a single trait when only one is selected', () => {
    const result = generateKanjiOptions(['courage'], index);
    expect(result.combos.length).toBeGreaterThan(0);
  });

  it('ignores unknown trait ids gracefully', () => {
    const result = generateKanjiOptions(['does-not-exist'], index);
    expect(result.singles).toHaveLength(0);
  });
});
