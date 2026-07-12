import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '../i18n/context';
import { SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_NAMES, type LocaleCode } from '../i18n/messages';

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer';
}

export function LanguageSwitcher({ variant = 'header' }: LanguageSwitcherProps) {
  const { locale, navigateToLocale, messages } = useI18n();
  const groupLabel = messages.languageSwitcher.label;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const choose = (code: LocaleCode) => {
    setOpen(false);
    if (code === locale) return;
    navigateToLocale(code);
  };

  return (
    <div
      ref={rootRef}
      className={`kz-lang-switcher kz-lang-switcher--${variant}${open ? ' is-open' : ''}`}
    >
      <button
        type="button"
        className="mg-btn kz-help-btn kz-lang-switcher__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={groupLabel}
        title={LOCALE_NAMES[locale]}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{LOCALE_LABELS[locale]}</span>
        <svg className="kz-lang-switcher__chevron" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M1 1l4 4 4-4"
          />
        </svg>
      </button>

      {open ? (
        <ul id={listId} className="kz-lang-switcher__menu" role="listbox" aria-label={groupLabel}>
          {SUPPORTED_LOCALES.map((code) => {
            const selected = code === locale;
            return (
              <li key={code} role="presentation">
                <button
                  type="button"
                  role="option"
                  className={`kz-lang-switcher__option${selected ? ' is-selected' : ''}`}
                  aria-selected={selected}
                  onClick={() => choose(code)}
                >
                  <span className="kz-lang-switcher__option-code">{LOCALE_LABELS[code]}</span>
                  <span className="kz-lang-switcher__option-name">{LOCALE_NAMES[code]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
