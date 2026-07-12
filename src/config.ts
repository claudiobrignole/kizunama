/**
 * Static, build-time configuration. No backend/API calls.
 * Affiliate / sponsor URLs are opened in a new tab. Override hanko URL
 * at build time via VITE_HANKO_AFFILIATE_URL without touching this file.
 */

export const HANKO_AFFILIATE_URL: string =
  import.meta.env.VITE_HANKO_AFFILIATE_URL || 'https://hankohub.com/';

export const LUNA_NIHONGO_ORIGIN = 'https://lunanihongo.com';

export type LunaUtmCampaign = 'footer' | 'share';

/** Outbound Luna Nihongo URL with fixed UTM tagging (no analytics scripts). */
export function lunaNihongoUrl(campaign: LunaUtmCampaign = 'footer'): string {
  const url = new URL(LUNA_NIHONGO_ORIGIN);
  url.searchParams.set('utm_source', 'kizunama');
  url.searchParams.set('utm_medium', 'referral');
  url.searchParams.set('utm_campaign', campaign);
  return url.toString();
}

/** @deprecated Prefer lunaNihongoUrl('footer') — kept for older imports. */
export const SPONSOR_URL = lunaNihongoUrl('footer');
