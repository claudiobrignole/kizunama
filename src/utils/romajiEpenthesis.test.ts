import { describe, expect, it } from 'vitest';
import * as wanakana from 'wanakana';
import { applyEpenthesis, applyEpenthesisDetailed } from './romajiEpenthesis';

describe('applyEpenthesis', () => {
  it('breaks the Italian "cl" cluster with an epenthetic vowel and coaxes extended ディ', () => {
    // "Claudio" -> Italian rules produce "klaudio" -> クラウディオ
    expect(applyEpenthesis('klaudio')).toBe('kuraudhio');
    expect(wanakana.toKatakana(applyEpenthesis('klaudio'))).toBe('クラウディオ');
  });

  it('breaks German final consonant clusters (lf/ng) and maps l -> r', () => {
    // "Wolfgang" -> German rules produce "volfgang" -> ヴォルフガング
    expect(applyEpenthesis('volfgang')).toBe('vorufugangu');
    expect(wanakana.toKatakana(applyEpenthesis('volfgang'))).toBe('ヴォルフガング');
  });

  it('does not disturb a plain consonant+vowel sequence', () => {
    expect(applyEpenthesis('mari')).toBe('mari');
  });

  it('returns deterministic fixed penalty details', () => {
    const report = applyEpenthesisDetailed('klaudio');
    expect(report.penalties.map(({ kind, points }) => ({ kind, points }))).toEqual([
      { kind: 'epenthetic-vowel', points: 8 },
      { kind: 'l-to-r', points: 10 },
      { kind: 'extended-katakana-normalization', points: 4 },
    ]);
    expect(report.fitPercent).toBe(78);
  });

  it('charges every inserted vowel and v approximation independently', () => {
    const report = applyEpenthesisDetailed('volf');
    expect(report.penalties.filter((penalty) => penalty.kind === 'epenthetic-vowel')).toHaveLength(2);
    expect(report.penalties.some((penalty) => penalty.kind === 'v-approximation')).toBe(true);
    expect(report.fitPercent).toBe(59);
  });
});
