import type { Messages } from '../messages';

const fr = {
  header: {
    tagline: 'Transforme ton nom en un japonais écrit\nen caractères katakana et kanji',
    helpButton: 'Comment ça marche',
  },
  languageBanner: {
    question: 'Voulez-vous utiliser Kizunama en français ?',
    accept: 'Oui, changer',
    stay: 'Rester en anglais',
  },
  languageSwitcher: {
    label: 'Langue',
  },
  band1: {
    index: '01.SON',
    subtitle: 'Entrez votre nom : nous convertissons son son en Katakana, l\'alphabet japonais des noms étrangers',
    helpAria: 'Qu\'est-ce que le Katakana ?',
  },
  nameKatakana: {
    placeholder: 'Votre nom',
    convert: 'Convertir',
    converting: '…',
    loading: 'Chargement du moteur phonétique…',
    copy: 'Copier',
    copied: 'Copié',
  },
  surnameField: {
    label: 'Nom de famille (facultatif)',
    placeholder: 'Votre nom de famille — utile seulement pour le score de seimei handan',
    hint: 'Sans nom de famille, seuls les piliers liés au prénom peuvent être calculés.',
  },
  credibility: {
    label: 'Fiabilité de la transcription',
    high: 'Élevée — chaque son a un équivalent naturel en japonais',
    medium: 'Moyenne — quelques sons ne sont qu\'une approximation de l\'original',
    low: 'Faible — ce nom contient plusieurs sons sans véritable équivalent japonais',
  },
  band2: {
    index: '02.ATEJI',
    subtitle: 'Choisissez des Kanji sélectionnés pour leur son (ateji, 当て字) — une façon historique et ludique d\'« écrire » un nom étranger',
    helpAria: 'Qu\'est-ce que les ateji ?',
  },
  atejiCandidates: {
    emptyHint: 'Convertissez votre nom ci-dessus pour voir les Kanji correspondant par le son.',
    comboLabel: 'Option',
    unmatchedBadge: 'aucun Kanji adapté',
    unmatchedNote: 'Ce son n\'a pas de lecture Kanji naturelle — il reste en Katakana.',
    readingTypeNanori: 'lecture de prénom',
    readingTypeOn: 'lecture d\'origine chinoise',
    readingTypeKun: 'lecture native japonaise',
    historicalBadge: 'historiquement utilisé comme ateji',
    swapButton: 'Changer ce Kanji',
    swapTitle: 'Choisissez un autre Kanji pour ce son',
    swapClose: 'Fermer',
    strokesLabel: 'traits',
    meaningLabel: 'Signification',
    chosenBadge: 'Sélectionné',
    selectButton: 'Utiliser cette combinaison',
    surnameHeading: 'Nom de famille',
    givenNameHeading: 'Prénom',
  },
  band3: {
    index: '03.FORTUNE',
    subtitle: 'Seimei handan (姓名判断) : une lecture numérologique basée sur le nombre de traits des Kanji choisis',
    helpAria: 'Qu\'est-ce que le seimei handan ?',
  },
  seimeiHandan: {
    noKanjiHint: 'Choisissez une combinaison de Kanji ci-dessus pour voir son score de seimei handan.',
    strokesUnit: 'traits',
    noSurnameNote: 'Aucun nom de famille fourni — Tenkaku et Gaikaku sont affichés à 0 et n\'ont pas de sens à eux seuls.',
    disclaimer:
      'Le seimei handan est de la numérologie traditionnelle, pas une méthode scientifique. Ce calcul utilise une école répandue (Kumazaki-shiki) et une table de comptage des traits couramment utilisée — d\'autres écoles comptent les traits différemment et peuvent aboutir à un verdict différent.',
    tenkakuName: 'Tenkaku (天格) — pilier du Ciel',
    tenkakuDescription: 'Fortune héritée, liée au nom de famille et à la lignée familiale.',
    chikakuName: 'Chikaku (地格) — pilier de la Terre',
    chikakuDescription: 'Fortune personnelle liée au prénom, la plus influente dans la jeunesse.',
    jinkakuName: 'Jinkaku (人格) — pilier de l\'Humain',
    jinkakuDescription: 'Votre personnalité profonde et la façon dont les autres vous perçoivent.',
    soukakuName: 'Sōkaku (総格) — pilier Total',
    soukakuDescription: 'Fortune globale de la vie, surtout à partir du milieu de la vie.',
    gaikakuName: 'Gaikaku (外格) — pilier Extérieur',
    gaikakuDescription: 'Relations sociales et influences extérieures sur votre vie.',
    categoryDaikichi: 'Grande fortune',
    categoryKichi: 'Bonne fortune',
    categoryHankichi: 'Fortune mitigée',
    categoryKyou: 'Fortune médiocre',
    categoryDaikyou: 'Fortune très médiocre',
  },
  band4: {
    index: '04.HANKO',
    subtitle: 'Voyez les Kanji (ou le Katakana) choisis gravés sur un sceau Hanko décoratif',
    helpAria: 'Qu\'est-ce qu\'un Hanko ?',
  },
  hankoSeal: {
    download: 'Télécharger le SVG',
    downloadPreparing: 'Préparation du SVG…',
    downloadUnavailable: 'SVG indisponible',
    copy: 'Copier le SVG',
    copied: 'Copié',
    disclaimer: 'Aperçu décoratif — ce n\'est pas un jitsuin (sceau officiel) enregistrable.',
  },
  nameOrderField: {
    placeholder: 'Votre nom en lettres latines (pour l\'aide à la commande)',
  },
  orderHelper: {
    title: 'Commandez un vrai hanko — copiez ces champs',
    fieldChars: 'Caractères à graver',
    fieldName: 'Nom en lettres latines',
    fieldOrientation: 'Orientation suggérée',
    fieldOrientationValue: 'Écriture verticale',
    copy: 'Copier',
    copied: 'Copié',
    copyAll: 'Copier tout',
    copiedAll: 'Tout copié',
    cta: 'Obtenir un vrai tampon hanko',
    fieldNameEmpty: '—',
  },
  help: {
    closeButton: 'Fermer',
    topics: {
      overview: {
        title: 'Comment fonctionne Kizunama',
        body: [
          'Entrez votre nom : nous convertissons son son en Katakana, l\'alphabet japonais utilisé pour les noms étrangers.',
          'Nous classons des Kanji choisis uniquement pour leur son (ateji, 当て字) — une façon historique et ludique d\'« écrire » un nom, pas une traduction par le sens.',
          'Choisissez une combinaison et découvrez son score de seimei handan (numérologie), basé sur le nombre de traits des Kanji.',
          'Téléchargez un sceau Hanko décoratif avec les Kanji ou le Katakana choisis.',
        ],
      },
      ateji: {
        title: 'Ateji : des Kanji choisis pour leur son',
        body: [
          'Les ateji (当て字) sont des Kanji utilisés uniquement pour leur prononciation, en ignorant leur sens habituel — la façon historique dont le Japon écrivait les noms étrangers et les mots d\'emprunt avant que le Katakana ne devienne la norme.',
          'Chaque Kanji ici a été choisi parce qu\'une syllabe de votre nom correspond à l\'une de ses lectures (lecture de prénom, lecture d\'origine chinoise ou lecture native) — pas parce que son sens a un lien avec vous.',
          'Quand un son n\'a pas de correspondance Kanji naturelle, il reste en Katakana plutôt que d\'être imposé sur un caractère sans rapport.',
          'C\'est un exercice ludique et décoratif — ce n\'est pas ainsi que les noms japonais modernes sont réellement choisis.',
        ],
      },
      katakana: {
        title: 'Katakana',
        body: [
          'Le Katakana est un alphabet japonais habituellement utilisé pour écrire phonétiquement des noms et mots étrangers.',
          'Il ne transcrit que le son de votre nom — il ne porte aucun sens.',
          'Chaque étape suivante (correspondance Kanji, numérologie, le sceau) part de cette lecture en Katakana.',
        ],
      },
      seimeiHandan: {
        title: 'Seimei handan (numérologie)',
        body: [
          'Le seimei handan (姓名判断) est une pratique numérologique japonaise traditionnelle basée sur le nombre de traits des Kanji d\'un nom.',
          'Cinq valeurs (« piliers ») sont calculées à partir des Kanji du nom de famille et du prénom, chacune classée de grande fortune à fortune très médiocre.',
          'C\'est de la numérologie populaire, pas une méthode scientifique — d\'autres écoles utilisent des conventions de comptage différentes et peuvent aboutir à des verdicts différents.',
        ],
      },
      hanko: {
        title: 'Sceau Hanko',
        body: [
          'Le Hanko est un sceau personnel japonais, traditionnellement gravé de Kanji et utilisé à la place d\'une signature.',
          'Cet aperçu est purement décoratif — ce n\'est pas un jitsuin (sceau officiel) enregistrable. Pour toute démarche officielle, consultez une mairie japonaise ou un fabricant de hanko professionnel.',
          'Téléchargez le sceau généré en SVG, ou copiez les détails pour commander un vrai hanko physique gravé avec les caractères choisis.',
        ],
      },
    },
  },
  install: {
    text: 'Installez 絆名 KIZUNAMA comme application pour y accéder plus vite.',
    install: 'Installer',
    dismiss: 'Plus tard',
  },
  footer: {
    seo: 'Kizunama — un outil gratuit pour transformer le son de votre nom en Kanji ateji, calculer un score numérologique de seimei handan et créer un sceau Hanko décoratif téléchargeable. Pas d\'IA, pas de compte, fonctionne hors ligne une fois installé. Données Kanji issues de KANJIDIC2 (licence EDRDG).',
    credits: 'Créé par',
    sourcesTitle: 'Sources et licences',
    sourcesBody:
      'Lectures, nombre de traits et significations des Kanji issus de KANJIDIC2, avec l\'aimable autorisation de l\'Electronic Dictionary Research and Development Group (EDRDG), utilisés sous licence EDRDG. La table de fortune du seimei handan et les listes de bonus/exclusion d\'ateji sont une curation éditoriale originale de Kizunama.',
    sponsorCta: 'Cours de japonais gratuit',
  },
  generalDisclaimer:
    'Kizunama est un outil culturel ludique, pas un conseil juridique ou officiel. Rien de ce qui est généré ici n\'est enregistrable au koseki, et l\'aperçu du sceau n\'est pas un jitsuin. Pour toute démarche officielle — enregistrement de nom, résidence, ou un vrai hanko — consultez une mairie japonaise ou un fabricant de hanko agréé.',
} satisfies Messages;

export default fr;
