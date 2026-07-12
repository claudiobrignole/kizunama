import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/context';

export type HelpTopic = 'overview' | 'ateji' | 'katakana' | 'seimeiHandan' | 'hanko';

interface HelpDialogProps {
  topic: HelpTopic | null;
  onClose: () => void;
}

export function HelpDialog({ topic, onClose }: HelpDialogProps) {
  const { messages } = useI18n();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!topic) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [topic, onClose]);

  if (!topic) return null;

  const content = messages.help.topics[topic];

  return (
    <div className="kz-modal-overlay" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="mg-card kz-help-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={content.title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="kz-help-dialog__title">{content.title}</h2>
        <ol className="kz-help-dialog__list">
          {content.body.map((paragraph, i) => (
            <li key={i}>{paragraph}</li>
          ))}
        </ol>
        <button type="button" className="mg-btn mg-btn--ink kz-help-dialog__close" onClick={onClose}>
          {messages.help.closeButton}
        </button>
      </div>
    </div>
  );
}
