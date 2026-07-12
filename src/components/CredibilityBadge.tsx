import { atejiCredibility } from '../utils/ateji';
import { useI18n } from '../i18n/context';

interface CredibilityBadgeProps {
  katakana: string;
}

export function CredibilityBadge({ katakana }: CredibilityBadgeProps) {
  const { messages } = useI18n();
  const t = messages.credibility;
  const { level } = atejiCredibility(katakana);
  const label = level === 'high' ? t.high : level === 'medium' ? t.medium : t.low;

  return (
    <span className={`kz-credibility-badge kz-credibility-badge--${level}`} title={t.label}>
      {label}
    </span>
  );
}
