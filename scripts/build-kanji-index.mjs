#!/usr/bin/env node
/**
 * Generates src/data/kanjiConceptIndex.json from KANJIDIC2 (via kanjidic2-json).
 *
 * KANJIDIC2 is (c) Electronic Dictionary Research and Development Group (EDRDG),
 * used under the EDRDG licence: https://www.edrdg.org/edrdg/licence.html
 * Attribution is shown in the app footer.
 *
 * This is a build-time only script (no network access needed: kanjidic2-json
 * ships the data pre-converted to JSON). Re-run with `npm run data:kanji`
 * whenever src/data/traits.json changes.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import KANJIS from 'kanjidic2-json';
import traits from '../src/data/traits.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, '../src/data/kanjiConceptIndex.json');

// Keep only kanji that are reasonably common/recognizable: jouyou/jinmeiyo
// grade-schooled kanji, or kanji with a JLPT level, or a decent frequency rank.
const MAX_FREQ = 2500;
const commonKanji = KANJIS.filter((k) => {
  if (typeof k.grade === 'number' && k.grade <= 9) return true;
  if (typeof k.jlpt === 'number') return true;
  if (typeof k.freq === 'number' && k.freq <= MAX_FREQ) return true;
  return false;
});

function normalizeWord(word) {
  return word.toLowerCase().replace(/[^a-z]/g, '');
}

function matchesKeyword(meaningEn, keywords) {
  const words = meaningEn
    .toLowerCase()
    .split(/[\s,;/-]+/)
    .map(normalizeWord)
    .filter(Boolean);
  return keywords.some((kw) => words.includes(normalizeWord(kw)));
}

const MAX_PER_TRAIT = 40;

const traitEntries = traits.map((trait) => {
  const matches = [];
  for (const k of commonKanji) {
    const meanings = k.meanings?.en ?? [];
    const hit = meanings.find((m) => matchesKeyword(m, trait.keywords));
    if (hit) {
      matches.push({
        char: k.literal,
        meaning: meanings.slice(0, 3).join(', '),
        on: (k.readings?.ja_on ?? []).slice(0, 2),
        kun: (k.readings?.ja_kun ?? []).slice(0, 2),
        jlpt: typeof k.jlpt === 'number' ? k.jlpt : null,
        freq: typeof k.freq === 'number' ? k.freq : null,
      });
    }
  }

  matches.sort((a, b) => {
    const fa = a.freq ?? Number.MAX_SAFE_INTEGER;
    const fb = b.freq ?? Number.MAX_SAFE_INTEGER;
    return fa - fb;
  });

  return {
    id: trait.id,
    label: trait.label,
    icon: trait.icon,
    kanji: matches.slice(0, MAX_PER_TRAIT),
  };
});

const totalMatches = traitEntries.reduce((sum, t) => sum + t.kanji.length, 0);
const empty = traitEntries.filter((t) => t.kanji.length === 0).map((t) => t.id);

const output = {
  generatedAt: new Date().toISOString().slice(0, 10),
  source: 'KANJIDIC2 (EDRDG licence) via kanjidic2-json',
  kanjiConsidered: commonKanji.length,
  traits: traitEntries,
};

writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));

console.log(`kanjiConceptIndex.json written: ${traitEntries.length} traits, ${totalMatches} total kanji matches (from ${commonKanji.length} common kanji considered).`);
if (empty.length) {
  console.warn(`Traits with zero matches (review keywords): ${empty.join(', ')}`);
}
