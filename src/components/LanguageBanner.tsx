import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/context';
import { localeFromPathname } from '../i18n/messages';
import {
  browserPrefersNonItalian,
  dismissLanguageBanner,
  isLanguageBannerDismissed,
  setStoredLocale,
} from '../i18n/storage';

/**
 * One-time modal on the Italian root when the browser language is not Italian.
 * Never auto-redirects — user chooses English (/en/) or stays on Italian.
 */
export function LanguageBanner() {
  const { messages, navigateToLocale } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localeFromPathname(window.location.pathname) !== 'it') return;
    if (!browserPrefersNonItalian()) return;
    if (isLanguageBannerDismissed()) return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  const handleEnglish = () => {
    dismissLanguageBanner();
    setStoredLocale('en');
    navigateToLocale('en');
  };

  const handleItalian = () => {
    dismissLanguageBanner();
    setStoredLocale('it');
    setVisible(false);
  };

  return (
    <div className="kz-lang-modal-overlay" role="presentation" onClick={handleItalian}>
      <div
        className="mg-card kz-lang-modal"
        role="dialog"
        aria-modal="true"
        aria-label={messages.languageBanner.question}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="kz-lang-modal__question">{messages.languageBanner.question}</p>
        <div className="kz-lang-modal__actions">
          <button type="button" className="mg-btn mg-btn--red" onClick={handleEnglish}>
            {messages.languageBanner.continueEnglish}
          </button>
          <button type="button" className="mg-btn" onClick={handleItalian}>
            {messages.languageBanner.continueItalian}
          </button>
        </div>
      </div>
    </div>
  );
}
