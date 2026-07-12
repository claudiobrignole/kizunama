#!/usr/bin/env node
/**
 * Builds the compact foreign-name lookup used by the conventional tier.
 * ENAMDICT is distributed in EUC-JP by EDRDG; the cached archive is ignored
 * so normal application builds remain offline and reproducible.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import anyAscii from 'any-ascii';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '.cache');
const ARCHIVE = path.join(CACHE_DIR, 'enamdict.gz');
const OUTPUT = path.join(__dirname, '../src/data/jmnedictNames.json');
const SOURCE = 'http://ftp.edrdg.org/pub/Nihongo/enamdict.gz';
const PERSON_TAG = /\((?:[^)]*,)?(?:f|g|s|m)(?:,[^)]*)?\)/;
const KATAKANA_ONLY = /^[ァ-ヺー・･]+$/u;

await mkdir(CACHE_DIR, { recursive: true });

let compressed;
try {
  compressed = await readFile(ARCHIVE);
} catch {
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`ENAMDICT download failed: ${response.status} ${response.statusText}`);
  compressed = Buffer.from(await response.arrayBuffer());
  await writeFile(ARCHIVE, compressed);
}

const text = new TextDecoder('euc-jp').decode(gunzipSync(compressed));
const variants = new Map();
let order = 0;

for (const line of text.split(/\r?\n/)) {
  const slash = line.indexOf(' /');
  if (slash < 1) continue;
  const headword = line.slice(0, slash).trim().split(/\s+/)[0];
  if (!KATAKANA_ONLY.test(headword)) continue;

  const senses = line.slice(slash + 2).split('/').map((sense) => sense.trim()).filter(Boolean);
  if (!senses.some((sense) => PERSON_TAG.test(sense))) continue;

  for (const sense of senses) {
    if (!PERSON_TAG.test(sense)) continue;
    const gloss = sense.replace(/\([^)]*\)/g, ' ').replace(/\{[^}]*\}/g, ' ').trim();
    if (!gloss || !/[A-Za-z]/.test(anyAscii(gloss))) continue;
    const key = anyAscii(gloss).toLowerCase().replace(/[^a-z]/g, '');
    if (!key) continue;

    let names = variants.get(key);
    if (!names) {
      names = new Map();
      variants.set(key, names);
    }
    const current = names.get(headword);
    names.set(headword, current ? { ...current, count: current.count + 1 } : { count: 1, order: order++ });
  }
}

const output = {};
for (const key of [...variants.keys()].sort()) {
  const ranked = [...variants.get(key)].sort(
    ([, a], [, b]) => b.count - a.count || a.order - b.order,
  );
  output[key] = {
    k: ranked[0][0],
    ...(ranked.length > 1 ? { a: ranked.slice(1).map(([katakana]) => katakana) } : {}),
  };
}

await writeFile(OUTPUT, `${JSON.stringify(output)}\n`);
console.log(`jmnedictNames.json written: ${Object.keys(output).length} Latin name keys.`);
