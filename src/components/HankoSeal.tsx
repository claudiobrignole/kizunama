import { useEffect, useMemo, useRef, useState } from 'react';
import type { Font } from 'opentype.js';
import {
  generateHankoSvg,
  generateHankoSvgOutlined,
  isFontFreeHankoSvg,
  type HankoOptions,
} from '../utils/hanko';
import { useI18n } from '../i18n/context';

interface HankoSealProps {
  chars: string[];
  shape?: HankoOptions['shape'];
  orientation?: HankoOptions['orientation'];
  /** Opens the social share dialog (PNG story/post/square). */
  onShare?: () => void;
}

function triggerDownload(svg: string, filename: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

function safeFilename(chars: string[]): string {
  const joined = chars.join('') || 'seal';
  return `hanko-${joined.replace(/[\\/:*?"<>|]+/g, '_')}.svg`;
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

export function HankoSeal({ chars, shape, orientation, onShare }: HankoSealProps) {
  const { messages } = useI18n();
  const [copied, setCopied] = useState(false);
  const [fontReady, setFontReady] = useState(false);
  const [fontError, setFontError] = useState(false);
  const fontRef = useRef<Font | null>(null);
  const options = useMemo(() => ({ shape, orientation }), [shape, orientation]);
  const previewSvg = useMemo(() => generateHankoSvg(chars, options), [chars, options]);
  const charsKey = chars.join('\0');

  // Preload local Noto Serif JP so click can export paths inside the user gesture.
  // Depend only on charsKey — a new `chars` array identity must not cancel in-flight loads.
  useEffect(() => {
    let cancelled = false;
    fontRef.current = null;
    setFontReady(false);
    setFontError(false);

    if (!charsKey) return;

    const charsToLoad = charsKey.split('\0').filter(Boolean);

    void (async () => {
      try {
        const { loadHankoOutlineFont } = await import('../utils/hankoFont');
        const font = await loadHankoOutlineFont(charsToLoad);
        if (cancelled) return;
        fontRef.current = font;
        setFontReady(true);
      } catch (err) {
        console.warn('[hanko] outline font preload failed', err);
        if (!cancelled) {
          fontRef.current = null;
          setFontReady(false);
          setFontError(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [charsKey]);

  /** Outlined paths only — never the preview `<text>` SVG. */
  const exportOutlinedSvg = (): string => {
    if (!fontRef.current) {
      throw new Error('Outline font not ready');
    }
    const svg = generateHankoSvgOutlined(chars, fontRef.current, options);
    if (!isFontFreeHankoSvg(svg)) {
      throw new Error('Export refused: SVG still depends on fonts');
    }
    return svg;
  };

  const handleDownload = () => {
    if (chars.length === 0 || !fontReady || !fontRef.current) return;
    try {
      triggerDownload(exportOutlinedSvg(), safeFilename(chars));
    } catch (err) {
      console.warn('[hanko] outlined download failed', err);
    }
  };

  const handleCopy = async () => {
    if (chars.length === 0 || !fontReady || !fontRef.current) return;
    try {
      await copyText(exportOutlinedSvg());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.warn('[hanko] clipboard copy failed', err);
    }
  };

  const handleRetryFont = () => {
    // Retrigger effect by toggling error → remount load via charsKey noop:
    // force reload by clearing singleton through a dynamic re-import path.
    setFontError(false);
    setFontReady(false);
    fontRef.current = null;
    void (async () => {
      try {
        // Bust failed promise by re-fetching through loadHankoOutlineFont
        // (getHankoOutlineFont resets on failure).
        const { loadHankoOutlineFont: reload } = await import('../utils/hankoFont');
        const font = await reload(chars);
        fontRef.current = font;
        setFontReady(true);
      } catch (err) {
        console.warn('[hanko] outline font retry failed', err);
        setFontError(true);
      }
    })();
  };

  const actionsDisabled = chars.length === 0 || !fontReady;
  const downloadLabel = fontError
    ? messages.hankoSeal.downloadUnavailable
    : fontReady
      ? messages.hankoSeal.download
      : messages.hankoSeal.downloadPreparing;

  return (
    <div className="kz-hanko-block">
      <div className="kz-hanko-preview">
        {/* eslint-disable-next-line react/no-danger */}
        <div className="kz-hanko-svg-wrap" dangerouslySetInnerHTML={{ __html: previewSvg }} />
      </div>
      <div className="kz-hanko-actions">
        {onShare && (
          <button
            type="button"
            className="mg-btn mg-btn--yellow kz-share-btn"
            onClick={onShare}
            disabled={chars.length === 0}
          >
            {messages.share.button}
          </button>
        )}
        <button
          type="button"
          className="mg-btn mg-btn--red"
          onClick={fontError ? handleRetryFont : handleDownload}
          disabled={chars.length === 0 || (!fontReady && !fontError)}
          data-font-ready={fontReady ? 'true' : 'false'}
          aria-busy={chars.length > 0 && !fontReady && !fontError}
        >
          {downloadLabel}
        </button>
        <button type="button" className="mg-btn" onClick={handleCopy} disabled={actionsDisabled}>
          {copied ? messages.hankoSeal.copied : messages.hankoSeal.copy}
        </button>
      </div>
      <p className="kz-hanko-disclaimer">{messages.hankoSeal.disclaimer}</p>
    </div>
  );
}
