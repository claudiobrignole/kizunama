import { describe, expect, it } from 'vitest';
import { isHardMora, moraSegment } from './mora';

describe('moraSegment', () => {
  it('splits plain katakana into one mora per character', () => {
    expect(moraSegment('クラウオ')).toEqual(['ク', 'ラ', 'ウ', 'オ']);
  });

  it('merges small kana with the preceding character', () => {
    expect(moraSegment('ディオ')).toEqual(['ディ', 'オ']);
    expect(moraSegment('キャット')).toEqual(['キャ', 'ッ', 'ト']);
  });

  it('keeps the geminate marker, long-vowel mark and moraic nasal standalone', () => {
    expect(moraSegment('マリー')).toEqual(['マ', 'リ', 'ー']);
    expect(moraSegment('ワンコ')).toEqual(['ワ', 'ン', 'コ']);
    expect(moraSegment('ヴォルフガング')).toEqual(['ヴォ', 'ル', 'フ', 'ガ', 'ン', 'グ']);
  });

  it('handles the full worked examples from the reports', () => {
    expect(moraSegment('クラウディオ')).toEqual(['ク', 'ラ', 'ウ', 'ディ', 'オ']);
    expect(moraSegment('マリー')).toEqual(['マ', 'リ', 'ー']);
  });

  it('segments hiragana the same way (used for kun/nanori readings)', () => {
    expect(moraSegment('ひかる')).toEqual(['ひ', 'か', 'る']);
    expect(moraSegment('きゃく')).toEqual(['きゃ', 'く']);
  });
});

describe('isHardMora', () => {
  it('flags mora with no native kanji reading', () => {
    expect(isHardMora('ヴォ')).toBe(true);
    expect(isHardMora('ディ')).toBe(true);
    expect(isHardMora('フィ')).toBe(true);
  });

  it('does not flag ordinary mora', () => {
    expect(isHardMora('ラ')).toBe(false);
    expect(isHardMora('ン')).toBe(false);
    expect(isHardMora('ー')).toBe(false);
  });
});
