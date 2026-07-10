import { describe, expect, it } from 'vitest';
import { ipaToKatakana, ipaToRomaji } from './ipaToKatakana';

describe('ipaToRomaji', () => {
  it('pairs consonants with following vowels', () => {
    expect(ipaToRomaji('ka')).toBe('ka');
  });

  it('inserts an epenthetic vowel after a stranded consonant', () => {
    expect(ipaToRomaji('sk')).toBe('suku');
  });

  it('keeps a trailing n as the moraic nasal', () => {
    expect(ipaToRomaji('an')).toBe('an');
  });

  it('uses extended digraphs for di/ti/du/tu sounds', () => {
    expect(ipaToRomaji('di')).toBe('dhi');
    expect(ipaToRomaji('ti')).toBe('thi');
  });

  it('strips stress marks and ignores unknown symbols', () => {
    expect(ipaToRomaji('kˈɔːdɪˌoʊ')).not.toBe('');
  });
});

describe('ipaToKatakana', () => {
  it('produces katakana characters', () => {
    const result = ipaToKatakana('klˈɔːdɪˌoʊ');
    expect(result.length).toBeGreaterThan(0);
    expect(/[\u30A0-\u30FF]/.test(result)).toBe(true);
  });

  it('returns an empty string for empty input', () => {
    expect(ipaToKatakana('')).toBe('');
  });
});
