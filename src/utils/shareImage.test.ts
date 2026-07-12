/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { buildShareResultUrl } from './shareLink';
import {
  SHARE_FORMATS,
  SHARE_JP_FONT_FAMILY,
  SHARE_JP_FONT_WEIGHT,
  ShareFontError,
  __resetShareFontsForTests,
  ensureShareFonts,
  isShareJpFontReady,
} from './shareImage';

describe('buildShareResultUrl', () => {
  it('returns the Italian site root by default', () => {
    expect(buildShareResultUrl({ origin: 'https://kizunama.com' })).toBe('https://kizunama.com/');
  });

  it('returns the English locale path with the restorable name query', () => {
    expect(
      buildShareResultUrl({
        locale: 'en',
        givenName: 'Mary Jane',
        surname: "O'Connor",
        origin: 'https://kizunama.com',
      }),
    ).toBe("https://kizunama.com/en/?n=Mary+Jane&s=O%27Connor");
  });

  it('sanitizes the name values embedded in the result link', () => {
    const url = buildShareResultUrl({
      locale: 'it',
      givenName: 'Claudio<script>',
      surname: 'De-Luca 123',
      origin: 'https://kizunama.com',
    });
    expect(url).toBe('https://kizunama.com/?n=Claudioscript&s=De-Luca');
  });
});

describe('SHARE_FORMATS', () => {
  it('matches the required social crop sizes', () => {
    expect(SHARE_FORMATS.story).toEqual({ id: 'story', width: 1080, height: 1920 });
    expect(SHARE_FORMATS.post).toEqual({ id: 'post', width: 1080, height: 1350 });
    expect(SHARE_FORMATS.square).toEqual({ id: 'square', width: 1080, height: 1080 });
  });
});

describe('ensureShareFonts runtime guard', () => {
  beforeEach(() => {
    __resetShareFontsForTests();
    vi.stubGlobal(
      'FontFace',
      class MockFontFace {
        family: string;
        constructor(family: string) {
          this.family = family;
        }
        async load() {
          return this as unknown as FontFace;
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    __resetShareFontsForTests();
  });

  it('throws ShareFontError when document.fonts.check reports the JP face missing', async () => {
    const load = vi.fn(async () => undefined);
    const check = vi.fn(() => false);
    const add = vi.fn();
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: {
        load,
        check,
        add,
        ready: Promise.resolve(),
      },
    });

    await expect(ensureShareFonts(120)).rejects.toBeInstanceOf(ShareFontError);
    expect(load).toHaveBeenCalled();
    expect(check).toHaveBeenCalledWith(`${SHARE_JP_FONT_WEIGHT} 120px "${SHARE_JP_FONT_FAMILY}"`);
    expect(isShareJpFontReady(120)).toBe(false);
  });

  it('resolves when check confirms the JP face', async () => {
    const load = vi.fn(async () => undefined);
    const check = vi.fn(() => true);
    const add = vi.fn();
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: {
        load,
        check,
        add,
        ready: Promise.resolve(),
      },
    });

    await expect(ensureShareFonts(96)).resolves.toBeUndefined();
    expect(isShareJpFontReady(96)).toBe(true);
  });
});
