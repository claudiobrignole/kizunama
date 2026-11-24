import { useI18n } from '../i18n/context';
import { absoluteUrl, homePath, hreflangSet, nameIndexPath, namePagePath } from '../seo/paths';
import { buildNamePageModel } from '../seo/pageModel';
import { getSeoName, SEO_NAMES, spellingFor } from '../seo/names';
import { readKatakana } from '../utils/katakanaReading';
import { usePageMeta } from '../seo/usePageMeta';
import { Furigana } from './Furigana';

const BRAND_OG = 'https://kizunama.com/brand/og-card.png';

function ogImage(locale: 'en' | 'it', slug: string): string {
  return absoluteUrl(`/og/names/${locale}/${slug}.png`);
}

export function NamePage({ slug }: { slug: string }) {
  const { locale, messages } = useI18n();
  const entry = getSeoName(slug);
  const t = messages.seo;

  const model = entry ? buildNamePageModel(entry, locale, messages) : null;
  usePageMeta({
    title: model?.title ?? t.notFoundTitle,
    description: model?.description ?? t.notFoundBody,
    canonical: absoluteUrl(model?.path ?? nameIndexPath(locale)),
    robots: model ? 'index,follow' : 'noindex,follow',
    ogImage: model ? ogImage(locale, slug) : BRAND_OG,
    ogAlt: model ? `${model.entry.name} ${model.kana}` : 'KIZUNAMA',
    ogLocale: locale === 'it' ? 'it_IT' : 'en_US',
    hreflang: model ? hreflangSet('name', slug) : hreflangSet('index'),
  });

  if (!model) {
    return (
      <main className="kz-name-page">
        <div className="kz-name-page__inner">
          <h1>{t.notFoundTitle}</h1>
          <p>{t.notFoundBody}</p>
          <p>
            <a href={homePath(locale)}>{t.convertAnother}</a>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="kz-name-page">
      <div className="kz-name-page__inner">
        <h1>{model.h1}</h1>
        <p className="kz-name-page__note">{model.note}</p>
        <div className="kz-name-result">
          <Furigana katakana={model.kana} />
          <dl className="kz-name-facts">
            <div>
              <dt>{t.romajiLabel}</dt>
              <dd lang="ja">{model.reading.romaji}</dd>
            </div>
            <div>
              <dt>{t.pronunciationLabel}</dt>
              <dd>{model.reading.pronunciation}</dd>
            </div>
          </dl>
        </div>
        <h2>{t.similarTitle}</h2>
        <ul className="kz-similar">
          {model.similar.map((item) => (
            <li key={item.slug}>
              <a href={item.path}>{item.name}</a>
              <span lang="ja">{item.kana}</span>
            </li>
          ))}
        </ul>
        <p className="kz-name-page__links">
          <a href={homePath(locale)}>{t.convertAnother}</a>
          <a href={nameIndexPath(locale)}>{t.indexLink}</a>
        </p>
      </div>
    </main>
  );
}

export function NameIndex() {
  const { locale, messages } = useI18n();
  const t = messages.seo;
  usePageMeta({
    title: t.indexTitle,
    description: t.indexDescription,
    canonical: absoluteUrl(nameIndexPath(locale)),
    ogImage: BRAND_OG,
    ogAlt: 'KIZUNAMA',
    ogLocale: locale === 'it' ? 'it_IT' : 'en_US',
    hreflang: hreflangSet('index'),
  });

  const groups = new Map<string, typeof SEO_NAMES>();
  for (const entry of SEO_NAMES) {
    const letter = entry.name[0]?.toUpperCase() ?? '#';
    const list = groups.get(letter) ?? [];
    list.push(entry);
    groups.set(letter, list);
  }
  const letters = [...groups.keys()].sort();

  return (
    <main className="kz-name-page">
      <div className="kz-name-page__inner">
        <h1>{t.indexH1}</h1>
        <p>{t.indexIntro}</p>
        {letters.map((letter) => (
          <section key={letter} className="kz-index-letter" aria-labelledby={`letter-${letter}`}>
            <h2 id={`letter-${letter}`}>{letter}</h2>
            <ul className="kz-similar">
              {(groups.get(letter) ?? [])
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, locale))
                .map((entry) => {
                const kana = spellingFor(entry, locale);
                const reading = readKatakana(kana);
                return (
                  <li key={entry.slug}>
                    <a href={namePagePath(locale, entry.slug)}>{entry.name}</a>
                    <span lang="ja">{kana}</span>
                    <span className="kz-similar__romaji">{reading.romaji}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <p className="kz-name-page__links">
          <a href={homePath(locale)}>{t.convertAnother}</a>
        </p>
      </div>
    </main>
  );
}
