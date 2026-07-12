import anyAscii from 'any-ascii';
import * as wanakana from 'wanakana';
import nameDict from '../data/nameKatakanaDict.json';
import { ipaToKatakana } from './ipaToKatakana';
import { approximatePronunciation, type PhoneticLanguage } from './languagePhonetics';
import { applyEpenthesis } from './romajiEpenthesis';

export type KatakanaMethod = 'dictionary' | 'phonetic' | 'rule-based' | 'fallback';
export type KatakanaLanguage = 'en' | PhoneticLanguage;

export interface KatakanaResult {
  katakana: string;
  method: KatakanaMethod;
}

const { _meta: _dictMeta, ...dict } = nameDict as unknown as Record<string, string> & { _meta: unknown };

function normalizeKey(input: string): string {
  return anyAscii(input).toLowerCase().replace(/[^a-z]/g, '');
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
  if (!trimmed) return { katakana: '', method: 'fallback' };

  const key = normalizeKey(trimmed);
  if (dict[key]) {
    return { katakana: dict[key], method: 'dictionary' };
  }

  const asciiName = anyAscii(trimmed);

  if (lang === 'en') {
    const phonetic = await phoneticEnglish(asciiName);
    if (phonetic) {
      return { katakana: phonetic, method: 'phonetic' };
    }
  } else {
    const { romaji, lengthenFinalVowel } = approximatePronunciation(asciiName, lang);
    const epenthesized = applyEpenthesis(romaji);
    let katakana = wanakana.toKatakana(epenthesized);
    if (katakana && lengthenFinalVowel) {
      katakana += 'ー';
    }
    if (katakana) {
      return { katakana, method: 'rule-based' };
    }
  }

  return { katakana: wanakana.toKatakana(asciiName.toLowerCase()), method: 'fallback' };
}
