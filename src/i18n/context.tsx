import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LocaleCode, Messages } from './messages';
import { localeFromPathname } from './messages';
import en from './locales/en';
import it from './locales/it';
import { setStoredLocale } from './storage';

const CATALOG: Record<LocaleCode, Messages> = { en, it };

interface I18nContextValue {
  locale: LocaleCode;
  messages: Messages;
  /** Navigate to the other locale’s URL (real navigation). */
  navigateToLocale: (locale: LocaleCode) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolveLocaleFromLocation(): LocaleCode {
  if (typeof window === 'undefined') return 'it';
  return localeFromPathname(window.location.pathname);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(resolveLocaleFromLocation);

  useEffect(() => {
    const fromUrl = resolveLocaleFromLocation();
    setLocaleState(fromUrl);
    setStoredLocale(fromUrl);
    document.documentElement.lang = fromUrl;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const navigateToLocale = useCallback((next: LocaleCode) => {
    setStoredLocale(next);
    const target = next === 'en' ? '/en/' : '/';
    const search = window.location.search;
    window.location.assign(search ? `${target}${search}` : target);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, messages: CATALOG[locale], navigateToLocale }),
    [locale, navigateToLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
