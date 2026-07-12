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
    continueEnglish: string;
    continueItalian: string;
  };
  languageSwitcher: {
    label: string;
  };
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
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
  transliteration: {
    label: string;
    validated: string;
    conventional: string;
    approximate: string;
    conventionalNote: string;
    approximateWarning: string;
  };
  band2: {
    index: string;
    subtitle: string;
    helpAria: string;
  };
  atejiCandidates: {
    emptyHint: string;
    loading: string;
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
    readingLabel: string;
    phoneticFitLabel: string;
    freeAdaptation: string;
    disclaimer: string;
    fitExplanation: string;
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
  share: {
    button: string;
    earlyHint: string;
    title: string;
    formatLegend: string;
    formatStory: string;
    formatPost: string;
    formatSquare: string;
    preparing: string;
    previewAlt: string;
    shareNative: string;
    shareNativeHint: string;
    shareNativeUnavailable: string;
    downloadPng: string;
    instagram: string;
    instagramHint: string;
    socialLegend: string;
    shareTitle: string;
    close: string;
    linkLabel: string;
    linkCopy: string;
    linkCopied: string;
    tagline: string;
    errorFont: string;
    errorGeneric: string;
    errorCopy: string;
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

export type LocaleCode = 'en' | 'it';

export const SUPPORTED_LOCALES: LocaleCode[] = ['it', 'en'];

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  en: 'EN',
  it: 'IT',
};

export const LOCALE_NAMES: Record<LocaleCode, string> = {
  en: 'English',
  it: 'Italiano',
};

/** Production site origin used for canonical / hreflang / sitemap. */
export const SITE_ORIGIN = 'https://kizunama.com';

/** Locale from the URL path: /en or /en/… → en, otherwise it. */
export function localeFromPathname(pathname: string): LocaleCode {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/en' || path.startsWith('/en/')) return 'en';
  return 'it';
}

/** Absolute path for a locale, preserving an optional query string (e.g. ?n=). */
export function pathForLocale(locale: LocaleCode, search = ''): string {
  const base = locale === 'en' ? '/en/' : '/';
  if (!search || search === '?') return base;
  return `${base}${search.startsWith('?') ? search : `?${search}`}`;
}
