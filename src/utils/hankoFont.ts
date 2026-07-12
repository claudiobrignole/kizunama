/**
 * Loads Noto Serif JP Bold (same family as the on-screen hanko preview) so
 * glyphs can be converted to SVG paths for download.
 *
 * Served from /fonts/NotoSerifJP-Bold.woff (WOFF — opentype.js parses it
 * natively; no Google Fonts / WOFF2).
 */

import opentype, { type Font } from 'opentype.js';

/** Public URL for the hanko outline face (Noto Serif JP 700). */
export const HANKO_OUTLINE_FONT_URL = '/fonts/NotoSerifJP-Bold.woff';

let fontPromise: Promise<Font> | null = null;

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

export function parseHankoOutlineFont(bytes: Uint8Array): Font {
  const sig = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (sig !== 'wOFF' && sig !== 'OTTO' && !(bytes[0] === 0x00 && bytes[1] === 0x01)) {
    throw new Error(`Unexpected font signature: ${JSON.stringify(sig)}`);
  }
  return opentype.parse(toArrayBuffer(bytes));
}

async function loadSerifJpBold(): Promise<Font> {
  const res = await fetch(HANKO_OUTLINE_FONT_URL);
  if (!res.ok) {
    throw new Error(`Noto Serif JP font request failed (${res.status})`);
  }
  return parseHankoOutlineFont(new Uint8Array(await res.arrayBuffer()));
}

/** Shared singleton — one fetch for the whole session. */
export function getHankoOutlineFont(): Promise<Font> {
  if (!fontPromise) {
    fontPromise = loadSerifJpBold().catch((err) => {
      fontPromise = null;
      throw err;
    });
  }
  return fontPromise;
}

export async function loadHankoOutlineFont(chars: string[]): Promise<Font> {
  const needed = [...new Set(chars.filter(Boolean))];
  if (needed.length === 0) {
    throw new Error('No characters to outline');
  }

  const font = await getHankoOutlineFont();

  for (const ch of needed) {
    const glyph = font.charToGlyph(ch);
    if (!glyph || glyph.index === 0) {
      throw new Error(`Noto Serif JP missing glyph for: ${ch}`);
    }
  }

  return font;
}
