/**
 * Static, build-time configuration. No backend/API calls: the affiliate URL
 * is just a link opened in a new tab. Update HANKO_AFFILIATE_URL once you
 * have joined a hanko print-on-demand affiliate program (e.g. Hanko Hub).
 * You can also override it at build time via the VITE_HANKO_AFFILIATE_URL
 * env var without touching this file.
 */
export const HANKO_AFFILIATE_URL: string =
  import.meta.env.VITE_HANKO_AFFILIATE_URL || 'https://hankohub.com/';

export const SPONSOR_URL = 'https://lunanihongo.com';
