#!/usr/bin/env node
/**
 * Builds the Kizunama monogram icons from one SVG source.
 * The K outline is Bricolage Grotesque ExtraBold (the header lockup font),
 * converted to a path so every browser and generated PNG renders it exactly.
 */
import sharp from 'sharp';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../public/icons');
const MASTER_SVG = path.join(__dirname, 'icon-master.svg');
const MASTER_PNG = path.join(__dirname, 'icon-master.png');

const BG = '#d6304a'; // --ln-red
const FG = '#ffffff';
const SIZE = 1024;

// Bricolage Grotesque ExtraBold (wght 800, opsz 14, wdth 100), centred in
// the 1024 viewBox. Keeping the glyph as an outline makes icon builds
// independent of locally installed fonts.
const K_PATH =
  'M174.80 0L52.44 0L52.44-501.60L174.80-501.60L174.80-281.96Q212.04-298.68 243.96-323.76Q275.88-348.84 300.58-378.48Q325.28-408.12 341.62-439.66Q357.96-471.20 365.56-501.60L506.92-501.60Q497.80-466.64 477.28-430.54Q456.76-394.44 427.88-361.38Q399-328.32 365.94-302.48Q332.88-276.64 298.68-261.44L298.68-250.04Q333.64-250.04 360.62-242.44Q387.60-234.84 408.50-218.88Q429.40-202.92 444.98-178.98Q460.56-155.04 471.96-121.60L515.28 0L376.20 0L348.08-99.56Q338.96-133 323.76-152.38Q308.56-171.76 283.48-180.50Q258.40-189.24 218.88-189.24L174.80-189.24';

function buildSvg(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024" role="img" aria-label="Kizunama">
  <rect width="100%" height="100%" fill="${BG}"/>
  <path d="${K_PATH}" transform="translate(228.14 762.8)" fill="${FG}"/>
</svg>`;
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const masterSvg = buildSvg(SIZE);
writeFileSync(MASTER_SVG, masterSvg);
await sharp(Buffer.from(masterSvg)).png().toFile(MASTER_PNG);
console.log('icon-master.svg / icon-master.png written');

writeFileSync(path.join(OUT_DIR, 'icon.svg'), buildSvg(512));

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
