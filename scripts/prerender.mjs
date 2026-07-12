/**
 * Post-vite prerender: localize dist/index.html (Italian root) and
 * dist/en/index.html (English), plus sitemap.xml and robots.txt.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://kizunama.com';
const OG_IMAGE = `${SITE}/icons/icon-512.png`;

const META = {
  it: {
    lang: 'it',
    canonical: `${SITE}/`,
    title: 'キズナマ KIZUNAMA - Trasforma il tuo nome in uno giapponese scritto in caratteri Katakana e Kanji',
    description:
      'キズナマ KIZUNAMA - Trasforma il tuo nome in uno giapponese scritto in caratteri Katakana e Kanji',
    ogTitle: 'キズナマ KIZUNAMA - Trasforma il tuo nome in uno giapponese scritto in caratteri Katakana e Kanji',
    ogDescription:
      'キズナマ KIZUNAMA - Trasforma il tuo nome in uno giapponese scritto in caratteri Katakana e Kanji',
  },
  en: {
    lang: 'en',
    canonical: `${SITE}/en/`,
    title: 'キズナマ KIZUNAMA - Turn your name into a Japanese Katakana and Kanji name',
    description: 'キズナマ KIZUNAMA - Turn your name into a Japanese Katakana and Kanji name',
    ogTitle: 'キズナマ KIZUNAMA - Turn your name into a Japanese Katakana and Kanji name',
    ogDescription: 'キズナマ KIZUNAMA - Turn your name into a Japanese Katakana and Kanji name',
  },
};

const HREFLANG = `
    <link rel="alternate" hreflang="it" href="${SITE}/" />
    <link rel="alternate" hreflang="en" href="${SITE}/en/" />
    <link rel="alternate" hreflang="x-default" href="${SITE}/" />`.trim();

function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function applyMeta(html, meta) {
  let out = html;

  out = out.replace(/<html\s+lang="[^"]*"/i, `<html lang="${meta.lang}"`);
  if (!/<html\s+lang=/i.test(out)) {
    out = out.replace(/<html/i, `<html lang="${meta.lang}"`);
  }

  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(meta.title)}</title>`);

  const ensureMeta = (pattern, tag) => {
    if (pattern.test(out)) {
      out = out.replace(pattern, tag);
    } else {
      out = out.replace(/<\/head>/i, `    ${tag}\n  </head>`);
    }
  };

  ensureMeta(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeAttr(meta.ogTitle)}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeAttr(meta.ogDescription)}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeAttr(meta.canonical)}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeAttr(OG_IMAGE)}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:alt" content="キズナマ KIZUNAMA" />`,
  );
  ensureMeta(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeAttr(meta.ogTitle)}" />`,
  );
  ensureMeta(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeAttr(meta.ogDescription)}" />`,
  );
  ensureMeta(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeAttr(OG_IMAGE)}" />`,
  );

  // Drop any previous canonical / hreflang, then inject a fresh set.
  out = out.replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '');
  out = out.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>/gi, '');

  const headExtras = `
    <link rel="canonical" href="${meta.canonical}" />
    ${HREFLANG}`;

  out = out.replace(/<\/head>/i, `${headExtras}\n  </head>`);
  return out;
}

function main() {
  const built = path.join(DIST, 'index.html');
  if (!fs.existsSync(built)) {
    console.error('[prerender] dist/index.html missing — run vite build first');
    process.exit(1);
  }

  const template = fs.readFileSync(built, 'utf8');

  const italianHtml = applyMeta(template, META.it);
  fs.writeFileSync(built, italianHtml);

  const enDir = path.join(DIST, 'en');
  fs.mkdirSync(enDir, { recursive: true });
  fs.writeFileSync(path.join(enDir, 'index.html'), applyMeta(template, META.en));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}/</loc>
  </url>
  <url>
    <loc>${SITE}/en/</loc>
  </url>
</urlset>
`;
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);

  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
  fs.writeFileSync(path.join(DIST, 'robots.txt'), robots);

  console.log('[prerender] wrote dist/index.html (it), dist/en/index.html (en), sitemap.xml, robots.txt');
}

main();
