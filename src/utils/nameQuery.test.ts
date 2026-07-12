/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import {
  NAME_QUERY_MAX_LEN,
  buildNameSearch,
  parseNameQuery,
  sanitizeNameParam,
  syncNameQueryToUrl,
} from './nameQuery';

describe('name query deep links', () => {
  it('keeps only letters, spaces, hyphens and apostrophes', () => {
    expect(sanitizeNameParam("  Mary<script> Jane- O'Neil 123  ")).toBe(
      "Maryscript Jane- O'Neil",
    );
  });

  it('caps prefilled names', () => {
    expect(sanitizeNameParam('a'.repeat(100))).toHaveLength(NAME_QUERY_MAX_LEN);
  });

  it('reads sanitized n and s values', () => {
    expect(parseNameQuery('?n=Mary%20Jane%21&s=O%27Connor%2099')).toEqual({
      given: 'Mary Jane',
      surname: "O'Connor",
    });
  });

  it('builds an encoded query and omits empty values', () => {
    expect(buildNameSearch({ given: 'Mary Jane', surname: '' })).toBe('?n=Mary+Jane');
    expect(buildNameSearch({ given: '', surname: 'De Luca' })).toBe('?s=De+Luca');
  });

  it('syncs the locale URL using replaceState without reload', () => {
    window.history.replaceState({}, '', '/en/');
    const replace = vi.spyOn(window.history, 'replaceState');
    syncNameQueryToUrl({ given: 'Mary', surname: 'Smith' }, 'en');
    expect(replace).toHaveBeenLastCalledWith(
      window.history.state,
      '',
      '/en/?n=Mary&s=Smith',
    );
    expect(window.location.pathname + window.location.search).toBe('/en/?n=Mary&s=Smith');
  });
});
