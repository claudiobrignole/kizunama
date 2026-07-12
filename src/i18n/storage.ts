import { SUPPORTED_LOCALES, type LocaleCode } from './messages';

const LANG_COOKIE = 'kz_lang';
const BANNER_DISMISSED_COOKIE = 'kz_lang_prompt_dismissed';
const COOKIE_MAX_AGE_DAYS = 365;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeDays: number): void {
  if (typeof document === 'undefined') return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export function isSupportedLocale(value: string | null): value is LocaleCode {
  return !!value && (SUPPORTED_LOCALES as string[]).includes(value);
}

export function getStoredLocale(): LocaleCode | null {
  const stored = readCookie(LANG_COOKIE);
  return isSupportedLocale(stored) ? stored : null;
}

export function setStoredLocale(locale: LocaleCode): void {
  writeCookie(LANG_COOKIE, locale, COOKIE_MAX_AGE_DAYS);
}

/** True when the browser UI language is not Italian (e.g. en-US, fr-FR). */
export function browserPrefersNonItalian(): boolean {
  if (typeof navigator === 'undefined') return false;
  const lang = (navigator.language || '').toLowerCase();
  return Boolean(lang) && !lang.startsWith('it');
}

export function isLanguageBannerDismissed(): boolean {
  return readCookie(BANNER_DISMISSED_COOKIE) === '1';
}

export function dismissLanguageBanner(): void {
  writeCookie(BANNER_DISMISSED_COOKIE, '1', COOKIE_MAX_AGE_DAYS);
}
