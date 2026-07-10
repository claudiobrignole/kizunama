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

export function approximatePronunciation(text: string, lang: PhoneticLanguage): string {
  let result = text.toLowerCase();
  for (const [pattern, replacement] of RULES[lang]) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
