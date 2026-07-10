export interface InstallCopy {
  text: string;
  install: string;
  dismiss: string;
}

const COPY: Record<string, InstallCopy> = {
  en: { text: 'Install Kizunama as an app for quick access.', install: 'Install', dismiss: 'Not now' },
  it: { text: "Installa Kizunama come app per un accesso rapido.", install: 'Installa', dismiss: 'Non ora' },
  es: { text: 'Instala Kizunama como app para acceder más rápido.', install: 'Instalar', dismiss: 'Ahora no' },
  fr: { text: "Installez Kizunama comme application pour y accéder plus vite.", install: 'Installer', dismiss: 'Plus tard' },
  de: { text: 'Installiere Kizunama als App für schnellen Zugriff.', install: 'Installieren', dismiss: 'Nicht jetzt' },
  pt: { text: 'Instale o Kizunama como app para acesso rápido.', install: 'Instalar', dismiss: 'Agora não' },
  ja: { text: 'Kizunamaをアプリとしてインストールしませんか？', install: 'インストール', dismiss: '後で' },
  zh: { text: '将 Kizunama 安装为应用，快速访问。', install: '安装', dismiss: '稍后' },
  ko: { text: 'Kizunama를 앱으로 설치하고 빠르게 이용하세요.', install: '설치', dismiss: '나중에' },
  ru: { text: 'Установите Kizunama как приложение для быстрого доступа.', install: 'Установить', dismiss: 'Не сейчас' },
};

export function getInstallCopy(browserLanguage: string): InstallCopy {
  const short = browserLanguage.slice(0, 2).toLowerCase();
  return COPY[short] ?? COPY.en;
}
