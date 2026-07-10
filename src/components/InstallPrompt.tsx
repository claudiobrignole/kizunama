import { useEffect, useState } from 'react';
import { getInstallCopy } from '../i18n/installPrompt';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'kz-install-dismissed';

export function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      if (localStorage.getItem(DISMISS_KEY)) return;
      setDeferredEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!visible || !deferredEvent) return null;

  const copy = getInstallCopy(navigator.language || 'en');

  const handleInstall = async () => {
    setVisible(false);
    try {
      await deferredEvent.prompt();
    } catch {
      // ignore
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  return (
    <div className="kz-install-banner" role="dialog" aria-label="Install app">
      <span>{copy.text}</span>
      <span style={{ display: 'flex', gap: '0.4rem' }}>
        <button type="button" onClick={handleInstall}>
          {copy.install}
        </button>
        <button type="button" className="kz-install-banner__dismiss" onClick={handleDismiss} aria-label={copy.dismiss}>
          ✕
        </button>
      </span>
    </div>
  );
}
