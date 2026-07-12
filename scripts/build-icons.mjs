#!/usr/bin/env node
/**
 * Builds Kizunama PWA icons: full-bleed Luna red with a centred white
 * Bricolage "K". Glyphs are outlined so PNG/SVG output does not depend on
 * fonts installed on the machine that opens them.
 */
import sharp from 'sharp';
import opentype from 'opentype.js';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../public/icons');
const MASTER_SVG = path.join(__dirname, 'icon-master.svg');
const MASTER_PNG = path.join(__dirname, 'icon-master.png');
const FONT_FILE = path.join(__dirname, 'fonts/BricolageGrotesque-ExtraBold.ttf');

const BG = '#d6304a'; // --ln-red
const FG = '#ffffff';
const SIZE = 1024;
/** Maskable safe zone is the centre 80% — keep the K inside this inset. */
const SAFE = { min: SIZE * 0.12, max: SIZE * 0.88 };

function loadFont() {
  const buf = readFileSync(FONT_FILE);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/** Build glyph outlines without OpenType GSUB (opentype.js chokes on this font's features). */
function textPath(font, text, fontSize) {
  let x = 0;
  const scale = fontSize / font.unitsPerEm;
  const commands = [];
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    commands.push(...glyph.getPath(x, 0, fontSize).commands);
    x += (glyph.advanceWidth || 0) * scale;
  }
  return { commands, width: x };
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

function buildSvg(font, size) {
  // Large centred K within the maskable safe zone.
  const k = textPath(font, 'K', 620);
  const bboxY0 = Math.min(...k.commands.filter((c) => 'y' in c).map((c) => c.y));
  const bboxY1 = Math.max(...k.commands.filter((c) => 'y' in c).map((c) => c.y));
  const kHeight = bboxY1 - bboxY0;
  const kX = (SIZE - k.width) / 2;
  // Optical vertical centre (path y grows downward from the baseline).
  const kY = (SIZE - kHeight) / 2 - bboxY0;

  if (kX < SAFE.min || kX + k.width > SAFE.max) {
    console.warn('[icons] K near maskable safe-zone edge — check layout');
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="KIZUNAMA">
  <rect width="100%" height="100%" fill="${BG}"/>
  <path fill="${FG}" transform="translate(${kX.toFixed(2)} ${kY.toFixed(2)})" d="${commandsToD(k.commands)}"/>
</svg>`;
}

if (!existsSync(FONT_FILE)) {
  console.error(`Missing font: ${FONT_FILE}`);
  process.exit(1);
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const font = loadFont();
const masterSvg = buildSvg(font, SIZE);
writeFileSync(MASTER_SVG, masterSvg);
await sharp(Buffer.from(masterSvg)).png().toFile(MASTER_PNG);
console.log('icon-master.svg / icon-master.png written');

writeFileSync(path.join(OUT_DIR, 'icon.svg'), buildSvg(font, 512));

const sizes = [
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-192.png', size: 192 },
  { name: 'favicon-32.png', size: 32 },
];

for (const { name, size } of sizes) {
  await sharp(Buffer.from(buildSvg(font, size))).png().toFile(path.join(OUT_DIR, name));
  console.log(`${name} written`);
}

console.log('Icons written to public/icons/');
