/**
 * Generates a stylised Japanese Hanko (personal seal) as a standalone SVG
 * string from 1-2 kanji characters. Pure function, no dependencies, so it
 * can run both in the browser and in tests.
 */

const SIZE = 200;
const RED = '#c8102e';

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function shapeMarkup(shape: 'square' | 'round'): string {
  if (shape === 'round') {
    return `<circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2 - 8}" fill="${RED}" filter="url(#kzHankoTexture)" />`;
  }
  const inset = 8;
  return `<rect x="${inset}" y="${inset}" width="${SIZE - inset * 2}" height="${SIZE - inset * 2}" rx="6" fill="${RED}" filter="url(#kzHankoTexture)" />`;
}

function textMarkup(chars: string[]): string {
  const fontFamily = "'Noto Serif JP','Hiragino Mincho ProN','Yu Mincho',serif";
  if (chars.length <= 1) {
    const char = chars[0] ?? '';
    return `<text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="${fontFamily}" font-size="92" fill="#fff">${escapeXml(char)}</text>`;
  }
  // Traditional vertical arrangement, top-to-bottom, for up to 2 characters.
  const fontSize = chars.length > 2 ? 52 : 68;
  const startY = 50 - (chars.length - 1) * (fontSize / SIZE) * 55;
  return chars
    .map((char, i) => {
      const y = 50 + (i - (chars.length - 1) / 2) * (fontSize * 1.05 * 100) / SIZE;
      return `<text x="50%" y="${y}%" text-anchor="middle" dominant-baseline="middle" font-family="${fontFamily}" font-size="${fontSize}" fill="#fff">${escapeXml(char)}</text>`;
    })
    .join('') || `<text x="50%" y="${startY}%">${escapeXml(chars.join(''))}</text>`;
}

export interface HankoOptions {
  shape?: 'square' | 'round';
}

export function generateHankoSvg(chars: string[], options: HankoOptions = {}): string {
  const shape = options.shape ?? 'square';
  const cleanChars = chars.filter(Boolean).slice(0, 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" role="img" aria-label="Hanko seal: ${escapeXml(cleanChars.join(''))}">
  <defs>
    <filter id="kzHankoTexture" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  ${shapeMarkup(shape)}
  ${textMarkup(cleanChars)}
</svg>`;
}
