import { describe, expect, it } from 'vitest';
import { approximatePronunciation } from './languagePhonetics';

describe('approximatePronunciation', () => {
  it('converts Italian "cl" into a plain /k/ before the epenthesis stage (Claudio)', () => {
    expect(approximatePronunciation('claudio', 'it')).toEqual({ romaji: 'klaudio', lengthenFinalVowel: false });
  });

  it('maps Italian digraphs (gn, gli, sci)', () => {
    expect(approximatePronunciation('gnocchi', 'it').romaji).toBe('nyokki');
  });
});
