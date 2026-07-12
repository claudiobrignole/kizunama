import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/context';
import { LOCALE_NAMES } from '../i18n/messages';
import { dismissLanguageBanner, getStoredLocale, isLanguageBannerDismissed } from '../i18n/storage';

export function LanguageBanner() {
  const { browserLocale, setLocale, messages } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!browserLocale || browserLocale === 'en') return;
    if (getStoredLocale()) return;
    if (isLanguageBannerDismissed()) return;
    setVisible(true);
  }, [browserLocale]);

  if (!visible || !browserLocale) return null;

  const handleAccept = () => {
    setLocale(browserLocale);
    setVisible(false);
  };

  const handleStay = () => {
    dismissLanguageBanner();
    setVisible(false);
  };

  return (
    <div className="kz-lang-banner" role="dialog" aria-label={LOCALE_NAMES[browserLocale]}>
      <span>{messages.languageBanner.question}</span>
      <span className="kz-lang-banner__actions">
        <button type="button" className="mg-btn mg-btn--red" onClick={handleAccept}>
          {messages.languageBanner.accept}
        </button>
        <button type="button" className="mg-btn" onClick={handleStay}>
          {messages.languageBanner.stay}
        </button>
      </span>
    </div>
  );
}
