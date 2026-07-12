import * as wanakana from 'wanakana';
import nameDict from '../data/nameKatakanaDict.json';
import { ipaToKatakana } from './ipaToKatakana';
import { approximatePronunciation, type PhoneticLanguage } from './languagePhonetics';
import { moraSegment } from './mora';
import { applyEpenthesisDetailed, type EpenthesisPenalty } from './romajiEpenthesis';

export type KatakanaMethod = 'dictionary' | 'phonetic' | 'rule-based' | 'fallback';
export type TransliterationTier = 'validated' | 'conventional' | 'approximate';
export type KatakanaLanguage = 'en' | PhoneticLanguage;

export interface KatakanaResult {
  katakana: string;
  method: KatakanaMethod;
  tier: TransliterationTier;
  alternates?: string[];
  /** Fixed fit penalties assigned to the output mora they affect. */
  moraPenaltyPoints?: number[];
}

type ConventionalEntry = { k: string; a?: string[] };

const { _meta: _dictMeta, ...dict } = nameDict as unknown as Record<string, string> & { _meta: unknown };

/** Cached load of the ENAMDICT conventional-name index (own Vite chunk). */
let conventionalNamesPromise: Promise<Record<string, ConventionalEntry>> | null = null;

export function loadJmnedictNames(): Promise<Record<string, ConventionalEntry>> {
  if (!conventionalNamesPromise) {
    conventionalNamesPromise = import('../data/jmnedictNames.json').then(
      (mod) => mod.default as Record<string, ConventionalEntry>,
    );
  }
  return conventionalNamesPromise;
}

/** Warm the JMnedict chunk during idle time after first paint. */
export function prefetchJmnedictNames(): void {
  void loadJmnedictNames();
}

function normalizeKey(input: string): string {
  return input.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z]/g, '');
}

/** Tier-1 lookup: prefer `name@lang` when EN/IT readings differ, else `name`. */
function lookupValidated(key: string, lang: KatakanaLanguage): string | undefined {
  const localized = dict[`${key}@${lang}`];
  if (localized) return localized;
  return dict[key];
}

function penaltiesByMora(outputRomaji: string, katakana: string, penalties: EpenthesisPenalty[]): number[] {
  const mora = moraSegment(katakana);
  const result = Array.from({ length: mora.length }, () => 0);
  for (const penalty of penalties) {
    const prefix = wanakana.toKatakana(outputRomaji.slice(0, penalty.outputEnd));
    const index = Math.max(0, Math.min(mora.length - 1, moraSegment(prefix).length - 1));
    result[index] += penalty.points;
  }
  return result;
}

/**
 * Lazily loads the eSpeak-NG (WASM) powered phonemizer. Only English voices
 * are bundled by the `phonemizer` package, so this is only used for the
 * "en" language option; other languages use rule-based approximation.
 */
async function phoneticEnglish(name: string): Promise<string | null> {
  try {
    const { phonemize } = await import('phonemizer');
    const parts = await phonemize(name, 'en-us');
    const ipa = parts.join(' ');
    const katakana = ipaToKatakana(ipa);
    return katakana || null;
  } catch {
    return null;
  }
}

/**
 * Converts a Western given name to katakana. Tries, in order: the curated
 * dictionary of common names, then (for English) the eSpeak-NG phonetic
 * engine, then a rule-based phonetic approximation for other languages,
 * then a direct romaji-style fallback that always produces *something*.
 */
export async function nameToKatakana(name: string, lang: KatakanaLanguage = 'en'): Promise<KatakanaResult> {
  const trimmed = name.trim();
  if (!trimmed) return { katakana: '', method: 'fallback', tier: 'approximate' };

  const key = normalizeKey(trimmed);
  // Tier 1 — curated dict (static, small): never wait on the lazy index.
  const validated = lookupValidated(key, lang);
  if (validated) {
    return { katakana: validated, method: 'dictionary', tier: 'validated' };
  }

  // Tier 2 — ENAMDICT conventional names (lazy chunk), only after tier 1 miss.
  const conventionalNames = await loadJmnedictNames();
  const conventional = conventionalNames[key];
  if (conventional) {
    return {
      katakana: conventional.k,
      method: 'dictionary',
      tier: 'conventional',
      alternates: conventional.a,
    };
  }

  const asciiName = trimmed.normalize('NFKD').replace(/\p{M}/gu, '');

  if (lang === 'en') {
    const phonetic = await phoneticEnglish(asciiName);
    if (phonetic) {
      return { katakana: phonetic, method: 'phonetic', tier: 'approximate' };
    }
  } else {
    const { romaji, lengthenFinalVowel } = approximatePronunciation(asciiName, lang);
    const report = applyEpenthesisDetailed(romaji, { longVowelAdjustment: lengthenFinalVowel });
    let katakana = wanakana.toKatakana(report.output);
    if (katakana && lengthenFinalVowel) {
      katakana += 'ー';
    }
    if (katakana) {
      return {
        katakana,
        method: 'rule-based',
        tier: 'approximate',
        moraPenaltyPoints: penaltiesByMora(report.output, katakana, report.penalties),
      };
    }
  }

  return {
    katakana: wanakana.toKatakana(asciiName.toLowerCase()),
    method: 'fallback',
    tier: 'approximate',
  };
}
