import { moraSegment } from './mora.ts';

/**
 * Mora → Hepburn reading for the katakana this site actually emits,
 * including the extended combinations used for foreign names
 * (ティ, ディ, ファ, ヴァ, チェ, ツォ, …).
 * ッ and ー are handled by the walker, not this map.
 */
const MORA_READING: Record<string, string> = {
  ア: 'a', イ: 'i', ウ: 'u', エ: 'e', オ: 'o',
  カ: 'ka', キ: 'ki', ク: 'ku', ケ: 'ke', コ: 'ko',
  サ: 'sa', シ: 'shi', ス: 'su', セ: 'se', ソ: 'so',
  タ: 'ta', チ: 'chi', ツ: 'tsu', テ: 'te', ト: 'to',
  ナ: 'na', ニ: 'ni', ヌ: 'nu', ネ: 'ne', ノ: 'no',
  ハ: 'ha', ヒ: 'hi', フ: 'fu', ヘ: 'he', ホ: 'ho',
  マ: 'ma', ミ: 'mi', ム: 'mu', メ: 'me', モ: 'mo',
  ヤ: 'ya', ユ: 'yu', ヨ: 'yo',
  ラ: 'ra', リ: 'ri', ル: 'ru', レ: 're', ロ: 'ro',
  ワ: 'wa', ヲ: 'o', ン: 'n',
  ガ: 'ga', ギ: 'gi', グ: 'gu', ゲ: 'ge', ゴ: 'go',
  ザ: 'za', ジ: 'ji', ズ: 'zu', ゼ: 'ze', ゾ: 'zo',
  ダ: 'da', ヂ: 'ji', ヅ: 'zu', デ: 'de', ド: 'do',
  バ: 'ba', ビ: 'bi', ブ: 'bu', ベ: 'be', ボ: 'bo',
  パ: 'pa', ピ: 'pi', プ: 'pu', ペ: 'pe', ポ: 'po',
  ヴ: 'vu',
  キャ: 'kya', キュ: 'kyu', キョ: 'kyo',
  シャ: 'sha', シュ: 'shu', ショ: 'sho',
  チャ: 'cha', チュ: 'chu', チョ: 'cho',
  ニャ: 'nya', ニュ: 'nyu', ニョ: 'nyo',
  ヒャ: 'hya', ヒュ: 'hyu', ヒョ: 'hyo',
  ミャ: 'mya', ミュ: 'myu', ミョ: 'myo',
  リャ: 'rya', リュ: 'ryu', リョ: 'ryo',
  ギャ: 'gya', ギュ: 'gyu', ギョ: 'gyo',
  ジャ: 'ja', ジュ: 'ju', ジョ: 'jo',
  ビャ: 'bya', ビュ: 'byu', ビョ: 'byo',
  ピャ: 'pya', ピュ: 'pyu', ピョ: 'pyo',
  ティ: 'ti', ディ: 'di', トゥ: 'tu', ドゥ: 'du',
  テュ: 'tyu', デュ: 'dyu',
  ファ: 'fa', フィ: 'fi', フェ: 'fe', フォ: 'fo', フュ: 'fyu',
  ヴァ: 'va', ヴィ: 'vi', ヴェ: 've', ヴォ: 'vo',
  チェ: 'che', シェ: 'she', ジェ: 'je',
  ツァ: 'tsa', ツィ: 'tsi', ツェ: 'tse', ツォ: 'tso',
  ウィ: 'wi', ウェ: 'we', ウォ: 'wo',
  イェ: 'ye',
};

const MACRON: Record<string, string> = { a: 'ā', i: 'ī', u: 'ū', e: 'ē', o: 'ō' };

export interface KanaPiece {
  kana: string;
  /** Furigana for this mora. ッ shows the consonant it doubles. */
  reading: string;
}

export interface KatakanaReading {
  pieces: KanaPiece[];
  /** Mora beats separated by hyphens: マルコ → ma-ru-ko */
  pronunciation: string;
  /** Hepburn, long vowels as macrons: ジェームズ → jēmuzu */
  romaji: string;
}

function readingFor(mora: string, katakana: string): string {
  const reading = MORA_READING[mora];
  if (!reading) throw new Error(`Unmapped katakana mora ${mora} in ${katakana}`);
  return reading;
}

function consonantOf(reading: string): string {
  return reading.match(/^[^aeiou]+/)?.[0] ?? '';
}

function plainVowel(syllable: string): string {
  const vowel = syllable.normalize('NFD').match(/[aeiou](?!.*[aeiou])/u)?.[0];
  return vowel ?? '';
}

/** Split a katakana name into furigana, a spoken beat string, and romaji. */
export function readKatakana(katakana: string): KatakanaReading {
  const mora = moraSegment(katakana);
  const pieces: KanaPiece[] = [];
  const spoken: string[] = [];
  const romajiParts: string[] = [];

  for (let i = 0; i < mora.length; i++) {
    const current = mora[i];

    if (current === 'ッ' || current === 'っ') {
      const next = mora[i + 1];
      if (!next || next === 'ー') throw new Error(`ッ without a following mora in ${katakana}`);
      pieces.push({ kana: current, reading: consonantOf(readingFor(next, katakana)) });
      continue;
    }

    if (current === 'ー') {
      const prev = romajiParts[romajiParts.length - 1] ?? '';
      const vowel = plainVowel(prev);
      const macron = MACRON[vowel] ?? vowel;
      if (prev && macron) {
        romajiParts[romajiParts.length - 1] = prev.replace(/[aeiouāīūēō]$/u, macron);
      }
      pieces.push({ kana: current, reading: vowel || '–' });
      spoken.push(vowel || '–');
      continue;
    }

    const reading = readingFor(current, katakana);
    const geminate = i > 0 && (mora[i - 1] === 'ッ' || mora[i - 1] === 'っ');
    const doubled = geminate ? `${consonantOf(reading)}${reading}` : reading;
    pieces.push({ kana: current, reading });
    spoken.push(doubled);
    romajiParts.push(doubled);
  }

  return {
    pieces,
    pronunciation: spoken.join('-'),
    romaji: romajiParts.join(''),
  };
}
