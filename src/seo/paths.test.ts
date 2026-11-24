import { describe, expect, it } from 'vitest';
import { hreflangSet, namePagePath, parseAppRoute, pathForLocaleSwitch } from './paths';

describe('name paths', () => {
  it('uses the public name URLs', () => {
    expect(namePagePath('en', 'marco')).toBe('/en/name/marco');
    expect(namePagePath('it', 'marco')).toBe('/it/nome/marco');
  });

  it('points x-default at the English URL', () => {
    const home = hreflangSet('home');
    expect(home.find((item) => item.hreflang === 'x-default')?.href).toBe('https://kizunama.com/en/');
    expect(home.find((item) => item.hreflang === 'it')?.href).toBe('https://kizunama.com/');
    const marco = hreflangSet('name', 'marco');
    expect(marco.find((item) => item.hreflang === 'x-default')?.href).toBe('https://kizunama.com/en/name/marco');
    expect(marco.find((item) => item.hreflang === 'it')?.href).toBe('https://kizunama.com/it/nome/marco');
  });

  it('parses name, index and home routes', () => {
    expect(parseAppRoute('/en/name/marco')).toEqual({ kind: 'name', slug: 'marco' });
    expect(parseAppRoute('/it/nome/marco/')).toEqual({ kind: 'name', slug: 'marco' });
    expect(parseAppRoute('/en/names')).toEqual({ kind: 'index' });
    expect(parseAppRoute('/it/nomi')).toEqual({ kind: 'index' });
    expect(parseAppRoute('/en/')).toEqual({ kind: 'home' });
    expect(parseAppRoute('/')).toEqual({ kind: 'home' });
    expect(parseAppRoute('/en/name/not-a-name')).toEqual({ kind: 'notfound' });
  });

  it('switches language without leaving the name', () => {
    expect(pathForLocaleSwitch('/en/name/marco', 'it')).toBe('/it/nome/marco');
    expect(pathForLocaleSwitch('/it/nomi', 'en')).toBe('/en/names');
    expect(pathForLocaleSwitch('/en/', 'it')).toBe('/');
  });
});
