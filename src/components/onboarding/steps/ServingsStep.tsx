'use client';

import { FaUsers } from 'react-icons/fa';

interface ServingsStepProps {
  value: number;
  onChange: (value: number) => void;
}

export function ServingsStep({ value, onChange }: ServingsStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-center text-muted">
        How many people do you typically cook for?
      </p>

      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 text-primary">
          <FaUsers className="w-12 h-12" />
          <span className="text-6xl font-bold">{value}</span>
        </div>

        <div className="w-full max-w-md">
          <input
            type="range"
            min="1"
            max="10"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-3 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
            style={{
              background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((value - 1) / 9) * 100}%, var(--color-border) ${((value - 1) / 9) * 100}%, var(--color-border) 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-muted mt-2">
            <span>1</span>
            <span>10+</span>
          </div>
        </div>

        <p className="text-sm text-muted text-center">
          {value === 1 && "Just for me"}
          {value === 2 && "For two people"}
          {value >= 3 && value <= 4 && "Small family"}
          {value >= 5 && value <= 6 && "Large family"}
          {value >= 7 && "Big gatherings"}
        </p>
      </div>
    </div>
  );
}
