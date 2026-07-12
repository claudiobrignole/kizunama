import { useState } from 'react';
import { applyAtejiOverrides, candidatesForReading, type AtejiCombo, type AtejiIndexCandidate } from '../utils/ateji';
import { useI18n } from '../i18n/context';

interface AtejiCandidatesProps {
  combos: AtejiCombo[];
  selectedIndex: number;
  onSelectCombo: (index: number) => void;
  overrides: Record<string, AtejiIndexCandidate>;
  onOverride: (moraKey: string, candidate: AtejiIndexCandidate) => void;
  allowSwap?: boolean;
  heading?: string;
  showDisclaimer?: boolean;
}

function comboLabelText(combo: AtejiCombo): string {
  return combo.spans.map((s) => s.kanji ?? `(${s.mora.join('')})`).join('');
}

function readingTypeLabel(
  type: AtejiIndexCandidate['readingType'] | undefined,
  t: { readingTypeOn: string; readingTypeKun: string },
): string {
  if (type === 'on') return t.readingTypeOn;
  return t.readingTypeKun;
}

export function AtejiCandidates({
  combos,
  selectedIndex,
  onSelectCombo,
  overrides,
  onOverride,
  allowSwap = true,
  heading,
  showDisclaimer = false,
}: AtejiCandidatesProps) {
  const { messages, locale } = useI18n();
  const t = messages.atejiCandidates;
  const [openSwapKey, setOpenSwapKey] = useState<string | null>(null);

  if (combos.length === 0) {
    return (
      <div className="kz-ateji-block">
        {heading && <h3 className="kz-ateji-block__heading">{heading}</h3>}
        <p className="kz-empty-hint">{t.emptyHint}</p>
      </div>
    );
  }

  const selectedCombo = combos[Math.min(selectedIndex, combos.length - 1)];
  const renderedSpans = applyAtejiOverrides(selectedCombo.spans, overrides);

  return (
    <div className="kz-ateji-block">
      {showDisclaimer && (
        <aside className="kz-ateji-disclaimer" role="note" title={t.fitExplanation}>
          {t.disclaimer}
        </aside>
      )}
      {heading && <h3 className="kz-ateji-block__heading">{heading}</h3>}
      <div className="kz-ateji-combo-grid" role="radiogroup">
        {combos.slice(0, 6).map((combo, i) => {
          const isChosen = i === selectedIndex;
          return (
            <button
              key={i}
              type="button"
              className={`kz-ateji-combo-chip${isChosen ? ' kz-ateji-combo-chip--chosen' : ''}`}
              role="radio"
              aria-checked={isChosen}
              aria-pressed={isChosen}
              onClick={() => onSelectCombo(i)}
            >
              <span className="kz-ateji-combo-chip__text" lang="ja">
                {comboLabelText(combo)}
              </span>
              <span className="kz-ateji-combo-chip__label">
                {isChosen ? t.chosenBadge : t.selectButton} · {combo.fitPercent}%
              </span>
            </button>
          );
        })}
      </div>

      <div className="kz-ateji-slot-row">
        {renderedSpans.map((span, i) => {
          const moraKey = span.mora.join('');
          const isOpen = openSwapKey === moraKey;
          const alternates = allowSwap && span.kanji ? candidatesForReading(span.mora) : [];

          return (
            <div className={`kz-ateji-slot${span.kanji ? '' : ' kz-ateji-slot--unmatched'}`} key={`${moraKey}-${i}`}>
              <div className="kz-ateji-slot__char" lang="ja">
                {span.kanji ?? moraKey}
                {span.kanji && <small className="kz-ateji-slot__reading"> {moraKey}</small>}
              </div>
              {span.kanji ? (
                <>
                  <div className="kz-ateji-slot__meta">
                    {readingTypeLabel(span.readingType, t)}
                    {span.boosted && <span className="kz-ateji-slot__historical"> · {t.historicalBadge}</span>}
                  </div>
                  <div className="kz-ateji-slot__fit">
                    {t.phoneticFitLabel}: {span.fitPercent}%
                    {span.fitPercent < 70 && <strong> · {t.freeAdaptation}</strong>}
                  </div>
                  {(span.meaningEn || span.meaningIt) && (
                    <div className="kz-ateji-slot__meaning">
                      {t.meaningLabel}: {locale === 'it' ? span.meaningIt || span.meaningEn : span.meaningEn}
                    </div>
                  )}
                  {allowSwap && alternates.length > 1 && (
                    <button
                      type="button"
                      className="kz-copy-btn kz-ateji-slot__swap"
                      onClick={() => setOpenSwapKey(isOpen ? null : moraKey)}
                    >
                      {t.swapButton}
                    </button>
                  )}
                  {isOpen && (
                    <div className="kz-ateji-swap-panel">
                      <p className="kz-ateji-swap-panel__title">{t.swapTitle}</p>
                      <div className="kz-ateji-swap-panel__list">
                        {alternates.map((candidate) => (
                          <button
                            type="button"
                            key={candidate.char}
                            className="kz-ateji-swap-option"
                            lang="ja"
                            onClick={() => {
                              onOverride(moraKey, candidate);
                              setOpenSwapKey(null);
                            }}
                          >
                            <span className="kz-ateji-swap-option__char">{candidate.char}</span>
                            <span className="kz-ateji-swap-option__meta">
                              {readingTypeLabel(candidate.readingType, t)} · {candidate.strokeCount ?? '?'} {t.strokesLabel}
                            </span>
                          </button>
                        ))}
                      </div>
                      <button type="button" className="kz-copy-btn" onClick={() => setOpenSwapKey(null)}>
                        {t.swapClose}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="kz-ateji-slot__meta">{t.unmatchedBadge}</div>
              )}
            </div>
          );
        })}
      </div>
      {renderedSpans.some((s) => !s.kanji) && <p className="kz-ateji-unmatched-note">{t.unmatchedNote}</p>}
    </div>
  );
}
