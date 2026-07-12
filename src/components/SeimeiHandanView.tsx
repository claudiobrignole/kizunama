import type { FortuneCategory, KakuValue, SeimeiHandanResult } from '../utils/seimeiHandan';
import { useI18n } from '../i18n/context';

interface SeimeiHandanViewProps {
  result: SeimeiHandanResult;
  hasSurname: boolean;
}

const PILLARS: Array<{ key: keyof SeimeiHandanResult; nameKey: string; descriptionKey: string }> = [
  { key: 'tenkaku', nameKey: 'tenkakuName', descriptionKey: 'tenkakuDescription' },
  { key: 'chikaku', nameKey: 'chikakuName', descriptionKey: 'chikakuDescription' },
  { key: 'jinkaku', nameKey: 'jinkakuName', descriptionKey: 'jinkakuDescription' },
  { key: 'soukaku', nameKey: 'soukakuName', descriptionKey: 'soukakuDescription' },
  { key: 'gaikaku', nameKey: 'gaikakuName', descriptionKey: 'gaikakuDescription' },
];

const CATEGORY_LABEL_KEY: Record<FortuneCategory, string> = {
  daikichi: 'categoryDaikichi',
  kichi: 'categoryKichi',
  hankichi: 'categoryHankichi',
  kyou: 'categoryKyou',
  daikyou: 'categoryDaikyou',
};

export function SeimeiHandanView({ result, hasSurname }: SeimeiHandanViewProps) {
  const { messages } = useI18n();
  const t = messages.seimeiHandan;

  return (
    <div className="kz-seimei-block">
      {!hasSurname && <p className="kz-loading-note">{t.noSurnameNote}</p>}
      <div className="kz-seimei-grid">
        {PILLARS.map(({ key, nameKey, descriptionKey }) => {
          const kaku = result[key] as KakuValue;
          const categoryKey = CATEGORY_LABEL_KEY[kaku.category];
          return (
            <div className={`kz-seimei-pillar kz-seimei-pillar--${kaku.category}`} key={key}>
              <div className="kz-seimei-pillar__name">{t[nameKey as keyof typeof t]}</div>
              <div className="kz-seimei-pillar__value">
                {kaku.strokes} <span className="kz-seimei-pillar__unit">{t.strokesUnit}</span>
              </div>
              <div className="kz-seimei-pillar__category">{t[categoryKey as keyof typeof t]}</div>
              <p className="kz-seimei-pillar__description">{t[descriptionKey as keyof typeof t]}</p>
            </div>
          );
        })}
      </div>
      <p className="kz-seimei-disclaimer">{t.disclaimer}</p>
    </div>
  );
}
