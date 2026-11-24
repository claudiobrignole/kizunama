import { useI18n } from '../i18n/context';
import { HOME_TABLE_SLUGS, getSeoName, spellingFor } from '../seo/names';
import { nameIndexPath, namePagePath } from '../seo/paths';
import { readKatakana } from '../utils/katakanaReading';
import { Furigana } from './Furigana';

export function SeoGuide() {
  const { locale, messages } = useI18n();
  const t = messages.seo;
  const rows = HOME_TABLE_SLUGS.map((slug) => {
    const entry = getSeoName(slug);
    if (!entry) throw new Error(`Missing home-table name ${slug}`);
    const kana = spellingFor(entry, locale);
    const reading = readKatakana(kana);
    return { entry, kana, reading };
  });

  return (
    <section className="kz-guide" aria-labelledby="kz-katakana-heading">
      <div className="kz-guide__inner">
        <h2 id="kz-katakana-heading">{t.katakanaTitle}</h2>
        {t.katakanaBody.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}

        <h2 id="kz-furigana-heading">{t.furiganaTitle}</h2>
        {t.furiganaBody.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}

        <h2 id="kz-names-heading">{t.tableTitle}</h2>
        <p>{t.tableIntro}</p>
        <div className="kz-name-table-wrap">
          <table className="kz-name-table">
            <thead>
              <tr>
                <th scope="col">{t.colName}</th>
                <th scope="col">{t.colKatakana}</th>
                <th scope="col">{t.colRomaji}</th>
                <th scope="col">{t.colPronunciation}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ entry, kana, reading }) => (
                <tr key={entry.slug}>
                  <th scope="row">
                    <a href={namePagePath(locale, entry.slug)}>{entry.name}</a>
                  </th>
                  <td>
                    <Furigana katakana={kana} className="kz-furigana kz-furigana--table" />
                  </td>
                  <td lang="ja">{reading.romaji}</td>
                  <td>{reading.pronunciation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="kz-guide__index">
          <a href={nameIndexPath(locale)}>{t.indexLink}</a>
        </p>

        <h2 id="kz-faq-heading">{t.faqTitle}</h2>
        <div className="kz-faq">
          {t.faq.map((item) => (
            <article key={item.q} className="kz-faq__item">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
