import type { LocaleCode, Messages } from '../i18n/messages';
import { fillTemplate, namePagePath } from './paths.ts';
import { getSeoName, noteFor, spellingFor, type SeoName } from './names.ts';
import { readKatakana, type KatakanaReading } from '../utils/katakanaReading.ts';

export interface SimilarLink {
  slug: string;
  name: string;
  kana: string;
  path: string;
}

export interface NamePageModel {
  entry: SeoName;
  kana: string;
  reading: KatakanaReading;
  h1: string;
  title: string;
  description: string;
  note: string;
  path: string;
  similar: SimilarLink[];
}

export function buildNamePageModel(entry: SeoName, locale: LocaleCode, messages: Messages): NamePageModel {
  const kana = spellingFor(entry, locale);
  const reading = readKatakana(kana);
  const vars = {
    name: entry.name,
    kana,
    romaji: reading.romaji,
    pronunciation: reading.pronunciation,
  };
  return {
    entry,
    kana,
    reading,
    h1: fillTemplate(messages.seo.nameH1, vars),
    title: fillTemplate(messages.seo.nameTitle, vars),
    description: fillTemplate(messages.seo.nameDescription, vars),
    note: noteFor(entry, locale),
    path: namePagePath(locale, entry.slug),
    similar: entry.similar.map((slug) => {
      const other = getSeoName(slug);
      if (!other) throw new Error(`Missing similar name ${slug} for ${entry.slug}`);
      const otherKana = spellingFor(other, locale);
      return { slug, name: other.name, kana: otherKana, path: namePagePath(locale, slug) };
    }),
  };
}
