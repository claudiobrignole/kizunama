import { useI18n } from '../i18n/context';
import type { TransliterationTier } from '../utils/katakana';

interface CredibilityBadgeProps {
  tier: TransliterationTier;
}

export function CredibilityBadge({ tier }: CredibilityBadgeProps) {
  const { messages } = useI18n();
  const t = messages.transliteration;
  const label = tier === 'validated'
    ? t.validated
    : tier === 'conventional'
      ? `${t.conventional} (${t.conventionalNote})`
      : t.approximate;

  return (
    <span className={`kz-credibility-badge kz-credibility-badge--${tier}`} title={t.label}>
      {label}
    </span>
  );
}
