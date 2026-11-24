/**
 * Post-vite prerender: localize home pages, write name and index HTML,
 * Open Graph cards, sitemap.xml (with hreflang) and robots.txt.
 *
 * Requires Node 22+ (`--experimental-strip-types`) to import locale TS modules.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import en from '../src/i18n/locales/en.ts';
import it from '../src/i18n/locales/it.ts';
import { absoluteUrl, homePath, hreflangSet, nameIndexPath, namePagePath } from '../src/seo/paths.ts';
import { nameModels, renderHomeStatic, renderIndexStatic, renderNameStatic } from '../src/seo/staticHtml.ts';
import { spellingFor } from '../src/seo/names.ts';
import { readKatakana } from '../src/utils/katakanaReading.ts';
import { OG_HEIGHT, OG_WIDTH, writeNameOg } from './nameOg.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://kizunama.com';
const BRAND_OG = `${SITE}/brand/og-card.png`;
const MIN_STATIC_TEXT_CHARS = 1000;

const LOCALES = {
  it: { lang: 'it', ogLocale: 'it_IT', messages: it },
  en: { lang: 'en', ogLocale: 'en_US', messages: en },
};

function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function homeJsonLd(localeKey, canonical) {
  const { lang, messages } = LOCALES[localeKey];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'KIZUNAMA',
        alternateName: ['絆名', 'Katakana Name Converter'],
        url: canonical,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        inLanguage: lang,
        description: messages.meta.description,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
        },
        publisher: { '@id': 'https://brignole.ch/#organization' },
      },
      {
        '@type': 'Organization',
        '@id': 'https://brignole.ch/#organization',
        name: 'Brignole',
        url: 'https://brignole.ch',
      },
      {
        '@type': 'FAQPage',
        mainEntity: messages.seo.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
}

function hreflangTags(links) {
  return links
    .map((item) => `    <link rel="alternate" hreflang="${item.hreflang}" href="${escapeAttr(item.href)}" />`)
    .join('\n');
}

function applyDocument(html, page) {
  const { lang, title, description, canonical, ogLocale, ogImage, ogAlt, links, jsonLd } = page;
  let out = html;

  out = out.replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"`);
  if (!/<html\s+lang=/i.test(out)) out = out.replace(/<html/i, `<html lang="${lang}"`);

  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(title)}</title>`);

  const ensureMeta = (pattern, tag) => {
    if (pattern.test(out)) out = out.replace(pattern, tag);
    else out = out.replace(/<\/head>/i, `    ${tag}\n  </head>`);
  };

  ensureMeta(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeAttr(description)}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeAttr(canonical)}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:locale" content="${escapeAttr(ogLocale)}" />`,
  );
  const alternateLocale = ogLocale === 'it_IT' ? 'en_US' : 'it_IT';
  ensureMeta(
    /<meta\s+property="og:locale:alternate"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:locale:alternate" content="${alternateLocale}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeAttr(ogImage)}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:image:width"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:width" content="${OG_WIDTH}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:image:height"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:height" content="${OG_HEIGHT}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:image:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:type" content="image/png" />`,
  );
  ensureMeta(
    /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:alt" content="${escapeAttr(ogAlt)}" />`,
  );
  ensureMeta(
    /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:card" content="summary_large_image" />`,
  );
  ensureMeta(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
  );
  ensureMeta(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
  );
  ensureMeta(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeAttr(ogImage)}" />`,
  );

  out = out.replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '');
  out = out.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>/gi, '');
  out = out.replace(/\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

  const headExtras = `
    <link rel="canonical" href="${escapeAttr(canonical)}" />
${hreflangTags(links)}
    <link rel="alternate" type="text/plain" title="LLM summary" href="${SITE}/llms.txt" />
    ${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ''}`;

  out = out.replace(/<\/head>/i, `${headExtras}\n  </head>`);

  if (!/<div\s+id="root"[^>]*>\s*<\/div>/i.test(out)) {
    console.error('[prerender] expected empty <div id="root"></div> in Vite template');
    process.exit(1);
  }
  out = out.replace(/<div\s+id="root"[^>]*>\s*<\/div>/i, `<div id="root">${page.body}</div>`);
  return out;
}

function readableTextLength(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length;
}

function assertStatic(filePath, label, needles) {
  const html = fs.readFileSync(filePath, 'utf8');
  const len = readableTextLength(html);
  if (len < MIN_STATIC_TEXT_CHARS && label.startsWith('home')) {
    console.error(`[prerender] ${label}: readable text is ${len} chars (need ≥ ${MIN_STATIC_TEXT_CHARS})`);
    process.exit(1);
  }
  if (!html.includes('data-seo-static="true"')) {
    console.error(`[prerender] ${label}: missing static body`);
    process.exit(1);
  }
  if (!html.includes('rel="canonical" href="https://kizunama.com')) {
    console.error(`[prerender] ${label}: canonical is not absolute`);
    process.exit(1);
  }
  for (const needle of needles) {
    if (!html.includes(needle)) {
      console.error(`[prerender] ${label}: missing ${needle.slice(0, 80)}`);
      process.exit(1);
    }
  }
  return html;
}

function writePage(template, filePath, page) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, applyDocument(template, page));
}

function xhtmlLink(hreflang, href) {
  return `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`;
}

function sitemapUrl(loc, links) {
  return `  <url>\n    <loc>${loc}</loc>\n${links.map((item) => xhtmlLink(item.hreflang, item.href)).join('\n')}\n  </url>`;
}

async function main() {
  const built = path.join(DIST, 'index.html');
  if (!fs.existsSync(built)) {
    console.error('[prerender] dist/index.html missing — run vite build first');
    process.exit(1);
  }
  if (!fs.existsSync(path.join(ROOT, 'public/brand/og-card.png'))) {
    console.error('[prerender] public/brand/og-card.png missing — run npm run build:icons first');
    process.exit(1);
  }

  const template = fs.readFileSync(built, 'utf8');
  const titles = new Set();
  const sitemap = [];

  for (const localeKey of ['it', 'en']) {
    const meta = LOCALES[localeKey];
    const canonical = absoluteUrl(homePath(localeKey));
    const body = renderHomeStatic(meta.messages, localeKey);
    const filePath = localeKey === 'it' ? built : path.join(DIST, 'en/index.html');
    writePage(template, filePath, {
      lang: meta.lang,
      title: meta.messages.meta.title,
      description: meta.messages.meta.description,
      canonical,
      ogLocale: meta.ogLocale,
      ogImage: BRAND_OG,
      ogAlt: 'KIZUNAMA',
      links: hreflangSet('home'),
      jsonLd: JSON.stringify(homeJsonLd(localeKey, canonical)),
      body,
    });
    assertStatic(filePath, `home-${localeKey}`, [
      meta.messages.seo.h1,
      'FAQPage',
      '"@type":"WebApplication"',
      '"price":"0"',
      'hreflang="x-default" href="https://kizunama.com/en/"',
    ]);
    titles.add(meta.messages.meta.title);
    sitemap.push(sitemapUrl(canonical, hreflangSet('home')));
  }

  for (const localeKey of ['it', 'en']) {
    const meta = LOCALES[localeKey];
    const canonical = absoluteUrl(nameIndexPath(localeKey));
    const filePath = path.join(DIST, nameIndexPath(localeKey).replace(/^\//, ''), 'index.html');
    writePage(template, filePath, {
      lang: meta.lang,
      title: meta.messages.seo.indexTitle,
      description: meta.messages.seo.indexDescription,
      canonical,
      ogLocale: meta.ogLocale,
      ogImage: BRAND_OG,
      ogAlt: 'KIZUNAMA',
      links: hreflangSet('index'),
      jsonLd: '',
      body: renderIndexStatic(meta.messages, localeKey),
    });
    assertStatic(filePath, `index-${localeKey}`, [meta.messages.seo.indexH1, 'hreflang="x-default" href="https://kizunama.com/en/names"']);
    titles.add(meta.messages.seo.indexTitle);
    sitemap.push(sitemapUrl(canonical, hreflangSet('index')));
  }

  let ogCount = 0;
  for (const localeKey of ['it', 'en']) {
    const meta = LOCALES[localeKey];
    for (const model of nameModels(localeKey, meta.messages)) {
      if (titles.has(model.title)) {
        console.error(`[prerender] duplicate title: ${model.title}`);
        process.exit(1);
      }
      titles.add(model.title);
      if (model.note.trim().length < 80) {
        console.error(`[prerender] thin note for ${model.entry.slug} (${localeKey})`);
        process.exit(1);
      }

      const kana = spellingFor(model.entry, localeKey);
      const reading = readKatakana(kana);
      const ogRel = `/og/names/${localeKey}/${model.entry.slug}.png`;
      const ogFile = path.join(DIST, ogRel.slice(1));
      await writeNameOg(ROOT, {
        outFile: ogFile,
        name: model.entry.name,
        katakana: kana,
        romaji: reading.romaji,
      });
      ogCount += 1;

      const canonical = absoluteUrl(namePagePath(localeKey, model.entry.slug));
      const filePath = path.join(DIST, namePagePath(localeKey, model.entry.slug).replace(/^\//, ''), 'index.html');
      writePage(template, filePath, {
        lang: meta.lang,
        title: model.title,
        description: model.description,
        canonical,
        ogLocale: meta.ogLocale,
        ogImage: absoluteUrl(ogRel),
        ogAlt: `${model.entry.name} ${kana}`,
        links: hreflangSet('name', model.entry.slug),
        jsonLd: '',
        body: renderNameStatic(model, meta.messages, localeKey),
      });
      const html = assertStatic(filePath, `${localeKey}/${model.entry.slug}`, [
        model.h1,
        kana,
        model.note.slice(0, 40),
        `hreflang="x-default" href="${absoluteUrl(namePagePath('en', model.entry.slug))}"`,
        absoluteUrl(ogRel),
      ]);
      if (readableTextLength(html) < 250) {
        console.error(`[prerender] ${localeKey}/${model.entry.slug} is too short to publish`);
        process.exit(1);
      }
      sitemap.push(sitemapUrl(canonical, hreflangSet('name', model.entry.slug)));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemap.join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml);
  fs.writeFileSync(
    path.join(DIST, 'robots.txt'),
    `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`,
  );

  const sitemapText = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
  const urlCount = (sitemapText.match(/<loc>/g) ?? []).length;
  if (urlCount !== sitemap.length) {
    console.error('[prerender] sitemap count mismatch');
    process.exit(1);
  }
  console.log(`[prerender] ${urlCount} sitemap URLs, ${ogCount} name cards`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
