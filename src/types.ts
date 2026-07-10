export interface Trait {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
}

export interface KanjiEntry {
  char: string;
  meaning: string;
  on: string[];
  kun: string[];
  jlpt: number | null;
  freq: number | null;
}

export interface TraitKanjiGroup {
  id: string;
  label: string;
  icon: string;
  kanji: KanjiEntry[];
}

export interface KanjiConceptIndex {
  generatedAt: string;
  source: string;
  kanjiConsidered: number;
  traits: TraitKanjiGroup[];
}

export interface KanjiCombo {
  chars: KanjiEntry[];
}

export interface KanjiOptions {
  singles: KanjiEntry[];
  combos: KanjiCombo[];
}
