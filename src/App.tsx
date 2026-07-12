import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { NameKatakana } from './components/NameKatakana';
import { AtejiCandidates } from './components/AtejiCandidates';
import { SeimeiHandanView } from './components/SeimeiHandanView';
import { OrderHelper } from './components/OrderHelper';
import { ShareDialog } from './components/ShareDialog';
import { SiteFooter } from './components/SiteFooter';
import { LunaSponsorStrip } from './components/LunaSponsorStrip';
import { InstallPrompt } from './components/InstallPrompt';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { LanguageBanner } from './components/LanguageBanner';
import { HelpDialog, type HelpTopic } from './components/HelpDialog';
import { useI18n } from './i18n/context';
import {
  applyAtejiOverrides,
  generateAtejiCandidates,
  prefetchAtejiIndex,
  type AtejiCombo,
  type AtejiIndexCandidate,
  type AtejiSpan,
} from './utils/ateji';
import {
  nameToKatakana,
  prefetchJmnedictNames,
  type KatakanaLanguage,
  type KatakanaResult,
} from './utils/katakana';
import { parseNameQuery, syncNameQueryToUrl } from './utils/nameQuery';
import { computeSeimeiHandan } from './utils/seimeiHandan';

const HankoSeal = lazy(() =>
  import('./components/HankoSeal').then((mod) => ({ default: mod.HankoSeal })),
);

function spanChar(span: AtejiSpan): string {
  return span.kanji ?? span.mora.join('');
}

function scheduleIdle(cb: () => void): () => void {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(cb);
    return () => cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 1);
  return () => clearTimeout(id);
}

function App() {
  const { messages, locale } = useI18n();
  const [helpTopic, setHelpTopic] = useState<HelpTopic | null>(null);
  const [lang, setLang] = useState<KatakanaLanguage>(locale);
  const initialNames = useRef(
    parseNameQuery(typeof window === 'undefined' ? '' : window.location.search),
  ).current;

  // Keep the phonetic-engine selector aligned with the UI language.
  useEffect(() => {
    setLang(locale);
  }, [locale]);

  // Prefetch large data chunks after first paint so submit rarely waits.
  useEffect(() => {
    return scheduleIdle(() => {
      prefetchJmnedictNames();
      prefetchAtejiIndex();
    });
  }, []);

  const [givenName, setGivenName] = useState(initialNames.given);
  const [givenResult, setGivenResult] = useState<KatakanaResult | null>(null);
  const [selectedGivenIdx, setSelectedGivenIdx] = useState(0);
  const [givenOverrides, setGivenOverrides] = useState<Record<string, AtejiIndexCandidate>>({});

  const [surname, setSurname] = useState(initialNames.surname);
  const [surnameResult, setSurnameResult] = useState<KatakanaResult | null>(null);
  const [selectedSurnameIdx, setSelectedSurnameIdx] = useState(0);
  const [surnameOverrides, setSurnameOverrides] = useState<Record<string, AtejiIndexCandidate>>({});

  const [givenCombos, setGivenCombos] = useState<AtejiCombo[]>([]);
  const [surnameCombos, setSurnameCombos] = useState<AtejiCombo[]>([]);
  const [atejiLoading, setAtejiLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const [orderName, setOrderName] = useState('');

  // Restore a shared ?n=/&s= result and convert both fields on first boot.
  useEffect(() => {
    if (!initialNames.given && !initialNames.surname) return;
    let cancelled = false;

    // Normalize away disallowed / overlong query input without a reload.
    syncNameQueryToUrl(initialNames, locale);

    void (async () => {
      const [nextGiven, nextSurname] = await Promise.all([
        initialNames.given
          ? nameToKatakana(initialNames.given, lang)
          : Promise.resolve<KatakanaResult | null>(null),
        initialNames.surname
          ? nameToKatakana(initialNames.surname, lang)
          : Promise.resolve<KatakanaResult | null>(null),
      ]);
      if (cancelled) return;
      setGivenResult(nextGiven);
      setSurnameResult(nextSurname);
    })();

    return () => {
      cancelled = true;
    };
    // This is intentionally a boot-only restore. Strict Mode's second setup
    // still runs because no one-shot ref suppresses it after the first cleanup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (orderName) return;
    const combined = [surname, givenName].filter(Boolean).join(' ').trim();
    if (combined) setOrderName(combined);
  }, [givenName, surname, orderName]);

  const handleGivenResult = (result: KatakanaResult | null) => {
    setGivenResult(result);
    setSelectedGivenIdx(0);
    setGivenOverrides({});
    if (result) {
      syncNameQueryToUrl(
        { given: givenName, surname: surnameResult ? surname : '' },
        locale,
      );
    }
  };

  const handleSurnameResult = (result: KatakanaResult | null) => {
    setSurnameResult(result);
    setSelectedSurnameIdx(0);
    setSurnameOverrides({});
    if (result) {
      syncNameQueryToUrl(
        { given: givenResult ? givenName : '', surname },
        locale,
      );
    }
  };

  useEffect(() => {
    let cancelled = false;
    const givenKana = givenResult?.katakana ?? '';
    const surnameKana = surnameResult?.katakana ?? '';

    if (!givenKana && !surnameKana) {
      setGivenCombos([]);
      setSurnameCombos([]);
      setAtejiLoading(false);
      return;
    }

    setAtejiLoading(true);
    void (async () => {
      const [nextGiven, nextSurname] = await Promise.all([
        givenKana ? generateAtejiCandidates(givenKana, 8, givenResult?.moraPenaltyPoints) : Promise.resolve([]),
        surnameKana
          ? generateAtejiCandidates(surnameKana, 8, surnameResult?.moraPenaltyPoints)
          : Promise.resolve([]),
      ]);
      if (cancelled) return;
      setGivenCombos(nextGiven);
      setSurnameCombos(nextSurname);
      setAtejiLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [givenResult, surnameResult]);

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

  const shareOriginalName = [givenName, surname].filter(Boolean).join(' ').trim() || orderName;
  const shareKatakana = [surnameResult?.katakana, givenResult?.katakana].filter(Boolean).join('　');
  const shareDisplayJa = hasAnyAtejiKanji
    ? [...surnameSpans.map(spanChar), ...givenSpans.map(spanChar)].join('')
    : shareKatakana;
  const canShare = hankoChars.length > 0;

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
              {atejiLoading ? (
                <p className="kz-empty-hint" role="status" aria-live="polite">
                  {messages.atejiCandidates.loading}
                </p>
              ) : (
                <>
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
                  {canShare && (
                    <div className="kz-share-launch">
                      <p className="kz-share-launch__hint">{messages.share.earlyHint}</p>
                      <button type="button" className="mg-btn mg-btn--yellow kz-share-btn" onClick={() => setShareOpen(true)}>
                        {messages.share.button}
                      </button>
                    </div>
                  )}
                </>
              )}
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
              <Suspense fallback={<p className="kz-empty-hint" role="status">{messages.hankoSeal.downloadPreparing}</p>}>
                <HankoSeal
                  chars={hankoChars}
                  orientation={hankoOrientation}
                  onShare={canShare ? () => setShareOpen(true) : undefined}
                />
              </Suspense>
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
      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        givenName={givenName}
        surname={surnameResult ? surname : ''}
        originalName={shareOriginalName}
        katakana={shareKatakana}
        displayJa={shareDisplayJa}
        hankoChars={hankoChars}
        hankoOrientation={hankoOrientation}
      />
    </div>
  );
}

export default App;
