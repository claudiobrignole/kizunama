import type { KanjiEntry, KanjiOptions } from '../types';

interface KanjiResultsProps {
  options: KanjiOptions;
  selectedChars: string[] | null;
  onSelect: (chars: string[]) => void;
}

function sameChars(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((c, i) => c === b[i]);
}

function KanjiCard({
  chars,
  label,
  selected,
  onClick,
}: {
  chars: string[];
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="kz-kanji-card" aria-pressed={selected} onClick={onClick}>
      <span className="kz-kanji-card__char">{chars.join('')}</span>
      <span className="kz-kanji-card__meaning">{label}</span>
    </button>
  );
}

function comboLabel(chars: KanjiEntry[]): string {
  return chars.map((c) => c.meaning.split(',')[0]).join(' · ');
}

export function KanjiResults({ options, selectedChars, onSelect }: KanjiResultsProps) {
  if (options.singles.length === 0) {
    return <p className="kz-empty-hint">Pick 1-3 traits above to see Kanji suggestions.</p>;
  }

  return (
    <div>
      <p className="kz-section-title kz-section-title--sub">Single Kanji</p>
      <div className="kz-kanji-grid">
        {options.singles.map((k) => (
          <KanjiCard
            key={k.char}
            chars={[k.char]}
            label={k.meaning.split(',')[0]}
            selected={!!selectedChars && sameChars(selectedChars, [k.char])}
            onClick={() => onSelect([k.char])}
          />
        ))}
      </div>

      {options.combos.length > 0 && (
        <>
          <p className="kz-section-title kz-section-title--sub" style={{ marginTop: '1.1rem' }}>
            Two-Kanji Combinations
          </p>
          <div className="kz-kanji-grid">
            {options.combos.map((combo) => {
              const chars = combo.chars.map((c) => c.char);
              return (
                <KanjiCard
                  key={chars.join('')}
                  chars={chars}
                  label={comboLabel(combo.chars)}
                  selected={!!selectedChars && sameChars(selectedChars, chars)}
                  onClick={() => onSelect(chars)}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
