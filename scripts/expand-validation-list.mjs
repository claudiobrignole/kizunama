/**
 * Expand docs/names-to-validate-en-it.tsv to at least 2× EN and IT names.
 * Resolves katakana: curated dict → JMnedict/ENAMDICT → (filled later by phonetic).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const dict = require(path.join(root, 'src/data/nameKatakanaDict.json'));
const jmn = require(path.join(root, 'src/data/jmnedictNames.json'));

/** Common English given names (beyond the curated set). */
const EN_EXTRA = [
  'liam', 'elijah', 'lucas', 'mason', 'logan', 'jackson', 'aiden', 'carter', 'jayden', 'dylan',
  'grayson', 'gabriel', 'isaac', 'jayce', 'caleb', 'connor', 'luke', 'isaiah', 'owen', 'sebastian',
  'julian', 'levi', 'mateo', 'lincoln', 'jaxon', 'landon', 'wyatt', 'hunter', 'cameron',
  'adrian', 'jordan', 'xavier', 'jose', 'ian', 'cooper', 'dominic', 'jaxson', 'colton',
  'brayden', 'parker', 'blake', 'evan', 'miles', 'micah', 'asher', 'theodore', 'ezra',
  'hudson', 'maverick', 'kai', 'roman', 'brooks', 'bennett', 'weston', 'silas', 'jasper',
  'everett', 'finn', 'rowan', 'axel', 'elias', 'theo', 'enzo', 'santiago', 'emmett',
  'harrison', 'sawyer', 'beck', 'ryder', 'kingston', 'declan', 'cole', 'max', 'maxwell',
  'timothy', 'jeremy', 'zachary', 'nathaniel', 'bradley', 'raymond', 'lawrence', 'gerald',
  'dennis', 'jerry', 'jesse', 'bryan', 'billy', 'johnny', 'bobby', 'ralph', 'roy',
  'eugene', 'ava', 'sofia', 'avery', 'scarlett', 'riley', 'aria', 'aurora', 'zoey', 'nora',
  'camila', 'layla', 'penelope', 'lillian', 'addison', 'luna', 'savannah', 'brooklyn', 'leah',
  'zoe', 'stella', 'hazel', 'ellie', 'paisley', 'audrey', 'skylar', 'violet', 'claire', 'bella',
  'lucy', 'everly', 'caroline', 'genesis', 'aaliyah', 'kennedy', 'kinsley', 'allison', 'maya',
  'willow', 'naomi', 'eliana', 'gabriella', 'ariana', 'hailey', 'kaylee', 'autumn', 'nevaeh',
  'serenity', 'pippa', 'freya', 'isla', 'maeve', 'sadie', 'delilah', 'josephine', 'madison',
  'nova', 'emilia', 'ruby', 'iris', 'jade', 'piper', 'lyla', 'alexandra', 'madeline', 'brielle',
  'charlie', 'melanie', 'morgan', 'nicole', 'paige', 'quinn', 'reagan', 'taylor', 'tiffany',
  'vanessa', 'whitney', 'yvonne', 'heather', 'holly', 'jackie', 'kathy', 'lauren', 'marilyn',
  'pamela', 'phyllis', 'rose', 'ruth', 'tracy', 'wanda', 'april', 'cindy', 'dawn', 'diane',
  'doris', 'edith', 'eileen', 'elaine', 'gladys', 'helen', 'ida', 'joyce', 'june', 'katherine',
  'lois', 'louise', 'marjorie', 'mildred', 'norma', 'pearl', 'rita', 'theresa', 'albert',
  'alfred', 'bernard', 'calvin', 'cedric', 'chester', 'clifford', 'clyde', 'dale', 'darrell',
  'daryl', 'dean', 'don', 'donald', 'douglas', 'dustin', 'earl', 'edgar', 'edwin', 'ernest',
  'floyd', 'francis', 'frank', 'fred', 'frederick', 'gene', 'gilbert', 'glen', 'gordon',
  'harold', 'harvey', 'herman', 'howard', 'hugh', 'irving', 'ivan', 'jerome', 'jim', 'jimmy',
  'joe', 'joel', 'jon', 'karl', 'kirk', 'lance', 'larry', 'lee', 'leonard', 'leslie',
  'lester', 'lloyd', 'lonnie', 'luther', 'lyle', 'marcus', 'marion', 'marshall', 'martin',
  'marvin', 'maurice', 'melvin', 'milton', 'mitchell', 'morris', 'murray', 'neil', 'nelson',
  'norman', 'oscar', 'otis', 'perry', 'phillip', 'preston', 'randall', 'randy', 'ray',
  'reginald', 'rex', 'ricky', 'robin', 'rodney', 'roland', 'ron', 'ronald', 'ross', 'ruben',
  'rudolph', 'rufus', 'sam', 'sidney', 'spencer', 'stanley', 'steve', 'stewart', 'stuart',
  'ted', 'terry', 'tim', 'todd', 'tom', 'tommy', 'tony', 'travis', 'troy', 'vernon',
  'victor', 'wallace', 'walter', 'warren', 'wesley', 'willard', 'willie', 'wilson', 'woodrow',
  'beatrice', 'bernice', 'beverly', 'bonnie', 'carolyn', 'catherine', 'constance', 'crystal',
  'darlene', 'debra', 'denise', 'dolores', 'eleanor', 'ellen', 'esther', 'ethel', 'florence',
  'gail', 'georgia', 'geraldine', 'gertrude', 'gail', 'janice', 'jeanette', 'joanne', 'josephine',
  'judy', 'julie', 'kara', 'katie', 'kim', 'kristen', 'kristin', 'krystal', 'lana', 'latoya',
  'leslie', 'lindsay', 'lorraine', 'lynn', 'mabel', 'mae', 'marcia', 'marian', 'marlene',
  'maureen', 'maxine', 'melody', 'mercedes', 'misty', 'molly', 'myrtle', 'natasha', 'nellie',
  'nina', 'olga', 'patty', 'peggy', 'priscilla', 'ramona', 'regina', 'renee', 'rhonda',
  'roberta', 'rosalie', 'rosemary', 'roxanne', 'sally', 'shelley', 'sheila', 'sherri', 'stacey',
  'sue', 'sylvia', 'tamara', 'tammy', 'tanya', 'thelma', 'tina', 'toni', 'tracey', 'velma',
  'vera', 'vicki', 'vickie', 'viola', 'violet', 'vivian', 'whitney', 'wilma', 'yolanda',
];

/** Common Italian given names (beyond the curated set). */
const IT_EXTRA = [
  'alessio', 'alberto', 'alfredo', 'alfonso', 'amedeo', 'antonello', 'antonino', 'armando',
  'arturo', 'attilio', 'augusto', 'aurelio', 'bartolomeo', 'benedetto', 'beniamino', 'bernardo',
  'biagio', 'camillo', 'carmelo', 'carmine', 'cesare', 'clemente', 'cosimo', 'costantino',
  'damiano', 'dante', 'demetrio', 'diego', 'dino', 'domenico', 'donato', 'edoardo', 'egidio',
  'elio', 'emilio', 'enzo', 'ettore', 'eugenio', 'ezio', 'fausto', 'ferdinando', 'ferruccio',
  'filippo', 'flavio', 'fulvio', 'gaetano', 'gaspare', 'gennaro', 'gerardo', 'giacomo',
  'giancarlo', 'gianfranco', 'gianluca', 'gianmarco', 'gianni', 'gilberto', 'giordano', 'giorgio',
  'giuliano', 'giulio', 'gregorio', 'guido', 'gustavo', 'iacopo', 'ignazio', 'ilario', 'ivano',
  'jacopo', 'leandro', 'leone', 'leopoldo', 'livio', 'loris', 'luciano', 'lucio', 'ludovico',
  'luigi', 'marcello', 'mariano', 'marino', 'mario', 'mauro', 'michelangelo', 'mirko', 'nello',
  'nico', 'niccolo', 'nino', 'nunzio', 'orlando', 'osvaldo', 'ottavio', 'pasquale', 'patrizio',
  'pierluigi', 'piero', 'primo', 'raffaele', 'raimondo', 'remo', 'renzo', 'rino', 'rocco',
  'rodolfo', 'romano', 'romeo', 'rosario', 'ruggero', 'sandro', 'saverio', 'silvano', 'silvestro',
  'silvio', 'taddeo', 'teodoro', 'tiberio', 'tito', 'tiziano', 'tullio', 'ugo', 'umberto',
  'valentino', 'valerio', 'vito', 'vittorio',
  'adriana', 'agnese', 'alberta', 'alessia', 'amalia', 'ambra', 'angela', 'angelica',
  'annalisa', 'annamaria', 'antonella', 'antonietta', 'asia', 'assunta', 'aurora', 'barbara',
  'benedetta', 'bianca', 'carla', 'carmela', 'carmen', 'carolina', 'caterina', 'catia',
  'cecilia', 'celeste', 'cinzia', 'clara', 'clarissa', 'claudia', 'clelia', 'concetta',
  'cristiana', 'debora', 'diana', 'domenica', 'donatella', 'dorotea', 'elisa', 'elvira',
  'emanuela', 'emma', 'enrica', 'erica', 'ester', 'eugenia', 'eva', 'fabiana', 'fabiola',
  'fernanda', 'filomena', 'fiorella', 'flavia', 'flora', 'franca', 'gabriella', 'gaia',
  'gemma', 'gina', 'giovanna', 'giuliana', 'gloria', 'grazia', 'ida', 'ileana', 'ines',
  'isabella', 'lara', 'laura', 'lea', 'letizia', 'lidia', 'liliana', 'linda', 'lisa',
  'livia', 'lorena', 'lorenza', 'luana', 'luigia', 'luisa', 'maddalena', 'manuela', 'mara',
  'marcella', 'margherita', 'maria', 'mariangela', 'marina', 'marta', 'matilde', 'melissa',
  'michela', 'milena', 'miriam', 'monica', 'morena', 'nadia', 'natalia', 'nora', 'norma',
  'olga', 'ornella', 'orsola', 'ottavia', 'paola', 'piera', 'raffaella', 'rebecca', 'renata',
  'rita', 'romana', 'romina', 'rosa', 'rosanna', 'rosaria', 'rossana', 'rossella', 'sabina',
  'sabrina', 'samanta', 'sandra', 'sara', 'sonia', 'stefania', 'susanna', 'tania', 'tatiana',
  'tea', 'teresa', 'tiziana', 'vanessa', 'vera', 'viola', 'virginia', 'vittoria', 'zoe',
];

function uniq(arr) {
  return [...new Set(arr.map((s) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')))];
}

function resolve(name) {
  if (dict[name] && typeof dict[name] === 'string') {
    return { katakana: dict[name], source: 'validated' };
  }
  const c = jmn[name];
  if (c?.k) return { katakana: c.k, source: 'conventional' };
  return null;
}

function parseExisting(tsvPath) {
  const en = new Map();
  const it = new Map();
  let lang = null;
  for (const line of fs.readFileSync(tsvPath, 'utf8').split(/\r?\n/)) {
    if (line.startsWith('# === English')) {
      lang = 'en';
      continue;
    }
    if (line.startsWith('# === Italian')) {
      lang = 'it';
      continue;
    }
    if (!line || line.startsWith('#') || line.startsWith('name\t')) continue;
    const [name, katakana, l, source] = line.split('\t');
    if (!name || !katakana || katakana === 'DELETE') continue;
    const bucket = (l || lang) === 'it' ? it : en;
    bucket.set(name, { katakana, source: source || 'validated' });
  }
  return { en, it };
}

function writeTsv(en, it, outPath) {
  const enLines = [...en.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([n, v]) => `${n}\t${v.katakana}\ten\t${v.source}`);
  const itLines = [...it.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([n, v]) => `${n}\t${v.katakana}\tit\t${v.source}`);
  const out = [
    '# Kizunama — nomi EN/IT da validare (tier 1)',
    '# Correggi la colonna katakana, poi rimanda il file o il contenuto.',
    '# Per eliminare: katakana = DELETE | Per aggiungere: nuova riga name<TAB>katakana<TAB>lang',
    '# source: validated = già in nameKatakanaDict | conventional = ENAMDICT | proposed = da confermare',
    `# Totale: ${en.size} EN + ${it.size} IT = ${en.size + it.size}`,
    '#',
    '# === English ===',
    'name\tkatakana\tlang\tsource',
    ...enLines,
    '# === Italian ===',
    ...itLines,
    '',
  ].join('\n');
  fs.writeFileSync(outPath, out);
}

const tsvPath = path.join(root, 'docs/names-to-validate-en-it.tsv');
const { en, it } = parseExisting(tsvPath);

const minEn = Math.max(280, en.size * 2);
const minIt = Math.max(122, it.size * 2);

for (const name of uniq(EN_EXTRA)) {
  if (en.has(name)) continue;
  const r = resolve(name);
  en.set(name, r ?? { katakana: '', source: 'proposed' });
}

for (const name of uniq(IT_EXTRA)) {
  if (it.has(name)) continue;
  const r = resolve(name);
  it.set(name, r ?? { katakana: '', source: 'proposed' });
}

const unresolved = [
  ...[...en.entries()].filter(([, v]) => !v.katakana).map(([n]) => ['en', n]),
  ...[...it.entries()].filter(([, v]) => !v.katakana).map(([n]) => ['it', n]),
];
fs.writeFileSync(path.join(root, 'docs/.names-unresolved.json'), JSON.stringify(unresolved, null, 2));
writeTsv(en, it, tsvPath);

console.log(
  JSON.stringify(
    {
      en: en.size,
      it: it.size,
      enEmpty: unresolved.filter(([l]) => l === 'en').length,
      itEmpty: unresolved.filter(([l]) => l === 'it').length,
      minEn,
      minIt,
      meetsDouble: en.size >= minEn && it.size >= minIt,
    },
    null,
    2,
  ),
);
