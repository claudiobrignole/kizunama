#!/usr/bin/env node
/**
 * Builds/updates src/data/atejiMeaningsIt.json — EN→IT gloss map for atejiIndex.
 * Uses MyMemory (free MT) with a local cache so re-runs only fetch missing keys.
 *
 * Then patches meaningIt inside src/data/atejiIndex.json (and is also consulted
 * by scripts/build-ateji-index.mjs on the next full rebuild).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'src/data/atejiIndex.json');
const CACHE_PATH = path.join(ROOT, 'src/data/atejiMeaningsIt.json');

const CONCURRENCY = 4;
const RETRIES = 3;

function loadJson(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function collectUniqueMeanings(index) {
  const set = new Set();
  for (const list of Object.values(index.readings ?? {})) {
    for (const c of list) {
      if (c.meaningEn) set.add(c.meaningEn);
    }
  }
  return [...set];
}

async function translateViaMyMemory(text) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', 'en|it');
  url.searchParams.set('de', 'kizunama@lunanihongo.com');

  for (let attempt = 0; attempt < RETRIES; attempt++) {
    const res = await fetch(url);
    if (!res.ok) {
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      continue;
    }
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (typeof translated === 'string' && translated.trim() && !/MYMEMORY WARNING/i.test(translated)) {
      return translated.trim();
    }
    // Soft quota / warning — don't burn retries; caller falls back to GTX.
    if (typeof translated === 'string' && /MYMEMORY WARNING/i.test(translated)) {
      return null;
    }
    await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
  }
  return null;
}

/** Unofficial Google Translate endpoint used only as fallback when MyMemory is
 * rate-limited. Keep concurrency low to avoid bans. */
async function translateViaGtx(text) {
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'en');
  url.searchParams.set('tl', 'it');
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);

  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      const data = await res.json();
      const parts = Array.isArray(data?.[0]) ? data[0] : [];
      const translated = parts
        .map((seg) => (Array.isArray(seg) ? seg[0] : ''))
        .filter(Boolean)
        .join('');
      if (translated.trim()) return translated.trim();
    } catch {
      // network blip
    }
    await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
  }
  return null;
}

async function translateEnToIt(text) {
  return (await translateViaMyMemory(text)) ?? (await translateViaGtx(text));
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

async function main() {
  const index = loadJson(INDEX_PATH, null);
  if (!index?.readings) {
    console.error('[meanings-it] atejiIndex.json missing — run npm run data:ateji first');
    process.exit(1);
  }

  const cache = loadJson(CACHE_PATH, { generatedAt: null, translations: {} });
  const unique = collectUniqueMeanings(index);
  const missing = unique.filter((en) => !cache.translations[en]);

  console.log(`[meanings-it] unique=${unique.length} cached=${unique.length - missing.length} missing=${missing.length}`);

  if (missing.length > 0) {
    let done = 0;
    let failed = 0;
    await mapPool(missing, CONCURRENCY, async (en) => {
      const it = await translateEnToIt(en);
      if (it) {
        cache.translations[en] = it;
        done += 1;
      } else {
        failed += 1;
      }
      if ((done + failed) % 50 === 0 || done + failed === missing.length) {
        cache.generatedAt = new Date().toISOString();
        fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));
        console.log(`[meanings-it] progress ${done + failed}/${missing.length} (ok=${done} fail=${failed})`);
      }
    });
    cache.generatedAt = new Date().toISOString();
    fs.writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 0)}\n`);
    console.log(`[meanings-it] wrote cache ${CACHE_PATH} (ok=${done} fail=${failed})`);
  }

  let patched = 0;
  let stillEn = 0;
  for (const list of Object.values(index.readings)) {
    for (const c of list) {
      if (!c.meaningEn) {
        c.meaningIt = '';
        continue;
      }
      const it = cache.translations[c.meaningEn];
      if (it) {
        c.meaningIt = it;
        patched += 1;
      } else {
        c.meaningIt = c.meaningEn;
        stillEn += 1;
      }
    }
  }
  fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index)}\n`);
  console.log(`[meanings-it] patched atejiIndex meaningIt: translated=${patched} fallbackEn=${stillEn}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
