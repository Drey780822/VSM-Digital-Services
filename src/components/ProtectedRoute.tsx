'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, supabaseAvailable } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card-hover">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <h1 className="text-lg font-semibold text-foreground">Checking owner access</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Securely validating your session before opening the command centre.
          </p>
        </div>
      </div>
    );
  }

  if (!supabaseAvailable) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-lg rounded-2xl border border-warning/30 bg-warning/10 p-8 text-center shadow-card-hover">
          <h1 className="text-lg font-semibold text-foreground">Supabase configuration required</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            The owner dashboard is wired for live Supabase authentication. Add your project URL and
            anon key to the environment file to enable sign-in.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
