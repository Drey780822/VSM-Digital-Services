'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight, Sparkles, User, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/client';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBookingRedirect = redirect === '/book';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        await signUp(email.trim().toLowerCase(), password, { fullName: fullName.trim() });
        toast.success('Account created successfully!');
      } else {
        await signIn(email.trim().toLowerCase(), password);
        toast.success('Welcome back!');
      }

      if (redirect) {
        router.replace(redirect);
      } else if (email.toLowerCase().includes('owner') || email.toLowerCase().includes('admin')) {
        router.replace('/admin-dashboard');
      } else {
        router.replace('/portal');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Authentication failed. Please verify your details.'
      );
      toast.error(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-card-hover">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-gold/30 text-primary text-xs font-semibold tracking-widest uppercase mb-3">
            <Sparkles size={13} />
            {isBookingRedirect ? 'Booking Authentication' : 'VSM Secure Access'}
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {mode === 'signin' ? 'Sign in to your account' : 'Create customer account'}
          </h1>
          <p className="mt-2 text-xs text-foreground-muted">
            {isBookingRedirect
              ? 'An authenticated account is required to link your event and track booking progress.'
              : 'Access your private event vault, photography bookings, and smart financing.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="mb-6 flex rounded-xl bg-muted/40 p-1 border border-border">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'signin'
                ? 'bg-card text-foreground shadow-sm border border-gold/40'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-card text-foreground shadow-sm border border-gold/40'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Create Account
          </button>
        </div>

        {!isSupabaseConfigured() && (
          <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
            Supabase URL or anon key missing. Please verify environment variables.
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground" htmlFor="fullName">
                Full name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-luxury w-full pl-10 pr-4 py-2.5 text-sm"
                  placeholder="Sipho Khumalo"
                  required={mode === 'signup'}
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground" htmlFor="email">
              Email address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-luxury w-full pl-10 pr-4 py-2.5 text-sm"
                placeholder="you@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-luxury w-full pl-10 pr-4 py-2.5 text-sm"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full justify-center py-3 text-sm font-semibold rounded-md flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
              </>
            ) : (
              <>
                {mode === 'signin' ? 'Sign In to Account' : 'Create & Link Account'}
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {isBookingRedirect && (
          <div className="mt-5 text-center">
            <Link
              href="/book"
              className="text-xs text-foreground-muted hover:text-foreground transition-colors"
            >
              ← Return to booking form
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
