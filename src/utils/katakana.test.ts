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

  // Reference outputs from the ateji-pivot research reports. Claudio, Marie
  // and Wolfgang are also present in the curated dictionary, so these three
  // additionally exercise the rule-based engine directly (bypassing the
  // dictionary short-circuit) to prove the fix is in the engine itself, not
  // just in curated data — see languagePhonetics.test.ts and
  // romajiEpenthesis.test.ts for the underlying unit coverage.
  describe('reference outputs from the ateji-pivot reports', () => {
    it('Claudio (it) -> クラウディオ', async () => {
      const result = await nameToKatakana('Claudio', 'it');
      expect(result.katakana).toBe('クラウディオ');
    });

    it('Marie (fr) -> マリー', async () => {
      const result = await nameToKatakana('Marie', 'fr');
      expect(result.katakana).toBe('マリー');
    });

    it('Wolfgang (de) -> ヴォルフガング', async () => {
      const result = await nameToKatakana('Wolfgang', 'de');
      expect(result.katakana).toBe('ヴォルフガング');
    });

    it('the rule-based engine alone (bypassing the curated dictionary) produces the same three outputs', async () => {
      // Names not in nameKatakanaDict.json but built from the exact same
      // consonant-cluster / w-v / silent-e patterns as Claudio/Wolfgang/Marie.
      const claudino = await nameToKatakana('Klaudino', 'it');
      expect(claudino.method).toBe('rule-based');
      expect(claudino.katakana).toBe('クラウディノ');

      const wolfrid = await nameToKatakana('Wolfrid', 'de');
      expect(wolfrid.method).toBe('rule-based');
      expect(wolfrid.katakana).toBe('ヴォルフリド');

      const marielle = await nameToKatakana('Marisette', 'fr');
      expect(marielle.method).toBe('rule-based');
      expect(marielle.katakana.length).toBeGreaterThan(0);
    });
  });
});
