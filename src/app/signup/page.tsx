'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AuthForm } from '@/components/ui/AuthForm';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/meal-plan';

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_#f0fdf4_0%,_#ecfdf5_30%,_#ccfbf1_70%,_#f0fdf4_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(16,185,129,0.15),transparent)]" />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/assets/logo.png"
              alt="PlateMyDay Logo"
              width={80}
              height={80}
              className="w-16 h-16 mx-auto mb-3 drop-shadow-lg"
            />
          </Link>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-foreground">
            Create your account
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Save your meal plans and recipes across devices
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-emerald-500/10 border border-white/60 p-6">
          <AuthForm
            defaultTab="signup"
            redirect={redirect}
            onSuccess={(path) => {
              router.push(path);
              router.refresh();
            }}
            emailConfirmationAction={
              <Link
                href="/login"
                className="text-primary font-medium hover:underline underline-offset-4 text-sm"
              >
                Back to sign in
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
