/**
 * Generates a stylised Japanese Hanko (personal seal) as a standalone SVG
 * string from up to 6 characters.
 *
 * Preview SVGs use `<text>` (web fonts). Download/copy SVGs outline glyphs
 * to `<path>` so the file is font-independent and looks the same everywhere.
 */

import type { Font } from 'opentype.js';

export const HANKO_SIZE = 200;
const RED = '#c8102e';
const MAX_CHARS = 6;

/** Mincho-style family for on-screen preview (must match outline loader). */
export const HANKO_FONT_FAMILY = "'Noto Serif JP','Hiragino Mincho ProN','Yu Mincho',serif";

/** Google Fonts family name used when converting glyphs to paths for download. */
export const HANKO_OUTLINE_FONT_FAMILY = 'Noto Serif JP';

export interface HankoOptions {
  shape?: 'square' | 'round';
  /** 'vertical-columns' (default) for kanji seals; 'horizontal' for a
   * katakana-only name, engraved left-to-right. */
  orientation?: 'vertical-columns' | 'horizontal';
}

export interface HankoGlyph {
  char: string;
  /** Center X in viewBox units. */
  x: number;
  /** Center Y in viewBox units. */
  y: number;
  fontSize: number;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function shapeMarkup(shape: 'square' | 'round'): string {
  if (shape === 'round') {
    return `<circle cx="${HANKO_SIZE / 2}" cy="${HANKO_SIZE / 2}" r="${HANKO_SIZE / 2 - 8}" fill="${RED}" filter="url(#kzHankoTexture)" />`;
  }
  const inset = 8;
  return `<rect x="${inset}" y="${inset}" width="${HANKO_SIZE - inset * 2}" height="${HANKO_SIZE - inset * 2}" rx="6" fill="${RED}" filter="url(#kzHankoTexture)" />`;
}

/** How many characters go in each column, ordered right-to-left. */
function columnLayout(count: number): number[] {
  if (count <= 3) return [count];
  if (count === 4) return [2, 2];
  if (count === 5) return [3, 2];
  return [3, 3];
}

function stackedColumnGlyphs(chars: string[], x: number, fontSize: number): HankoGlyph[] {
  return chars.map((char, i) => ({
    char,
    x,
    y: HANKO_SIZE / 2 + (i - (chars.length - 1) / 2) * fontSize * 1.12,
    fontSize,
  }));
}

function verticalColumnsGlyphs(chars: string[]): HankoGlyph[] {
  if (chars.length === 0) return [];
  if (chars.length === 1) {
    return [{ char: chars[0], x: HANKO_SIZE / 2, y: HANKO_SIZE * 0.54, fontSize: 92 }];
  }

  const layout = columnLayout(chars.length);
  const fontSize = layout.length > 1 ? 58 : chars.length === 2 ? 68 : 54;
  const columnX = layout.length > 1 ? [HANKO_SIZE * 0.68, HANKO_SIZE * 0.32] : [HANKO_SIZE / 2];

  let offset = 0;
  return layout.flatMap((columnCount, i) => {
    const columnChars = chars.slice(offset, offset + columnCount);
    offset += columnCount;
    return stackedColumnGlyphs(columnChars, columnX[i], fontSize);
  });
}

function horizontalRowGlyphs(chars: string[]): HankoGlyph[] {
  if (chars.length === 0) return [];
  const fontSize = chars.length <= 2 ? 60 : chars.length <= 4 ? 46 : 36;
  return chars.map((char, i) => ({
    char,
    x: HANKO_SIZE / 2 + (i - (chars.length - 1) / 2) * fontSize * 1.05,
    y: HANKO_SIZE * 0.54,
    fontSize,
  }));
}

export function layoutHankoGlyphs(chars: string[], options: HankoOptions = {}): HankoGlyph[] {
  const orientation = options.orientation ?? 'vertical-columns';
  const cleanChars = chars.filter(Boolean).slice(0, MAX_CHARS);
  return orientation === 'horizontal' ? horizontalRowGlyphs(cleanChars) : verticalColumnsGlyphs(cleanChars);
}

function textMarkup(glyphs: HankoGlyph[]): string {
  return glyphs
    .map(
      (g) =>
        `<text x="${g.x}" y="${g.y}" text-anchor="middle" dominant-baseline="middle" font-family="${HANKO_FONT_FAMILY}" font-size="${g.fontSize}" fill="#fff">${escapeXml(g.char)}</text>`,
    )
    .join('');
}

/** Center a glyph path on (cx, cy) — matches text-anchor/dominant-baseline middle. */
export function glyphToCenteredPath(font: Font, char: string, cx: number, cy: number, fontSize: number): string {
  const probe = font.getPath(char, 0, 0, fontSize);
  const bb = probe.getBoundingBox();
  if (!Number.isFinite(bb.x1) || !Number.isFinite(bb.x2) || bb.x1 === bb.x2) {
    return '';
  }
  const dx = cx - (bb.x1 + bb.x2) / 2;
  const dy = cy - (bb.y1 + bb.y2) / 2;
  const path = font.getPath(char, dx, dy, fontSize);
  const d = path.toPathData(2);
  return d ? `<path d="${d}" fill="#fff"/>` : '';
}

function pathMarkup(glyphs: HankoGlyph[], font: Font): string {
  const paths = glyphs.map((g) => {
    const path = glyphToCenteredPath(font, g.char, g.x, g.y, g.fontSize);
    if (!path) {
      throw new Error(`Could not outline glyph: ${g.char}`);
    }
    return path;
  });
  return paths.join('');
}

function wrapSvg(charsLabel: string, shape: 'square' | 'round', content: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${HANKO_SIZE} ${HANKO_SIZE}" width="${HANKO_SIZE}" height="${HANKO_SIZE}" role="img" aria-label="Hanko seal: ${escapeXml(charsLabel)}">
  <defs>
    <filter id="kzHankoTexture" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  ${shapeMarkup(shape)}
  ${content}
</svg>`;
}

export function generateHankoSvg(chars: string[], options: HankoOptions = {}): string {
  const shape = options.shape ?? 'square';
  const cleanChars = chars.filter(Boolean).slice(0, MAX_CHARS);
  const glyphs = layoutHankoGlyphs(cleanChars, options);
  return wrapSvg(cleanChars.join(''), shape, textMarkup(glyphs));
}

/** True when the SVG has no `<text>` / font-family (safe to open without fonts). */
export function isFontFreeHankoSvg(svg: string): boolean {
  return !/<text[\s>]/i.test(svg) && !/font-family/i.test(svg) && /<path[\s>]/i.test(svg);
}

/** Font-free SVG: glyphs converted to vector paths (for download / copy). */
export function generateHankoSvgOutlined(chars: string[], font: Font, options: HankoOptions = {}): string {
  const shape = options.shape ?? 'square';
  const cleanChars = chars.filter(Boolean).slice(0, MAX_CHARS);
  const glyphs = layoutHankoGlyphs(cleanChars, options);
  const svg = wrapSvg(cleanChars.join(''), shape, pathMarkup(glyphs, font));
  if (!isFontFreeHankoSvg(svg)) {
    throw new Error('Outlined hanko SVG still references text/fonts');
  }
  return svg;
}
