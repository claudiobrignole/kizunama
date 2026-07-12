import { useState } from 'react';
import { HANKO_AFFILIATE_URL } from '../config';
import { useI18n } from '../i18n/context';

interface OrderHelperProps {
  chars: string[];
  originalName: string;
}

interface Field {
  key: string;
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
  const { messages } = useI18n();
  const { copiedKey, copy } = useCopy();
  const t = messages.orderHelper;

  const fields: Field[] = [
    { key: 'chars', label: t.fieldChars, value: chars.join('') },
    { key: 'name', label: t.fieldName, value: originalName || t.fieldNameEmpty },
    { key: 'orientation', label: t.fieldOrientation, value: t.fieldOrientationValue },
  ];

  const allText = fields.map((f) => `${f.label}: ${f.value}`).join('\n');

  return (
    <div className="kz-order-helper">
      <p className="kz-filter-label">{t.title}</p>
      {fields.map((f) => (
        <div className="kz-order-field" key={f.key}>
          <div>
            <div className="kz-order-field__label">{f.label}</div>
            <div className="kz-order-field__value" lang="ja">
              {f.value}
            </div>
          </div>
          <button type="button" className="kz-copy-btn" onClick={() => copy(f.key, f.value)}>
            {copiedKey === f.key ? t.copied : t.copy}
          </button>
        </div>
      ))}
      <div className="kz-hanko-actions">
        <button type="button" className="mg-btn" onClick={() => copy('all', allText)}>
          {copiedKey === 'all' ? t.copiedAll : t.copyAll}
        </button>
        <a className="mg-btn mg-btn--red" href={HANKO_AFFILIATE_URL} target="_blank" rel="noopener noreferrer sponsored">
          {t.cta}
        </a>
      </div>
    </div>
  );
}
