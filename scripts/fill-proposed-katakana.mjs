import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nameToKatakana } from '../src/utils/katakana.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tsvPath = path.join(root, 'docs/names-to-validate-en-it.tsv');
const unresolvedPath = path.join(root, 'docs/.names-unresolved.json');
const unresolved = JSON.parse(fs.readFileSync(unresolvedPath, 'utf8'));

/** @type {Map<string, string>} */
const filled = new Map();

for (const [lang, name] of unresolved) {
  const phoneticLang = lang === 'it' ? 'it' : 'en';
  const result = await nameToKatakana(name, phoneticLang);
  const k = result.katakana?.replace(/\s+/g, '') || '';
  if (k) filled.set(`${lang}:${name}`, k);
}

const lines = fs.readFileSync(tsvPath, 'utf8').split(/\r?\n/);
const out = lines.map((line) => {
  if (!line || line.startsWith('#') || line.startsWith('name\t')) return line;
  const parts = line.split('\t');
  if (parts.length < 3) return line;
  const [name, katakana, lang, source] = parts;
  if (katakana) return line;
  const k = filled.get(`${lang}:${name}`);
  if (!k) return line;
  return `${name}\t${k}\t${lang}\tproposed`;
});

// Drop rows that still have empty katakana
const cleaned = out.filter((line) => {
  if (!line || line.startsWith('#') || line.startsWith('name\t')) return true;
  const [, katakana] = line.split('\t');
  return Boolean(katakana);
});

const enCount = cleaned.filter((l) => l.endsWith('\ten\tvalidated') || l.includes('\ten\t')).filter((l) => !l.startsWith('#') && !l.startsWith('name')).length;
// recount properly
let en = 0;
let it = 0;
for (const line of cleaned) {
  if (!line || line.startsWith('#') || line.startsWith('name\t')) continue;
  const [, , lang] = line.split('\t');
  if (lang === 'it') it++;
  else if (lang === 'en') en++;
}
const headerIdx = cleaned.findIndex((l) => l.startsWith('# Totale:'));
if (headerIdx >= 0) cleaned[headerIdx] = `# Totale: ${en} EN + ${it} IT = ${en + it}`;

fs.writeFileSync(tsvPath, cleaned.join('\n').replace(/\n*$/, '\n'));
fs.unlinkSync(unresolvedPath);
console.log({ en, it, filled: filled.size, total: en + it });
