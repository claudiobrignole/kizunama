import { SITE_ORIGIN, pathForLocale, type LocaleCode } from '../i18n/messages';
import { buildNameSearch } from './nameQuery';

export interface ShareResultParams {
  givenName?: string;
  surname?: string;
  locale?: LocaleCode;
  /** Optional origin override (tests). */
  origin?: string;
}

/**
 * Absolute, locale-aware link that restores the submitted name.
 * Name values are sanitized by buildNameSearch before being encoded.
 */
export function buildShareResultUrl(params: ShareResultParams = {}): string {
  const locale = params.locale ?? 'it';
  const origin = (params.origin ?? SITE_ORIGIN).replace(/\/+$/, '');
  const search = buildNameSearch({
    given: params.givenName ?? '',
    surname: params.surname ?? '',
  });
  return `${origin}${pathForLocale(locale, search)}`;
}
