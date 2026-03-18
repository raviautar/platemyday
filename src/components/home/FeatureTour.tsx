'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { AuthForm } from '@/components/ui/AuthForm';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';

interface FeatureTourProps {
    view: 'feature1' | 'feature2' | 'feature3' | 'auth';
    onNext: (nextView: 'feature2' | 'feature3' | 'auth') => void;
    onComplete: (redirectPath?: string) => void;
}

function AuthStep({ onComplete }: { onComplete: (redirectPath?: string) => void }) {
    const { track } = useAnalytics();

    const handleSkip = () => {
        track(EVENTS.ONBOARDING_SKIPPED, { skipped_at: 'auth' });
        onComplete('/meal-plan');
    };

    return (
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-outfit)] text-foreground">Save your progress</h2>
            <p className="text-muted-foreground mb-8 text-base md:text-lg leading-relaxed">
                Sign in to keep your meal plans, recipes, and preferences across devices.
            </p>

            <AuthForm
                defaultTab="signup"
                redirect="/meal-plan"
                onSuccess={(path) => onComplete(path)}
                onBeforeOAuth={() => onComplete()}
                onAuthAttempt={(method, mode) => track(EVENTS.ONBOARDING_AUTH_ATTEMPTED, { method, mode })}
                emailConfirmationAction={
                    <button
                        onClick={handleSkip}
                        className="text-primary font-medium hover:underline underline-offset-4 text-sm"
                    >
                        Continue for now
                    </button>
                }
            />

            {/* Continue without account */}
            <button
                onClick={handleSkip}
                className="w-full flex items-center justify-center pb-2 pt-4 text-muted-foreground hover:text-foreground font-medium transition-colors hover:underline underline-offset-4 text-sm"
            >
                Continue without account for now
            </button>
        </div>
    );
}

export function FeatureTour({ view, onNext, onComplete }: FeatureTourProps) {
    if (view === 'feature1') {
        return (
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3 font-[family-name:var(--font-outfit)]">Feature 1 of 3</p>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-outfit)] text-foreground">Start with your pantry</h2>
                <div className="mb-6 bg-white p-2 rounded-2xl shadow-2xl shadow-primary/20 ring-1 ring-black/5 transform hover:-translate-y-1 transition-transform duration-300">
                    <Image
                        src="/assets/tour/meal-plan.png"
                        alt="Start with your pantry"
                        width={600}
                        height={600}
                        className="rounded-xl w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] object-contain"
                        priority
                    />
                </div>
                <p className="text-muted-foreground mb-10 text-base md:text-lg leading-relaxed">
                    Ingredient-based cooking starts with what you have. Add your pantry items and we&apos;ll turn them into a full week of meals — no waste, no guesswork.
                </p>
                <button
                    onClick={() => onNext('feature2')}
                    className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto min-w-[200px]"
                >
                    Next <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        );
    }

    if (view === 'feature2') {
        return (
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3 font-[family-name:var(--font-outfit)]">Feature 2 of 3</p>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-outfit)] text-foreground">Recipes from what you have</h2>
                <div className="mb-6 bg-white p-2 rounded-2xl shadow-2xl shadow-primary/20 ring-1 ring-black/5 transform hover:-translate-y-1 transition-transform duration-300">
                    <Image
                        src="/assets/tour/recipes.png"
                        alt="Recipes from what you have"
                        width={600}
                        height={600}
                        className="rounded-xl w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] object-contain"
                    />
                </div>
                <p className="text-muted-foreground mb-10 text-base md:text-lg leading-relaxed">
                    Get recipes that use your ingredients first. Only buy what you&apos;re truly missing.
                </p>
                <button
                    onClick={() => onNext('feature3')}
                    className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto min-w-[200px]"
                >
                    Next <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        );
    }

    if (view === 'feature3') {
        return (
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3 font-[family-name:var(--font-outfit)]">Feature 3 of 3</p>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-outfit)] text-foreground">Your diet, your way</h2>
                <div className="mb-6 bg-white p-2 rounded-2xl shadow-2xl shadow-primary/20 ring-1 ring-black/5 transform hover:-translate-y-1 transition-transform duration-300">
                    <Image
                        src="/assets/tour/preferences.png"
                        alt="Your diet, your way"
                        width={600}
                        height={600}
                        className="rounded-xl w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] object-contain"
                    />
                </div>
                <p className="text-muted-foreground mb-10 text-base md:text-lg leading-relaxed">
                    Set allergies, dietary needs, and preferences. Every plan respects your choices while minimizing waste.
                </p>
                <button
                    onClick={() => onNext('auth')}
                    className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto min-w-[200px]"
                >
                    Continue <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        );
    }

    if (view === 'auth') {
        return <AuthStep onComplete={onComplete} />;
    }

    return null;
}
