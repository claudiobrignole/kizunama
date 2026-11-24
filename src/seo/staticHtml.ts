import type { LocaleCode, Messages } from '../i18n/messages.ts';
import { lunaNihongoUrl } from '../config.ts';
import { HOME_TABLE_SLUGS, SEO_NAMES, getSeoName, spellingFor } from './names.ts';
import { buildNamePageModel, type NamePageModel } from './pageModel.ts';
import { homePath, nameIndexPath, namePagePath } from './paths.ts';
import { readKatakana } from '../utils/katakanaReading.ts';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ruby(katakana: string, className = 'kz-furigana'): string {
  const { pieces } = readKatakana(katakana);
  const inner = pieces
    .map((piece) => `${escapeHtml(piece.kana)}<rt>${escapeHtml(piece.reading)}</rt>`)
    .join('');
  return `<ruby class="${className}" lang="ja">${inner}</ruby>`;
}

function paragraphs(blocks: string[]): string {
  return blocks.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n');
}

export function renderHomeStatic(messages: Messages, locale: LocaleCode): string {
  const t = messages.seo;
  const rows = HOME_TABLE_SLUGS.map((slug) => {
    const entry = getSeoName(slug);
    if (!entry) throw new Error(`Missing home-table name ${slug}`);
    const kana = spellingFor(entry, locale);
    const reading = readKatakana(kana);
    return `<tr>
      <th scope="row"><a href="${namePagePath(locale, entry.slug)}">${escapeHtml(entry.name)}</a></th>
      <td>${ruby(kana, 'kz-furigana kz-furigana--table')}</td>
      <td lang="ja">${escapeHtml(reading.romaji)}</td>
      <td>${escapeHtml(reading.pronunciation)}</td>
    </tr>`;
  }).join('\n');

  const faq = t.faq
    .map(
      (item) => `<article class="kz-faq__item"><h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p></article>`,
    )
    .join('\n');

  const bands = [messages.band1, messages.band2, messages.band3, messages.band4]
    .map(
      (band) =>
        `<li class="kz-seo-static__band"><strong>${escapeHtml(band.index)}</strong> <span>${escapeHtml(band.subtitle)}</span></li>`,
    )
    .join('\n');

  return `
    <div class="kz-landing kz-seo-static" data-seo-static="true">
      <header class="ln-header">
        <div class="ln-header-inner">
          <p class="kz-header-tagline">${escapeHtml(messages.header.tagline)}</p>
        </div>
      </header>
      <main>
        <h1>${escapeHtml(t.h1)}</h1>
        <p>${escapeHtml(messages.meta.description)}</p>
        <section aria-labelledby="kz-katakana-heading">
          <h2 id="kz-katakana-heading">${escapeHtml(t.katakanaTitle)}</h2>
          ${paragraphs(t.katakanaBody)}
        </section>
        <section aria-labelledby="kz-furigana-heading">
          <h2 id="kz-furigana-heading">${escapeHtml(t.furiganaTitle)}</h2>
          ${paragraphs(t.furiganaBody)}
        </section>
        <section aria-labelledby="kz-names-heading">
          <h2 id="kz-names-heading">${escapeHtml(t.tableTitle)}</h2>
          <p>${escapeHtml(t.tableIntro)}</p>
          <div class="kz-name-table-wrap">
            <table class="kz-name-table">
              <thead>
                <tr>
                  <th scope="col">${escapeHtml(t.colName)}</th>
                  <th scope="col">${escapeHtml(t.colKatakana)}</th>
                  <th scope="col">${escapeHtml(t.colRomaji)}</th>
                  <th scope="col">${escapeHtml(t.colPronunciation)}</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
          <p><a href="${nameIndexPath(locale)}">${escapeHtml(t.indexLink)}</a></p>
        </section>
        <section aria-labelledby="kz-faq-heading">
          <h2 id="kz-faq-heading">${escapeHtml(t.faqTitle)}</h2>
          <div class="kz-faq">${faq}</div>
        </section>
        <section aria-labelledby="kz-seo-how">
          <h2 id="kz-seo-how">${escapeHtml(messages.header.helpButton)}</h2>
          <ol class="kz-seo-static__bands">${bands}</ol>
        </section>
        <p>${escapeHtml(messages.generalDisclaimer)}</p>
      </main>
      <footer class="kz-footer">
        <p>${escapeHtml(messages.footer.sourcesTitle)}. ${escapeHtml(messages.footer.sourcesBody)}</p>
        <p><a href="${escapeHtml(lunaNihongoUrl('seo'))}">${escapeHtml(messages.footer.sponsorCta)}</a></p>
      </footer>
    </div>`.trim();
}

export function renderNameStatic(model: NamePageModel, messages: Messages, locale: LocaleCode): string {
  const t = messages.seo;
  const similar = model.similar
    .map(
      (item) =>
        `<li><a href="${item.path}">${escapeHtml(item.name)}</a> <span lang="ja">${escapeHtml(item.kana)}</span></li>`,
    )
    .join('\n');
  return `
    <main class="kz-name-page" data-seo-static="true">
      <h1>${escapeHtml(model.h1)}</h1>
      <p>${escapeHtml(model.note)}</p>
      <div class="kz-name-result">
        ${ruby(model.kana)}
        <dl>
          <dt>${escapeHtml(t.romajiLabel)}</dt><dd lang="ja">${escapeHtml(model.reading.romaji)}</dd>
          <dt>${escapeHtml(t.pronunciationLabel)}</dt><dd>${escapeHtml(model.reading.pronunciation)}</dd>
        </dl>
      </div>
      <h2>${escapeHtml(t.similarTitle)}</h2>
      <ul>${similar}</ul>
      <p><a href="${homePath(locale)}">${escapeHtml(t.convertAnother)}</a></p>
      <p><a href="${nameIndexPath(locale)}">${escapeHtml(t.indexLink)}</a></p>
    </main>`.trim();
}

export function renderIndexStatic(messages: Messages, locale: LocaleCode): string {
  const t = messages.seo;
  const groups = new Map<string, string[]>();
  const ordered = [...SEO_NAMES].sort((a, b) => a.name.localeCompare(b.name, locale));
  for (const entry of ordered) {
    const letter = entry.name[0]?.toUpperCase() ?? '#';
    const kana = spellingFor(entry, locale);
    const reading = readKatakana(kana);
    const item = `<li><a href="${namePagePath(locale, entry.slug)}">${escapeHtml(entry.name)}</a> <span lang="ja">${escapeHtml(kana)}</span> <span>${escapeHtml(reading.romaji)}</span></li>`;
    const list = groups.get(letter) ?? [];
    list.push(item);
    groups.set(letter, list);
  }
  const sections = [...groups.keys()]
    .sort()
    .map(
      (letter) =>
        `<section><h2>${escapeHtml(letter)}</h2><ul>${(groups.get(letter) ?? []).join('\n')}</ul></section>`,
    )
    .join('\n');
  return `
    <main class="kz-name-page" data-seo-static="true">
      <h1>${escapeHtml(t.indexH1)}</h1>
      <p>${escapeHtml(t.indexIntro)}</p>
      ${sections}
      <p><a href="${homePath(locale)}">${escapeHtml(t.convertAnother)}</a></p>
    </main>`.trim();
}

export function nameModels(locale: LocaleCode, messages: Messages): NamePageModel[] {
  return SEO_NAMES.map((entry) => buildNamePageModel(entry, locale, messages));
}
