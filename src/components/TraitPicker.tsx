import type { Trait } from '../types';

interface TraitPickerProps {
  traits: Trait[];
  selected: string[];
  onToggle: (id: string) => void;
  maxSelected: number;
}

export function TraitPicker({ traits, selected, onToggle, maxSelected }: TraitPickerProps) {
  return (
    <div className="kz-trait-grid">
      {traits.map((trait) => {
        const isSelected = selected.includes(trait.id);
        const disabled = !isSelected && selected.length >= maxSelected;
        return (
          <button
            key={trait.id}
            type="button"
            className="kz-trait"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => onToggle(trait.id)}
            title={trait.label}
          >
            <span className="kz-trait__icon" aria-hidden="true">{trait.icon}</span>
            <span className="kz-trait__label">{trait.label}</span>
          </button>
        );
      })}
    </div>
  );
}
