import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { ArrowLeft, Shield } from 'lucide-react';

export default function BookingFlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background-secondary">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <ArrowLeft
              size={16}
              className="text-foreground-muted group-hover:text-primary transition-colors"
            />
            <AppLogo size={28} />
            <span className="font-display text-base font-semibold text-gradient-gold">VSM</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/track"
              className="text-xs text-foreground-muted hover:text-primary transition-colors hidden sm:block"
            >
              Track Booking
            </Link>
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <Shield size={13} className="text-success" />
              <span className="hidden sm:inline">Secure booking · POPIA compliant</span>
            </div>
          </div>
        </div>
      </header>

      <div className="blob-gold fixed top-1/4 right-0 w-96 h-96 opacity-10 pointer-events-none" />
      <div className="blob-silver fixed bottom-1/4 left-0 w-80 h-80 opacity-10 pointer-events-none" />

      <main className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-2xl">{children}</div>
      </main>

      <footer className="border-t border-border py-4 px-6 text-center">
        <p className="text-xs text-foreground-muted">
          © 2026 VSM · Event Photography & Memory Vault ·{' '}
          <Link href="/track" className="hover:text-primary transition-colors">
            Track your booking
          </Link>
        </p>
      </footer>
    </div>
  );
}
