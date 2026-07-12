import type { Messages } from '../messages';

const it = {
  header: {
    tagline: 'Trasforma il tuo nome in uno giapponese\nscritto in caratteri Katakana e Kanji',
    helpButton: 'Come funziona',
  },
  languageBanner: {
    question: 'Vuoi usare Kizunama in italiano?',
    accept: 'Sì, cambia lingua',
    stay: 'Resta in inglese',
  },
  languageSwitcher: {
    label: 'Lingua',
  },
  band1: {
    index: '01.SUONO',
    subtitle: 'Inserisci il tuo nome: convertiamo il suo suono in Katakana, l\'alfabeto giapponese per i nomi stranieri',
    helpAria: 'Cos\'è il Katakana?',
  },
  nameKatakana: {
    placeholder: 'Il tuo nome',
    convert: 'Converti',
    converting: '…',
    loading: 'Caricamento del motore fonetico…',
    copy: 'Copia',
    copied: 'Copiato',
  },
  surnameField: {
    label: 'Cognome (opzionale)',
    placeholder: 'Il tuo cognome — serve solo per il punteggio di seimei handan',
    hint: 'Senza cognome possiamo calcolare solo i pilastri legati al nome proprio.',
  },
  credibility: {
    label: 'Attendibilità della trascrizione',
    high: 'Alta — ogni suono ha un equivalente naturale in giapponese',
    medium: 'Media — un paio di suoni sono solo un\'approssimazione dell\'originale',
    low: 'Bassa — questo nome ha diversi suoni senza un vero equivalente giapponese',
  },
  band2: {
    index: '02.ATEJI',
    subtitle: 'Scegli i Kanji selezionati per il loro suono (ateji, 当て字) — un modo storico e giocoso di "scrivere" un nome straniero',
    helpAria: 'Cosa sono gli ateji?',
  },
  atejiCandidates: {
    emptyHint: 'Converti il tuo nome qui sopra per vedere i Kanji corrispondenti per suono.',
    comboLabel: 'Opzione',
    unmatchedBadge: 'nessun Kanji adatto',
    unmatchedNote: 'Questo suono non ha una lettura Kanji naturale — resta in Katakana.',
    readingTypeNanori: 'lettura da nome proprio',
    readingTypeOn: 'lettura di origine cinese',
    readingTypeKun: 'lettura nativa giapponese',
    historicalBadge: 'storicamente usato come ateji',
    swapButton: 'Cambia questo Kanji',
    swapTitle: 'Scegli un Kanji alternativo per questo suono',
    swapClose: 'Chiudi',
    strokesLabel: 'tratti',
    meaningLabel: 'Significato',
    chosenBadge: 'Selezionato',
    selectButton: 'Usa questa combinazione',
    surnameHeading: 'Cognome',
    givenNameHeading: 'Nome proprio',
  },
  band3: {
    index: '03.FORTUNA',
    subtitle: 'Seimei handan (姓名判断): una lettura numerologica basata sul numero di tratti dei Kanji scelti',
    helpAria: 'Cos\'è il seimei handan?',
  },
  seimeiHandan: {
    noKanjiHint: 'Scegli una combinazione di Kanji qui sopra per vedere il suo punteggio di seimei handan.',
    strokesUnit: 'tratti',
    noSurnameNote: 'Nessun cognome inserito — Tenkaku e Gaikaku sono mostrati come 0 e non hanno significato da soli.',
    disclaimer:
      'Il seimei handan è numerologia tradizionale, non un metodo scientifico. Questo calcolo usa una scuola diffusa (Kumazaki-shiki) e una tabella di conteggio dei tratti comunemente usata — altre scuole contano i tratti in modo diverso e possono arrivare a un verdetto diverso.',
    tenkakuName: 'Tenkaku (天格) — pilastro del Cielo',
    tenkakuDescription: 'Fortuna ereditata, legata al cognome e alla discendenza familiare.',
    chikakuName: 'Chikaku (地格) — pilastro della Terra',
    chikakuDescription: 'Fortuna personale legata al nome proprio, più influente in gioventù.',
    jinkakuName: 'Jinkaku (人格) — pilastro dell\'Uomo',
    jinkakuDescription: 'La tua personalità di base e come tendi a essere percepito dagli altri.',
    soukakuName: 'Sōkaku (総格) — pilastro Totale',
    soukakuDescription: 'Fortuna generale della vita, soprattutto dalla mezza età in poi.',
    gaikakuName: 'Gaikaku (外格) — pilastro Esterno',
    gaikakuDescription: 'Relazioni sociali e influenze esterne sulla tua vita.',
    categoryDaikichi: 'Grande fortuna',
    categoryKichi: 'Buona fortuna',
    categoryHankichi: 'Fortuna mista',
    categoryKyou: 'Fortuna scarsa',
    categoryDaikyou: 'Fortuna molto scarsa',
  },
  band4: {
    index: '04.HANKO',
    subtitle: 'Vedi i Kanji (o il Katakana) scelti incisi su un timbro Hanko decorativo',
    helpAria: 'Cos\'è un Hanko?',
  },
  hankoSeal: {
    download: 'Scarica SVG',
    downloadPreparing: 'Preparazione SVG…',
    downloadUnavailable: 'SVG non disponibile',
    copy: 'Copia SVG',
    copied: 'Copiato',
    disclaimer: 'Anteprima decorativa — non è un jitsuin (timbro ufficiale) registrabile.',
  },
  nameOrderField: {
    placeholder: 'Il tuo nome in lettere latine (per l\'assistente ordine)',
  },
  orderHelper: {
    title: 'Ordina un hanko reale — copia questi campi',
    fieldChars: 'Caratteri da incidere',
    fieldName: 'Nome in lettere latine',
    fieldOrientation: 'Orientamento consigliato',
    fieldOrientationValue: 'Scrittura verticale',
    copy: 'Copia',
    copied: 'Copiato',
    copyAll: 'Copia tutto',
    copiedAll: 'Copiato tutto',
    cta: 'Ottieni un hanko reale',
    fieldNameEmpty: '—',
  },
  help: {
    closeButton: 'Chiudi',
    topics: {
      overview: {
        title: 'Come funziona Kizunama',
        body: [
          'Inserisci il tuo nome: convertiamo il suo suono in Katakana, l\'alfabeto giapponese usato per i nomi stranieri.',
          'Classifichiamo i Kanji scelti solo per il loro suono (ateji, 当て字) — un modo storico e giocoso di "scrivere" un nome, non una traduzione per significato.',
          'Scegli una combinazione e guarda il suo punteggio di seimei handan (numerologia), basato sul numero di tratti dei Kanji.',
          'Scarica un timbro Hanko decorativo con i Kanji o il Katakana scelti.',
        ],
      },
      ateji: {
        title: 'Ateji: Kanji scelti per il suono',
        body: [
          'Gli ateji (当て字) sono Kanji usati solo per la loro pronuncia, ignorando il significato abituale — il modo storico con cui il Giappone scriveva nomi stranieri e prestiti linguistici prima che il Katakana diventasse lo standard.',
          'Ogni Kanji qui è stato scelto perché una sillaba del tuo nome corrisponde a una delle sue letture (lettura da nome proprio, lettura di origine cinese o lettura nativa) — non perché il suo significato ha un legame con te.',
          'Quando un suono non ha una corrispondenza Kanji naturale, resta in Katakana invece di essere forzato su un carattere non correlato.',
          'È un esercizio giocoso e decorativo — non è come si scelgono realmente i nomi giapponesi oggi.',
        ],
      },
      katakana: {
        title: 'Katakana',
        body: [
          'Il Katakana è un alfabeto giapponese usato di solito per scrivere foneticamente nomi e parole straniere.',
          'Trascrive solo il suono del tuo nome — non porta alcun significato.',
          'Ogni passaggio successivo (corrispondenza Kanji, numerologia, il timbro) parte da questa lettura in Katakana.',
        ],
      },
      seimeiHandan: {
        title: 'Seimei handan (numerologia)',
        body: [
          'Il seimei handan (姓名判断) è una pratica numerologica giapponese tradizionale basata sul numero di tratti dei Kanji di un nome.',
          'Si calcolano cinque valori ("pilastri") dai Kanji del cognome e del nome proprio, ciascuno classificato da grande fortuna a fortuna molto scarsa.',
          'È numerologia popolare, non un metodo scientifico — altre scuole usano convenzioni diverse per contare i tratti e possono arrivare a verdetti diversi.',
        ],
      },
      hanko: {
        title: 'Timbro Hanko',
        body: [
          'L\'Hanko è un timbro personale giapponese, tradizionalmente incisa con Kanji e usato al posto della firma.',
          'Questa anteprima è solo decorativa — non è un jitsuin (timbro ufficiale) registrabile. Per qualsiasi uso ufficiale, rivolgiti a un ufficio comunale giapponese o a un negozio di hanko professionale.',
          'Scarica il timbro generato in SVG, oppure copia i dettagli per ordinare un hanko reale e fisico incisa con i caratteri scelti.',
        ],
      },
    },
  },
  install: {
    text: 'Installa 絆名 KIZUNAMA come app per un accesso rapido.',
    install: 'Installa',
    dismiss: 'Non ora',
  },
  footer: {
    seo: 'Kizunama — uno strumento gratuito per trasformare il suono del tuo nome in Kanji ateji, calcolare un punteggio numerologico di seimei handan e creare un timbro Hanko decorativo scaricabile. Nessuna AI, nessun account, funziona offline una volta installato. Dati Kanji da KANJIDIC2 (licenza EDRDG).',
    credits: 'Realizzato da',
    sourcesTitle: 'Fonti e licenze',
    sourcesBody:
      'Letture, numero di tratti e significati dei Kanji da KANJIDIC2, per gentile concessione dell\'Electronic Dictionary Research and Development Group (EDRDG), usati secondo la licenza EDRDG. La tabella della fortuna del seimei handan e le liste di boost/esclusione degli ateji sono una curatela editoriale originale di Kizunama.',
    sponsorCta: 'Corso di giapponese gratuito',
  },
  generalDisclaimer:
    'Kizunama è uno strumento culturale e giocoso, non una guida legale o ufficiale. Nulla di quanto generato qui è registrabile nel koseki e l\'anteprima del timbro non è un jitsuin. Per qualsiasi cosa ufficiale — registrazione del nome, residenza o un hanko reale — rivolgiti a un ufficio comunale giapponese o a un negozio di hanko autorizzato.',
} satisfies Messages;

export default it;
