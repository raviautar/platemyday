'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, CheckCircle } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EVENTS } from '@/lib/analytics/events';

interface FeatureTourProps {
    view: 'feature1' | 'feature2' | 'feature3' | 'auth';
    onNext: (nextView: 'feature2' | 'feature3' | 'auth') => void;
    onComplete: (redirectPath?: string) => void;
}

function AuthStep({ onComplete }: { onComplete: (redirectPath?: string) => void }) {
    const supabase = createBrowserClient();
    const { track } = useAnalytics();
    const [mode, setMode] = useState<'signin' | 'signup'>('signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError('');
        track(EVENTS.ONBOARDING_AUTH_ATTEMPTED, { method: 'google' });
        onComplete(); // Mark onboarding complete before OAuth redirect
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent('/meal-plan')}`,
            },
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        track(EVENTS.ONBOARDING_AUTH_ATTEMPTED, { method: 'email', mode });

        if (mode === 'signin') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }
            onComplete('/meal-plan');
        } else {
            const { error, data } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent('/meal-plan')}`,
                },
            });
            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }
            if (data.session) {
                onComplete('/meal-plan');
                return;
            }
            setEmailSent(true);
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-outfit)] text-foreground mb-2">
                    Check your email
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                    We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click the link to activate your account.
                </p>
                <button
                    onClick={() => onComplete('/meal-plan')}
                    className="text-primary font-medium hover:underline underline-offset-4 text-sm"
                >
                    Continue for now
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-outfit)] text-foreground">Save your progress</h2>
            <p className="text-muted-foreground mb-8 text-base md:text-lg leading-relaxed">
                Sign in to keep your meal plans, recipes, and preferences across devices.
            </p>

            <div className="w-full">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Google OAuth */}
                <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-foreground font-medium px-4 py-3 rounded-xl border border-border shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                {/* Divider */}
                <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-3 text-muted-foreground">or</span>
                    </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-3">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                            required
                            minLength={mode === 'signup' ? 6 : undefined}
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-4 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {mode === 'signin' ? (
                            <>
                                <LogIn className="w-4 h-4" />
                                {loading ? 'Signing in...' : 'Sign In'}
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                {loading ? 'Creating account...' : 'Create Account'}
                            </>
                        )}
                    </button>
                </form>

                {/* Mode toggle */}
                <p className="text-sm text-muted-foreground mt-4">
                    {mode === 'signup' ? (
                        <>
                            Already have an account?{' '}
                            <button onClick={() => { setMode('signin'); setError(''); }} className="text-primary font-medium hover:underline underline-offset-4">
                                Sign in
                            </button>
                        </>
                    ) : (
                        <>
                            Don&apos;t have an account?{' '}
                            <button onClick={() => { setMode('signup'); setError(''); }} className="text-primary font-medium hover:underline underline-offset-4">
                                Sign up
                            </button>
                        </>
                    )}
                </p>
            </div>

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
