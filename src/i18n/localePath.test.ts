import { describe, expect, it } from 'vitest';
import { localeFromPathname, pathForLocale } from '../i18n/messages';

describe('localeFromPathname', () => {
  it('defaults to Italian at the root', () => {
    expect(localeFromPathname('/')).toBe('it');
    expect(localeFromPathname('')).toBe('it');
    expect(localeFromPathname('/foo')).toBe('it');
  });

  it('detects English under /en', () => {
    expect(localeFromPathname('/en')).toBe('en');
    expect(localeFromPathname('/en/')).toBe('en');
    expect(localeFromPathname('/en/anything')).toBe('en');
  });
});

describe('pathForLocale', () => {
  it('maps locales to / and /en/ and preserves query strings', () => {
    expect(pathForLocale('it')).toBe('/');
    expect(pathForLocale('en')).toBe('/en/');
    expect(pathForLocale('en', '?n=Claudio')).toBe('/en/?n=Claudio');
    expect(pathForLocale('it', 'n=Claudio')).toBe('/?n=Claudio');
  });
});
