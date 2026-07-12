import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '../i18n/context';
import { buildShareResultUrl } from '../utils/shareLink';
import {
  SHARE_FORMATS,
  ShareFontError,
  canSharePngFile,
  canvasToPngBlob,
  downloadPngBlob,
  renderShareCard,
  sharePngFile,
  type ShareFormatId,
} from '../utils/shareImage';
import type { HankoOptions } from '../utils/hanko';

export interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  givenName: string;
  surname: string;
  originalName: string;
  katakana: string;
  displayJa: string;
  hankoChars: string[];
  hankoOrientation?: HankoOptions['orientation'];
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

function pngFilename(originalName: string, format: ShareFormatId): string {
  const safe = (originalName || 'kizunama').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 40);
  return `kizunama-${safe}-${format}.png`;
}

export function ShareDialog({
  open,
  onClose,
  givenName,
  surname,
  originalName,
  katakana,
  displayJa,
  hankoChars,
  hankoOrientation,
}: ShareDialogProps) {
  const { messages, locale } = useI18n();
  const t = messages.share;
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<ShareFormatId>('square');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [nativeShareOk, setNativeShareOk] = useState(false);
  const [instagramNote, setInstagramNote] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const resultLink = buildShareResultUrl({ givenName, surname, locale });

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setPreviewBlob(null);
      setError(null);
      setBusy(false);
      setNativeShareOk(false);
      setInstagramNote(false);
      setLinkCopied(false);
      return;
    }

    let cancelled = false;
    setBusy(true);
    setError(null);
    setInstagramNote(false);

    void (async () => {
      try {
        let hankoFont = null;
        try {
          const { loadHankoOutlineFont } = await import('../utils/hankoFont');
          hankoFont = await loadHankoOutlineFont(hankoChars);
        } catch {
          hankoFont = null;
        }

        const canvas = await renderShareCard(SHARE_FORMATS[format], {
          originalName,
          katakana,
          displayJa,
          tagline: t.tagline,
          siteLabel: 'kizunama.com',
          hankoChars,
          hankoOrientation,
          hankoFont,
        });
        const blob = await canvasToPngBlob(canvas);
        if (cancelled) return;
        const file = new File([blob], pngFilename(originalName, format), { type: 'image/png' });
        setNativeShareOk(canSharePngFile(file));
        setPreviewBlob(blob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ShareFontError ? t.errorFont : err instanceof Error ? err.message : t.errorGeneric;
        setError(message);
        setPreviewBlob(null);
        setNativeShareOk(false);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, format, originalName, katakana, displayJa, hankoChars, hankoOrientation, t.tagline, t.errorFont, t.errorGeneric]);

  if (!open) return null;

  const withBlob = async (action: (blob: Blob) => Promise<void>) => {
    if (!previewBlob || busy) return;
    setBusy(true);
    setError(null);
    try {
      await action(previewBlob);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setBusy(false);
    }
  };

  const handleNativeShare = () =>
    withBlob(async (blob) => {
      await sharePngFile(blob, pngFilename(originalName, format), t.shareTitle);
    });

  const handleDownload = () =>
    withBlob(async (blob) => {
      downloadPngBlob(blob, pngFilename(originalName, format));
    });

  const handleInstagram = () =>
    withBlob(async (blob) => {
      downloadPngBlob(blob, pngFilename(originalName, format));
      setInstagramNote(true);
    });

  const handleCopyLink = async () => {
    try {
      await copyText(resultLink);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1600);
    } catch {
      setError(t.errorCopy);
    }
  };

  return (
    <div className="kz-modal-overlay" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="mg-card kz-share-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="kz-share-dialog__title" id={titleId}>
          {t.title}
        </h2>

        <fieldset className="kz-share-dialog__formats">
          <legend className="kz-share-dialog__legend">{t.formatLegend}</legend>
          {(Object.keys(SHARE_FORMATS) as ShareFormatId[]).map((id) => {
            const f = SHARE_FORMATS[id];
            const label =
              id === 'story' ? t.formatStory : id === 'post' ? t.formatPost : t.formatSquare;
            return (
              <label key={id} className={`kz-share-format${format === id ? ' kz-share-format--active' : ''}`}>
                <input
                  type="radio"
                  name="share-format"
                  value={id}
                  checked={format === id}
                  onChange={() => setFormat(id)}
                />
                <span>
                  {label}
                  <small>
                    {f.width}×{f.height}
                  </small>
                </span>
              </label>
            );
          })}
        </fieldset>

        <div className="kz-share-dialog__preview" aria-busy={busy}>
          {busy && !previewUrl && <p className="kz-empty-hint">{t.preparing}</p>}
          {previewUrl && (
            <img src={previewUrl} alt={t.previewAlt} className="kz-share-dialog__preview-img" />
          )}
          {!busy && error && (
            <p className="kz-share-dialog__error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="kz-share-dialog__social">
          <p className="kz-share-dialog__social-label">{t.socialLegend}</p>
          <div className="kz-share-dialog__social-grid">
            {nativeShareOk && (
              <button
                type="button"
                className="mg-btn mg-btn--red"
                disabled={busy || !previewBlob}
                onClick={() => void handleNativeShare()}
              >
                {t.shareNative}
              </button>
            )}
            <button
              type="button"
              className="mg-btn"
              disabled={busy || !previewBlob}
              onClick={() => void handleDownload()}
            >
              {t.downloadPng}
            </button>
            <button
              type="button"
              className="mg-btn mg-btn--yellow"
              disabled={busy || !previewBlob}
              onClick={() => void handleInstagram()}
            >
              {t.instagram}
            </button>
          </div>
          {nativeShareOk ? (
            <p className="kz-share-dialog__social-hint">{t.shareNativeHint}</p>
          ) : (
            <p className="kz-share-dialog__social-hint">{t.shareNativeUnavailable}</p>
          )}
          {instagramNote && (
            <aside className="kz-share-dialog__instagram-note" role="status">
              {t.instagramHint}
            </aside>
          )}
        </div>

        <div className="kz-share-dialog__link">
          <label className="kz-share-dialog__link-label" htmlFor="kz-share-link">
            {t.linkLabel}
          </label>
          <div className="kz-share-dialog__link-row">
            <input
              id="kz-share-link"
              className="lnx-input"
              type="text"
              readOnly
              value={resultLink}
            />
            <button type="button" className="kz-copy-btn" onClick={() => void handleCopyLink()}>
              {linkCopied ? t.linkCopied : t.linkCopy}
            </button>
          </div>
        </div>

        <div className="kz-share-dialog__actions">
          <button type="button" className="mg-btn mg-btn--ink" onClick={onClose}>
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
