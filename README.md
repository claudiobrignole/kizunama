# 絆名 | Kizunama

**Turn the sound of your name into a Japanese Kanji name.**

Free, static, no-AI single-page PWA. Enter your name, get it converted to
Katakana, pick Kanji chosen purely for their *sound* (ateji, 当て字 — not by
meaning), see a seimei handan (姓名判断) numerology reading based on the
stroke count of your chosen Kanji, and generate a downloadable decorative
Hanko seal SVG. No backend, no accounts, no per-request costs — everything
runs in the browser and the app works offline once installed.

The UI is fully translated into English, Italian, French, German, Spanish
and Portuguese (`src/i18n/`), with a first-visit language banner based on
the browser language, a persistent cookie-backed language switcher in the
header and footer, and recallable "How it works" help popups.

Built to match the visual identity of [Luna Nihongo](https://lunanihongo.com),
linked via the "Free Japanese course" button in the footer.

## How it works (4 bands)

1. **音写 · Sound** — enter your given name (and, optionally, a surname).
   Each is converted to Katakana with a per-language phonetic pipeline (see
   [Katakana pipeline](#katakana-pipeline) below), plus a "transliteration
   confidence" badge.
2. **当て字 · Ateji** — a ranking engine (`src/utils/ateji.ts`) proposes
   Kanji combinations chosen purely for how they *sound*, not what they
   mean — the historical way Japan wrote foreign names before Katakana
   became standard. Every mora can be covered by a 1–4 mora nanori/on/kun
   reading; users can swap any individual Kanji for an alternate reading.
3. **姓名判断 · Fortune** — once a Kanji combination is chosen, five
   numerology "pillars" (Tenkaku, Chikaku, Jinkaku, Sōkaku, Gaikaku) are
   computed from the stroke counts, using one popular school's convention
   (see [Seimei handan](#seimei-handan) below).
4. **印鑑 · Hanko** — a decorative Hanko seal SVG is generated from the
   chosen Kanji (vertical columns, up to 6 characters) or, if no Kanji
   match was found, from the raw Katakana (horizontal). Includes an "Order
   Helper" that copies the engraving details and links to a hanko print
   affiliate.

## Stack

- Vite + React 19 + TypeScript (strict)
- No backend / no API calls at runtime — fully static
- `wanakana` (Romaji → Katakana), `any-ascii` (Unicode → ASCII
  normalization), `phonemizer` (eSpeak-NG via WASM, lazy-loaded, English
  IPA only)
- KANJIDIC2 (via `kanjidic2-json`) processed at **build time** into a
  static reading → Kanji reverse index (`src/data/atejiIndex.json`) — no
  dictionary shipped/queried at runtime beyond the pre-computed JSON
- Vitest for unit tests, Oxlint for linting
- Hand-rolled PWA: `manifest.webmanifest` + `sw.js` (cache-first for static
  assets, network-first for HTML), multilingual install prompt

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) + production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Oxlint |
| `npm test` | Vitest (unit tests for the ateji engine, seimei handan, Hanko SVG, Katakana pipeline, mora segmentation) |
| `npm run data:ateji` | Regenerate `src/data/atejiIndex.json` from KANJIDIC2 + `src/data/atejiBoostlist.json` + `src/data/atejiBlocklist.json` |
| `npm run build:icons` | Rasterize `scripts/icon-master.png` into the PWA icon set in `public/icons/` |

Run `npm run data:ateji` again whenever `src/data/atejiBoostlist.json` or
`src/data/atejiBlocklist.json` changes, or after a `kanjidic2-json` version
bump.

## Katakana pipeline

Converting a foreign personal name to Katakana is a different, harder
problem than converting Japanese romaji to kana (what libraries like
`wanakana` are built for) — it needs per-origin-language phoneme mapping.
`src/utils/katakana.ts` tries, in order:

1. **Dictionary** (`src/data/nameKatakanaDict.json`) — a curated list of
   common Western given names with their conventional Katakana spelling.
2. **Phonetic (English only)** — eSpeak-NG (via `phonemizer`, lazy-loaded
   WASM) produces IPA, converted to Katakana by `src/utils/ipaToKatakana.ts`.
3. **Rule-based (it/es/de/pt/fr)** — `src/utils/languagePhonetics.ts` applies
   per-language letter-to-sound rules (Italian `c`/`ch` handling, French
   silent final `e`, German `w`/`v`/diphthongs, etc.), then
   `src/utils/romajiEpenthesis.ts` inserts the epenthetic vowels Japanese
   phonotactics require (default `u`/`o` after consonant clusters, `i`
   after `ch`/`j`, `l`→`r`, `v`→ the extended ヴ series) before handing off
   to `wanakana`.
4. **Fallback** — a direct romaji-style pass that always produces
   *something*, even for unrecognized input.

## Ateji engine

`src/utils/ateji.ts` builds ranked Kanji combinations for a Katakana name
using dynamic programming with a beam search over variable-length mora
spans (1 Kanji can cover 1–4 mora, derived from the built index — e.g.
光 = ひかる, 3 mora). Each span is scored by reading type (nanori > on >
kun'yomi), Jōyō vs Jinmeiyō status, presence on the historical-ateji boost
list (`src/data/atejiBoostlist.json`), and — most heavily — how many mora
a single Kanji covers, since one Kanji explaining more of the sound reads
as more natural ateji than the same sound spelled with several short
matches. Kanji with a clearly inauspicious dominant meaning are excluded
via `src/data/atejiBlocklist.json`. Mora with no clean native reading (most
often extended-katakana-only sounds like ヴ, ティ, フォ) are left as bare
Katakana rather than forced onto an unrelated character.

## Seimei handan

`src/utils/seimeiHandan.ts` computes the five "pillars" (五格, goko) from
the stroke counts (kakusū) of the chosen Kanji: Tenkaku (surname),
Chikaku (given name), Jinkaku (junction), Sōkaku (total), and Gaikaku
(outer), each classified 1–81 into a fortune category via
`src/data/kikkyouTable.json`. This ships **one** opinionated default
(Kumazaki-school gokaku-bōshōhō, shinjitai/modern stroke counts, the
*reisū* "+1 phantom stroke" correction applied symmetrically to Tenkaku
and Chikaku for single-character surnames/given names) and says so
explicitly in the UI — seimei handan is folk numerology, not a scientific
method, and other schools count strokes or classify fortune differently.

## Before committing

```bash
npm run lint && npm test && npm run build
```

## Configuration

No secrets, no `.env` required to run the app. One optional build-time
variable controls the hanko print affiliate CTA:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_HANKO_AFFILIATE_URL` | `https://hankohub.com/` | "Get a real hanko stamp" link in the Order Helper (see `src/config.ts`) |

Set it in a local `.env` (not committed) or as a Hostinger build environment
variable — see below.

## Deploy (Hostinger, static site)

This is a static site: the production output is the `dist/` folder, no
Node runtime needed in production.

1. In hPanel → **Git**, connect this repository and set:
   - Build command: `npm ci && npm run build`
   - Output / publish directory: `dist`
   - Node version: 22+
2. (Optional) Add `VITE_HANKO_AFFILIATE_URL` as a build environment variable
   once you have a real affiliate link.
3. Push to the deploy branch — Hostinger rebuilds and publishes `dist/`
   automatically. See `hostinger.json` for the machine-readable build config.
4. Point the separate domain (e.g. `kizunama.app` / `kizunama.xyz`) at this
   Hostinger site. No Firebase, no Cloud Functions, no PHP API involved.

## Attribution

- Kanji readings, stroke counts and meanings derived from **KANJIDIC2**
  (Electronic Dictionary Research and Development Group, EDRDG), used
  under the EDRDG licence.
- The seimei handan fortune table (`src/data/kikkyouTable.json`) and the
  ateji boost/exclusion lists (`src/data/atejiBoostlist.json`,
  `src/data/atejiBlocklist.json`) are original editorial curation by
  Kizunama, not sourced from KANJIDIC2.
- Katakana conversion combines a hand-curated name dictionary, rule-based
  per-language phonetic approximation, `wanakana`, `any-ascii`, and
  `phonemizer` (eSpeak-NG).
- Full credits are shown in the app footer, translated in all 6 supported
  UI languages (`src/i18n/locales/`).

## Disclaimer

Kizunama is a playful cultural tool, not legal or official guidance.
Nothing generated here is koseki-registrable and the seal preview is not a
jitsuin (official registrable seal). For anything official — name
registration, residency, or a real hanko — consult a Japanese municipal
office or a licensed hanko shop.

## License

Application code: see repository owner. Third-party data/licenses as noted
above and in-app.
