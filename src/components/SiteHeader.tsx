import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '../i18n/context';
import { homePath } from '../seo/paths';

interface SiteHeaderProps {
  onHelp: () => void;
}

export function SiteHeader({ onHelp }: SiteHeaderProps) {
  const { locale, messages } = useI18n();

  return (
    <header className="ln-header">
      <div className="ln-header-inner">
        <div className="kz-header-main">
          <div className="kz-brand-lockup">
            <a className="kz-brand-lockup__name" href={homePath(locale)}>
              <span className="kz-brand-lockup__kanji" lang="ja">
                キズナマ
              </span>{' '}
              KIZUNAMA
            </a>
          </div>
          <p className="kz-header-tagline">{messages.header.tagline}</p>
        </div>
        <div className="kz-header-actions">
          <LanguageSwitcher variant="header" />
          <button type="button" className="mg-btn kz-help-btn" onClick={onHelp}>
            {messages.header.helpButton}
          </button>
        </div>
      </div>
    </header>
  );
}
