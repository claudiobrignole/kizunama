import { describe, expect, it } from 'vitest';
import { readKatakana } from './katakanaReading';

describe('readKatakana', () => {
  it('keeps open Italian syllables as separate beats', () => {
    expect(readKatakana('マルコ')).toEqual({
      pieces: [
        { kana: 'マ', reading: 'ma' },
        { kana: 'ル', reading: 'ru' },
        { kana: 'コ', reading: 'ko' },
      ],
      pronunciation: 'ma-ru-ko',
      romaji: 'maruko',
    });
  });

  it('writes a long vowel as a macron and as its own beat', () => {
    const james = readKatakana('ジェームズ');
    expect(james.romaji).toBe('jēmuzu');
    expect(james.pronunciation).toBe('je-e-mu-zu');
  });

  it('doubles the consonant after a small tsu', () => {
    const jack = readKatakana('ジャック');
    expect(jack.romaji).toBe('jakku');
    expect(jack.pronunciation).toBe('ja-kku');
  });

  it('keeps foreign combinations as one mora', () => {
    expect(readKatakana('クラウディオ').pronunciation).toBe('ku-ra-u-di-o');
    expect(readKatakana('ロレンツォ').romaji).toBe('rorentso');
    expect(readKatakana('ヴァレンティーナ').romaji).toBe('varentīna');
    expect(readKatakana('クリストファー').romaji).toBe('kurisutofā');
  });
});
