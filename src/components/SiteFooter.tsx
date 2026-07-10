import { SPONSOR_URL } from '../config';

export function SiteFooter() {
  return (
    <footer className="kz-footer">
      <a className="kz-btn" href={SPONSOR_URL} target="_blank" rel="noopener noreferrer">
        🌙 Secret sponsor
      </a>
      <p className="kz-footer__seo">
        絆名 | Kizunama — a free tool to discover your Japanese Kanji name by meaning, generate a
        katakana reading of your name, and create a downloadable Hanko seal. No AI, no account,
        works offline once installed. Kanji data from KANJIDIC2 (EDRDG licence); katakana
        conversion via any-ascii, phonemizer/eSpeak-NG and wanakana.
      </p>
      <p className="kz-footer__credits">
        © {new Date().getFullYear()} Kizunama · Made by{' '}
        <a href="https://brignole.ch" target="_blank" rel="noopener noreferrer">
          brignole.ch
        </a>
      </p>
    </footer>
  );
}
