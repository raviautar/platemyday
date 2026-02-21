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
                        onClick={() => onComplete('/meal-plan')}
                        className="text-primary font-medium hover:underline underline-offset-4 text-sm"
                    >
                        Continue for now
                    </button>
                }
            />

            {/* Continue without account */}
            <button
                onClick={() => onComplete('/meal-plan')}
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
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-outfit)] text-foreground">Weekly Meal Plans</h2>
                <div className="mb-6 bg-white p-2 rounded-2xl shadow-2xl shadow-teal-500/20 ring-1 ring-black/5 transform hover:-translate-y-1 transition-transform duration-300">
                    <Image
                        src="/assets/tour/meal-plan.png"
                        alt="Weekly Meal Plans"
                        width={600}
                        height={600}
                        className="rounded-xl w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] object-contain"
                        priority
                    />
                </div>
                <p className="text-muted-foreground mb-10 text-base md:text-lg leading-relaxed">
                    Personalized menus ready in seconds. Eat healthier without the hassle.
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
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-outfit)] text-foreground">Tailored Recipes</h2>
                <div className="mb-6 bg-white p-2 rounded-2xl shadow-2xl shadow-primary/20 ring-1 ring-black/5 transform hover:-translate-y-1 transition-transform duration-300">
                    <Image
                        src="/assets/tour/recipes.png"
                        alt="Tailored Recipes"
                        width={600}
                        height={600}
                        className="rounded-xl w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] object-contain"
                    />
                </div>
                <p className="text-muted-foreground mb-10 text-base md:text-lg leading-relaxed">
                    Recipes curated for your diet and preferences.
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
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-outfit)] text-foreground">Dietary Preferences</h2>
                <div className="mb-6 bg-white p-2 rounded-2xl shadow-2xl shadow-teal-500/20 ring-1 ring-black/5 transform hover:-translate-y-1 transition-transform duration-300">
                    <Image
                        src="/assets/tour/preferences.png"
                        alt="Dietary Preferences"
                        width={600}
                        height={600}
                        className="rounded-xl w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] object-contain"
                    />
                </div>
                <p className="text-muted-foreground mb-10 text-base md:text-lg leading-relaxed">
                    Set your dietary needs and allergens. Every plan respects your choices.
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
