/**
 * Canonical shape of every translatable string in the app. `en.ts` is the
 * source of truth; every other locale file must implement this exact shape
 * (enforced with `satisfies Messages`) so a missing translation is a
 * compile-time error, not a silent runtime fallback.
 */
export interface Messages {
  header: {
    tagline: string;
    helpButton: string;
  };
  languageBanner: {
    question: string;
    accept: string;
    stay: string;
  };
  languageSwitcher: {
    label: string;
  };
  band1: {
    index: string;
    subtitle: string;
    helpAria: string;
  };
  nameKatakana: {
    placeholder: string;
    convert: string;
    converting: string;
    loading: string;
    copy: string;
    copied: string;
  };
  surnameField: {
    label: string;
    placeholder: string;
    hint: string;
  };
  credibility: {
    label: string;
    high: string;
    medium: string;
    low: string;
  };
  band2: {
    index: string;
    subtitle: string;
    helpAria: string;
  };
  atejiCandidates: {
    emptyHint: string;
    comboLabel: string;
    unmatchedBadge: string;
    unmatchedNote: string;
    readingTypeNanori: string;
    readingTypeOn: string;
    readingTypeKun: string;
    historicalBadge: string;
    swapButton: string;
    swapTitle: string;
    swapClose: string;
    strokesLabel: string;
    meaningLabel: string;
    chosenBadge: string;
    selectButton: string;
    surnameHeading: string;
    givenNameHeading: string;
  };
  band3: {
    index: string;
    subtitle: string;
    helpAria: string;
  };
  seimeiHandan: {
    noKanjiHint: string;
    strokesUnit: string;
    noSurnameNote: string;
    disclaimer: string;
    tenkakuName: string;
    tenkakuDescription: string;
    chikakuName: string;
    chikakuDescription: string;
    jinkakuName: string;
    jinkakuDescription: string;
    soukakuName: string;
    soukakuDescription: string;
    gaikakuName: string;
    gaikakuDescription: string;
    categoryDaikichi: string;
    categoryKichi: string;
    categoryHankichi: string;
    categoryKyou: string;
    categoryDaikyou: string;
  };
  band4: {
    index: string;
    subtitle: string;
    helpAria: string;
  };
  hankoSeal: {
    download: string;
    downloadPreparing: string;
    downloadUnavailable: string;
    copy: string;
    copied: string;
    disclaimer: string;
  };
  nameOrderField: {
    placeholder: string;
  };
  orderHelper: {
    title: string;
    fieldChars: string;
    fieldName: string;
    fieldOrientation: string;
    fieldOrientationValue: string;
    copy: string;
    copied: string;
    copyAll: string;
    copiedAll: string;
    cta: string;
    fieldNameEmpty: string;
  };
  help: {
    closeButton: string;
    topics: {
      overview: { title: string; body: string[] };
      ateji: { title: string; body: string[] };
      katakana: { title: string; body: string[] };
      seimeiHandan: { title: string; body: string[] };
      hanko: { title: string; body: string[] };
    };
  };
  install: {
    text: string;
    install: string;
    dismiss: string;
  };
  footer: {
    seo: string;
    credits: string;
    sourcesTitle: string;
    sourcesBody: string;
    sponsorCta: string;
  };
  generalDisclaimer: string;
}

export type LocaleCode = 'en' | 'it' | 'fr' | 'de' | 'es' | 'pt';

export const SUPPORTED_LOCALES: LocaleCode[] = ['en', 'it', 'fr', 'de', 'es', 'pt'];

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  en: 'EN',
  it: 'IT',
  fr: 'FR',
  de: 'DE',
  es: 'ES',
  pt: 'PT',
};

export const LOCALE_NAMES: Record<LocaleCode, string> = {
  en: 'English',
  it: 'Italiano',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  pt: 'Português',
};
