import { useState } from 'react';
import { useI18n } from '../i18n/context';
import { absoluteUrl, namePagePath } from '../seo/paths';
import { findSeoNameByInput } from '../seo/names';
import { buildShareResultUrl } from '../utils/shareLink';

interface ShareNameLinkProps {
  name: string;
  enabled: boolean;
}

/**
 * Builds a link to the published name page when one exists, otherwise to the
 * converter URL that restores the typed name. The control is always in the
 * layout so the result row does not push the page when it appears.
 */
export function ShareNameLink({ name, enabled }: ShareNameLinkProps) {
  const { locale, messages } = useI18n();
  const [href, setHref] = useState('');
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const t = messages.seo;
  const catalogHit = findSeoNameByInput(name);
  const canShare = enabled || Boolean(catalogHit);

  const shareUrl = () => {
    const entry = findSeoNameByInput(name);
    if (entry) return absoluteUrl(namePagePath(locale, entry.slug));
    return buildShareResultUrl({
      givenName: name,
      locale,
      origin: window.location.origin,
    });
  };

  const onShare = async () => {
    if (!canShare) return;
    const url = shareUrl();
    const entry = findSeoNameByInput(name);
    const payload = {
      title: entry ? `${entry.name}` : name,
      text: t.shareName,
      url,
    };
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share(payload);
        setHref(url);
        setStatus('idle');
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setHref(url);
      setStatus('copied');
    } catch {
      setHref(url);
      setStatus('failed');
    }
  };

  return (
    <div className="kz-share-name">
      <button type="button" className="mg-btn mg-btn--yellow kz-share-name__btn" onClick={() => void onShare()} disabled={!canShare}>
        {t.shareName}
      </button>
      <p className="kz-share-name__status" role="status">
        {status === 'copied' && t.shareCopied}
        {status === 'failed' && t.shareFailed}
        {href && (
          <>
            {status !== 'idle' ? ' ' : null}
            <a href={href}>{href.replace(/^https?:\/\/[^/]+/, '')}</a>
          </>
        )}
      </p>
    </div>
  );
}
