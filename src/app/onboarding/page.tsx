'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/contexts/SettingsContext';
import { FeatureTour } from '@/components/home/FeatureTour';
import { useUserIdentity } from '@/hooks/useUserIdentity';

export default function OnboardingPage() {
    const [view, setView] = useState<'feature1' | 'feature2' | 'feature3' | 'auth'>('feature1');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();
    const { settings, updateSettings, isSettingsLoaded } = useSettings();
    const { isLoaded: isAuthLoaded, isAuthenticated } = useUserIdentity();

    // Redirect if already onboarded
    useEffect(() => {
        if (isSettingsLoaded && isAuthLoaded) {
            if (settings.preferences.onboardingCompleted || isAuthenticated) {
                router.push('/meal-plan');
            }
        }
    }, [isSettingsLoaded, isAuthLoaded, settings.preferences.onboardingCompleted, isAuthenticated, router]);

    const changeView = (nextView: 'feature2' | 'feature3' | 'auth') => {
        setIsTransitioning(true);
        setTimeout(() => {
            setView(nextView);
            setIsTransitioning(false);
        }, 300);
    };

    useEffect(() => {
        let focusValue: string | null = null;
        if (view === 'feature1' || view === 'feature2' || view === 'feature3') {
            focusValue = view;
        }
        window.dispatchEvent(new CustomEvent('onboarding-step', { detail: focusValue }));
        return () => {
            window.dispatchEvent(new CustomEvent('onboarding-step', { detail: null }));
        };
    }, [view]);

    const completeOnboarding = (redirectPath?: string) => {
        if (!settings.preferences.onboardingCompleted) {
            updateSettings({ preferences: { ...settings.preferences, onboardingCompleted: true } });
        }
        router.push(redirectPath || '/meal-plan');
    };

    return (
        <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-white">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,_#f0fdf4_0%,_#ecfdf5_30%,_#ccfbf1_70%,_#f0fdf4_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(16,185,129,0.15),transparent)]" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />

            {/* Content Container */}
            <div
                className={`relative z-10 w-full px-4 transition-all duration-300 transform ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}
            >
                <FeatureTour view={view} onNext={changeView} onComplete={completeOnboarding} />
            </div>
        </div>
    );
}
