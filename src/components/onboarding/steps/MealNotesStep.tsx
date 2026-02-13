'use client';

import { Plus, X } from 'lucide-react';

interface MealNotesStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function MealNotesStep({ value, onChange }: MealNotesStepProps) {
  const handleAddNote = () => {
    onChange([...value, '']);
  };

  const handleUpdateNote = (index: number, note: string) => {
    const updated = [...value];
    updated[index] = note;
    onChange(updated);
  };

  const handleBlur = () => {
    const filtered = value.filter(n => n.trim() !== '');
    if (filtered.length !== value.length) {
      onChange(filtered);
    }
  };

  const handleRemoveNote = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-muted">
        Add any specific meal preferences or restrictions that aren't covered above
      </p>
      <p className="text-xs text-center text-muted italic">
        Examples: "No cilantro in my dishes", "Mondays no heavy cream or spicy food", "Prefer simple recipes on weekdays"
      </p>

      <div className="space-y-3">
        {value.map((note, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => handleUpdateNote(index, e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g., No cilantro in my dishes"
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={() => handleRemoveNote(index)}
              className="p-2 text-muted hover:text-foreground transition-colors"
              aria-label="Remove note"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          onClick={handleAddNote}
          className="w-full px-4 py-3 border-2 border-dashed border-border rounded-lg text-sm text-muted hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add preference
        </button>
      </div>

      {value.length === 0 && (
        <p className="text-center text-sm text-muted italic mt-4">
          No additional preferences? You can skip this step or add some later in settings.
        </p>
      )}
    </div>
  );
}
