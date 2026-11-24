/**
 * Raster Open Graph cards for name pages.
 * Text is drawn as glyph outlines so the PNG does not depend on fonts
 * installed on the machine that later serves the file.
 */
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const INK = '#2b2333';
const RED = '#d6304a';
const CREAM = '#faf6ed';
const MUTED = '#5c5348';

function loadFont(filePath) {
  const bytes = fs.readFileSync(filePath);
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return opentype.parse(copy);
}

function draw(font, text, x, baseline, size, fill) {
  const scale = size / font.unitsPerEm;
  let cursor = x;
  const paths = [];
  for (const char of text) {
    const glyph = font.charToGlyph(char);
    if (!glyph || glyph.name === '.notdef') {
      cursor += size * 0.5;
      continue;
    }
    paths.push(`<path fill="${fill}" d="${glyph.getPath(cursor, baseline, size).toPathData(2)}"/>`);
    cursor += (glyph.advanceWidth || 0) * scale;
  }
  return { svg: paths.join(''), width: cursor - x };
}

function fitSize(font, text, start, maxWidth) {
  let size = start;
  let width = draw(font, text, 0, 0, size, '#000').width;
  if (width > maxWidth && width > 0) {
    size = Math.max(28, Math.floor((start * maxWidth) / width));
    width = draw(font, text, 0, 0, size, '#000').width;
  }
  return { size, width };
}

let fonts = null;

function getFonts(root) {
  if (!fonts) {
    fonts = {
      latin: loadFont(path.join(root, 'scripts/fonts/BricolageGrotesque-ExtraBold.ttf')),
      jp: loadFont(path.join(root, 'public/fonts/NotoSerifJP-Bold.woff')),
    };
  }
  return fonts;
}

export async function writeNameOg(root, { outFile, name, katakana, romaji }) {
  const { latin, jp } = getFonts(root);
  const max = WIDTH - 120;

  const label = 'KIZUNAMA';
  const labelSize = 28;
  const labelWidth = draw(latin, label, 0, 0, labelSize, RED).width;

  const nameFit = fitSize(latin, name, 78, max);
  const kanaFit = fitSize(jp, katakana, 132, max);
  const romajiFit = fitSize(jp, romaji, 36, max);
  const site = 'kizunama.com';
  const siteSize = 24;
  const siteWidth = draw(latin, site, 0, 0, siteSize, RED).width;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${CREAM}"/>
  <rect width="${WIDTH}" height="18" fill="${RED}"/>
  ${draw(latin, label, (WIDTH - labelWidth) / 2, 120, labelSize, RED).svg}
  ${draw(latin, name, (WIDTH - nameFit.width) / 2, 230, nameFit.size, INK).svg}
  ${draw(jp, katakana, (WIDTH - kanaFit.width) / 2, 410, kanaFit.size, INK).svg}
  ${draw(jp, romaji, (WIDTH - romajiFit.width) / 2, 500, romajiFit.size, MUTED).svg}
  ${draw(latin, site, (WIDTH - siteWidth) / 2, 575, siteSize, RED).svg}
</svg>`;

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outFile);
}

export const OG_WIDTH = WIDTH;
export const OG_HEIGHT = HEIGHT;
