'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, CheckCircle } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

interface AuthFormProps {
    /** Which tab to show initially */
    defaultTab?: 'signin' | 'signup';
    /** Where to redirect after auth (used in OAuth callback URL) */
    redirect: string;
    /** Called after successful email sign-in or sign-up (with session) */
    onSuccess: (redirectPath: string) => void;
    /** Called before Google OAuth redirect (e.g., to persist onboarding state) */
    onBeforeOAuth?: () => void;
    /** Called when the user attempts auth — for analytics */
    onAuthAttempt?: (method: 'google' | 'email', mode: 'signin' | 'signup') => void;
    /** Shown as an error on mount (e.g., from URL params) */
    initialError?: string;
    /** Custom action rendered below the email confirmation message */
    emailConfirmationAction?: React.ReactNode;
}

export function AuthForm({
    defaultTab = 'signup',
    redirect,
    onSuccess,
    onBeforeOAuth,
    onAuthAttempt,
    initialError = '',
    emailConfirmationAction,
}: AuthFormProps) {
    const supabase = createBrowserClient();
    const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(initialError);
    const [emailSent, setEmailSent] = useState(false);

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError('');
        onAuthAttempt?.('google', tab);
        onBeforeOAuth?.();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
            },
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        onAuthAttempt?.('email', tab);

        if (tab === 'signin') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }
            onSuccess(redirect);
        } else {
            const { error, data } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
                },
            });
            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }
            if (data.session) {
                onSuccess(redirect);
                return;
            }
            setEmailSent(true);
            setLoading(false);
        }
    };

    const switchTab = (newTab: 'signin' | 'signup') => {
        setTab(newTab);
        setError('');
    };

    if (emailSent) {
        return (
            <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-outfit)] text-foreground mb-2">
                    Check your email
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                    We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click the link to activate your account.
                </p>
                {emailConfirmationAction}
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Tabs */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
                <button
                    type="button"
                    onClick={() => switchTab('signin')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${tab === 'signin'
                        ? 'bg-white text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Sign In
                </button>
                <button
                    type="button"
                    onClick={() => switchTab('signup')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${tab === 'signup'
                        ? 'bg-white text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Sign Up
                </button>
            </div>

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
            <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                    <label htmlFor="auth-email" className="block text-sm font-medium text-foreground mb-1.5">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            id="auth-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="auth-password" className="block text-sm font-medium text-foreground mb-1.5">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            id="auth-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={tab === 'signup' ? 'At least 6 characters' : 'Your password'}
                            required
                            minLength={tab === 'signup' ? 6 : undefined}
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
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-4 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {tab === 'signin' ? (
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
        </div>
    );
}
