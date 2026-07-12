/**
 * Lightweight, rule-based "spelling to approximate pronunciation" rewriting
 * for languages whose orthography is fairly phonetic. Used as the fallback
 * path for names not in the curated dictionary and not run through the
 * (English-only) eSpeak-NG phonetic engine. Not linguistically exhaustive,
 * but meaningfully better than reading foreign spelling as if it were
 * English/romaji directly.
 *
 * Currently only Italian rules are shipped; English uses phonemizer/eSpeak.
 */

type Rule = [RegExp, string];

const ITALIAN_RULES: Rule[] = [
  [/ch/g, 'k'],
  [/gh/g, 'g'],
  [/gli/g, 'ly'],
  [/gn/g, 'ny'],
  [/sci/g, 'shi'],
  [/sce/g, 'she'],
  [/ci/g, 'chi'],
  [/ce/g, 'che'],
  [/gi/g, 'ji'],
  [/ge/g, 'je'],
  [/qu/g, 'kw'],
  // Any "c" not already turned into "chi"/"che" above (and not part of a
  // "ch" digraph, which was already consumed by the first rule) is a plain
  // /k/ sound — including before another consonant, e.g. Italian "cl" in
  // "Claudio". Without this, letters like "c" in a consonant cluster are
  // left as literal Latin text that wanakana cannot convert at all.
  [/c(?!h)/g, 'k'],
  [/z/g, 'ts'],
];

export type PhoneticLanguage = 'it';

const RULES: Record<PhoneticLanguage, Rule[]> = {
  it: ITALIAN_RULES,
};

export const PHONETIC_LANGUAGES: Array<{ id: PhoneticLanguage | 'en'; label: string }> = [
  { id: 'en', label: 'English' },
  { id: 'it', label: 'Italiano' },
];

export interface PhoneticApproximation {
  /** Rough romaji-ish spelling, still needing romajiEpenthesis before it is
   * safe to feed to wanakana. */
  romaji: string;
  /** Reserved for orthographies that lengthen a final vowel after stripping
   * a silent letter (historically used for French). Always false for Italian. */
  lengthenFinalVowel: boolean;
}

export function approximatePronunciation(text: string, lang: PhoneticLanguage): PhoneticApproximation {
  let result = text.toLowerCase();
  for (const [pattern, replacement] of RULES[lang]) {
    result = result.replace(pattern, replacement);
  }
  return { romaji: result, lengthenFinalVowel: false };
}
