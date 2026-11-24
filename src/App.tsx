import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { NameKatakana } from './components/NameKatakana';
import { AtejiCandidates } from './components/AtejiCandidates';
import { SeimeiHandanView } from './components/SeimeiHandanView';
import { OrderHelper } from './components/OrderHelper';
import { ShareDialog } from './components/ShareDialog';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { LunaSponsorStrip } from './components/LunaSponsorStrip';
import { InstallPrompt } from './components/InstallPrompt';
import { LanguageBanner } from './components/LanguageBanner';
import { HelpDialog, type HelpTopic } from './components/HelpDialog';
import { SeoGuide } from './components/SeoGuide';
import { ShareNameLink } from './components/ShareNameLink';
import { NameIndex, NamePage } from './components/NamePage';
import { useI18n } from './i18n/context';
import { absoluteUrl, homePath, hreflangSet, parseAppRoute } from './seo/paths';
import { usePageMeta } from './seo/usePageMeta';
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
  prefetchPhonemizer,
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

function Home({ onHelp }: { onHelp: (topic: HelpTopic) => void }) {
  const { messages, locale } = useI18n();
  usePageMeta({
    title: messages.meta.title,
    description: messages.meta.description,
    canonical: absoluteUrl(homePath(locale)),
    ogImage: 'https://kizunama.com/brand/og-card.png',
    ogAlt: 'KIZUNAMA',
    ogLocale: locale === 'it' ? 'it_IT' : 'en_US',
    hreflang: hreflangSet('home'),
  });
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
      prefetchPhonemizer();
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

  // Keep the order-assistant Latin name in sync with the name fields.
  // (Previously we stopped after the first non-empty value, so typing
  // "Claudio" left the field stuck on "C".)
  useEffect(() => {
    setOrderName([givenName, surname].filter(Boolean).join(' ').trim());
  }, [givenName, surname]);

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
    <>
      <section className="mg-band mg-band--yellow kz-band" aria-labelledby="band1-title">
        <div className="mg-band-inner">
          <div className="mg-band-copy">
            <span className="mg-index">
              {messages.band1.index}
              {' · '}
              <span lang="ja">音写</span>
            </span>
            <h1 className="mg-band-title" id="band1-title">
              {messages.seo.h1}
              <button
                type="button"
                className="kz-help-icon"
                aria-label={messages.band1.helpAria}
                onClick={() => onHelp('katakana')}
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
            >
              <ShareNameLink name={givenName} enabled={Boolean(givenResult?.katakana)} />
            </NameKatakana>

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

      <SeoGuide />

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
                onClick={() => onHelp('ateji')}
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
                onClick={() => onHelp('seimeiHandan')}
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
                onClick={() => onHelp('hanko')}
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
    </>
  );
}

function App() {
  const route = parseAppRoute(typeof window === 'undefined' ? '/' : window.location.pathname);
  const [helpTopic, setHelpTopic] = useState<HelpTopic | null>(null);

  return (
    <div className="mg-landing kz-landing">
      <LanguageBanner />
      <SiteHeader onHelp={() => setHelpTopic('overview')} />
      {route.kind === 'home' && <Home onHelp={setHelpTopic} />}
      {route.kind === 'index' && <NameIndex />}
      {(route.kind === 'name' || route.kind === 'notfound') && (
        <NamePage slug={route.kind === 'name' ? route.slug : ''} />
      )}
      {route.kind === 'home' && <InstallPrompt />}
      <SiteFooter onOpenHelp={() => setHelpTopic('overview')} />
      <HelpDialog topic={helpTopic} onClose={() => setHelpTopic(null)} />
    </div>
  );
}

export default App;
