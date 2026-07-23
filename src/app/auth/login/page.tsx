'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function OwnerLoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      router.replace('/admin-dashboard');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign in. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-card-hover">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            VSM owner access
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">Secure command centre</h1>
          <p className="mt-3 text-sm text-foreground-muted">
            Access your private operations hub with Supabase-backed authentication.
          </p>
        </div>

        {!isSupabaseConfigured() && (
          <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
            Add your Supabase URL and anon key to the environment file to enable live owner sign-in.
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input-luxury w-full px-4 py-3"
              placeholder="owner@vsm.co.za"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-luxury w-full px-4 py-3"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full justify-center py-3 text-sm font-semibold"
          >
            {loading ? 'Signing in…' : 'Enter command centre'}
          </button>
        </form>
      </div>
    </main>
  );
}
