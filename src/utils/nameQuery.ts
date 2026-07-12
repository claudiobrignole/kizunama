import { pathForLocale, type LocaleCode } from '../i18n/messages';

export const NAME_QUERY_MAX_LEN = 40;

/**
 * Sanitize a name from the URL or before writing it back.
 * Keeps letters (any script), combining marks, spaces, hyphens, apostrophes.
 */
export function sanitizeNameParam(raw: string, maxLen = NAME_QUERY_MAX_LEN): string {
  return raw
    .normalize('NFC')
    .replace(/[^\p{L}\p{M}\s'-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export interface NameQuery {
  given: string;
  surname: string;
}

/** Read and sanitize ?n= (given) and ?s= (surname) from a query string. */
export function parseNameQuery(search: string): NameQuery {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return {
    given: sanitizeNameParam(params.get('n') ?? ''),
    surname: sanitizeNameParam(params.get('s') ?? ''),
  };
}

/** Build `?n=…&s=…` (omitting empty params). Returns '' when both empty. */
export function buildNameSearch(query: NameQuery): string {
  const params = new URLSearchParams();
  const given = sanitizeNameParam(query.given);
  const surname = sanitizeNameParam(query.surname);
  if (given) params.set('n', given);
  if (surname) params.set('s', surname);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Update the address bar with the locale path + ?n=/&s= without reloading.
 */
export function syncNameQueryToUrl(query: NameQuery, locale: LocaleCode): void {
  if (typeof window === 'undefined') return;
  const next = pathForLocale(locale, buildNameSearch(query));
  const current = `${window.location.pathname}${window.location.search}`;
  if (current === next) return;
  window.history.replaceState(window.history.state, '', next);
}
