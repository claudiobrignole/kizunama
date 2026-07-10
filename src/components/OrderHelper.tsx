import { useState } from 'react';
import { HANKO_AFFILIATE_URL } from '../config';

interface OrderHelperProps {
  chars: string[];
  originalName: string;
}

interface Field {
  label: string;
  value: string;
}

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1600);
    } catch {
      // ignore
    }
  };
  return { copiedKey, copy };
}

export function OrderHelper({ chars, originalName }: OrderHelperProps) {
  const { copiedKey, copy } = useCopy();

  const fields: Field[] = [
    { label: 'Characters to be engraved', value: chars.join('') },
    { label: 'Name in Roman letters', value: originalName || '—' },
    { label: 'Suggested orientation', value: 'Vertical Writing' },
  ];

  const allText = fields.map((f) => `${f.label}: ${f.value}`).join('\n');

  return (
    <div className="kz-order-helper">
      <p className="kz-section-title kz-section-title--sub">Order a real hanko — copy these fields</p>
      {fields.map((f) => (
        <div className="kz-order-field" key={f.label}>
          <div>
            <div className="kz-order-field__label">{f.label}</div>
            <div className="kz-order-field__value">{f.value}</div>
          </div>
          <button type="button" className="kz-copy-btn" onClick={() => copy(f.label, f.value)}>
            {copiedKey === f.label ? '✅ Copied' : 'Copy'}
          </button>
        </div>
      ))}
      <div className="kz-hanko-actions">
        <button type="button" className="kz-btn" onClick={() => copy('all', allText)}>
          {copiedKey === 'all' ? '✅ Copied all' : '📋 Copy all'}
        </button>
        <a className="kz-btn kz-btn--primary" href={HANKO_AFFILIATE_URL} target="_blank" rel="noopener noreferrer sponsored">
          Get a real hanko stamp →
        </a>
      </div>
    </div>
  );
}
