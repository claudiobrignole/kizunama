import { describe, expect, it } from 'vitest';
import {
  generateHankoSvg,
  generateHankoSvgOutlined,
  HANKO_FONT_FAMILY,
  HANKO_OUTLINE_FONT_FAMILY,
  isFontFreeHankoSvg,
  layoutHankoGlyphs,
} from './hanko';

describe('generateHankoSvg', () => {
  it('uses Noto Serif JP (mincho) for preview text — never Noto Sans JP', () => {
    expect(HANKO_FONT_FAMILY).toContain('Noto Serif JP');
    expect(HANKO_FONT_FAMILY).not.toContain('Noto Sans JP');
    expect(HANKO_OUTLINE_FONT_FAMILY).toBe('Noto Serif JP');

    const svg = generateHankoSvg(['絆']);
    expect(svg).toContain('Noto Serif JP');
    expect(svg).not.toContain('Noto Sans JP');
  });

  it('produces a valid SVG string for a single kanji', () => {
    const svg = generateHankoSvg(['絆']);
    expect(svg).toContain('<svg');
    expect(svg).toContain('絆');
    expect(svg).toContain('</svg>');
  });

  it('produces vertically arranged text for two kanji', () => {
    const svg = generateHankoSvg(['絆', '名']);
    expect(svg).toContain('絆');
    expect(svg).toContain('名');
    expect(svg.match(/<text/g)?.length).toBe(2);
  });

  it('escapes special XML characters', () => {
    const svg = generateHankoSvg(['<x>']);
    expect(svg).not.toContain('<x>');
    expect(svg).toContain('&lt;x&gt;');
  });

  it('supports a round shape', () => {
    const svg = generateHankoSvg(['絆'], { shape: 'round' });
    expect(svg).toContain('<circle');
  });

  it('stacks three kanji in a single column', () => {
    const svg = generateHankoSvg(['一', '二', '三']);
    expect(svg.match(/<text/g)?.length).toBe(3);
  });

  it('arranges four kanji in a 2x2 grid (two columns of two)', () => {
    const svg = generateHankoSvg(['一', '二', '三', '四']);
    expect(svg.match(/<text/g)?.length).toBe(4);
    const glyphs = layoutHankoGlyphs(['一', '二', '三', '四']);
    const xs = new Set(glyphs.map((g) => g.x));
    expect(xs.size).toBe(2);
  });

  it('supports up to six kanji across two columns of three', () => {
    const svg = generateHankoSvg(['一', '二', '三', '四', '五', '六']);
    expect(svg.match(/<text/g)?.length).toBe(6);
  });

  it('caps input at six characters', () => {
    const svg = generateHankoSvg(['一', '二', '三', '四', '五', '六', '七']);
    expect(svg.match(/<text/g)?.length).toBe(6);
  });

  it('renders a katakana name as a single horizontal left-to-right row', () => {
    const svg = generateHankoSvg(['ヴ', 'ォ', 'ル', 'フ'], { orientation: 'horizontal' });
    expect(svg.match(/<text/g)?.length).toBe(4);
    const glyphs = layoutHankoGlyphs(['ヴ', 'ォ', 'ル', 'フ'], { orientation: 'horizontal' });
    const ys = new Set(glyphs.map((g) => g.y));
    expect(ys.size).toBe(1);
  });
});

describe('layoutHankoGlyphs', () => {
  it('uses absolute viewBox coordinates (not percentages)', () => {
    const glyphs = layoutHankoGlyphs(['絆']);
    expect(glyphs).toHaveLength(1);
    expect(glyphs[0].x).toBe(100);
    expect(glyphs[0].y).toBeGreaterThan(50);
    expect(glyphs[0].fontSize).toBe(92);
  });
});

describe('generateHankoSvgOutlined', () => {
  it('converts glyphs to font-free paths using Noto Serif JP', async () => {
    const fs = await import('node:fs/promises');
    const { parseHankoOutlineFont } = await import('./hankoFont');
    const bytes = new Uint8Array(await fs.readFile('public/fonts/NotoSerifJP-Bold.woff'));
    const font = parseHankoOutlineFont(bytes);

    const chars = ['絆', '名'];
    expect(font.charToGlyph('絆').index).toBeGreaterThan(0);
    expect(font.charToGlyph('名').index).toBeGreaterThan(0);

    const svg = generateHankoSvgOutlined(chars, font);
    expect(isFontFreeHankoSvg(svg)).toBe(true);
    expect(svg).not.toMatch(/<text[\s>]/i);
    expect(svg).not.toMatch(/font-family/i);
    expect(svg).not.toContain('Noto Sans JP');
    expect(svg).not.toContain('Noto Serif JP');
    expect((svg.match(/<path[\s>]/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
});
