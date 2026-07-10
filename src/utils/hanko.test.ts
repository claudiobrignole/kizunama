import { describe, expect, it } from 'vitest';
import { generateHankoSvg } from './hanko';

describe('generateHankoSvg', () => {
  it('produces a valid SVG string for a single kanji', () => {
    const svg = generateHankoSvg(['絆']);
    expect(svg).toContain('<svg');
    expect(svg).toContain('絆');
    expect(svg).toContain('</svg>');
  });

  it('produces vertically arranged text for two kanji', () => {
    const svg = generateHankoSvg(['絆', '名']);
    expect(svg).toContain('絆');
    expect(svg).toContain('名');
    expect(svg.match(/<text/g)?.length).toBe(2);
  });

  it('escapes special XML characters', () => {
    const svg = generateHankoSvg(['<x>']);
    expect(svg).not.toContain('<x>');
    expect(svg).toContain('&lt;x&gt;');
  });

  it('supports a round shape', () => {
    const svg = generateHankoSvg(['絆'], { shape: 'round' });
    expect(svg).toContain('<circle');
  });

  it('ignores more than two characters', () => {
    const svg = generateHankoSvg(['一', '二', '三']);
    expect(svg.match(/<text/g)?.length).toBe(2);
  });
});
