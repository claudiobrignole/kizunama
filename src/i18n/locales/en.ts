import type { Messages } from '../messages';

const en = {
  header: {
    tagline: 'Turn your name into a Japanese\nKatakana and Kanji name',
    helpButton: 'How it works',
  },
  languageBanner: {
    question: 'Would you like to continue in English?',
    continueEnglish: 'Continue in English',
    continueItalian: 'Continua in italiano',
  },
  languageSwitcher: {
    label: 'Language',
  },
  meta: {
    title: '絆名 | KIZUNAMA — Turn your name into Katakana and Kanji',
    description:
      'Turn your name into a Japanese Katakana and Kanji name for free. Ateji matched by sound, seimei handan numerology, and a shareable Hanko seal. No AI, no account, install as an app.',
    ogTitle: '絆名 | KIZUNAMA — Turn your name into Katakana and Kanji',
    ogDescription: 'Turn your name into a Japanese Katakana and Kanji name. Free, no AI, no account.',
  },
  band1: {
    index: '01.SOUND',
    subtitle: 'Enter your name — we convert its sound into Katakana, the Japanese script for foreign names',
    helpAria: 'What is Katakana?',
  },
  nameKatakana: {
    placeholder: 'Your name',
    convert: 'Convert',
    converting: '…',
    loading: 'Loading phonetic engine…',
    copy: 'Copy',
    copied: 'Copied',
  },
  surnameField: {
    label: 'Surname (optional)',
    placeholder: 'Your surname — only needed for the seimei handan score',
    hint: 'Without a surname, only your given-name pillars can be calculated.',
  },
  transliteration: {
    label: 'Transliteration confidence',
    validated: 'Validated',
    conventional: 'Conventional',
    approximate: 'Approximate',
    conventionalNote: 'EDRDG dictionary',
    approximateWarning: 'Automatic approximation — this spelling has not been human-validated.',
  },
  band2: {
    index: '02.ATEJI',
    subtitle: 'Pick Kanji chosen for their sound (ateji, 当て字) — a playful, historical way to "spell" a foreign name',
    helpAria: 'What is ateji?',
  },
  atejiCandidates: {
    emptyHint: 'Convert your name above to see Kanji options matched by sound.',
    loading: 'Loading Kanji options…',
    comboLabel: 'Option',
    unmatchedBadge: 'no clean Kanji',
    unmatchedNote: 'This sound has no natural Kanji reading — it stays in Katakana.',
    readingTypeNanori: 'name reading',
    readingTypeOn: 'Chinese-derived reading',
    readingTypeKun: 'native reading',
    historicalBadge: 'historically used as ateji',
    swapButton: 'Swap this Kanji',
    swapTitle: 'Choose an alternate Kanji for this sound',
    swapClose: 'Close',
    strokesLabel: 'strokes',
    meaningLabel: 'Meaning',
    readingLabel: 'Reading used',
    phoneticFitLabel: 'Phonetic fit',
    freeAdaptation: 'free adaptation',
    disclaimer:
      'Sound-only ateji: these Kanji do not make this a real Japanese name, and their readings can vary by context.',
    fitExplanation:
      'Fit starts at 100% per Kanji. Penalties: l→r −10, v approximation −15, each inserted vowel −8, long-vowel adjustment −5, and other extended-Katakana normalization −4. The combination is a mora-length-weighted mean.',
    chosenBadge: 'Selected',
    selectButton: 'Use this combination',
    surnameHeading: 'Surname',
    givenNameHeading: 'Given name',
  },
  band3: {
    index: '03.FORTUNE',
    subtitle: 'Seimei handan (姓名判断): a numerology reading based on the stroke count of your chosen Kanji',
    helpAria: 'What is seimei handan?',
  },
  seimeiHandan: {
    noKanjiHint: 'Choose a Kanji combination above to see its seimei handan score.',
    strokesUnit: 'strokes',
    noSurnameNote: 'No surname provided — Tenkaku and Gaikaku are shown as 0 and are not meaningful on their own.',
    disclaimer:
      'Seimei handan is traditional numerology, not a scientific method. This uses one popular school (Kumazaki-shiki) and one commonly used stroke-count table — other schools count strokes differently and can reach a different verdict.',
    tenkakuName: 'Tenkaku (天格) — Heaven pillar',
    tenkakuDescription: 'Inherited fortune, tied to your surname and family lineage.',
    chikakuName: 'Chikaku (地格) — Earth pillar',
    chikakuDescription: 'Personal fortune from your given name, most influential in youth.',
    jinkakuName: 'Jinkaku (人格) — Human pillar',
    jinkakuDescription: 'Your core personality and how others tend to perceive you.',
    soukakuName: 'Sōkaku (総格) — Total pillar',
    soukakuDescription: 'Overall life fortune, especially from mid-life onward.',
    gaikakuName: 'Gaikaku (外格) — Outer pillar',
    gaikakuDescription: 'Social relationships and outside influences on your life.',
    categoryDaikichi: 'Great fortune',
    categoryKichi: 'Good fortune',
    categoryHankichi: 'Mixed fortune',
    categoryKyou: 'Poor fortune',
    categoryDaikyou: 'Very poor fortune',
  },
  band4: {
    index: '04.HANKO',
    subtitle: 'See your chosen Kanji (or Katakana) engraved on a decorative Hanko seal',
    helpAria: 'What is a Hanko?',
  },
  hankoSeal: {
    download: 'Download SVG',
    downloadPreparing: 'Preparing SVG…',
    downloadUnavailable: 'SVG unavailable',
    copy: 'Copy SVG',
    copied: 'Copied',
    disclaimer: 'Decorative preview — not a registrable jitsuin (official seal).',
  },
  share: {
    button: 'Share to social',
    earlyHint: 'Ready to post? Create a Story, Post, or Square image with your name and hanko.',
    title: 'Share your Japanese name',
    formatLegend: 'Image format',
    formatStory: 'Story 9:16',
    formatPost: 'Post 4:5',
    formatSquare: 'Square 1:1',
    preparing: 'Preparing image…',
    previewAlt: 'Share preview',
    shareNative: 'Share…',
    shareNativeHint:
      'Opens your phone’s share sheet (WhatsApp, Messages, and sometimes Instagram when the system allows it).',
    shareNativeUnavailable:
      'Direct app sharing isn’t available in this browser — download the PNG, then open your social app.',
    downloadPng: 'Download PNG',
    instagram: 'Instagram',
    instagramHint:
      'Instagram still doesn’t let websites post for you. The PNG was saved to your device — open Instagram and upload it from your gallery (Feed, Stories, or Reels).',
    socialLegend: 'Share',
    shareTitle: 'My name in Japanese — Kizunama',
    close: 'Close',
    linkLabel: 'Link to this result',
    linkCopy: 'Copy link',
    linkCopied: 'Copied',
    tagline: 'My name in Japanese',
    errorFont: 'Japanese fonts are still loading. Please try again in a moment.',
    errorGeneric: 'Could not create the share image.',
    errorCopy: 'Could not copy the link.',
  },
  nameOrderField: {
    placeholder: 'Your name in Roman letters (for the order helper)',
  },
  orderHelper: {
    title: 'Order a real hanko — copy these fields',
    fieldChars: 'Characters to be engraved',
    fieldName: 'Name in Roman letters',
    fieldOrientation: 'Suggested orientation',
    fieldOrientationValue: 'Vertical Writing',
    copy: 'Copy',
    copied: 'Copied',
    copyAll: 'Copy all',
    copiedAll: 'Copied all',
    cta: 'Get a real hanko stamp',
    fieldNameEmpty: '—',
  },
  help: {
    closeButton: 'Close',
    topics: {
      overview: {
        title: 'How Kizunama works',
        body: [
          'Enter your name: we convert its sound into Katakana, the Japanese script used for foreign names.',
          'We rank Kanji chosen purely for their sound (ateji, 当て字) — a playful, historical way of "spelling" a name, not a meaning-based translation.',
          'Pick a combination and see its seimei handan (numerology) score, based on the stroke count of the Kanji.',
          'Download a decorative Hanko seal with your chosen Kanji or Katakana.',
        ],
      },
      ateji: {
        title: 'Ateji: Kanji chosen for their sound',
        body: [
          'Ateji (当て字) are Kanji used purely for their pronunciation, ignoring their usual meaning — the historical way Japan wrote foreign names and loanwords before Katakana became standard.',
          'Each Kanji here was picked because a syllable of your name matches a Chinese-derived reading, or an explicitly curated common native reading — not because its meaning relates to you.',
          'Phonetic fit starts at 100% for each Kanji: l→r costs 10 points, v approximation 15, each inserted vowel 8, long-vowel adjustment 5, and other extended-Katakana normalization 4. Overall fit is weighted by the mora covered.',
          'When a sound has no natural Kanji match, it stays in Katakana instead of being forced onto an unrelated character.',
          'This is a playful, decorative exercise — it is not how modern Japanese names are actually chosen.',
        ],
      },
      katakana: {
        title: 'Katakana',
        body: [
          'Katakana is a Japanese script normally used to write foreign names and words phonetically.',
          'It transliterates the sound of your name only — it does not carry any meaning.',
          'Every downstream step (Kanji matching, numerology, the seal) starts from this Katakana reading.',
        ],
      },
      seimeiHandan: {
        title: 'Seimei handan (numerology)',
        body: [
          'Seimei handan (姓名判断) is a traditional Japanese numerology practice based on the stroke count of the Kanji in a name.',
          'Five values ("pillars") are calculated from your surname and given-name Kanji, each classified from great fortune to very poor fortune.',
          'This is folk numerology, not a scientific method — other schools use different stroke-counting conventions and can reach different verdicts.',
        ],
      },
      hanko: {
        title: 'Hanko seal',
        body: [
          'A Hanko is a Japanese personal seal, traditionally engraved with Kanji and used instead of a signature.',
          'This preview is decorative only — it is not a registrable jitsuin (official seal). For anything official, consult a Japanese municipal office or a professional hanko shop.',
          'Download the generated seal as SVG, or copy the details to order a real, physical hanko engraved with your chosen characters.',
        ],
      },
    },
  },
  install: {
    text: 'Install 絆名 KIZUNAMA as an app for quick access.',
    install: 'Install',
    dismiss: 'Not now',
  },
  footer: {
    seo: 'Kizunama — a free tool to turn the sound of your name into ateji Kanji, calculate a seimei handan numerology score, and create a downloadable decorative Hanko seal. No AI, no account, works offline once installed. Kanji data from KANJIDIC2 (EDRDG licence).',
    credits: 'Made by',
    sourcesTitle: 'Sources & licences',
    sourcesBody:
      'Kanji readings, stroke counts and meanings from KANJIDIC2, and conventional foreign-name spellings from ENAMDICT/JMnedict, courtesy of the Electronic Dictionary Research and Development Group (EDRDG), used under the EDRDG licence. The seimei handan fortune table and ateji boost/exclusion lists are original editorial curation by Kizunama.',
    sponsorCta: 'Free Japanese course',
  },
  generalDisclaimer:
    'Kizunama is a playful cultural tool, not legal or official guidance. Nothing generated here is koseki-registrable and the seal preview is not a jitsuin. For anything official — name registration, residency, or a real hanko — consult a Japanese municipal office or a licensed hanko shop.',
} satisfies Messages;

export default en;
