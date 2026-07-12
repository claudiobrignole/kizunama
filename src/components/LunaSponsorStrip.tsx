import { SPONSOR_URL } from '../config';
import { useI18n } from '../i18n/context';

/**
 * Narrow red sponsor strip between ateji and seimei handan —
 * reduced Luna Nihongo hero: white logo + waving Luna + centered CTA.
 */
export function LunaSponsorStrip() {
  const { messages } = useI18n();

  return (
    <aside className="kz-luna-strip" aria-label="Luna Nihongo">
      <div className="kz-luna-strip__inner">
        <img
          className="kz-luna-strip__logo"
          src="/brand/Luna-Nihongo-logo-orizz-bianco-rosso.png"
          alt="Luna Nihongo"
          height={36}
        />
        <a className="mg-btn mg-btn--red kz-luna-strip__cta" href={SPONSOR_URL} target="_blank" rel="noopener noreferrer">
          {messages.footer.sponsorCta}
        </a>
        <img
          className="kz-luna-strip__fig"
          src="/brand/luna-wave.webp"
          alt=""
          width={140}
          height={122}
          decoding="async"
        />
      </div>
    </aside>
  );
}
