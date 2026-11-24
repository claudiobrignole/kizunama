import { useEffect } from 'react';

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  robots?: string;
  ogImage: string;
  ogAlt: string;
  ogLocale: string;
  hreflang: { hreflang: string; href: string }[];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string, extra?: Record<string, string>) {
  const selector = extra?.hreflang
    ? `link[rel="${rel}"][hreflang="${extra.hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  if (extra) {
    for (const [key, value] of Object.entries(extra)) el.setAttribute(key, value);
  }
}

/** Keeps the document head aligned with the route after hydration. */
export function usePageMeta(meta: PageMeta) {
  const { title, description, canonical, robots, ogImage, ogAlt, ogLocale, hreflang } = meta;
  const hreflangKey = hreflang.map((item) => `${item.hreflang}:${item.href}`).join('|');

  useEffect(() => {
    document.title = title;
    document.documentElement.lang = ogLocale.startsWith('it') ? 'it' : 'en';
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots ?? 'index,follow');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:image:alt', ogAlt);
    upsertMeta('property', 'og:locale', ogLocale);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', ogImage);
    upsertLink('canonical', canonical);

    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());
    for (const item of hreflang) {
      upsertLink('alternate', item.href, { hreflang: item.hreflang });
    }
  }, [title, description, canonical, robots, ogImage, ogAlt, ogLocale, hreflangKey, hreflang]);
}
