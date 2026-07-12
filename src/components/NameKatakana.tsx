import { useState } from 'react';
import { nameToKatakana, type KatakanaLanguage, type KatakanaResult } from '../utils/katakana';
import { PHONETIC_LANGUAGES } from '../utils/languagePhonetics';
import { useI18n } from '../i18n/context';
import { CredibilityBadge } from './CredibilityBadge';

interface NameKatakanaProps {
  name: string;
  onNameChange: (name: string) => void;
  lang: KatakanaLanguage;
  onLangChange: (lang: KatakanaLanguage) => void;
  result: KatakanaResult | null;
  onResult: (result: KatakanaResult | null) => void;
  /** 'given' shows the language selector; 'surname' reuses the same lang
   * (no second selector — given + surname share one phonetic engine). */
  variant?: 'given' | 'surname';
  showCredibility?: boolean;
}

export function NameKatakana({
  name,
  onNameChange,
  lang,
  onLangChange,
  result,
  onResult,
  variant = 'given',
  showCredibility = true,
}: NameKatakanaProps) {
  const { messages } = useI18n();
  const isGiven = variant === 'given';
  const t = isGiven
    ? messages.nameKatakana
    : { ...messages.nameKatakana, placeholder: messages.surnameField.placeholder };
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConvert = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setCopied(false);
    try {
      const r = await nameToKatakana(name, lang);
      onResult(r);
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
      // Clipboard API unavailable; silently ignore.
    }
  };

  return (
    <div className="mg-card kz-tool-card">
      <div className={`kz-name-row${isGiven ? '' : ' kz-name-row--no-lang'}`}>
        <input
          className="lnx-input"
          type="text"
          placeholder={t.placeholder}
          value={name}
          onChange={(e) => {
            onNameChange(e.target.value);
            onResult(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
          maxLength={40}
        />
        {isGiven && (
          <select className="lnx-select" value={lang} onChange={(e) => onLangChange(e.target.value as KatakanaLanguage)}>
            {PHONETIC_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        )}
        <button type="button" className="mg-btn mg-btn--red" onClick={handleConvert} disabled={loading || !name.trim()}>
          {loading ? t.converting : t.convert}
        </button>
      </div>
      {loading && <p className="kz-loading-note">{t.loading}</p>}
      {result && result.katakana && (
        <div className="kz-katakana-result">
          <span className="kz-katakana-result__text" lang="ja">
            {result.katakana}
          </span>
          <button type="button" className="kz-copy-btn" onClick={handleCopy}>
            {copied ? t.copied : t.copy}
          </button>
          {showCredibility && <CredibilityBadge tier={result.tier} />}
        </div>
      )}
      {result?.katakana && result.tier === 'approximate' && (
        <p className="kz-transliteration-warning" role="alert">
          {messages.transliteration.approximateWarning}
        </p>
      )}
    </div>
  );
}
