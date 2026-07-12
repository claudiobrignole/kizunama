import type { Font } from 'opentype.js';
import { generateHankoSvg, generateHankoSvgOutlined, type HankoOptions } from './hanko';

/** Luna Nihongo palette (from design tokens — do not invent colors). */
export const SHARE_COLORS = {
  cream: '#faf6ed',
  washi: '#efe3c8',
  yellow: '#f0a92e',
  ink: '#2b2333',
  red: '#d6304a',
  redDeep: '#a8203a',
  white: '#ffffff',
} as const;

/** Local JP face used by the hanko / /fonts (reliable for canvas). */
export const SHARE_JP_FONT_FAMILY = 'Noto Serif JP';
export const SHARE_JP_FONT_URL = '/fonts/NotoSerifJP-Bold.woff';
export const SHARE_JP_FONT_WEIGHT = '700';

/** Latin display face from Luna tokens. */
export const SHARE_LATIN_FONT_FAMILY = 'Bricolage Grotesque';

export type ShareFormatId = 'story' | 'post' | 'square';

export interface ShareFormat {
  id: ShareFormatId;
  width: number;
  height: number;
}

export const SHARE_FORMATS: Record<ShareFormatId, ShareFormat> = {
  story: { id: 'story', width: 1080, height: 1920 },
  post: { id: 'post', width: 1080, height: 1350 },
  square: { id: 'square', width: 1080, height: 1080 },
};

export class ShareFontError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShareFontError';
  }
}

let jpFacePromise: Promise<FontFace> | null = null;

/** Clears the cached FontFace promise (unit tests only). */
export function __resetShareFontsForTests(): void {
  jpFacePromise = null;
}

async function registerLocalJpFont(): Promise<FontFace> {
  if (!jpFacePromise) {
    jpFacePromise = (async () => {
      const face = new FontFace(SHARE_JP_FONT_FAMILY, `url(${SHARE_JP_FONT_URL})`, {
        weight: SHARE_JP_FONT_WEIGHT,
        style: 'normal',
        display: 'block',
      });
      const loaded = await face.load();
      // FontFaceSet.add exists at runtime; TS 5.9 DOM libs omit it from the type.
      (document.fonts as FontFaceSet & Set<FontFace>).add(loaded);
      return loaded;
    })();
  }
  return jpFacePromise;
}

/**
 * Ensures Japanese (and latin display) fonts are usable on canvas.
 * Never draw share cards until this resolves without throwing.
 */
export async function ensureShareFonts(jpPx = 120): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) {
    throw new ShareFontError('document.fonts is unavailable');
  }

  await registerLocalJpFont();

  const jpSpec = `${SHARE_JP_FONT_WEIGHT} ${jpPx}px "${SHARE_JP_FONT_FAMILY}"`;
  await document.fonts.load(jpSpec);

  // Best-effort latin heading (CSS-loaded); share still works if missing.
  try {
    await document.fonts.load(`700 48px "${SHARE_LATIN_FONT_FAMILY}"`);
  } catch {
    /* ignore */
  }

  await document.fonts.ready;

  if (!document.fonts.check(jpSpec)) {
    throw new ShareFontError(
      `Japanese font not ready for canvas: ${jpSpec}. Refusing to draw (would fall back to system/tofu).`,
    );
  }
}

/** Test / runtime guard helper. */
export function isShareJpFontReady(jpPx = 120): boolean {
  if (typeof document === 'undefined' || !document.fonts) return false;
  return document.fonts.check(`${SHARE_JP_FONT_WEIGHT} ${jpPx}px "${SHARE_JP_FONT_FAMILY}"`);
}

export interface ShareCardContent {
  originalName: string;
  katakana: string;
  /** Large centered Japanese — kanji if chosen, else katakana. */
  displayJa: string;
  tagline: string;
  siteLabel?: string;
  hankoChars: string[];
  hankoOrientation?: HankoOptions['orientation'];
  /** Optional outlined font for path-based hanko (preferred). */
  hankoFont?: Font | null;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const chars = [...text];
  if (chars.length === 0) return [];
  const lines: string[] = [];
  let line = '';
  for (const ch of chars) {
    const next = line + ch;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function svgToImage(svg: string): Promise<{ img: HTMLImageElement; revoke: () => void }> {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.decoding = 'async';
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load hanko SVG into Image'));
      img.src = url;
    });
    return {
      img,
      revoke: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

function fitKanjiFontSize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxPx: number, minPx: number): number {
  let size = maxPx;
  while (size > minPx) {
    ctx.font = `${SHARE_JP_FONT_WEIGHT} ${size}px "${SHARE_JP_FONT_FAMILY}"`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 8;
  }
  return minPx;
}

/**
 * Draws a share card onto an offscreen canvas at the exact format pixel size.
 * Awaits font readiness before any text is painted.
 */
export async function renderShareCard(
  format: ShareFormat,
  content: ShareCardContent,
): Promise<HTMLCanvasElement> {
  const { width, height } = format;
  await ensureShareFonts(Math.round(height * 0.12));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Background: warm washi + yellow accent band (manga editorial).
  ctx.fillStyle = SHARE_COLORS.cream;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = SHARE_COLORS.yellow;
  ctx.fillRect(0, 0, width, Math.round(height * 0.14));

  // Hard-shadow card panel
  const margin = Math.round(width * 0.07);
  const panelX = margin;
  const panelY = Math.round(height * 0.1);
  const panelW = width - margin * 2;
  const panelH = height - panelY - Math.round(height * 0.08);
  ctx.fillStyle = SHARE_COLORS.ink;
  ctx.fillRect(panelX + 10, panelY + 10, panelW, panelH);
  ctx.fillStyle = SHARE_COLORS.white;
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeStyle = SHARE_COLORS.ink;
  ctx.lineWidth = 4;
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  // Red accent strip
  ctx.fillStyle = SHARE_COLORS.red;
  ctx.fillRect(panelX, panelY, 14, panelH);

  const contentWidth = panelW - Math.round(width * 0.12);
  let y = panelY + Math.round(height * 0.06);

  // Original name (latin)
  ctx.fillStyle = SHARE_COLORS.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const latinFamily = `"${SHARE_LATIN_FONT_FAMILY}", "Noto Sans", system-ui, sans-serif`;
  ctx.font = `700 ${Math.round(width * 0.045)}px ${latinFamily}`;
  const nameLines = wrapText(ctx, content.originalName || '—', contentWidth);
  for (const line of nameLines.slice(0, 3)) {
    ctx.fillText(line, width / 2, y);
    y += Math.round(width * 0.055);
  }

  // Katakana
  if (content.katakana) {
    y += Math.round(height * 0.01);
    ctx.fillStyle = SHARE_COLORS.red;
    const kanaSize = Math.round(width * 0.055);
    ctx.font = `${SHARE_JP_FONT_WEIGHT} ${kanaSize}px "${SHARE_JP_FONT_FAMILY}"`;
    ctx.fillText(content.katakana, width / 2, y);
    y += kanaSize + Math.round(height * 0.025);
  }

  // Large centered Japanese (kanji or kana)
  const display = content.displayJa || content.katakana || '';
  const maxKanji = Math.round(height * 0.16);
  const kanjiSize = fitKanjiFontSize(ctx, display, contentWidth, maxKanji, Math.round(width * 0.08));
  await ensureShareFonts(kanjiSize);
  if (!isShareJpFontReady(kanjiSize)) {
    throw new ShareFontError(`Japanese font check failed at ${kanjiSize}px before kanji draw`);
  }
  ctx.fillStyle = SHARE_COLORS.ink;
  ctx.font = `${SHARE_JP_FONT_WEIGHT} ${kanjiSize}px "${SHARE_JP_FONT_FAMILY}"`;
  ctx.fillText(display, width / 2, y);
  y += kanjiSize + Math.round(height * 0.04);

  // Hanko seal
  const hankoSize = Math.round(Math.min(width * 0.32, height * 0.18));
  if (content.hankoChars.length > 0) {
    const opts: HankoOptions = { orientation: content.hankoOrientation ?? 'horizontal', shape: 'square' };
    const svg = content.hankoFont
      ? generateHankoSvgOutlined(content.hankoChars, content.hankoFont, opts)
      : generateHankoSvg(content.hankoChars, opts);
    const img = await svgToImage(svg);
    try {
      const hx = (width - hankoSize) / 2;
      ctx.drawImage(img.img, hx, y, hankoSize, hankoSize);
    } finally {
      img.revoke();
    }
    y += hankoSize + Math.round(height * 0.035);
  }

  // Tagline
  ctx.fillStyle = SHARE_COLORS.ink;
  ctx.font = `600 ${Math.round(width * 0.038)}px ${latinFamily}`;
  const tagLines = wrapText(ctx, content.tagline, contentWidth);
  for (const line of tagLines.slice(0, 2)) {
    ctx.fillText(line, width / 2, y);
    y += Math.round(width * 0.048);
  }

  // Site URL — small footer credit (readable, not dominant)
  const site = content.siteLabel ?? 'kizunama.com';
  ctx.fillStyle = SHARE_COLORS.redDeep;
  ctx.font = `600 ${Math.round(width * 0.026)}px ${latinFamily}`;
  ctx.textBaseline = 'bottom';
  ctx.fillText(site, width / 2, panelY + panelH - Math.round(height * 0.028));

  return canvas;
}

export async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('canvas.toBlob returned null');
  return blob;
}

export function canSharePngFile(file: File): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    typeof navigator.share === 'function' &&
    navigator.canShare({ files: [file] })
  );
}

export function downloadPngBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
  }
}

export async function sharePngFile(blob: Blob, filename: string, shareTitle: string): Promise<void> {
  const file = new File([blob], filename, { type: 'image/png' });
  if (!canSharePngFile(file)) {
    throw new Error('Web Share API with files is not available');
  }
  await navigator.share({ files: [file], title: shareTitle, text: shareTitle });
}

export async function shareOrDownloadPng(blob: Blob, filename: string, shareTitle: string): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: 'image/png' });
  if (canSharePngFile(file)) {
    await navigator.share({ files: [file], title: shareTitle });
    return 'shared';
  }
  downloadPngBlob(blob, filename);
  return 'downloaded';
}
