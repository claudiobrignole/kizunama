/**
 * Turns a rough, per-language "romaji-ish" approximation (produced by
 * languagePhonetics.ts) into a string that actually round-trips correctly
 * through `wanakana.toKatakana`.
 *
 * Two problems this solves that a bare regex-substitution pipeline cannot:
 *  1. Consonant clusters and word-final consonants that are perfectly valid
 *     in the source language (it "cl", de "lf"/"ng"...) are *not* valid
 *     Japanese mora and must be broken up with an epenthetic vowel — /u/ by
 *     default, /o/ after t/d (to avoid the affricated tsu/dzu), /i/ after
 *     ch/j — exactly as real gairaigo transliteration does.
 *  2. "l" has no Japanese equivalent and always maps to the ラ row.
 *
 * The digraph coaxing for t+i/t+u/d+i/d+u/w+o mirrors the trick already
 * used in ipaToKatakana.ts: wanakana's *plain* romaji table maps these to
 * the native chi/tsu/ji/zu/wo kana, but inserting a silent "h"/"w" forces
 * it down the extended-katakana path (ティ/トゥ/ディ/ドゥ/ウォ) used for
 * foreign sounds.
 */

const VOWELS = new Set(['a', 'i', 'u', 'e', 'o']);
const CONSONANT_DIGRAPHS = ['ny', 'sh', 'ch', 'ts', 'dz'];

type Token = { kind: 'vowel' | 'nasal' | 'consonant'; text: string };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const two = input.slice(i, i + 2);
    if (CONSONANT_DIGRAPHS.includes(two)) {
      tokens.push({ kind: 'consonant', text: two });
      i += 2;
      continue;
    }
    const c = input[i];
    if (VOWELS.has(c)) {
      tokens.push({ kind: 'vowel', text: c });
    } else if (c === 'n') {
      tokens.push({ kind: 'nasal', text: 'n' });
    } else if (c === 'l') {
      tokens.push({ kind: 'consonant', text: 'r' });
    } else {
      tokens.push({ kind: 'consonant', text: c });
    }
    i += 1;
  }
  return tokens;
}

/** Coax wanakana into the extended-katakana form for foreign-sound digraphs
 * instead of the native chi/tsu/ji/zu/wo it would otherwise produce. */
function joinConsonantVowel(consonant: string, vowel: string): string {
  if (consonant === 't' && vowel === 'i') return 'thi';
  if (consonant === 't' && vowel === 'u') return 'twu';
  if (consonant === 'd' && vowel === 'i') return 'dhi';
  if (consonant === 'd' && vowel === 'u') return 'dwu';
  if (consonant === 'w' && vowel === 'o') return 'who';
  return consonant + vowel;
}

function epentheticVowelFor(consonant: string): string {
  if (consonant === 't' || consonant === 'd') return 'o';
  if (consonant === 'ch' || consonant === 'j') return 'i';
  return 'u';
}

export function applyEpenthesis(input: string): string {
  const tokens = tokenize(input.toLowerCase());
  let out = '';

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const next = tokens[i + 1];

    if (token.kind === 'vowel') {
      out += token.text;
      continue;
    }

    if (token.kind === 'nasal') {
      if (next && next.kind === 'vowel') {
        out += 'n' + next.text;
        i += 1;
      } else {
        out += 'n';
      }
      continue;
    }

    // Consonant.
    if (next && next.kind === 'vowel') {
      out += joinConsonantVowel(token.text, next.text);
      i += 1;
    } else {
      out += token.text + epentheticVowelFor(token.text);
    }
  }

  return out;
}
