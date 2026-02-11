'use client';

import { useState, useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

interface CompletionStepProps {
  onComplete: () => void;
}

export function CompletionStep({ onComplete }: CompletionStepProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8 relative">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="confetti-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#4CAF50', '#FFD54F', '#F48FB1'][Math.floor(Math.random() * 3)],
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <Image
          src="/assets/logo.png"
          alt="PlateMyDay"
          width={80}
          height={80}
          className="drop-shadow-lg"
        />
        <FaCheckCircle className="absolute -bottom-2 -right-2 w-8 h-8 text-primary bg-white rounded-full" />
      </div>

      <div className="text-center space-y-3 z-10">
        <h2 className="text-3xl font-bold text-foreground">You're All Set!</h2>
        <p className="text-lg text-muted max-w-md">
          Your preferences have been saved. We'll now personalize recipe and meal plan suggestions just for you.
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-4 z-10">
        <Button onClick={onComplete} variant="primary">
          <Sparkles className="w-5 h-5 mr-2" />
          Start Exploring Recipes
        </Button>
      </div>

      <style jsx>{`
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          animation: confetti-fall 3s linear forwards;
        }
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
