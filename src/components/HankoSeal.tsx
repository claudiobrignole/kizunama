import { useMemo, useState } from 'react';
import { generateHankoSvg } from '../utils/hanko';

interface HankoSealProps {
  chars: string[];
}

export function HankoSeal({ chars }: HankoSealProps) {
  const [copied, setCopied] = useState(false);
  const svg = useMemo(() => generateHankoSvg(chars), [chars]);

  const handleDownload = () => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hanko-${chars.join('')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(svg);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable; silently ignore, download still works.
    }
  };

  return (
    <div className="kz-hanko-block">
      {/* eslint-disable-next-line react/no-danger */}
      <div className="kz-hanko-svg-wrap" dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="kz-hanko-actions">
        <button type="button" className="kz-btn kz-btn--primary" onClick={handleDownload}>
          ⬇️ Download SVG
        </button>
        <button type="button" className="kz-btn" onClick={handleCopy}>
          {copied ? '✅ Copied' : '📋 Copy SVG'}
        </button>
      </div>
    </div>
  );
}
