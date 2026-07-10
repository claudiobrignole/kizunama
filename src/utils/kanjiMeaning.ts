import type { KanjiCombo, KanjiConceptIndex, KanjiEntry, KanjiOptions } from '../types';

interface PoolEntry {
  entry: KanjiEntry;
  matchedTraits: Set<string>;
}

function freqRank(entry: KanjiEntry): number {
  return entry.freq ?? Number.MAX_SAFE_INTEGER;
}

function buildPool(traitIds: string[], index: KanjiConceptIndex): Map<string, PoolEntry> {
  const pool = new Map<string, PoolEntry>();
  for (const traitId of traitIds) {
    const group = index.traits.find((t) => t.id === traitId);
    if (!group) continue;
    for (const kanji of group.kanji) {
      const existing = pool.get(kanji.char);
      if (existing) {
        existing.matchedTraits.add(traitId);
      } else {
        pool.set(kanji.char, { entry: kanji, matchedTraits: new Set([traitId]) });
      }
    }
  }
  return pool;
}

function rankPool(pool: Map<string, PoolEntry>): PoolEntry[] {
  return Array.from(pool.values()).sort((a, b) => {
    const traitDiff = b.matchedTraits.size - a.matchedTraits.size;
    if (traitDiff !== 0) return traitDiff;
    return freqRank(a.entry) - freqRank(b.entry);
  });
}

function traitKanji(traitId: string, index: KanjiConceptIndex): KanjiEntry[] {
  const group = index.traits.find((t) => t.id === traitId);
  if (!group) return [];
  return [...group.kanji].sort((a, b) => freqRank(a) - freqRank(b));
}

const MAX_SINGLES = 8;
const MAX_COMBOS = 8;
const MAX_PICKS_PER_TRAIT = 3;

/**
 * Given 1-3 selected trait ids, returns single-kanji suggestions (ranked by
 * how many selected traits they match, then by frequency) and 2-kanji combo
 * suggestions pairing kanji from different traits (or top picks from the
 * same trait when only one is selected).
 */
export function generateKanjiOptions(traitIds: string[], index: KanjiConceptIndex): KanjiOptions {
  const uniqueTraitIds = Array.from(new Set(traitIds));
  if (uniqueTraitIds.length === 0) {
    return { singles: [], combos: [] };
  }

  const ranked = rankPool(buildPool(uniqueTraitIds, index));
  const singles = ranked.slice(0, MAX_SINGLES).map((p) => p.entry);

  const combos: KanjiCombo[] = [];
  const seenPairs = new Set<string>();

  const addCombo = (a: KanjiEntry, b: KanjiEntry) => {
    if (a.char === b.char) return;
    const key = [a.char, b.char].sort().join('');
    if (seenPairs.has(key)) return;
    seenPairs.add(key);
    combos.push({ chars: [a, b] });
  };

  if (uniqueTraitIds.length === 1) {
    const list = traitKanji(uniqueTraitIds[0], index).slice(0, MAX_PICKS_PER_TRAIT + 1);
    for (let i = 0; i < list.length && combos.length < MAX_COMBOS; i++) {
      for (let j = i + 1; j < list.length && combos.length < MAX_COMBOS; j++) {
        addCombo(list[i], list[j]);
      }
    }
  } else {
    for (let i = 0; i < uniqueTraitIds.length && combos.length < MAX_COMBOS; i++) {
      for (let j = i + 1; j < uniqueTraitIds.length && combos.length < MAX_COMBOS; j++) {
        const listA = traitKanji(uniqueTraitIds[i], index).slice(0, MAX_PICKS_PER_TRAIT);
        const listB = traitKanji(uniqueTraitIds[j], index).slice(0, MAX_PICKS_PER_TRAIT);
        for (const a of listA) {
          for (const b of listB) {
            if (combos.length >= MAX_COMBOS) break;
            addCombo(a, b);
          }
        }
      }
    }
  }

  return { singles, combos: combos.slice(0, MAX_COMBOS) };
}
