import { SITE_ORIGIN, type LocaleCode } from '../i18n/messages.ts';

export type PageKind = 'home' | 'index' | 'name';

export type AppRoute =
  | { kind: 'home' }
  | { kind: 'index' }
  | { kind: 'name'; slug: string }
  | { kind: 'notfound' };

export function homePath(locale: LocaleCode): string {
  return locale === 'en' ? '/en/' : '/';
}

export function nameIndexPath(locale: LocaleCode): string {
  return locale === 'en' ? '/en/names' : '/it/nomi';
}

/** Public path without a trailing slash, as in /en/name/marco. */
export function namePagePath(locale: LocaleCode, slug: string): string {
  return locale === 'en' ? `/en/name/${slug}` : `/it/nome/${slug}`;
}

export function absoluteUrl(path: string, origin = SITE_ORIGIN): string {
  const base = origin.replace(/\/+$/, '');
  if (path === '/') return `${base}/`;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function hreflangSet(kind: PageKind, slug?: string): { hreflang: string; href: string }[] {
  const itPath = kind === 'home' ? homePath('it') : kind === 'index' ? nameIndexPath('it') : namePagePath('it', slug ?? '');
  const enPath = kind === 'home' ? homePath('en') : kind === 'index' ? nameIndexPath('en') : namePagePath('en', slug ?? '');
  return [
    { hreflang: 'it', href: absoluteUrl(itPath) },
    { hreflang: 'en', href: absoluteUrl(enPath) },
    { hreflang: 'x-default', href: absoluteUrl(enPath) },
  ];
}

export function parseAppRoute(pathname: string): AppRoute {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/en') return { kind: 'home' };
  if (path === '/en/names' || path === '/it/nomi') return { kind: 'index' };
  const enName = /^\/en\/name\/([a-z]+)$/.exec(path);
  if (enName) return { kind: 'name', slug: enName[1] };
  const itName = /^\/it\/nome\/([a-z]+)$/.exec(path);
  if (itName) return { kind: 'name', slug: itName[1] };
  if (path.startsWith('/en/') || path.startsWith('/it/')) return { kind: 'notfound' };
  return { kind: 'home' };
}

/** Where the language switcher should send the current URL. */
export function pathForLocaleSwitch(pathname: string, next: LocaleCode): string {
  const route = parseAppRoute(pathname);
  if (route.kind === 'name') return namePagePath(next, route.slug);
  if (route.kind === 'index') return nameIndexPath(next);
  return homePath(next);
}

export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '');
}
