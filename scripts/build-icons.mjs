#!/usr/bin/env node
/**
 * Builds PWA icons (black background, red 絆名) from an SVG master that
 * uses the same Japanese sans as the site titles (Noto Sans JP / system
 * CJK fallback). Re-run with `npm run build:icons` after changing colours
 * or glyph layout below.
 */
import sharp from 'sharp';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../public/icons');
const MASTER_SVG = path.join(__dirname, 'icon-master.svg');
const MASTER_PNG = path.join(__dirname, 'icon-master.png');

const BG = '#ffffff';
const FG = '#d6304a'; // --ln-red
const SIZE = 1024;

/** Prefer a local CJK-capable font so sharp/librsvg actually paints 絆名. */
const FONT_CANDIDATES = [
  '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  '/Library/Fonts/Arial Unicode.ttf',
  '/System/Library/Fonts/Hiragino Sans GB.ttc',
];

function resolveFontUrl() {
  for (const candidate of FONT_CANDIDATES) {
    if (existsSync(candidate)) return `file://${candidate}`;
  }
  return null;
}

function buildSvg(size) {
  const fontUrl = resolveFontUrl();
  const fontFace = fontUrl
    ? `@font-face { font-family: 'KizunamaIcon'; src: url('${fontUrl}'); }`
    : '';
  const fontFamily = fontUrl
    ? "KizunamaIcon, 'Noto Sans JP', 'Hiragino Sans', sans-serif"
    : "'Noto Sans JP', 'Hiragino Sans', 'Arial Unicode MS', sans-serif";
  const fontSize = Math.round(size * 0.41);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="絆名">
  <defs>
    <style type="text/css"><![CDATA[
      ${fontFace}
    ]]></style>
  </defs>
  <rect width="100%" height="100%" fill="${BG}"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
    font-family="${fontFamily}" font-size="${fontSize}" font-weight="900"
    fill="${FG}">絆名</text>
</svg>`;
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const masterSvg = buildSvg(SIZE);
writeFileSync(MASTER_SVG, masterSvg);
await sharp(Buffer.from(masterSvg)).png().toFile(MASTER_PNG);
console.log('icon-master.svg / icon-master.png written');

// Browser-served SVG must not use file:// font URLs — rely on installed CJK fonts.
const webSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="絆名">
  <rect width="100%" height="100%" fill="${BG}"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
    font-family="'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif"
    font-size="210" font-weight="900" fill="${FG}">絆名</text>
</svg>`;
writeFileSync(path.join(OUT_DIR, 'icon.svg'), webSvg);

const sizes = [
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-192.png', size: 192 },
  { name: 'favicon-32.png', size: 32 },
];

for (const { name, size } of sizes) {
  const svg = buildSvg(size);
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT_DIR, name));
  console.log(`${name} written`);
}

console.log('Icons written to public/icons/');
