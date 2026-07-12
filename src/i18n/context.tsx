import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LocaleCode, Messages } from './messages';
import en from './locales/en';
import it from './locales/it';
import fr from './locales/fr';
import de from './locales/de';
import es from './locales/es';
import pt from './locales/pt';
import { getBrowserLocale, getStoredLocale, setStoredLocale } from './storage';

const CATALOG: Record<LocaleCode, Messages> = { en, it, fr, de, es, pt };

interface I18nContextValue {
  locale: LocaleCode;
  messages: Messages;
  setLocale: (locale: LocaleCode) => void;
  browserLocale: LocaleCode | null;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolveInitialLocale(): LocaleCode {
  return getStoredLocale() ?? 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(resolveInitialLocale);
  const browserLocale = useMemo(() => getBrowserLocale(), []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((next: LocaleCode) => {
    setLocaleState(next);
    setStoredLocale(next);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next;
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, messages: CATALOG[locale], setLocale, browserLocale }),
    [locale, setLocale, browserLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
