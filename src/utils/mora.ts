/**
 * Splits a katakana (or hiragana) string into mora — the rhythmic units
 * Japanese phonology and orthography are built on. Needed by the ateji
 * matching engine (each mora maps to 0-1 kanji) and by the hanko layout
 * engine (mora count drives grid sizing).
 *
 * Small kana (ァィゥェォャュョ) combine with the *preceding* character into
 * a single mora — this covers both the traditional palatalized series
 * (キャ, シュ, チョ...) and the MEXT-standardised extended katakana used
 * for foreign sounds (ヴァ, ティ, ディ, ウィ, ウォ, ファ, フィ, フォ...).
 * The geminate marker ッ, the long-vowel mark ー and the moraic nasal ン
 * are always their own mora.
 */

const SMALL_KANA = new Set(['ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ャ', 'ュ', 'ョ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゃ', 'ゅ', 'ょ']);

export function moraSegment(kana: string): string[] {
  const chars = Array.from(kana);
  const mora: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    const current = chars[i];
    const next = chars[i + 1];
    if (next && SMALL_KANA.has(next)) {
      mora.push(current + next);
      i += 1;
    } else {
      mora.push(current);
    }
  }

  return mora;
}

/** Mora considered phonetically "hard" for ateji purposes: no native kanji
 * reading ever produces these sounds, so a name containing many of them
 * will always need to fall back to katakana for at least one syllable. */
const HARD_MORA = new Set([
  'ヴ', 'ヴァ', 'ヴィ', 'ヴェ', 'ヴォ', 'ヴュ',
  'ウィ', 'ウェ', 'ウォ',
  'ティ', 'ディ', 'トゥ', 'ドゥ',
  'ファ', 'フィ', 'フェ', 'フォ', 'フュ',
  'ツァ', 'ツィ', 'ツェ', 'ツォ',
  'チェ', 'ジェ', 'シェ',
]);

export function isHardMora(mora: string): boolean {
  return HARD_MORA.has(mora);
}
