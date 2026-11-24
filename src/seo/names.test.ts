import { describe, expect, it } from 'vitest';
import dict from '../data/nameKatakanaDict.json';
import en from '../i18n/locales/en';
import italian from '../i18n/locales/it';
import { HOME_TABLE_SLUGS, SEO_NAMES, getSeoName, spellingFor } from './names';
import { buildNamePageModel } from './pageModel';
import { readKatakana } from '../utils/katakanaReading';

const dictionary = dict as unknown as Record<string, string>;

function skeleton(note: string, name: string, kana: string[]): string {
  let out = note;
  for (const token of [name, ...kana]) {
    if (token) out = out.split(token).join('');
  }
  return out.replace(/\s+/g, ' ').trim();
}

describe('published name pages', () => {
  it('publishes between 50 and 100 names, each with a validated spelling', () => {
    expect(SEO_NAMES.length).toBeGreaterThanOrEqual(50);
    expect(SEO_NAMES.length).toBeLessThanOrEqual(100);
    expect(new Set(SEO_NAMES.map((entry) => entry.slug)).size).toBe(SEO_NAMES.length);

    for (const entry of SEO_NAMES) {
      expect(entry.slug).toBe(entry.name.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase());
      expect(dictionary[entry.slug]).toBe(entry.katakana);
      const italian = dictionary[`${entry.slug}@it`];
      if (italian && italian !== dictionary[entry.slug]) {
        expect(entry.katakanaIt).toBe(italian);
      } else {
        expect(entry.katakanaIt).toBeUndefined();
      }
      expect(entry.noteEn.length).toBeGreaterThan(100);
      expect(entry.noteIt.length).toBeGreaterThan(100);
      expect(entry.noteEn).not.toBe(entry.noteIt);
      expect(entry.similar.length).toBeGreaterThanOrEqual(2);
      expect(entry.similar).not.toContain(entry.slug);
      for (const slug of entry.similar) expect(getSeoName(slug)?.slug).toBe(slug);
      readKatakana(entry.katakana);
      if (entry.katakanaIt) readKatakana(entry.katakanaIt);
    }
  });

  it('does not reuse a note once the name and the kana are removed', () => {
    for (const locale of ['en', 'it'] as const) {
      const seen = new Map<string, string>();
      for (const entry of SEO_NAMES) {
        const kana = [entry.katakana, entry.katakanaIt ?? ''];
        const note = locale === 'en' ? entry.noteEn : entry.noteIt;
        const key = skeleton(note, entry.name, kana);
        const previous = seen.get(key);
        expect(previous, `${entry.slug} repeats ${previous}`).toBeUndefined();
        seen.set(key, entry.slug);
      }
    }
  });

  it('gives every page a distinct title in each language', () => {
    for (const [locale, messages] of [
      ['en', en],
      ['it', italian],
    ] as const) {
      const titles = SEO_NAMES.map((entry) => buildNamePageModel(entry, locale, messages).title);
      expect(new Set(titles).size).toBe(titles.length);
      for (const title of titles) {
        expect(title.length).toBeGreaterThan(10);
        expect(title).not.toBe(messages.meta.title);
      }
    }
  });

  it('links the home table only to published names', () => {
    expect(HOME_TABLE_SLUGS.length).toBeGreaterThanOrEqual(20);
    expect(HOME_TABLE_SLUGS.length).toBeLessThanOrEqual(30);
    for (const slug of HOME_TABLE_SLUGS) {
      expect(getSeoName(slug)).toBeTruthy();
      expect(spellingFor(getSeoName(slug)!, 'it').length).toBeGreaterThan(0);
    }
  });

  it('translates the guide instead of copying it', () => {
    expect(en.seo.h1).not.toBe(italian.seo.h1);
    expect(en.meta.description).not.toBe(italian.meta.description);
    expect(en.seo.faq.map((item) => item.q).join('|')).not.toBe(italian.seo.faq.map((item) => item.q).join('|'));
    expect(en.seo.faq).toHaveLength(6);
    expect(italian.seo.faq).toHaveLength(6);
  });
});
