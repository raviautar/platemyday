'use client';

import { useState, useEffect } from 'react';

const ACTION_IMAGES = [
  '/assets/actions/cooking.png',
  '/assets/actions/cutting.png',
  '/assets/actions/baking.png',
  '/assets/actions/ladle.png',
  '/assets/actions/pancake.png',
  '/assets/actions/rolling.png',
  '/assets/actions/salad.png',
];

const LOADING_MESSAGES = [
  'Teaching a tomato to tango...',
  'Convincing broccoli it\'s delicious...',
  'Asking the avocado if it\'s ripe yet...',
  'Negotiating with picky eaters...',
  'Giving the pasta a pep talk...',
  'Interviewing potatoes for the role...',
  'Hiding vegetables in plain sight...',
  'Bribing the oven to preheat faster...',
  'Whispering sweet nothings to the soufflé...',
  'Training chopsticks for beginners...',
  'Conducting a symphony of flavors...',
  'Sending the garlic on a spa day...',
  'Letting the dough rise to the occasion...',
  'Putting the "fun" in "fundamental nutrients"...',
  'Politely declining the kale smoothie...',
  'Auditing the spice cabinet...',
  'Performing taste tests (someone\'s gotta do it)...',
  'Folding in existential dread... I mean cream...',
  'Asking the chef\'s hat for wisdom...',
  'Marinating in good vibes...',
  'Waking up the slow cooker...',
  'Convincing leftovers they\'re a feature...',
  'Calculating the perfect cheese-to-everything ratio...',
  'Flipping pancakes with style...',
  'Consulting grandma\'s secret recipes...',
  'Debating: cilantro, love it or hate it?...',
  'Wrestling with the cling wrap...',
  'Making sure the eggs are happy (free-range, obviously)...',
  'Sneaking extra chocolate chips into the plan...',
  'Plating your week like a Michelin chef...',
];

interface GeneratingAnimationProps {
  message?: string;
  compact?: boolean;
}

export function GeneratingAnimation({ message, compact = false }: GeneratingAnimationProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
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

  useEffect(() => {
    const timer = setInterval(() => {
      setImageIndex(prev => (prev + 1) % ACTION_IMAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const displayMessage = message || LOADING_MESSAGES[messageIndex];
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeDisplay = minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : `${seconds}s`;

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-3 py-4 px-4">
        <div className="relative w-12 h-12 shrink-0">
          {ACTION_IMAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className="absolute inset-0 w-12 h-12 object-contain transition-opacity duration-700"
              style={{ opacity: i === imageIndex ? 1 : 0 }}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-foreground">{displayMessage}</p>
        <p className="text-xs text-muted tabular-nums">{timeDisplay}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-6">
        {ACTION_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-700"
            style={{ opacity: i === imageIndex ? 1 : 0 }}
          />
        ))}
      </div>
      <p className="text-lg font-medium text-foreground mb-1 text-center transition-opacity duration-300">
        {displayMessage}
      </p>
      <p className="text-sm text-muted tabular-nums">{timeDisplay}</p>
    </div>
  );
}
