import { describe, expect, it } from 'vitest';
import { nameToKatakana } from './katakana';

describe('nameToKatakana', () => {
  it('returns an empty result for empty input', async () => {
    const result = await nameToKatakana('', 'en');
    expect(result).toEqual({ katakana: '', method: 'fallback', tier: 'approximate' });
  });

  it('uses the curated dictionary when the name is known', async () => {
    const result = await nameToKatakana('Claudio', 'en');
    expect(result.method).toBe('dictionary');
    expect(result.tier).toBe('validated');
    expect(result.katakana).toBe('クラウディオ');
  });

  it('applies language-specific validated readings when EN and IT differ', async () => {
    const en = await nameToKatakana('Laura', 'en');
    const it = await nameToKatakana('Laura', 'it');
    expect(en.tier).toBe('validated');
    expect(it.tier).toBe('validated');
    expect(en.katakana).toBe('ローラ');
    expect(it.katakana).toBe('ラウラ');
  });

  it('uses newly validated English entries from the production dictionary', async () => {
    const result = await nameToKatakana('Aaliyah', 'en');
    expect(result.tier).toBe('validated');
    expect(result.katakana).toBe('アリーヤ');
  });

  it('uses ENAMDICT after the curated dictionary', async () => {
    const result = await nameToKatakana('Abbado', 'it');
    expect(result.tier).toBe('conventional');
    expect(result.katakana).toBe('アッバード');
  });

  it('is case- and accent-insensitive for dictionary lookups', async () => {
    const result = await nameToKatakana('CLAUDIO', 'en');
    expect(result.method).toBe('dictionary');
  });

  it('falls back to rule-based approximation for unknown non-English names', async () => {
    const result = await nameToKatakana('Zblorxxaq', 'it');
    expect(result.method).toBe('rule-based');
    expect(result.tier).toBe('approximate');
    expect(result.katakana.length).toBeGreaterThan(0);
  });

  it('falls back to the eSpeak-NG phonetic engine for unknown English names', async () => {
    const result = await nameToKatakana('Zblorxxaq', 'en');
    expect(['phonetic', 'fallback']).toContain(result.method);
    expect(result.tier).toBe('approximate');
    expect(result.katakana.length).toBeGreaterThan(0);
  }, 20000);

  // Reference outputs from the ateji-pivot research reports. Claudio is also
  // present in the curated dictionary; Klaudino exercises the rule-based
  // engine directly (bypassing the dictionary short-circuit).
  describe('reference outputs from the ateji-pivot reports', () => {
    it('Claudio (it) -> クラウディオ', async () => {
      const result = await nameToKatakana('Claudio', 'it');
      expect(result.katakana).toBe('クラウディオ');
    });

    it('the rule-based Italian engine alone produces the expected output', async () => {
      const claudino = await nameToKatakana('Klaudino', 'it');
      expect(claudino.method).toBe('rule-based');
      expect(claudino.katakana).toBe('クラウディノ');
    });
  });
});
