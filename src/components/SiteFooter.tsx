import { useI18n } from '../i18n/context';
import { LanguageSwitcher } from './LanguageSwitcher';

interface SiteFooterProps {
  onOpenHelp: () => void;
}

export function SiteFooter({ onOpenHelp }: SiteFooterProps) {
  const { messages } = useI18n();

  return (
    <footer className="kz-footer ln-footer">
      <div className="kz-footer__inner">
        <div className="kz-footer__actions">
          <LanguageSwitcher variant="footer" />
          <button type="button" className="mg-btn kz-help-btn" onClick={onOpenHelp}>
            {messages.header.helpButton}
          </button>
        </div>

        <p className="kz-footer__seo">{messages.footer.seo}</p>
        <p className="kz-footer__sources">
          <strong>{messages.footer.sourcesTitle}.</strong> {messages.footer.sourcesBody}
        </p>
        <p className="kz-footer__credits">
          © {new Date().getFullYear()} Kizunama ·{' '}
          <a href="https://naito.work" target="_blank" rel="noopener noreferrer">
            {messages.footer.credits}
          </a>
        </p>
      </div>
    </footer>
  );
}
