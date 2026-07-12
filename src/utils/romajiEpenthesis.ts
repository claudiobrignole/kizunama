/**
 * Turns a rough, per-language "romaji-ish" approximation (produced by
 * languagePhonetics.ts) into a string that actually round-trips correctly
 * through `wanakana.toKatakana`.
 *
 * Two problems this solves that a bare regex-substitution pipeline cannot:
 *  1. Consonant clusters and word-final consonants that are perfectly valid
 *     in the source language (e.g. Italian "cl") are *not* valid
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

export type EpenthesisPenaltyKind =
  | 'l-to-r'
  | 'v-approximation'
  | 'epenthetic-vowel'
  | 'long-vowel-adjustment'
  | 'extended-katakana-normalization';

export const EPENTHESIS_PENALTIES: Record<EpenthesisPenaltyKind, number> = {
  'l-to-r': 10,
  'v-approximation': 15,
  'epenthetic-vowel': 8,
  'long-vowel-adjustment': 5,
  'extended-katakana-normalization': 4,
};

export interface EpenthesisPenalty {
  kind: EpenthesisPenaltyKind;
  points: number;
  /** Character range in the transformed romaji output affected by this approximation. */
  outputStart: number;
  outputEnd: number;
}

export interface EpenthesisReport {
  output: string;
  penalties: EpenthesisPenalty[];
  /** Deterministic fit: 100 minus all fixed penalties, clamped to 0. */
  fitPercent: number;
}

type Token = { kind: 'vowel' | 'nasal' | 'consonant'; text: string; source?: string };

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
      tokens.push({ kind: 'consonant', text: 'r', source: 'l' });
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

export function applyEpenthesisDetailed(
  input: string,
  options: { longVowelAdjustment?: boolean } = {},
): EpenthesisReport {
  const tokens = tokenize(input.toLowerCase());
  let out = '';
  const penalties: EpenthesisPenalty[] = [];

  const addPenalty = (kind: EpenthesisPenaltyKind, start: number, end: number) => {
    penalties.push({ kind, points: EPENTHESIS_PENALTIES[kind], outputStart: start, outputEnd: end });
  };

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
      const start = out.length;
      const joined = joinConsonantVowel(token.text, next.text);
      out += joined;
      if (token.source === 'l') addPenalty('l-to-r', start, out.length);
      if (token.text === 'v') addPenalty('v-approximation', start, out.length);
      if (joined !== token.text + next.text) addPenalty('extended-katakana-normalization', start, out.length);
      i += 1;
    } else {
      const start = out.length;
      out += token.text + epentheticVowelFor(token.text);
      if (token.source === 'l') addPenalty('l-to-r', start, out.length);
      if (token.text === 'v') addPenalty('v-approximation', start, out.length);
      addPenalty('epenthetic-vowel', start, out.length);
    }
  }

  if (options.longVowelAdjustment) {
    addPenalty('long-vowel-adjustment', Math.max(0, out.length - 1), out.length);
  }
  const fitPercent = Math.max(0, 100 - penalties.reduce((sum, penalty) => sum + penalty.points, 0));
  return { output: out, penalties, fitPercent };
}

/** Backward-compatible string-only wrapper. */
export function applyEpenthesis(input: string): string {
  return applyEpenthesisDetailed(input).output;
}
