#!/usr/bin/env node
/**
 * Generates src/data/atejiIndex.json from KANJIDIC2 (via kanjidic2-json).
 *
 * KANJIDIC2 is (c) Electronic Dictionary Research and Development Group
 * (EDRDG), used under the EDRDG licence:
 * https://www.edrdg.org/edrdg/licence.html. Attribution is shown in the app
 * footer.
 *
 * Builds a katakana-reading -> kanji-candidates reverse index covering the
 * jōyō + jinmeiyō pool (~2,999 legally usable characters), used by
 * src/utils/ateji.ts to turn a name's katakana mora sequence into ranked
 * ateji (sound-based kanji) candidates.
 *
 * On readings are indexed first. Common kun readings are included only for
 * explicitly curated/boosted characters; nanori are excluded because they
 * are too context-dependent for sound-only foreign-name matching. Every
 * retained reading is indexed at its own *full* mora length —
 * there is deliberately no fixed 1-2 mora cap. Several of the best
 * single-kanji name readings span 3-4 mora (光=hikaru, 勇=isamu, 守=mamoru,
 * 一=hajime, ...); capping the index would silently drop exactly the
 * highest-quality candidates. `maxMoraLength` records the true maximum
 * found in the data so the runtime matcher knows how wide to search.
 *
 * Build-time only, no network access needed (kanjidic2-json ships the data
 * pre-converted to JSON). Re-run with `npm run data:ateji` whenever the
 * boost/block lists change.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as wanakana from 'wanakana';
import KANJIS from 'kanjidic2-json';
import { moraSegment } from '../src/utils/mora.ts';
import boostlist from '../src/data/atejiBoostlist.json' with { type: 'json' };
import blocklist from '../src/data/atejiBlocklist.json' with { type: 'json' };
import kunAllowlist from '../src/data/atejiKunAllowlist.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, '../src/data/atejiIndex.json');

const boostSet = new Set(boostlist.chars);
const blockSet = new Set(blocklist.chars);
const kunAllowedSet = new Set([...boostlist.chars, ...kunAllowlist.chars]);

// Jōyō (taught in compulsory education, grade 1-8 in kanjidic2's scheme) +
// jinmeiyō (grade 9-10, name-only characters) = the legally registrable pool.
const LEGAL_GRADES = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const legalKanji = KANJIS.filter((k) => typeof k.grade === 'number' && LEGAL_GRADES.has(k.grade));

const READING_PRIORITY = { on: 0, kun: 1 };

/** Kun readings carry an okurigana marker, e.g. "ひか.る" (hikaru) or a
 * leading/trailing "-" for bound/compound forms, e.g. "ひと-", "-なが.す".
 * For name-reading purposes the *whole* pronunciation (stem + okurigana) is
 * what gets used, e.g. 光 as a given name is read "Hikaru" in full — so we
 * strip the punctuation but keep every kana around it. */
function cleanKunReading(reading) {
  return reading.replace(/[.-]/g, '');
}

function toKatakanaReading(hiraganaOrKatakana) {
  return wanakana.toKatakana(hiraganaOrKatakana);
}

const readingsIndex = new Map();

function addReading(char, readingKatakana, readingType, meta) {
  if (!readingKatakana) return;
  const seenKey = `${char}:${readingKatakana}`;
  let bucket = readingsIndex.get(readingKatakana);
  if (!bucket) {
    bucket = new Map();
    readingsIndex.set(readingKatakana, bucket);
  }
  const existing = bucket.get(char);
  if (existing && READING_PRIORITY[existing.readingType] <= READING_PRIORITY[readingType]) {
    return; // Already have this kanji for this reading via an equal-or-better reading type.
  }
  bucket.set(char, { char, readingType, ...meta });
  void seenKey;
}

let kanjiConsidered = 0;

for (const k of legalKanji) {
  if (blockSet.has(k.literal)) continue;
  kanjiConsidered += 1;

  const strokeCount = k.strokeCounts?.[0] ?? null;
  const meaningEn = (k.meanings?.en ?? []).slice(0, 3).join(', ');
  // KANJIDIC2 does not provide Italian glosses. Until a licensed Italian
  // source is added, retain the English primary gloss as the explicit fallback.
  const meaningIt = meaningEn;
  const freq = typeof k.freq === 'number' ? k.freq : null;
  const grade = k.grade;
  const boosted = boostSet.has(k.literal);
  const meta = { strokeCount, meaningEn, meaningIt, freq, grade, boosted };

  for (const on of k.readings?.ja_on ?? []) {
    addReading(k.literal, on, 'on', meta); // ja_on is already katakana.
  }
  if (kunAllowedSet.has(k.literal)) {
    for (const kun of k.readings?.ja_kun ?? []) {
      addReading(k.literal, toKatakanaReading(cleanKunReading(kun)), 'kun', meta);
    }
  }
}

let maxMoraLength = 0;
const readings = {};
for (const [reading, bucket] of readingsIndex) {
  const candidates = Array.from(bucket.values()).sort((a, b) => {
    const pDiff = READING_PRIORITY[a.readingType] - READING_PRIORITY[b.readingType];
    if (pDiff !== 0) return pDiff;
    const boostDiff = (b.boosted ? 1 : 0) - (a.boosted ? 1 : 0);
    if (boostDiff !== 0) return boostDiff;
    const fa = a.freq ?? Number.MAX_SAFE_INTEGER;
    const fb = b.freq ?? Number.MAX_SAFE_INTEGER;
    return fa - fb;
  });
  readings[reading] = candidates;
  maxMoraLength = Math.max(maxMoraLength, moraSegment(reading).length);
}

const output = {
  generatedAt: new Date().toISOString().slice(0, 10),
  source: 'KANJIDIC2 (EDRDG licence) via kanjidic2-json',
  kanjiConsidered,
  maxMoraLength,
  readings,
};

writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));

const readingCount = Object.keys(readings).length;
console.log(
  `atejiIndex.json written: ${kanjiConsidered} kanji considered, ${readingCount} distinct readings indexed, maxMoraLength=${maxMoraLength}.`,
);
