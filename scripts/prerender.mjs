/**
 * Post-vite prerender: localize dist/index.html (Italian root) and
 * dist/en/index.html (English), inject crawler-visible body copy + JSON-LD,
 * plus sitemap.xml (with hreflang) and robots.txt.
 *
 * Requires Node 22+ (`--experimental-strip-types`) to import locale TS modules.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { lunaNihongoUrl } from '../src/config.ts';
import en from '../src/i18n/locales/en.ts';
import it from '../src/i18n/locales/it.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://kizunama.com';
const OG_IMAGE = `${SITE}/brand/og-card.png`;
const OG_WIDTH = '1200';
const OG_HEIGHT = '630';
const MIN_STATIC_TEXT_CHARS = 1000;

const LOCALES = {
  it: {
    lang: 'it',
    ogLocale: 'it_IT',
    canonical: `${SITE}/`,
    messages: it,
  },
  en: {
    lang: 'en',
    ogLocale: 'en_US',
    canonical: `${SITE}/en/`,
    messages: en,
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

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildJsonLd(localeKey, meta) {
  const { lang, canonical, messages } = meta;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'KIZUNAMA',
        alternateName: '絆名',
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
    ],
  };
}

function buildStaticBody(messages) {
  const lunaUrl = lunaNihongoUrl('seo');
  const bands = [
    { index: messages.band1.index, subtitle: messages.band1.subtitle },
    { index: messages.band2.index, subtitle: messages.band2.subtitle },
    { index: messages.band3.index, subtitle: messages.band3.subtitle },
    { index: messages.band4.index, subtitle: messages.band4.subtitle },
  ];

  const howTitle = messages.header.helpButton;

  return `
    <div class="kz-landing kz-seo-static" data-seo-static="true">
      <header class="ln-header">
        <div class="ln-header-inner">
          <div class="kz-header-main">
            <div class="kz-brand-lockup">
              <span class="kz-brand-lockup__name">
                <span class="kz-brand-lockup__kanji" lang="ja">キズナマ</span>
                KIZUNAMA
              </span>
            </div>
            <p class="kz-header-tagline">${escapeHtml(messages.header.tagline)}</p>
          </div>
        </div>
      </header>
      <main class="kz-seo-static__main">
        <h1 class="kz-seo-static__title">KIZUNAMA — ${escapeHtml(messages.header.tagline)}</h1>
        <p class="kz-seo-static__lead">${escapeHtml(messages.footer.seo)}</p>
        <section class="kz-seo-static__how" aria-labelledby="kz-seo-how">
          <h2 id="kz-seo-how" class="kz-seo-static__how-title">${escapeHtml(howTitle)}</h2>
          <ol class="kz-seo-static__bands">
            ${bands
              .map(
                (b) => `
              <li class="kz-seo-static__band">
                <strong class="kz-seo-static__band-index">${escapeHtml(b.index)}</strong>
                <span class="kz-seo-static__band-sub">${escapeHtml(b.subtitle)}</span>
              </li>`,
              )
              .join('')}
          </ol>
        </section>
        <aside class="kz-ateji-disclaimer" role="note">
          ${escapeHtml(messages.atejiCandidates.disclaimer)}
        </aside>
        <p class="kz-seo-static__legal">${escapeHtml(messages.generalDisclaimer)}</p>
      </main>
      <footer class="kz-footer ln-footer">
        <div class="kz-footer__inner">
          <p class="kz-footer__sources">
            <strong>${escapeHtml(messages.footer.sourcesTitle)}.</strong>
            ${escapeHtml(messages.footer.sourcesBody)}
          </p>
          <p class="kz-footer__credits">
            ${escapeHtml(messages.footer.credits)}
            <a href="https://brignole.ch" rel="noopener noreferrer">brignole.ch</a>
            ·
            <a href="${escapeAttr(lunaUrl)}" rel="noopener noreferrer">${escapeHtml(messages.footer.sponsorCta)}</a>
          </p>
        </div>
      </footer>
    </div>`.trim();
}

function applyMeta(html, localeKey) {
  const meta = LOCALES[localeKey];
  const { messages, lang, canonical, ogLocale } = meta;
  let out = html;

  out = out.replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"`);
  if (!/<html\s+lang=/i.test(out)) {
    out = out.replace(/<html/i, `<html lang="${lang}"`);
  }

  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(messages.meta.title)}</title>`);

  const ensureMeta = (pattern, tag) => {
    if (pattern.test(out)) {
      out = out.replace(pattern, tag);
    } else {
      out = out.replace(/<\/head>/i, `    ${tag}\n  </head>`);
    }
  };

  ensureMeta(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeAttr(messages.meta.description)}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeAttr(messages.meta.ogTitle)}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeAttr(messages.meta.ogDescription)}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeAttr(canonical)}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:locale" content="${ogLocale}" />`,
  );
  ensureMeta(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeAttr(OG_IMAGE)}" />`,
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
    `<meta property="og:image:alt" content="KIZUNAMA 絆名" />`,
  );
  ensureMeta(
    /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:card" content="summary_large_image" />`,
  );
  ensureMeta(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeAttr(messages.meta.ogTitle)}" />`,
  );
  ensureMeta(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeAttr(messages.meta.ogDescription)}" />`,
  );
  ensureMeta(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeAttr(OG_IMAGE)}" />`,
  );

  // Drop previous canonical / hreflang / json-ld, then inject fresh set.
  out = out.replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '');
  out = out.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>/gi, '');
  out = out.replace(/\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

  const jsonLd = JSON.stringify(buildJsonLd(localeKey, meta));
  const headExtras = `
    <link rel="canonical" href="${canonical}" />
    ${HREFLANG}
    <script type="application/ld+json">${jsonLd}</script>`;

  out = out.replace(/<\/head>/i, `${headExtras}\n  </head>`);

  const staticBody = buildStaticBody(messages);
  if (!/<div\s+id="root"[^>]*>\s*<\/div>/i.test(out)) {
    console.error('[prerender] expected empty <div id="root"></div> in Vite template');
    process.exit(1);
  }
  out = out.replace(/<div\s+id="root"[^>]*>\s*<\/div>/i, `<div id="root">${staticBody}</div>`);

  return out;
}

function readableTextLength(html) {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const text = withoutScripts
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length;
}

function assertStaticContent(filePath, localeKey) {
  const html = fs.readFileSync(filePath, 'utf8');
  const len = readableTextLength(html);
  if (len < MIN_STATIC_TEXT_CHARS) {
    console.error(
      `[prerender] ${localeKey}: readable text after stripping scripts is ${len} chars (need ≥ ${MIN_STATIC_TEXT_CHARS})`,
    );
    process.exit(1);
  }
  if (!html.includes('data-seo-static="true"')) {
    console.error(`[prerender] ${localeKey}: missing injected static body`);
    process.exit(1);
  }
  console.log(`[prerender] ${localeKey}: static text ok (${len} chars)`);
}

function main() {
  const built = path.join(DIST, 'index.html');
  if (!fs.existsSync(built)) {
    console.error('[prerender] dist/index.html missing — run vite build first');
    process.exit(1);
  }

  const ogCard = path.join(ROOT, 'public/brand/og-card.png');
  if (!fs.existsSync(ogCard)) {
    console.error('[prerender] public/brand/og-card.png missing — run npm run build:icons first');
    process.exit(1);
  }

  const template = fs.readFileSync(built, 'utf8');

  const italianHtml = applyMeta(template, 'it');
  fs.writeFileSync(built, italianHtml);

  const enDir = path.join(DIST, 'en');
  fs.mkdirSync(enDir, { recursive: true });
  const enPath = path.join(enDir, 'index.html');
  fs.writeFileSync(enPath, applyMeta(template, 'en'));

  const xhtmlLink = (hreflang, href) =>
    `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${SITE}/</loc>
${xhtmlLink('it', `${SITE}/`)}
${xhtmlLink('en', `${SITE}/en/`)}
${xhtmlLink('x-default', `${SITE}/`)}
  </url>
  <url>
    <loc>${SITE}/en/</loc>
${xhtmlLink('it', `${SITE}/`)}
${xhtmlLink('en', `${SITE}/en/`)}
${xhtmlLink('x-default', `${SITE}/`)}
  </url>
</urlset>
`;
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);

  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
  fs.writeFileSync(path.join(DIST, 'robots.txt'), robots);

  assertStaticContent(built, 'it');
  assertStaticContent(enPath, 'en');

  console.log('[prerender] wrote dist/index.html (it), dist/en/index.html (en), sitemap.xml, robots.txt');
}

main();
