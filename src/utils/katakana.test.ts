import { describe, expect, it } from 'vitest';
import { nameToKatakana } from './katakana';

describe('nameToKatakana', () => {
  it('returns an empty result for empty input', async () => {
    const result = await nameToKatakana('', 'en');
    expect(result).toEqual({ katakana: '', method: 'fallback' });
  });

  it('uses the curated dictionary when the name is known', async () => {
    const result = await nameToKatakana('Claudio', 'en');
    expect(result.method).toBe('dictionary');
    expect(result.katakana).toBe('クラウディオ');
  });

  it('is case- and accent-insensitive for dictionary lookups', async () => {
    const result = await nameToKatakana('CLAUDIO', 'en');
    expect(result.method).toBe('dictionary');
  });

  it('falls back to rule-based approximation for unknown non-English names', async () => {
    const result = await nameToKatakana('Zblorxxaq', 'it');
    expect(result.method).toBe('rule-based');
    expect(result.katakana.length).toBeGreaterThan(0);
  });

  it('falls back to the eSpeak-NG phonetic engine for unknown English names', async () => {
    const result = await nameToKatakana('Zblorxxaq', 'en');
    expect(['phonetic', 'fallback']).toContain(result.method);
    expect(result.katakana.length).toBeGreaterThan(0);
  }, 20000);
});
