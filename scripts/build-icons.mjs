#!/usr/bin/env node
/**
 * Rasterizes scripts/icon-master.png (source artwork) into the PWA icon
 * sizes under public/icons/. Re-run with `npm run build:icons` if you
 * replace the master artwork.
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, 'icon-master.png');
const OUT_DIR = path.join(__dirname, '../public/icons');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(SRC).resize(size, size).png().toFile(path.join(OUT_DIR, `icon-${size}.png`));
  console.log(`icon-${size}.png written`);
}

await sharp(SRC).resize(32, 32).png().toFile(path.join(OUT_DIR, 'favicon-32.png'));

console.log('Icons written to public/icons/');
