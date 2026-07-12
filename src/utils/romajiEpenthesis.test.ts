import { describe, expect, it } from 'vitest';
import * as wanakana from 'wanakana';
import { applyEpenthesis } from './romajiEpenthesis';

describe('applyEpenthesis', () => {
  it('breaks the Italian "cl" cluster with an epenthetic vowel and coaxes extended ディ', () => {
    // "Claudio" -> Italian rules produce "klaudio" -> クラウディオ
    expect(applyEpenthesis('klaudio')).toBe('kuraudhio');
    expect(wanakana.toKatakana(applyEpenthesis('klaudio'))).toBe('クラウディオ');
  });

  it('breaks German final consonant clusters (lf/ng) and maps l -> r', () => {
    // "Wolfgang" -> German rules produce "volfgang" -> ヴォルフガング
    expect(applyEpenthesis('volfgang')).toBe('vorufugangu');
    expect(wanakana.toKatakana(applyEpenthesis('volfgang'))).toBe('ヴォルフガング');
  });

  it('does not disturb a plain consonant+vowel sequence', () => {
    expect(applyEpenthesis('mari')).toBe('mari');
  });
});
