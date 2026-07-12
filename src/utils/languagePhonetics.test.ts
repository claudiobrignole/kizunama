import { describe, expect, it } from 'vitest';
import { approximatePronunciation } from './languagePhonetics';

describe('approximatePronunciation', () => {
  it('converts Italian "cl" into a plain /k/ before the epenthesis stage (Claudio)', () => {
    expect(approximatePronunciation('claudio', 'it')).toEqual({ romaji: 'klaudio', lengthenFinalVowel: false });
  });

  it('maps German w->v and v->f before the epenthesis stage (Wolfgang)', () => {
    expect(approximatePronunciation('wolfgang', 'de')).toEqual({ romaji: 'volfgang', lengthenFinalVowel: false });
  });

  it('strips a French word-final silent "e" after a vowel and flags final-vowel lengthening (Marie)', () => {
    expect(approximatePronunciation('marie', 'fr')).toEqual({ romaji: 'mari', lengthenFinalVowel: true });
  });

  it('does not strip a final "e" that follows a consonant (it is not silent-after-vowel)', () => {
    expect(approximatePronunciation('anne', 'fr')).toEqual({ romaji: 'anne', lengthenFinalVowel: false });
  });
});
