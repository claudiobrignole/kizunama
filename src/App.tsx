import { useEffect, useMemo, useState } from 'react';
import { NameKatakana } from './components/NameKatakana';
import { AtejiCandidates } from './components/AtejiCandidates';
import { SeimeiHandanView } from './components/SeimeiHandanView';
import { HankoSeal } from './components/HankoSeal';
import { OrderHelper } from './components/OrderHelper';
import { SiteFooter } from './components/SiteFooter';
import { LunaSponsorStrip } from './components/LunaSponsorStrip';
import { InstallPrompt } from './components/InstallPrompt';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { LanguageBanner } from './components/LanguageBanner';
import { HelpDialog, type HelpTopic } from './components/HelpDialog';
import { useI18n } from './i18n/context';
import { applyAtejiOverrides, generateAtejiCandidates, type AtejiIndexCandidate, type AtejiSpan } from './utils/ateji';
import { computeSeimeiHandan } from './utils/seimeiHandan';
import type { KatakanaLanguage, KatakanaResult } from './utils/katakana';

function spanChar(span: AtejiSpan): string {
  return span.kanji ?? span.mora.join('');
}

function App() {
  const { messages, locale } = useI18n();
  const [helpTopic, setHelpTopic] = useState<HelpTopic | null>(null);
  const [lang, setLang] = useState<KatakanaLanguage>(locale);

  // Keep the phonetic-engine selector aligned with the UI language.
  useEffect(() => {
    setLang(locale);
  }, [locale]);

  const [givenName, setGivenName] = useState('');
  const [givenResult, setGivenResult] = useState<KatakanaResult | null>(null);
  const [selectedGivenIdx, setSelectedGivenIdx] = useState(0);
  const [givenOverrides, setGivenOverrides] = useState<Record<string, AtejiIndexCandidate>>({});

  const [surname, setSurname] = useState('');
  const [surnameResult, setSurnameResult] = useState<KatakanaResult | null>(null);
  const [selectedSurnameIdx, setSelectedSurnameIdx] = useState(0);
  const [surnameOverrides, setSurnameOverrides] = useState<Record<string, AtejiIndexCandidate>>({});

  const [orderName, setOrderName] = useState('');

  useEffect(() => {
    if (orderName) return;
    const combined = [surname, givenName].filter(Boolean).join(' ').trim();
    if (combined) setOrderName(combined);
  }, [givenName, surname, orderName]);

  const handleGivenResult = (result: KatakanaResult | null) => {
    setGivenResult(result);
    setSelectedGivenIdx(0);
    setGivenOverrides({});
  };

  const handleSurnameResult = (result: KatakanaResult | null) => {
    setSurnameResult(result);
    setSelectedSurnameIdx(0);
    setSurnameOverrides({});
  };

  const givenCombos = useMemo(
    () => (givenResult?.katakana
      ? generateAtejiCandidates(givenResult.katakana, 8, givenResult.moraPenaltyPoints)
      : []),
    [givenResult],
  );
  const surnameCombos = useMemo(
    () => (surnameResult?.katakana
      ? generateAtejiCandidates(surnameResult.katakana, 8, surnameResult.moraPenaltyPoints)
      : []),
    [surnameResult],
  );

  const givenSpans = useMemo(() => {
    if (givenCombos.length === 0) return [];
    const combo = givenCombos[Math.min(selectedGivenIdx, givenCombos.length - 1)];
    return applyAtejiOverrides(combo.spans, givenOverrides);
  }, [givenCombos, selectedGivenIdx, givenOverrides]);

  const surnameSpans = useMemo(() => {
    if (surnameCombos.length === 0) return [];
    const combo = surnameCombos[Math.min(selectedSurnameIdx, surnameCombos.length - 1)];
    return applyAtejiOverrides(combo.spans, surnameOverrides);
  }, [surnameCombos, selectedSurnameIdx, surnameOverrides]);

  const seimeiResult = useMemo(() => {
    const givenStrokes = givenSpans.filter((s) => s.kanji && s.strokeCount != null).map((s) => s.strokeCount as number);
    if (givenStrokes.length === 0) return null;
    const surnameStrokes = surnameSpans
      .filter((s) => s.kanji && s.strokeCount != null)
      .map((s) => s.strokeCount as number);
    return computeSeimeiHandan(surnameStrokes, givenStrokes);
  }, [givenSpans, surnameSpans]);

  const hasAnyAtejiKanji = givenSpans.some((s) => s.kanji) || surnameSpans.some((s) => s.kanji);

  const hankoChars = useMemo(() => {
    if (hasAnyAtejiKanji) {
      return [...surnameSpans.map(spanChar), ...givenSpans.map(spanChar)];
    }
    const combined = `${surnameResult?.katakana ?? ''}${givenResult?.katakana ?? ''}`;
    return Array.from(combined);
  }, [hasAnyAtejiKanji, surnameSpans, givenSpans, surnameResult, givenResult]);

  const hankoOrientation = hasAnyAtejiKanji ? 'vertical-columns' : 'horizontal';

  return (
    <div className="mg-landing kz-landing">
      <LanguageBanner />

      <header className="ln-header">
        <div className="ln-header-inner">
          <div className="kz-header-main">
            <div className="kz-brand-lockup">
              <span className="kz-brand-lockup__name">
                <span className="kz-brand-lockup__kanji" lang="ja">
                  キズナマ
                </span>{' '}
                KIZUNAMA
              </span>
            </div>
            <p className="kz-header-tagline">
              {messages.header.tagline.split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          </div>
          <div className="kz-header-actions">
            <LanguageSwitcher variant="header" />
            <button type="button" className="mg-btn kz-help-btn" onClick={() => setHelpTopic('overview')}>
              {messages.header.helpButton}
            </button>
          </div>
        </div>
      </header>

      <section className="mg-band mg-band--yellow kz-band" aria-labelledby="band1-title">
        <div className="mg-band-inner">
          <div className="mg-band-copy">
            <span className="mg-index">{messages.band1.index}</span>
            <h1 className="mg-band-title" id="band1-title" lang="ja">
              音写
              <button
                type="button"
                className="kz-help-icon"
                aria-label={messages.band1.helpAria}
                onClick={() => setHelpTopic('katakana')}
              >
                ?
              </button>
            </h1>
            <p className="kz-band-sub">{messages.band1.subtitle}</p>

            <NameKatakana
              name={givenName}
              onNameChange={setGivenName}
              lang={lang}
              onLangChange={setLang}
              result={givenResult}
              onResult={handleGivenResult}
              variant="given"
            />

            <div className="kz-surname-block">
              <span className="mg-index">{messages.surnameField.label}</span>
              <p className="kz-band-sub kz-surname-hint">{messages.surnameField.hint}</p>
              <NameKatakana
                name={surname}
                onNameChange={setSurname}
                lang={lang}
                onLangChange={setLang}
                result={surnameResult}
                onResult={handleSurnameResult}
                variant="surname"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mg-band mg-band--washi kz-band" aria-labelledby="band2-title">
        <div className="mg-band-inner">
          <div className="mg-band-copy">
            <span className="mg-index">{messages.band2.index}</span>
            <h2 className="mg-band-title" id="band2-title" lang="ja">
              当て字
              <button
                type="button"
                className="kz-help-icon"
                aria-label={messages.band2.helpAria}
                onClick={() => setHelpTopic('ateji')}
              >
                ?
              </button>
            </h2>
            <p className="kz-band-sub">{messages.band2.subtitle}</p>

            <div className="mg-card kz-tool-card">
              {surname.trim() && (
                <AtejiCandidates
                  heading={messages.atejiCandidates.surnameHeading}
                  combos={surnameCombos}
                  selectedIndex={selectedSurnameIdx}
                  onSelectCombo={setSelectedSurnameIdx}
                  overrides={surnameOverrides}
                  onOverride={(key, candidate) => setSurnameOverrides((prev) => ({ ...prev, [key]: candidate }))}
                  showDisclaimer={surnameCombos.length > 0}
                />
              )}
              <AtejiCandidates
                heading={surname.trim() ? messages.atejiCandidates.givenNameHeading : undefined}
                combos={givenCombos}
                selectedIndex={selectedGivenIdx}
                onSelectCombo={setSelectedGivenIdx}
                overrides={givenOverrides}
                onOverride={(key, candidate) => setGivenOverrides((prev) => ({ ...prev, [key]: candidate }))}
                showDisclaimer={surnameCombos.length === 0}
              />
            </div>
          </div>
        </div>
      </section>

      <LunaSponsorStrip />

      <section className="mg-band mg-band--purple kz-band" aria-labelledby="band3-title">
        <div className="mg-band-inner">
          <div className="mg-band-copy">
            <span className="mg-index">{messages.band3.index}</span>
            <h2 className="mg-band-title" id="band3-title" lang="ja">
              姓名判断
              <button
                type="button"
                className="kz-help-icon"
                aria-label={messages.band3.helpAria}
                onClick={() => setHelpTopic('seimeiHandan')}
              >
                ?
              </button>
            </h2>
            <p className="kz-band-sub">{messages.band3.subtitle}</p>

            <div className="mg-card kz-tool-card">
              {seimeiResult ? (
                <SeimeiHandanView result={seimeiResult} hasSurname={Boolean(surname.trim())} />
              ) : (
                <p className="kz-empty-hint">{messages.seimeiHandan.noKanjiHint}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mg-band mg-band--ink kz-band" aria-labelledby="band4-title">
        <div className="mg-band-inner">
          <div className="mg-band-copy">
            <span className="mg-index">{messages.band4.index}</span>
            <h2 className="mg-band-title" id="band4-title" lang="ja">
              印鑑
              <button
                type="button"
                className="kz-help-icon"
                aria-label={messages.band4.helpAria}
                onClick={() => setHelpTopic('hanko')}
              >
                ?
              </button>
            </h2>
            <p className="kz-band-sub">{messages.band4.subtitle}</p>

            <div className="mg-card kz-tool-card">
              <HankoSeal chars={hankoChars} orientation={hankoOrientation} />
              <div className="kz-field-block">
                <input
                  className="lnx-input"
                  type="text"
                  placeholder={messages.nameOrderField.placeholder}
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  maxLength={60}
                />
              </div>
              <OrderHelper chars={hankoChars} originalName={orderName} />
            </div>
          </div>
        </div>
      </section>

      <LunaSponsorStrip />

      <SiteFooter onOpenHelp={() => setHelpTopic('overview')} />
      <InstallPrompt />
      <HelpDialog topic={helpTopic} onClose={() => setHelpTopic(null)} />
    </div>
  );
}

export default App;
