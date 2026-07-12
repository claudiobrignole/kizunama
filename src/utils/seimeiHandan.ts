import kikkyouTable from '../data/kikkyouTable.json';

/**
 * Seimei handan (姓名判断) — the "five pillars" (五格, goko) numerology
 * built from the stroke counts of the kanji in a name, per the Kumazaki-school
 * gokaku-bōshōhō method (the dominant school, ~90% of contemporary practice).
 *
 * This is folk numerology, not an exact science, and schools genuinely
 * disagree on both the kikkyō (fortune) table (see kikkyouTable.json) and on
 * how the reisū ("phantom stroke") correction for single-character
 * names/surnames is applied. Kizunama ships ONE opinionated default
 * (Kumazaki school, shinjitai/modern stroke counts, reisū applied
 * symmetrically to Tenkaku and Chikaku) and says so explicitly in the UI —
 * see the seimeiHandan i18n copy and README.
 */

export type FortuneCategory = 'daikichi' | 'kichi' | 'hankichi' | 'kyou' | 'daikyou';

export interface KakuValue {
  strokes: number;
  category: FortuneCategory;
}

export interface SeimeiHandanResult {
  tenkaku: KakuValue;
  chikaku: KakuValue;
  jinkaku: KakuValue;
  soukaku: KakuValue;
  gaikaku: KakuValue;
}

const CATEGORIES = (kikkyouTable as { categories: Record<string, FortuneCategory> }).categories;

/** The 1-81 table is cyclical in traditional practice: numbers above 81
 * carry the same meaning as (n - 80), (n - 160), etc. */
export function classifyKakusu(strokes: number): FortuneCategory {
  const normalized = strokes <= 81 ? strokes : ((strokes - 1) % 80) + 1;
  return CATEGORIES[String(normalized)] ?? 'hankichi';
}

function kaku(strokes: number): KakuValue {
  return { strokes, category: classifyKakusu(strokes) };
}

function sum(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}

/**
 * @param surnameStrokes Stroke counts of each surname kanji, in order. Pass
 *   an empty array when the user has no (real or virtual) Japanese surname —
 *   Tenkaku/Jinkaku/Gaikaku are then computed against a 0-stroke phantom
 *   surname, and only Chikaku is meaningful in isolation.
 * @param givenStrokes Stroke counts of each given-name kanji, in order.
 */
export function computeSeimeiHandan(surnameStrokes: number[], givenStrokes: number[]): SeimeiHandanResult {
  const m = surnameStrokes.length;
  const n = givenStrokes.length;

  // Reisū (霊数): a +1 "phantom stroke" that traditional schools add when a
  // surname or given name has only a single kanji, so the pillar built from
  // "the other" character of that half of the name isn't left undefined.
  const tenkakuValue = sum(surnameStrokes) + (m === 1 ? 1 : 0);
  const chikakuValue = sum(givenStrokes) + (n === 1 ? 1 : 0);

  const lastSurnameStroke = m > 0 ? surnameStrokes[m - 1] : 0;
  const firstGivenStroke = n > 0 ? givenStrokes[0] : 0;
  const jinkakuValue = lastSurnameStroke + firstGivenStroke;

  const soukakuValue = tenkakuValue + chikakuValue;
  const gaikakuValue = soukakuValue - jinkakuValue;

  return {
    tenkaku: kaku(tenkakuValue),
    chikaku: kaku(chikakuValue),
    jinkaku: kaku(jinkakuValue),
    soukaku: kaku(soukakuValue),
    gaikaku: kaku(gaikakuValue),
  };
}
