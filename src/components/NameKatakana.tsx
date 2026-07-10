import { useState } from 'react';
import { nameToKatakana, type KatakanaLanguage, type KatakanaResult } from '../utils/katakana';
import { PHONETIC_LANGUAGES } from '../utils/languagePhonetics';

export function NameKatakana() {
  const [name, setName] = useState('');
  const [lang, setLang] = useState<KatakanaLanguage>('en');
  const [result, setResult] = useState<KatakanaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConvert = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setCopied(false);
    try {
      const r = await nameToKatakana(name, lang);
      setResult(r);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.katakana) return;
    try {
      await navigator.clipboard.writeText(result.katakana);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  return (
    <div className="kz-panel kz-panel--compact kz-section--katakana">
      <p className="kz-section-title kz-section-title--sub">🔤 Your name in Katakana</p>
      <div className="kz-name-row">
        <input
          className="kz-input"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
          maxLength={40}
        />
        <select className="kz-select" value={lang} onChange={(e) => setLang(e.target.value as KatakanaLanguage)}>
          {PHONETIC_LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
        <button type="button" className="kz-btn kz-btn--primary" onClick={handleConvert} disabled={loading || !name.trim()}>
          {loading ? '…' : '→'}
        </button>
      </div>
      {loading && <p className="kz-loading-note">Loading phonetic engine…</p>}
      {result && result.katakana && (
        <div className="kz-katakana-result">
          <span className="kz-katakana-result__text">{result.katakana}</span>
          <button type="button" className="kz-copy-btn" onClick={handleCopy}>
            {copied ? '✅ Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
}
