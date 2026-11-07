'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, UserRound, Sparkles } from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/ui/AppLogo';

const links = [
  { label: 'Book Event', href: '/book' },
  { label: 'Smart Finance', href: '/finance' },
  { label: 'VSM for Business', href: '/business' },
  { label: 'Opportunities', href: '/opportunities' },
  { label: 'Memory Vault', href: '/vault' },
];

function Brand() {
  return (
    <Link href="/" className="flex min-w-max items-center gap-3 group" aria-label="VSM home">
      <AppLogo size={36} />
      <div className="flex flex-col">
        <span className="font-bold tracking-tight text-white text-base leading-tight font-sans">
          VSM
        </span>
        <span className="text-[9px] tracking-widest uppercase text-vsm-gold font-semibold">
          Digital Services
        </span>
      </div>
    </Link>
  );
}

export default function PublicShell({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-near-black text-white flex flex-col font-sans selection:bg-vsm-gold/20 selection:text-white">
      <header className="sticky top-0 z-40 border-b border-vsm-gold/15 bg-near-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />
          {!compact && (
            <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Main navigation">
              {links.map((link) => {
                const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                      active
                        ? 'bg-deep-navy text-vsm-gold border border-vsm-gold/30 shadow-inner-gold'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
          <div className="hidden items-center gap-3.5 lg:flex">
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/75 hover:text-vsm-gold transition-colors"
            >
              <UserRound size={15} className="text-vsm-gold" />
              <span>Portal</span>
            </Link>
            {!compact && (
              <Link href="/book" className="btn-gold gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full shadow-gold">
                <span>Book Event</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-white/80 hover:text-vsm-gold transition-colors lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {!compact && open && (
          <div className="border-t border-white/10 bg-deep-navy px-5 py-4 lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-2" aria-label="Mobile navigation">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${
                    pathname.startsWith(link.href)
                      ? 'bg-vsm-gold text-near-black font-bold'
                      : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                <Link
                  href="/portal"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-center text-white/80"
                >
                  Client &amp; Creator Portal
                </Link>
                <Link
                  href="/book"
                  onClick={() => setOpen(false)}
                  className="btn-gold rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider text-center"
                >
                  Book Event
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {!compact && (
        <footer className="border-t border-white/10 bg-near-black py-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 text-white/50">
            <div className="flex items-center gap-3 text-white/80">
              <AppLogo size={26} />
              <span className="font-semibold">VSM Digital Services</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/track" className="hover:text-vsm-gold transition-colors">
                Track Booking
              </Link>
              <Link href="/vault" className="hover:text-vsm-gold transition-colors">
                Memory Vault
              </Link>
              <Link href="/business" className="hover:text-vsm-gold transition-colors">
                VSM for Business
              </Link>
              <Link href="/admin-dashboard" className="hover:text-vsm-gold transition-colors">
                Admin CRM
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
