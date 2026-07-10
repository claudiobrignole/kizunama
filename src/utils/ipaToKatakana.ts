import * as wanakana from 'wanakana';

/**
 * Approximate IPA -> Japanese mora mapping used only as a fallback for names
 * that are not found in the curated dictionary. This is a simplification of
 * standard gairaigo (foreign loanword) transliteration conventions, not a
 * linguistically exhaustive mapping. Longest symbols are matched first.
 */
const VOWELS: Array<[string, string]> = [
  ['aɪ', 'ai'], ['aʊ', 'au'], ['eɪ', 'ei'], ['oʊ', 'ou'], ['ɔɪ', 'oi'],
  ['iː', 'i'], ['uː', 'u'], ['ɑː', 'a'], ['ɔː', 'o'], ['ɜː', 'a'],
  ['i', 'i'], ['ɪ', 'i'], ['e', 'e'], ['ɛ', 'e'], ['æ', 'a'],
  ['a', 'a'], ['ɑ', 'a'], ['ʌ', 'a'], ['ə', 'a'], ['ɐ', 'a'],
  ['u', 'u'], ['ʊ', 'u'], ['o', 'o'], ['ɔ', 'o'], ['ɒ', 'o'],
  ['y', 'yu'], ['ø', 'e'], ['œ', 'e'],
];

const CONSONANTS: Array<[string, string]> = [
  ['tʃ', 'ch'], ['dʒ', 'j'], ['ts', 'ts'], ['dz', 'z'],
  ['p', 'p'], ['b', 'b'], ['t', 't'], ['d', 'd'], ['k', 'k'], ['ɡ', 'g'], ['g', 'g'],
  ['f', 'f'], ['v', 'v'], ['θ', 's'], ['ð', 'z'], ['s', 's'], ['z', 'z'],
  ['ʃ', 'sh'], ['ʒ', 'j'], ['h', 'h'], ['x', 'h'], ['ç', 'h'],
  ['m', 'm'], ['n', 'n'], ['ŋ', 'n'], ['ɲ', 'ny'],
  ['l', 'r'], ['ɹ', 'r'], ['r', 'r'], ['ɾ', 'r'],
  ['j', 'y'], ['w', 'w'],
];

const IGNORED = new Set(['ˈ', 'ˌ', '.', ' ', "'", '̩', '̃', 'ː']);

/**
 * wanakana's default romaji table maps plain "ti"/"tu"/"di"/"du" to the
 * traditional kana (chi/tsu/ji/zu family) rather than the extended katakana
 * used for foreign sounds (ティ/トゥ/ディ/ドゥ). These digraphs coax it into
 * the extended forms.
 */
function joinConsonantVowel(consonant: string, vowel: string): string {
  if (consonant === 't' && vowel === 'i') return 'thi';
  if (consonant === 't' && vowel === 'u') return 'twu';
  if (consonant === 'd' && vowel === 'i') return 'dhi';
  if (consonant === 'd' && vowel === 'u') return 'dwu';
  return consonant + vowel;
}

type Token = { kind: 'vowel' | 'consonant'; romaji: string };

function tokenizeIpa(ipa: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const chars = Array.from(ipa);
  while (i < chars.length) {
    const remaining = chars.slice(i).join('');
    if (IGNORED.has(chars[i])) {
      i += 1;
      continue;
    }
    let matched = false;
    for (const [symbol, romaji] of [...CONSONANTS, ...VOWELS].sort((a, b) => b[0].length - a[0].length)) {
      if (remaining.startsWith(symbol)) {
        const kind: Token['kind'] = VOWELS.some(([s]) => s === symbol) ? 'vowel' : 'consonant';
        tokens.push({ kind, romaji });
        i += symbol.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Unknown symbol: skip it rather than corrupting the output.
      i += 1;
    }
  }
  return tokens;
}

/**
 * Groups IPA-derived tokens into Japanese-mora-friendly romaji, inserting an
 * epenthetic "u" after consonants that are not followed by a vowel (the
 * standard convention when transliterating closed syllables), except for
 * a trailing "n" which maps to the moraic nasal.
 */
export function ipaToRomaji(ipa: string): string {
  const tokens = tokenizeIpa(ipa);
  let romaji = '';

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const next = tokens[i + 1];

    if (token.kind === 'vowel') {
      romaji += token.romaji;
      continue;
    }

    // Consonant token.
    if (next && next.kind === 'vowel') {
      romaji += joinConsonantVowel(token.romaji, next.romaji);
      i += 1; // consume the vowel
    } else if (token.romaji === 'n') {
      romaji += 'n';
    } else {
      // Consonant with no following vowel: add epenthetic "u" (e.g. "su", "ku"),
      // "to" is the convention for a trailing "t"/"d".
      romaji += token.romaji === 't' || token.romaji === 'd' ? `${token.romaji}o` : `${token.romaji}u`;
    }
  }

  return romaji;
}

export function ipaToKatakana(ipa: string): string {
  const romaji = ipaToRomaji(ipa);
  if (!romaji) return '';
  return wanakana.toKatakana(romaji);
}
