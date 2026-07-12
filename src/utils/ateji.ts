import { isHardMora, moraSegment } from './mora';

export interface AtejiIndexCandidate {
  char: string;
  readingType: 'on' | 'kun';
  strokeCount: number | null;
  meaningEn: string;
  meaningIt: string;
  freq: number | null;
  grade: number;
  boosted: boolean;
}

interface AtejiIndex {
  generatedAt: string;
  source: string;
  kanjiConsidered: number;
  maxMoraLength: number;
  readings: Record<string, AtejiIndexCandidate[]>;
}

/** Cached load of the ~1 MB reading index (own Vite chunk). */
let atejiIndexPromise: Promise<AtejiIndex> | null = null;

export function loadAtejiIndex(): Promise<AtejiIndex> {
  if (!atejiIndexPromise) {
    atejiIndexPromise = import('../data/atejiIndex.json').then(
      (mod) => mod.default as unknown as AtejiIndex,
    );
  }
  return atejiIndexPromise;
}

/** Warm the ateji chunk during idle time after first paint. */
export function prefetchAtejiIndex(): void {
  void loadAtejiIndex();
}

const READING_TYPE_WEIGHT: Record<AtejiIndexCandidate['readingType'], number> = {
  on: 100,
  kun: 60,
};

/** How many alternate kanji to consider per matched mora-span. Keeping this
 * small bounds the DP's branching factor; the reading index is already
 * sorted best-first (on > curated kun, boosted, then lower freq). */
const CANDIDATES_PER_SPAN = 6;

/** How many partial paths to keep at each mora position (beam search width),
 * so the search stays linear in name length instead of exponential. */
const BEAM_WIDTH = 8;

const UNMATCHED_MORA_PENALTY = -60;

export interface AtejiSpan {
  /** The mora (from the input katakana) this span consumes. */
  mora: string[];
  /** null when no kanji reading covers this span — rendered as bare katakana. */
  kanji: string | null;
  readingType?: AtejiIndexCandidate['readingType'];
  strokeCount?: number | null;
  meaningEn?: string;
  meaningIt?: string;
  boosted?: boolean;
  /** 100 minus fixed approximation penalties affecting this mora span. */
  fitPercent: number;
}

export interface AtejiCombo {
  spans: AtejiSpan[];
  /** Sum of per-span scores, used only for ranking — not shown to users. */
  score: number;
  unmatchedMoraCount: number;
  kanjiCount: number;
  /** Mora-length-weighted mean of the matched Kanji fit percentages. */
  fitPercent: number;
}

interface PartialPath {
  spans: AtejiSpan[];
  score: number;
  spanCount: number;
  unmatchedMoraCount: number;
}

/** Ranking key for both beam pruning and the final sort: *average* score
 * per span used, not the raw sum. Summing would systematically favour
 * chopping a name into many 1-mora spans (three so-so nanori matches
 * always out-sum one excellent 3-mora match), which is the opposite of
 * what makes ateji look natural — one kanji explaining more of the sound
 * is the better outcome, and should win even though it contributes only a
 * single term to the path. */
function averageScore(path: Pick<PartialPath, 'score' | 'spanCount'>): number {
  return path.spanCount > 0 ? path.score / path.spanCount : 0;
}

function spanScore(span: AtejiSpan): number {
  if (!span.kanji) {
    return UNMATCHED_MORA_PENALTY * span.mora.length;
  }
  let score = READING_TYPE_WEIGHT[span.readingType ?? 'kun'];
  // Jōyō (grade 1-8) reads as more familiar/standard than jinmeiyō (9-10).
  score += 10;
  if (span.boosted) score += 15;
  // Longer spans (one kanji covering more mora) reflect a "cleaner" sound
  // match and are rewarded — this is what favours 光=hikaru (1 kanji, 3
  // mora) over spelling the same sound with multiple 1-mora kanji.
  score += span.mora.length * 30;
  return score;
}

function maxSpanFor(index: AtejiIndex, remainingMora: number): number {
  return Math.min(index.maxMoraLength, remainingMora);
}

function candidatesForSpan(index: AtejiIndex, moraSlice: string[]): AtejiIndexCandidate[] {
  const key = moraSlice.join('');
  return index.readings[key] ?? [];
}

/**
 * All known kanji candidates for an exact mora slice (e.g. ['ヒ','カ','ル']),
 * sorted best-first. Used by the UI's per-mora "swap this Kanji" control so
 * a user can pick a different candidate than the one the ranking engine
 * chose automatically, without having to accept or reject an entire
 * alternate name combination.
 */
export async function candidatesForReading(moraSlice: string[]): Promise<AtejiIndexCandidate[]> {
  const index = await loadAtejiIndex();
  return candidatesForSpan(index, moraSlice);
}

function generateAtejiCandidatesSync(
  index: AtejiIndex,
  katakanaName: string,
  maxResults = 8,
  moraPenaltyPoints: number[] = [],
): AtejiCombo[] {
  const mora = moraSegment(katakanaName);
  if (mora.length === 0) return [];

  // beams[i] = best partial paths covering mora[0..i).
  const beams: PartialPath[][] = Array.from({ length: mora.length + 1 }, () => []);
  beams[0] = [{ spans: [], score: 0, spanCount: 0, unmatchedMoraCount: 0 }];

  for (let end = 1; end <= mora.length; end++) {
    const extensions: PartialPath[] = [];

    for (let len = 1; len <= maxSpanFor(index, end); len++) {
      const start = end - len;
      const prefixBeam = beams[start];
      if (prefixBeam.length === 0) continue;

      const moraSlice = mora.slice(start, end);
      // Each approximation is assigned to one output mora by the
      // transliteration stage. A Kanji's fit starts at 100 and loses every
      // fixed penalty in the mora span it covers.
      const fitPercent = Math.max(
        0,
        100 - moraPenaltyPoints.slice(start, end).reduce((sum, points) => sum + points, 0),
      );
      const candidates = candidatesForSpan(index, moraSlice).slice(0, CANDIDATES_PER_SPAN);

      const spanOptions: AtejiSpan[] =
        candidates.length > 0
          ? candidates.map((c) => ({
              mora: moraSlice,
              kanji: c.char,
              readingType: c.readingType,
              strokeCount: c.strokeCount,
              meaningEn: c.meaningEn,
              meaningIt: c.meaningIt,
              boosted: c.boosted,
              fitPercent,
            }))
          : len === 1
            ? [{ mora: moraSlice, kanji: null, fitPercent }] // Unmatched fallback only at 1-mora granularity.
            : [];

      for (const span of spanOptions) {
        const score = spanScore(span);
        const unmatchedDelta = span.kanji ? 0 : span.mora.length;
        for (const prefix of prefixBeam) {
          extensions.push({
            spans: [...prefix.spans, span],
            score: prefix.score + score,
            spanCount: prefix.spanCount + 1,
            unmatchedMoraCount: prefix.unmatchedMoraCount + unmatchedDelta,
          });
        }
      }
    }

    extensions.sort((a, b) => averageScore(b) - averageScore(a));
    beams[end] = extensions.slice(0, BEAM_WIDTH);
  }

  const finalPaths = [...beams[mora.length]].sort((a, b) => averageScore(b) - averageScore(a));
  const combos: AtejiCombo[] = finalPaths.map((path) => {
    const matched = path.spans.filter((span) => span.kanji);
    const matchedMora = matched.reduce((sum, span) => sum + span.mora.length, 0);
    const fitPercent = matchedMora
      ? Math.round(matched.reduce((sum, span) => sum + span.fitPercent * span.mora.length, 0) / matchedMora)
      : 0;
    return {
      spans: path.spans,
      score: path.score,
      unmatchedMoraCount: path.unmatchedMoraCount,
      kanjiCount: matched.length,
      fitPercent,
    };
  });

  // De-duplicate combos that resolve to the exact same kanji sequence
  // (can happen when different mora segmentations land on the same chars).
  const seen = new Set<string>();
  const unique: AtejiCombo[] = [];
  for (const combo of combos) {
    const key = combo.spans.map((s) => s.kanji ?? `[${s.mora.join('')}]`).join('');
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(combo);
  }

  return unique.slice(0, maxResults);
}

/**
 * Generates ranked ateji (sound-based kanji) candidate combinations for a
 * katakana name, covering every mora with either a matched kanji or an
 * explicit "no clean kanji" gap (rendered as bare katakana for that mora).
 *
 * Uses variable-length mora spans (1 kanji can cover 1-N mora, N derived
 * from the built index — see build-ateji-index.mjs) rather than a fixed
 * 1-2 mora window, so curated 3-4 mora kun readings like 光=hikaru are not
 * silently excluded.
 */
export async function generateAtejiCandidates(
  katakanaName: string,
  maxResults = 8,
  moraPenaltyPoints: number[] = [],
): Promise<AtejiCombo[]> {
  const index = await loadAtejiIndex();
  return generateAtejiCandidatesSync(index, katakanaName, maxResults, moraPenaltyPoints);
}

/**
 * Applies user-chosen per-mora swaps (keyed by the mora slice they replace,
 * e.g. "ヒカル") on top of a combo's engine-ranked spans. Shared between the
 * ateji candidate UI (to render the edited combo) and the app's seimei
 * handan / hanko steps (which need the same final kanji sequence).
 */
export function applyAtejiOverrides(
  spans: AtejiSpan[],
  overrides: Record<string, AtejiIndexCandidate>,
): AtejiSpan[] {
  return spans.map((span) => {
    const override = overrides[span.mora.join('')];
    if (!override) return span;
    return {
      mora: span.mora,
      kanji: override.char,
      readingType: override.readingType,
      strokeCount: override.strokeCount,
      meaningEn: override.meaningEn,
      meaningIt: override.meaningIt,
      boosted: override.boosted,
      fitPercent: span.fitPercent,
    };
  });
}

export type CredibilityLevel = 'high' | 'medium' | 'low';

export interface AtejiCredibility {
  level: CredibilityLevel;
  moraCount: number;
  hardMoraCount: number;
}

/**
 * Rough "how plausible is this as a real Japanese name" signal, surfaced in
 * the UI per the reports' finding that transliteration quality degrades
 * with name length and with the proportion of mora that have no native
 * kanji reading at all (ヴ/ティ/フォ-type foreign-only sounds).
 */
export function atejiCredibility(katakanaName: string): AtejiCredibility {
  const mora = moraSegment(katakanaName);
  const hardMoraCount = mora.filter(isHardMora).length;
  const hardFraction = mora.length > 0 ? hardMoraCount / mora.length : 0;

  let level: CredibilityLevel = 'high';
  if (hardFraction > 0.4 || mora.length > 6) {
    level = 'low';
  } else if (hardFraction > 0.15 || mora.length > 4) {
    level = 'medium';
  }

  return { level, moraCount: mora.length, hardMoraCount };
}
