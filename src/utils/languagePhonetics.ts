/**
 * Lightweight, rule-based "spelling to approximate pronunciation" rewriting
 * for languages whose orthography is fairly phonetic. Used as the fallback
 * path for names not in the curated dictionary and not run through the
 * (English-only) eSpeak-NG phonetic engine. Not linguistically exhaustive,
 * but meaningfully better than reading foreign spelling as if it were
 * English/romaji directly.
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

const SPANISH_RULES: Rule[] = [
  [/ll/g, 'y'],
  [/rr/g, 'r'],
  [/ñ/g, 'ny'],
  [/j/g, 'h'],
  [/qu/g, 'k'],
  [/gui/g, 'gi'],
  [/gue/g, 'ge'],
  [/ge/g, 'he'],
  [/gi/g, 'hi'],
  [/z/g, 's'],
  [/h/g, ''],
];

const GERMAN_RULES: Rule[] = [
  [/sch/g, 'sh'],
  [/tsch/g, 'ch'],
  [/ei/g, 'ai'],
  [/ie/g, 'ii'],
  [/eu/g, 'oi'],
  [/äu/g, 'oi'],
  [/ä/g, 'e'],
  [/ö/g, 'oe'],
  [/ü/g, 'yu'],
  [/ch/g, 'h'],
  [/v/g, 'f'],
  [/w/g, 'v'],
  [/z/g, 'ts'],
  [/j/g, 'y'],
];

const PORTUGUESE_RULES: Rule[] = [
  [/lh/g, 'ly'],
  [/nh/g, 'ny'],
  [/ch/g, 'sh'],
  [/qu/g, 'k'],
  [/gu/g, 'g'],
  [/ão/g, 'aun'],
  [/ç/g, 's'],
  [/j/g, 'j'],
  [/z/g, 'z'],
];

const FRENCH_RULES: Rule[] = [
  [/ch/g, 'sh'],
  [/qu/g, 'k'],
  [/gn/g, 'ny'],
  [/eau/g, 'o'],
  [/au/g, 'o'],
  [/ou/g, 'u'],
  [/eu/g, 'e'],
  [/oi/g, 'oa'],
  [/gue/g, 'ge'],
  [/gui/g, 'gi'],
  [/qu/g, 'k'],
  [/ille/g, 'iy'],
  [/j/g, 'j'],
  [/h/g, ''],
];

export type PhoneticLanguage = 'it' | 'es' | 'de' | 'pt' | 'fr';

const RULES: Record<PhoneticLanguage, Rule[]> = {
  it: ITALIAN_RULES,
  es: SPANISH_RULES,
  de: GERMAN_RULES,
  pt: PORTUGUESE_RULES,
  fr: FRENCH_RULES,
};

export const PHONETIC_LANGUAGES: Array<{ id: PhoneticLanguage | 'en'; label: string }> = [
  { id: 'en', label: 'English' },
  { id: 'it', label: 'Italiano' },
  { id: 'es', label: 'Español' },
  { id: 'fr', label: 'Français' },
  { id: 'de', label: 'Deutsch' },
  { id: 'pt', label: 'Português' },
];

export interface PhoneticApproximation {
  /** Rough romaji-ish spelling, still needing romajiEpenthesis before it is
   * safe to feed to wanakana. */
  romaji: string;
  /** French names very commonly end in a silent "e" that leaves the
   * preceding vowel stressed and open (Marie, Sophie, Amélie...). The
   * established Japanese transliteration convention lengthens that final
   * vowel with a chōonpu (マリー, not マリ) rather than dropping it or
   * reading the "e" aloud (which wanakana would otherwise do, producing
   * マリエ). */
  lengthenFinalVowel: boolean;
}

/** Word-final "vowel + silent e" (Marie, Sophie, Amélie, Renée...). Only
 * strips the trailing "e" when it is not itself needed to carry a sound
 * (i.e. it directly follows a vowel letter, not a consonant). */
const FRENCH_SILENT_FINAL_E = /([aeiou])e$/;

export function approximatePronunciation(text: string, lang: PhoneticLanguage): PhoneticApproximation {
  let source = text.toLowerCase();
  let lengthenFinalVowel = false;

  if (lang === 'fr' && FRENCH_SILENT_FINAL_E.test(source)) {
    source = source.slice(0, -1);
    lengthenFinalVowel = true;
  }

  let result = source;
  for (const [pattern, replacement] of RULES[lang]) {
    result = result.replace(pattern, replacement);
  }
  return { romaji: result, lengthenFinalVowel };
}
