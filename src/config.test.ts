import { describe, expect, it } from 'vitest';
import { lunaNihongoUrl } from './config';

describe('lunaNihongoUrl', () => {
  it.each(['footer', 'share'] as const)('adds centralized %s UTM tagging', (campaign) => {
    const url = new URL(lunaNihongoUrl(campaign));
    expect(url.origin).toBe('https://lunanihongo.com');
    expect(url.searchParams.get('utm_source')).toBe('kizunama');
    expect(url.searchParams.get('utm_medium')).toBe('referral');
    expect(url.searchParams.get('utm_campaign')).toBe(campaign);
  });
});
