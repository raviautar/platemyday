'use client';

import { useState, useEffect } from 'react';
import { UtensilsCrossed } from 'lucide-react';

const LOADING_MESSAGES = [
  'Warming up the kitchen...',
  'Browsing the farmer\'s market...',
  'Flipping through cookbooks...',
  'Picking the freshest ingredients...',
  'Sharpening the knives...',
  'Preheating the oven...',
  'Seasoning to perfection...',
  'Tasting the soup...',
  'Rolling out the dough...',
  'Simmering something wonderful...',
  'Chopping veggies like a pro...',
  'Balancing flavors and nutrition...',
  'Planning your breakfasts...',
  'Crafting the perfect lunch...',
  'Designing dreamy dinners...',
  'Sneaking in some healthy snacks...',
  'Mixing sweet and savory...',
  'Finding the perfect pairings...',
  'Taste-testing everything (tough job)...',
  'Consulting the spice rack...',
  'Whisking up something special...',
  'Folding in a pinch of creativity...',
  'Plating your week beautifully...',
  'Adding a dash of variety...',
  'Letting the flavors meld...',
  'Stirring the pot of inspiration...',
  'Checking the pantry one more time...',
  'Garnishing with fresh herbs...',
  'Almost ready to serve...',
  'Putting the finishing touches on...',
];

interface GeneratingAnimationProps {
  message?: string;
  compact?: boolean;
}

export function GeneratingAnimation({ message, compact = false }: GeneratingAnimationProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (message) return;
    setMessageIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));
    const timer = setInterval(() => {
      setMessageIndex(prev => {
        let next;
        do {
          next = Math.floor(Math.random() * LOADING_MESSAGES.length);
        } while (next === prev);
        return next;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, [message]);

  const displayMessage = message || LOADING_MESSAGES[messageIndex];
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeDisplay = minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : `${seconds}s`;

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-3 py-4 px-4">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <UtensilsCrossed
              className="w-4 h-4 text-primary animate-spin"
              style={{ animationDuration: '3s' }}
              strokeWidth={1.5}
            />
          </div>
          <div
            className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin"
            style={{ animationDuration: '1.5s' }}
          />
        </div>
        <p className="text-sm font-medium text-foreground">{displayMessage}</p>
        <p className="text-xs text-muted tabular-nums">{timeDisplay}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-pulse">
          <UtensilsCrossed
            className="w-10 h-10 text-primary animate-spin"
            style={{ animationDuration: '3s' }}
            strokeWidth={1.5}
          />
        </div>
        <div
          className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin"
          style={{ animationDuration: '1.5s' }}
        />
      </div>
      <p className="text-lg font-medium text-foreground mb-1 text-center transition-opacity duration-300">
        {displayMessage}
      </p>
      <p className="text-sm text-muted tabular-nums">{timeDisplay}</p>
    </div>
  );
}
