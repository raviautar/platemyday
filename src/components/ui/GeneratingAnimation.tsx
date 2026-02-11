'use client';

import { UtensilsCrossed } from 'lucide-react';

interface GeneratingAnimationProps {
  message?: string;
}

export function GeneratingAnimation({ message = 'Creating your meal plan...' }: GeneratingAnimationProps) {
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
      <p className="text-lg font-medium text-foreground mb-1">{message}</p>
      <p className="text-sm text-muted">This usually takes 15-30 seconds</p>
    </div>
  );
}
