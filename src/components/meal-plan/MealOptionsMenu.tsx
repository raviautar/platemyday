'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, ArrowRight, Trash2, RefreshCw } from 'lucide-react';
import { DayPlan } from '@/types';

interface MealOptionsMenuProps {
  weekDays: DayPlan[];
  currentDayIndex: number;
  onMoveTo: (targetDayIndex: number) => void;
  onRemove: () => void;
  onLockedFeatureClick?: () => void;
}

export function MealOptionsMenu({ weekDays, currentDayIndex, onMoveTo, onRemove, onLockedFeatureClick }: MealOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoveToSubmenu, setShowMoveToSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowMoveToSubmenu(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    setShowMoveToSubmenu(false);
  };

  const handleMoveToClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoveToSubmenu(!showMoveToSubmenu);
  };

  const handleDaySelect = (targetDayIndex: number) => {
    onMoveTo(targetDayIndex);
    setIsOpen(false);
    setShowMoveToSubmenu(false);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggleMenu}
        className="text-muted hover:text-foreground p-1 rounded hover:bg-surface transition-colors"
        aria-label="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-border z-50 min-w-[160px]">
          <div className="py-1">
            <button
              onClick={handleMoveToClick}
              className="w-full px-4 py-2 text-left text-sm hover:bg-surface transition-colors flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Move to
              </span>
              <span className="text-muted text-xs">›</span>
            </button>

            {showMoveToSubmenu && (
              <div className="pl-4 border-t border-border mt-1 pt-1">
                {weekDays.map((day, index) => (
                  <button
                    key={day.dayOfWeek}
                    onClick={() => handleDaySelect(index)}
                    disabled={index === currentDayIndex}
                    className={`w-full px-4 py-1.5 text-left text-sm transition-colors ${
                      index === currentDayIndex
                        ? 'text-muted cursor-not-allowed'
                        : 'hover:bg-surface text-foreground'
                    }`}
                  >
                    {day.dayOfWeek}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLockedFeatureClick?.();
                setIsOpen(false);
              }}
              title="Refine recipe"
              aria-label="Refine recipe"
              className="w-full px-4 py-2 text-left text-sm text-muted opacity-75 cursor-not-allowed flex items-center gap-2 border-t border-border hover:bg-transparent hover:text-muted"
            >
              <RefreshCw className="w-4 h-4" />
              Refine recipe
            </button>

            <button
              onClick={handleRemoveClick}
              className="w-full px-4 py-2 text-left text-sm hover:bg-surface transition-colors flex items-center gap-2 text-danger border-t border-border"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
