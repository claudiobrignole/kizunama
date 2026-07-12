import type { Messages } from '../messages';

const pt = {
  header: {
    tagline: 'Transforma o teu nome num japonês\nescrito em katakana e kanji',
    helpButton: 'Como funciona',
  },
  languageBanner: {
    question: 'Quer usar o Kizunama em português?',
    accept: 'Sim, mudar',
    stay: 'Continuar em inglês',
  },
  languageSwitcher: {
    label: 'Idioma',
  },
  band1: {
    index: '01.SOM',
    subtitle: 'Introduza o seu nome: convertemos o seu som em Katakana, o alfabeto japonês para nomes estrangeiros',
    helpAria: 'O que é o Katakana?',
  },
  nameKatakana: {
    placeholder: 'O seu nome',
    convert: 'Converter',
    converting: '…',
    loading: 'A carregar o motor fonético…',
    copy: 'Copiar',
    copied: 'Copiado',
  },
  surnameField: {
    label: 'Sobrenome (opcional)',
    placeholder: 'O seu sobrenome — só é necessário para a pontuação de seimei handan',
    hint: 'Sem sobrenome, só é possível calcular os pilares do nome próprio.',
  },
  credibility: {
    label: 'Confiança da transliteração',
    high: 'Alta — cada som tem um equivalente natural em japonês',
    medium: 'Média — alguns sons são apenas uma aproximação do original',
    low: 'Baixa — este nome tem vários sons sem equivalente japonês real',
  },
  band2: {
    index: '02.ATEJI',
    subtitle: 'Escolha Kanji selecionados pelo seu som (ateji, 当て字) — uma forma histórica e lúdica de "escrever" um nome estrangeiro',
    helpAria: 'O que são os ateji?',
  },
  atejiCandidates: {
    emptyHint: 'Converta o seu nome acima para ver opções de Kanji correspondentes por som.',
    comboLabel: 'Opção',
    unmatchedBadge: 'sem Kanji adequado',
    unmatchedNote: 'Este som não tem uma leitura Kanji natural — mantém-se em Katakana.',
    readingTypeNanori: 'leitura de nome próprio',
    readingTypeOn: 'leitura de origem chinesa',
    readingTypeKun: 'leitura nativa japonesa',
    historicalBadge: 'historicamente usado como ateji',
    swapButton: 'Trocar este Kanji',
    swapTitle: 'Escolha um Kanji alternativo para este som',
    swapClose: 'Fechar',
    strokesLabel: 'traços',
    meaningLabel: 'Significado',
    chosenBadge: 'Selecionado',
    selectButton: 'Usar esta combinação',
    surnameHeading: 'Sobrenome',
    givenNameHeading: 'Nome próprio',
  },
  band3: {
    index: '03.FORTUNA',
    subtitle: 'Seimei handan (姓名判断): uma leitura numerológica baseada no número de traços dos Kanji escolhidos',
    helpAria: 'O que é o seimei handan?',
  },
  seimeiHandan: {
    noKanjiHint: 'Escolha uma combinação de Kanji acima para ver a sua pontuação de seimei handan.',
    strokesUnit: 'traços',
    noSurnameNote: 'Nenhum sobrenome indicado — Tenkaku e Gaikaku são mostrados como 0 e não têm significado por si só.',
    disclaimer:
      'O seimei handan é numerologia tradicional, não um método científico. Este cálculo usa uma escola difundida (Kumazaki-shiki) e uma tabela de contagem de traços de uso comum — outras escolas contam os traços de forma diferente e podem chegar a um veredito diferente.',
    tenkakuName: 'Tenkaku (天格) — pilar do Céu',
    tenkakuDescription: 'Fortuna herdada, ligada ao sobrenome e à linhagem familiar.',
    chikakuName: 'Chikaku (地格) — pilar da Terra',
    chikakuDescription: 'Fortuna pessoal do nome próprio, mais influente na juventude.',
    jinkakuName: 'Jinkaku (人格) — pilar Humano',
    jinkakuDescription: 'A sua personalidade essencial e como os outros tendem a percebê-lo.',
    soukakuName: 'Sōkaku (総格) — pilar Total',
    soukakuDescription: 'Fortuna geral da vida, especialmente a partir da meia-idade.',
    gaikakuName: 'Gaikaku (外格) — pilar Exterior',
    gaikakuDescription: 'Relações sociais e influências externas na sua vida.',
    categoryDaikichi: 'Grande fortuna',
    categoryKichi: 'Boa fortuna',
    categoryHankichi: 'Fortuna mista',
    categoryKyou: 'Fortuna escassa',
    categoryDaikyou: 'Fortuna muito escassa',
  },
  band4: {
    index: '04.HANKO',
    subtitle: 'Veja os seus Kanji (ou Katakana) escolhidos gravados num selo Hanko decorativo',
    helpAria: 'O que é um Hanko?',
  },
  hankoSeal: {
    download: 'Descarregar SVG',
    downloadPreparing: 'A preparar SVG…',
    downloadUnavailable: 'SVG indisponível',
    copy: 'Copiar SVG',
    copied: 'Copiado',
    disclaimer: 'Pré-visualização decorativa — não é um jitsuin (selo oficial) registável.',
  },
  nameOrderField: {
    placeholder: 'O seu nome em letras latinas (para o assistente de encomenda)',
  },
  orderHelper: {
    title: 'Encomende um hanko real — copie estes campos',
    fieldChars: 'Caracteres a gravar',
    fieldName: 'Nome em letras latinas',
    fieldOrientation: 'Orientação sugerida',
    fieldOrientationValue: 'Escrita vertical',
    copy: 'Copiar',
    copied: 'Copiado',
    copyAll: 'Copiar tudo',
    copiedAll: 'Tudo copiado',
    cta: 'Obter um selo hanko real',
    fieldNameEmpty: '—',
  },
  help: {
    closeButton: 'Fechar',
    topics: {
      overview: {
        title: 'Como funciona o Kizunama',
        body: [
          'Introduza o seu nome: convertemos o seu som em Katakana, o alfabeto japonês usado para nomes estrangeiros.',
          'Classificamos Kanji escolhidos apenas pelo seu som (ateji, 当て字) — uma forma histórica e lúdica de "escrever" um nome, não uma tradução por significado.',
          'Escolha uma combinação e veja a sua pontuação de seimei handan (numerologia), baseada no número de traços dos Kanji.',
          'Descarregue um selo Hanko decorativo com os Kanji ou o Katakana escolhidos.',
        ],
      },
      ateji: {
        title: 'Ateji: Kanji escolhidos pelo seu som',
        body: [
          'Os ateji (当て字) são Kanji usados apenas pela sua pronúncia, ignorando o seu significado habitual — a forma histórica como o Japão escrevia nomes estrangeiros e empréstimos linguísticos antes de o Katakana se tornar o padrão.',
          'Cada Kanji aqui foi escolhido porque uma sílaba do seu nome corresponde a uma das suas leituras (leitura de nome próprio, leitura de origem chinesa ou leitura nativa) — não porque o seu significado tem relação consigo.',
          'Quando um som não tem uma correspondência Kanji natural, mantém-se em Katakana em vez de ser forçado num carácter sem relação.',
          'É um exercício lúdico e decorativo — não é assim que os nomes japoneses modernos são realmente escolhidos.',
        ],
      },
      katakana: {
        title: 'Katakana',
        body: [
          'O Katakana é um alfabeto japonês normalmente usado para escrever foneticamente nomes e palavras estrangeiras.',
          'Transcreve apenas o som do seu nome — não tem qualquer significado.',
          'Cada passo seguinte (correspondência de Kanji, numerologia, o selo) parte desta leitura em Katakana.',
        ],
      },
      seimeiHandan: {
        title: 'Seimei handan (numerologia)',
        body: [
          'O seimei handan (姓名判断) é uma prática numerológica japonesa tradicional baseada no número de traços dos Kanji de um nome.',
          'Calculam-se cinco valores ("pilares") a partir dos Kanji do sobrenome e do nome próprio, cada um classificado desde grande fortuna até fortuna muito escassa.',
          'É numerologia popular, não um método científico — outras escolas usam convenções diferentes para contar os traços e podem chegar a veredictos diferentes.',
        ],
      },
      hanko: {
        title: 'Selo Hanko',
        body: [
          'O Hanko é um selo pessoal japonês, tradicionalmente gravado com Kanji e usado em vez de uma assinatura.',
          'Esta pré-visualização é apenas decorativa — não é um jitsuin (selo oficial) registável. Para qualquer assunto oficial, consulte um município japonês ou uma loja de hanko profissional.',
          'Descarregue o selo gerado em SVG, ou copie os detalhes para encomendar um hanko real e físico gravado com os caracteres escolhidos.',
        ],
      },
    },
  },
  install: {
    text: 'Instale 絆名 KIZUNAMA como app para acesso rápido.',
    install: 'Instalar',
    dismiss: 'Agora não',
  },
  footer: {
    seo: 'Kizunama — uma ferramenta gratuita para transformar o som do seu nome em Kanji ateji, calcular uma pontuação numerológica de seimei handan e criar um selo Hanko decorativo descarregável. Sem IA, sem conta, funciona offline depois de instalada. Dados de Kanji da KANJIDIC2 (licença EDRDG).',
    credits: 'Feito por',
    sourcesTitle: 'Fontes e licenças',
    sourcesBody:
      'Leituras, número de traços e significados dos Kanji da KANJIDIC2, por cortesia do Electronic Dictionary Research and Development Group (EDRDG), usados sob a licença EDRDG. A tabela de fortuna do seimei handan e as listas de bónus/exclusão de ateji são curadoria editorial original do Kizunama.',
    sponsorCta: 'Curso de japonês gratuito',
  },
  generalDisclaimer:
    'O Kizunama é uma ferramenta cultural lúdica, não aconselhamento legal ou oficial. Nada do que é gerado aqui é registável no koseki e a pré-visualização do selo não é um jitsuin. Para qualquer assunto oficial — registo de nome, residência ou um hanko real — consulte um município japonês ou uma loja de hanko licenciada.',
} satisfies Messages;

export default pt;
