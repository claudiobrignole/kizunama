import type { Messages } from '../messages';

const de = {
  header: {
    tagline: 'Verwandle deinen Namen in einen japanischen\ngeschrieben in Katakana und Kanji',
    helpButton: 'So funktioniert es',
  },
  languageBanner: {
    question: 'Möchtest du Kizunama auf Deutsch nutzen?',
    accept: 'Ja, wechseln',
    stay: 'Bei Englisch bleiben',
  },
  languageSwitcher: {
    label: 'Sprache',
  },
  band1: {
    index: '01.KLANG',
    subtitle: 'Gib deinen Namen ein — wir wandeln seinen Klang in Katakana um, die japanische Schrift für ausländische Namen',
    helpAria: 'Was ist Katakana?',
  },
  nameKatakana: {
    placeholder: 'Dein Name',
    convert: 'Umwandeln',
    converting: '…',
    loading: 'Phonetik-Engine wird geladen…',
    copy: 'Kopieren',
    copied: 'Kopiert',
  },
  surnameField: {
    label: 'Nachname (optional)',
    placeholder: 'Dein Nachname — nur für den Seimei-Handan-Wert nötig',
    hint: 'Ohne Nachname können nur die Säulen des Vornamens berechnet werden.',
  },
  credibility: {
    label: 'Verlässlichkeit der Umschrift',
    high: 'Hoch — jeder Laut hat eine natürliche japanische Entsprechung',
    medium: 'Mittel — ein paar Laute sind nur eine Annäherung an das Original',
    low: 'Niedrig — dieser Name hat mehrere Laute ohne echte japanische Entsprechung',
  },
  band2: {
    index: '02.ATEJI',
    subtitle: 'Wähle Kanji, die nach ihrem Klang ausgewählt wurden (Ateji, 当て字) — eine spielerische, historische Art, einen ausländischen Namen zu „schreiben"',
    helpAria: 'Was ist Ateji?',
  },
  atejiCandidates: {
    emptyHint: 'Wandle deinen Namen oben um, um nach Klang passende Kanji-Optionen zu sehen.',
    comboLabel: 'Option',
    unmatchedBadge: 'kein passendes Kanji',
    unmatchedNote: 'Für diesen Laut gibt es keine natürliche Kanji-Lesung — er bleibt in Katakana.',
    readingTypeNanori: 'Namenslesung',
    readingTypeOn: 'chinesisch abgeleitete Lesung',
    readingTypeKun: 'einheimische japanische Lesung',
    historicalBadge: 'historisch als Ateji verwendet',
    swapButton: 'Dieses Kanji tauschen',
    swapTitle: 'Wähle ein alternatives Kanji für diesen Laut',
    swapClose: 'Schließen',
    strokesLabel: 'Striche',
    meaningLabel: 'Bedeutung',
    chosenBadge: 'Ausgewählt',
    selectButton: 'Diese Kombination verwenden',
    surnameHeading: 'Nachname',
    givenNameHeading: 'Vorname',
  },
  band3: {
    index: '03.SCHICKSAL',
    subtitle: 'Seimei handan (姓名判断): eine numerologische Deutung anhand der Strichzahl deiner gewählten Kanji',
    helpAria: 'Was ist Seimei handan?',
  },
  seimeiHandan: {
    noKanjiHint: 'Wähle oben eine Kanji-Kombination, um ihren Seimei-Handan-Wert zu sehen.',
    strokesUnit: 'Striche',
    noSurnameNote: 'Kein Nachname angegeben — Tenkaku und Gaikaku werden als 0 angezeigt und sind allein nicht aussagekräftig.',
    disclaimer:
      'Seimei handan ist traditionelle Numerologie, keine wissenschaftliche Methode. Diese Berechnung nutzt eine verbreitete Schule (Kumazaki-shiki) und eine gängige Strichzähl-Tabelle — andere Schulen zählen Striche anders und können zu einem anderen Urteil kommen.',
    tenkakuName: 'Tenkaku (天格) — Himmelssäule',
    tenkakuDescription: 'Ererbtes Schicksal, verbunden mit Nachname und Familienlinie.',
    chikakuName: 'Chikaku (地格) — Erdsäule',
    chikakuDescription: 'Persönliches Schicksal aus dem Vornamen, am einflussreichsten in der Jugend.',
    jinkakuName: 'Jinkaku (人格) — Menschensäule',
    jinkakuDescription: 'Deine Kernpersönlichkeit und wie andere dich wahrnehmen.',
    soukakuName: 'Sōkaku (総格) — Gesamtsäule',
    soukakuDescription: 'Gesamtes Lebensschicksal, besonders ab der Lebensmitte.',
    gaikakuName: 'Gaikaku (外格) — Außensäule',
    gaikakuDescription: 'Soziale Beziehungen und äußere Einflüsse auf dein Leben.',
    categoryDaikichi: 'Großes Glück',
    categoryKichi: 'Gutes Glück',
    categoryHankichi: 'Gemischtes Glück',
    categoryKyou: 'Wenig Glück',
    categoryDaikyou: 'Sehr wenig Glück',
  },
  band4: {
    index: '04.HANKO',
    subtitle: 'Sieh deine gewählten Kanji (oder Katakana) auf einem dekorativen Hanko-Siegel graviert',
    helpAria: 'Was ist ein Hanko?',
  },
  hankoSeal: {
    download: 'SVG herunterladen',
    downloadPreparing: 'SVG wird vorbereitet…',
    downloadUnavailable: 'SVG nicht verfügbar',
    copy: 'SVG kopieren',
    copied: 'Kopiert',
    disclaimer: 'Dekorative Vorschau — kein registrierbares Jitsuin (offizielles Siegel).',
  },
  nameOrderField: {
    placeholder: 'Dein Name in lateinischen Buchstaben (für den Bestell-Helfer)',
  },
  orderHelper: {
    title: 'Echten Hanko bestellen — diese Felder kopieren',
    fieldChars: 'Zu gravierende Zeichen',
    fieldName: 'Name in lateinischen Buchstaben',
    fieldOrientation: 'Empfohlene Ausrichtung',
    fieldOrientationValue: 'Vertikale Schrift',
    copy: 'Kopieren',
    copied: 'Kopiert',
    copyAll: 'Alles kopieren',
    copiedAll: 'Alles kopiert',
    cta: 'Echten Hanko-Stempel bestellen',
    fieldNameEmpty: '—',
  },
  help: {
    closeButton: 'Schließen',
    topics: {
      overview: {
        title: 'So funktioniert Kizunama',
        body: [
          'Gib deinen Namen ein: Wir wandeln seinen Klang in Katakana um, die japanische Schrift für ausländische Namen.',
          'Wir ordnen Kanji, die rein nach ihrem Klang ausgewählt wurden (Ateji, 当て字) — eine spielerische, historische Art, einen Namen zu „schreiben", keine bedeutungsbasierte Übersetzung.',
          'Wähle eine Kombination und sieh ihren Seimei-Handan-Wert (Numerologie), basierend auf der Strichzahl der Kanji.',
          'Lade ein dekoratives Hanko-Siegel mit deinen gewählten Kanji oder Katakana herunter.',
        ],
      },
      ateji: {
        title: 'Ateji: Kanji nach ihrem Klang gewählt',
        body: [
          'Ateji (当て字) sind Kanji, die rein wegen ihrer Aussprache verwendet werden, unabhängig von ihrer üblichen Bedeutung — die historische Art, wie Japan ausländische Namen und Lehnwörter schrieb, bevor Katakana zum Standard wurde.',
          'Jedes Kanji hier wurde gewählt, weil eine Silbe deines Namens zu einer seiner Lesungen passt (Namenslesung, chinesisch abgeleitete Lesung oder einheimische Lesung) — nicht weil seine Bedeutung mit dir zu tun hat.',
          'Wenn ein Laut keine natürliche Kanji-Entsprechung hat, bleibt er in Katakana, statt einem unpassenden Zeichen aufgezwungen zu werden.',
          'Das ist eine spielerische, dekorative Übung — so werden moderne japanische Namen nicht tatsächlich vergeben.',
        ],
      },
      katakana: {
        title: 'Katakana',
        body: [
          'Katakana ist eine japanische Schrift, die normalerweise verwendet wird, um fremde Namen und Wörter phonetisch zu schreiben.',
          'Es überträgt nur den Klang deines Namens — es trägt keine Bedeutung.',
          'Jeder folgende Schritt (Kanji-Zuordnung, Numerologie, das Siegel) beginnt mit dieser Katakana-Lesung.',
        ],
      },
      seimeiHandan: {
        title: 'Seimei handan (Numerologie)',
        body: [
          'Seimei handan (姓名判断) ist eine traditionelle japanische numerologische Praxis, die auf der Strichzahl der Kanji eines Namens basiert.',
          'Fünf Werte („Säulen") werden aus den Kanji von Nachname und Vorname berechnet, jeweils eingestuft von großem Glück bis sehr wenig Glück.',
          'Das ist volkstümliche Numerologie, keine wissenschaftliche Methode — andere Schulen verwenden andere Strichzähl-Konventionen und können zu anderen Urteilen kommen.',
        ],
      },
      hanko: {
        title: 'Hanko-Siegel',
        body: [
          'Ein Hanko ist ein japanisches Namenssiegel, traditionell mit Kanji graviert und statt einer Unterschrift verwendet.',
          'Diese Vorschau ist rein dekorativ — kein registrierbares Jitsuin (offizielles Siegel). Für offizielle Angelegenheiten wende dich an ein japanisches Gemeindeamt oder einen professionellen Hanko-Laden.',
          'Lade das generierte Siegel als SVG herunter oder kopiere die Details, um einen echten, physischen Hanko mit den gewählten Zeichen zu bestellen.',
        ],
      },
    },
  },
  install: {
    text: 'Installiere 絆名 KIZUNAMA als App für schnellen Zugriff.',
    install: 'Installieren',
    dismiss: 'Nicht jetzt',
  },
  footer: {
    seo: 'Kizunama — ein kostenloses Tool, um den Klang deines Namens in Ateji-Kanji zu verwandeln, einen Seimei-Handan-Numerologiewert zu berechnen und ein herunterladbares dekoratives Hanko-Siegel zu erstellen. Keine KI, kein Konto, funktioniert offline nach der Installation. Kanji-Daten von KANJIDIC2 (EDRDG-Lizenz).',
    credits: 'Erstellt von',
    sourcesTitle: 'Quellen & Lizenzen',
    sourcesBody:
      'Kanji-Lesungen, Strichzahlen und Bedeutungen von KANJIDIC2, mit freundlicher Genehmigung der Electronic Dictionary Research and Development Group (EDRDG), verwendet unter der EDRDG-Lizenz. Die Seimei-Handan-Glückstabelle und die Ateji-Bonus-/Ausschlusslisten sind originale redaktionelle Kuratierung von Kizunama.',
    sponsorCta: 'Kostenloser Japanisch-Kurs',
  },
  generalDisclaimer:
    'Kizunama ist ein spielerisches Kulturtool, keine rechtliche oder offizielle Beratung. Nichts hier Generiertes ist im Koseki registrierbar, und die Siegel-Vorschau ist kein Jitsuin. Für offizielle Angelegenheiten — Namensregistrierung, Aufenthalt oder einen echten Hanko — wende dich an ein japanisches Gemeindeamt oder einen zugelassenen Hanko-Laden.',
} satisfies Messages;

export default de;
