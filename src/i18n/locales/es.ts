import type { Messages } from '../messages';

const es = {
  header: {
    tagline: 'Transforma tu nombre en uno japonés\nescrito en caracteres katakana y kanji',
    helpButton: 'Cómo funciona',
  },
  languageBanner: {
    question: '¿Quieres usar Kizunama en español?',
    accept: 'Sí, cambiar',
    stay: 'Seguir en inglés',
  },
  languageSwitcher: {
    label: 'Idioma',
  },
  band1: {
    index: '01.SONIDO',
    subtitle: 'Introduce tu nombre: convertimos su sonido a Katakana, el alfabeto japonés para nombres extranjeros',
    helpAria: '¿Qué es el Katakana?',
  },
  nameKatakana: {
    placeholder: 'Tu nombre',
    convert: 'Convertir',
    converting: '…',
    loading: 'Cargando el motor fonético…',
    copy: 'Copiar',
    copied: 'Copiado',
  },
  surnameField: {
    label: 'Apellido (opcional)',
    placeholder: 'Tu apellido — solo necesario para la puntuación de seimei handan',
    hint: 'Sin apellido, solo se pueden calcular los pilares del nombre de pila.',
  },
  credibility: {
    label: 'Fiabilidad de la transcripción',
    high: 'Alta — cada sonido tiene un equivalente natural en japonés',
    medium: 'Media — un par de sonidos solo aproximan el original',
    low: 'Baja — este nombre tiene varios sonidos sin un equivalente japonés real',
  },
  band2: {
    index: '02.ATEJI',
    subtitle: 'Elige Kanji escogidos por su sonido (ateji, 当て字) — una forma histórica y lúdica de "escribir" un nombre extranjero',
    helpAria: '¿Qué son los ateji?',
  },
  atejiCandidates: {
    emptyHint: 'Convierte tu nombre arriba para ver opciones de Kanji que coincidan por sonido.',
    comboLabel: 'Opción',
    unmatchedBadge: 'sin Kanji adecuado',
    unmatchedNote: 'Este sonido no tiene una lectura Kanji natural — se mantiene en Katakana.',
    readingTypeNanori: 'lectura de nombre propio',
    readingTypeOn: 'lectura de origen chino',
    readingTypeKun: 'lectura nativa japonesa',
    historicalBadge: 'usado históricamente como ateji',
    swapButton: 'Cambiar este Kanji',
    swapTitle: 'Elige un Kanji alternativo para este sonido',
    swapClose: 'Cerrar',
    strokesLabel: 'trazos',
    meaningLabel: 'Significado',
    chosenBadge: 'Seleccionado',
    selectButton: 'Usar esta combinación',
    surnameHeading: 'Apellido',
    givenNameHeading: 'Nombre de pila',
  },
  band3: {
    index: '03.FORTUNA',
    subtitle: 'Seimei handan (姓名判断): una lectura numerológica basada en el número de trazos de los Kanji elegidos',
    helpAria: '¿Qué es el seimei handan?',
  },
  seimeiHandan: {
    noKanjiHint: 'Elige una combinación de Kanji arriba para ver su puntuación de seimei handan.',
    strokesUnit: 'trazos',
    noSurnameNote: 'No se indicó apellido — Tenkaku y Gaikaku se muestran como 0 y no tienen sentido por sí solos.',
    disclaimer:
      'El seimei handan es numerología tradicional, no un método científico. Este cálculo usa una escuela extendida (Kumazaki-shiki) y una tabla de conteo de trazos de uso común — otras escuelas cuentan los trazos de forma distinta y pueden llegar a un veredicto diferente.',
    tenkakuName: 'Tenkaku (天格) — pilar del Cielo',
    tenkakuDescription: 'Fortuna heredada, vinculada al apellido y al linaje familiar.',
    chikakuName: 'Chikaku (地格) — pilar de la Tierra',
    chikakuDescription: 'Fortuna personal del nombre de pila, más influyente en la juventud.',
    jinkakuName: 'Jinkaku (人格) — pilar Humano',
    jinkakuDescription: 'Tu personalidad esencial y cómo suelen percibirte los demás.',
    soukakuName: 'Sōkaku (総格) — pilar Total',
    soukakuDescription: 'Fortuna general de la vida, especialmente desde la mediana edad.',
    gaikakuName: 'Gaikaku (外格) — pilar Exterior',
    gaikakuDescription: 'Relaciones sociales e influencias externas en tu vida.',
    categoryDaikichi: 'Gran fortuna',
    categoryKichi: 'Buena fortuna',
    categoryHankichi: 'Fortuna mixta',
    categoryKyou: 'Fortuna escasa',
    categoryDaikyou: 'Fortuna muy escasa',
  },
  band4: {
    index: '04.HANKO',
    subtitle: 'Mira tus Kanji (o Katakana) elegidos grabados en un sello Hanko decorativo',
    helpAria: '¿Qué es un Hanko?',
  },
  hankoSeal: {
    download: 'Descargar SVG',
    downloadPreparing: 'Preparando SVG…',
    downloadUnavailable: 'SVG no disponible',
    copy: 'Copiar SVG',
    copied: 'Copiado',
    disclaimer: 'Vista previa decorativa — no es un jitsuin (sello oficial) registrable.',
  },
  nameOrderField: {
    placeholder: 'Tu nombre en letras latinas (para el asistente de pedido)',
  },
  orderHelper: {
    title: 'Pide un hanko real — copia estos campos',
    fieldChars: 'Caracteres para grabar',
    fieldName: 'Nombre en letras latinas',
    fieldOrientation: 'Orientación sugerida',
    fieldOrientationValue: 'Escritura vertical',
    copy: 'Copiar',
    copied: 'Copiado',
    copyAll: 'Copiar todo',
    copiedAll: 'Todo copiado',
    cta: 'Consigue un sello hanko real',
    fieldNameEmpty: '—',
  },
  help: {
    closeButton: 'Cerrar',
    topics: {
      overview: {
        title: 'Cómo funciona Kizunama',
        body: [
          'Introduce tu nombre: convertimos su sonido a Katakana, el alfabeto japonés usado para nombres extranjeros.',
          'Clasificamos Kanji elegidos solo por su sonido (ateji, 当て字) — una forma histórica y lúdica de "escribir" un nombre, no una traducción por significado.',
          'Elige una combinación y mira su puntuación de seimei handan (numerología), basada en el número de trazos de los Kanji.',
          'Descarga un sello Hanko decorativo con los Kanji o el Katakana elegidos.',
        ],
      },
      ateji: {
        title: 'Ateji: Kanji elegidos por su sonido',
        body: [
          'Los ateji (当て字) son Kanji usados solo por su pronunciación, ignorando su significado habitual — la forma histórica en que Japón escribía nombres extranjeros y préstamos lingüísticos antes de que el Katakana se convirtiera en el estándar.',
          'Cada Kanji aquí se eligió porque una sílaba de tu nombre coincide con una de sus lecturas (lectura de nombre propio, lectura de origen chino o lectura nativa) — no porque su significado tenga relación contigo.',
          'Cuando un sonido no tiene una correspondencia Kanji natural, se mantiene en Katakana en lugar de forzarlo sobre un carácter no relacionado.',
          'Es un ejercicio lúdico y decorativo — no es cómo se eligen realmente los nombres japoneses hoy en día.',
        ],
      },
      katakana: {
        title: 'Katakana',
        body: [
          'El Katakana es un alfabeto japonés que normalmente se usa para escribir fonéticamente nombres y palabras extranjeras.',
          'Solo transcribe el sonido de tu nombre — no tiene ningún significado.',
          'Cada paso posterior (correspondencia de Kanji, numerología, el sello) parte de esta lectura en Katakana.',
        ],
      },
      seimeiHandan: {
        title: 'Seimei handan (numerología)',
        body: [
          'El seimei handan (姓名判断) es una práctica numerológica japonesa tradicional basada en el número de trazos de los Kanji de un nombre.',
          'Se calculan cinco valores ("pilares") a partir de los Kanji del apellido y del nombre de pila, cada uno clasificado desde gran fortuna hasta fortuna muy escasa.',
          'Es numerología popular, no un método científico — otras escuelas usan convenciones distintas para contar los trazos y pueden llegar a veredictos diferentes.',
        ],
      },
      hanko: {
        title: 'Sello Hanko',
        body: [
          'El Hanko es un sello personal japonés, tradicionalmente grabado con Kanji y usado en lugar de una firma.',
          'Esta vista previa es solo decorativa — no es un jitsuin (sello oficial) registrable. Para cualquier trámite oficial, consulta una oficina municipal japonesa o una tienda de hanko profesional.',
          'Descarga el sello generado en SVG, o copia los detalles para pedir un hanko real y físico grabado con los caracteres elegidos.',
        ],
      },
    },
  },
  install: {
    text: 'Instala 絆名 KIZUNAMA como app para acceder más rápido.',
    install: 'Instalar',
    dismiss: 'Ahora no',
  },
  footer: {
    seo: 'Kizunama — una herramienta gratuita para convertir el sonido de tu nombre en Kanji ateji, calcular una puntuación numerológica de seimei handan y crear un sello Hanko decorativo descargable. Sin IA, sin cuenta, funciona sin conexión una vez instalada. Datos de Kanji de KANJIDIC2 (licencia EDRDG).',
    credits: 'Creado por',
    sourcesTitle: 'Fuentes y licencias',
    sourcesBody:
      'Lecturas, número de trazos y significados de los Kanji de KANJIDIC2, por cortesía del Electronic Dictionary Research and Development Group (EDRDG), usados bajo la licencia EDRDG. La tabla de fortuna del seimei handan y las listas de bonificación/exclusión de ateji son curación editorial original de Kizunama.',
    sponsorCta: 'Curso de japonés gratis',
  },
  generalDisclaimer:
    'Kizunama es una herramienta cultural lúdica, no asesoramiento legal ni oficial. Nada de lo generado aquí es registrable en el koseki y la vista previa del sello no es un jitsuin. Para cualquier trámite oficial — registro de nombre, residencia o un hanko real — consulta una oficina municipal japonesa o una tienda de hanko autorizada.',
} satisfies Messages;

export default es;
