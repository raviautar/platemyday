'use client';

import { useEffect } from 'react';

export default function RecipesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Recipes error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
      <p className="text-muted mb-6 max-w-md">
        We had trouble loading your recipes. This is usually temporary — try refreshing.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
