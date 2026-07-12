#!/usr/bin/env node
/**
 * Builds Kizunama PWA icons (full-bleed red + white K) and the 1200×630
 * Open Graph share card. Glyphs are outlined so PNG/SVG output does not
 * depend on fonts installed on the machine that opens them.
 */
import sharp from 'sharp';
import opentype from 'opentype.js';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../public/icons');
const BRAND_DIR = path.join(__dirname, '../public/brand');
const MASTER_SVG = path.join(__dirname, 'icon-master.svg');
const MASTER_PNG = path.join(__dirname, 'icon-master.png');
const FONT_LATIN = path.join(__dirname, 'fonts/BricolageGrotesque-ExtraBold.ttf');
const FONT_JP = path.join(__dirname, '../public/fonts/NotoSerifJP-Bold.woff');
const OG_OUT = path.join(BRAND_DIR, 'og-card.png');

const BG = '#d6304a'; // --ln-red
const FG = '#ffffff';
const SIZE = 1024;
/** Maskable safe zone is the centre 80% — keep the K inside this inset. */
const SAFE = { min: SIZE * 0.12, max: SIZE * 0.88 };

function loadFont(filePath) {
  const buf = readFileSync(filePath);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/** Build glyph outlines without OpenType GSUB (opentype.js chokes on some fonts' features). */
function textPath(font, text, fontSize, letterSpacing = 0) {
  let x = 0;
  const scale = fontSize / font.unitsPerEm;
  const commands = [];
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    commands.push(...glyph.getPath(x, 0, fontSize).commands);
    x += (glyph.advanceWidth || 0) * scale + letterSpacing;
  }
  return { commands, width: Math.max(0, x - letterSpacing) };
}

function commandsToD(commands) {
  return commands
    .map((c) => {
      if (c.type === 'M') return `M${c.x} ${c.y}`;
      if (c.type === 'L') return `L${c.x} ${c.y}`;
      if (c.type === 'C') return `C${c.x1} ${c.y1} ${c.x2} ${c.y2} ${c.x} ${c.y}`;
      if (c.type === 'Q') return `Q${c.x1} ${c.y1} ${c.x} ${c.y}`;
      if (c.type === 'Z') return 'Z';
      return '';
    })
    .join('');
}

function pathElement(d, x, y) {
  return `<path fill="${FG}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})" d="${d}"/>`;
}

function buildIconSvg(latinFont, size) {
  const k = textPath(latinFont, 'K', 620);
  const bboxY0 = Math.min(...k.commands.filter((c) => 'y' in c).map((c) => c.y));
  const bboxY1 = Math.max(...k.commands.filter((c) => 'y' in c).map((c) => c.y));
  const kHeight = bboxY1 - bboxY0;
  const kX = (SIZE - k.width) / 2;
  const kY = (SIZE - kHeight) / 2 - bboxY0;

  if (kX < SAFE.min || kX + k.width > SAFE.max) {
    console.warn('[icons] K near maskable safe-zone edge — check layout');
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="KIZUNAMA">
  <rect width="100%" height="100%" fill="${BG}"/>
  ${pathElement(commandsToD(k.commands), kX, kY)}
</svg>`;
}

/** 1200×630 social card: red field, K + KIZUNAMA, 絆名, tagline. */
function buildOgSvg(latinFont, jpFont) {
  const W = 1200;
  const H = 630;
  const k = textPath(latinFont, 'K', 220);
  const word = textPath(latinFont, 'KIZUNAMA', 72, 3);
  const ateji = textPath(jpFont, '絆名', 64);
  const tag = textPath(latinFont, 'Katakana · Ateji · Hanko', 36, 1);

  const left = 96;
  const kY = 250;
  const wordX = left + k.width + 36;
  const wordY = 235;
  const atejiY = 340;
  const tagY = 520;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="KIZUNAMA">
  <rect width="100%" height="100%" fill="${BG}"/>
  ${pathElement(commandsToD(k.commands), left, kY)}
  ${pathElement(commandsToD(word.commands), wordX, wordY)}
  ${pathElement(commandsToD(ateji.commands), left, atejiY)}
  ${pathElement(commandsToD(tag.commands), left, tagY)}
</svg>`;
}

if (!existsSync(FONT_LATIN)) {
  console.error(`Missing font: ${FONT_LATIN}`);
  process.exit(1);
}
if (!existsSync(FONT_JP)) {
  console.error(`Missing font: ${FONT_JP}`);
  process.exit(1);
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
if (!existsSync(BRAND_DIR)) mkdirSync(BRAND_DIR, { recursive: true });

const latinFont = loadFont(FONT_LATIN);
const jpFont = loadFont(FONT_JP);

const masterSvg = buildIconSvg(latinFont, SIZE);
writeFileSync(MASTER_SVG, masterSvg);
await sharp(Buffer.from(masterSvg)).png().toFile(MASTER_PNG);
console.log('icon-master.svg / icon-master.png written');

writeFileSync(path.join(OUT_DIR, 'icon.svg'), buildIconSvg(latinFont, 512));

const sizes = [
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-192.png', size: 192 },
  { name: 'favicon-32.png', size: 32 },
];

for (const { name, size } of sizes) {
  await sharp(Buffer.from(buildIconSvg(latinFont, size))).png().toFile(path.join(OUT_DIR, name));
  console.log(`${name} written`);
}

const ogSvg = buildOgSvg(latinFont, jpFont);
await sharp(Buffer.from(ogSvg)).png().toFile(OG_OUT);
console.log(`og-card.png written (${OG_OUT})`);

console.log('Icons written to public/icons/');
