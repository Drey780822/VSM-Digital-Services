'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, UserRound } from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/ui/AppLogo';

const links = [
  { label: 'Book', href: '/book' },
  { label: 'Finance', href: '/finance' },
  { label: 'VSM for Business', href: '/business' },
  { label: 'Opportunities', href: '/opportunities' },
  { label: 'Memory Vault', href: '/vault' },
];

function Brand() {
  return (
    <Link href="/" className="flex min-w-max items-center gap-2.5" aria-label="VSM home">
      <AppLogo size={34} />
      {/* <span className="text-base font-bold tracking-[-0.03em] text-[#0B1F3A]">VSM</span> */}
    </Link>
  );
}

export default function PublicShell({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#122B4A]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />
          {!compact && (
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
              {links.map((link) => {
                const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
                return (
                  <Link key={link.href} href={link.href} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-[#F3F0E4] text-[#0B1F3A]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#0B1F3A]'}`}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/portal" className="inline-flex items-center gap-2 px-2 py-2 text-sm font-medium text-slate-600 hover:text-[#0B1F3A]">
              <UserRound size={16} /> Account
            </Link>
            {!compact && <Link href="/book" className="btn-gold gap-2 px-4 py-2 text-sm">Start booking <ArrowRight size={15} /></Link>}
          </div>
          <button type="button" className="rounded-md p-2 text-[#122B4A] lg:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {!compact && open && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">
              {links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={`rounded-md px-3 py-3 text-sm font-semibold ${pathname.startsWith(link.href) ? 'bg-[#F3F0E4] text-[#0B1F3A]' : 'text-slate-700'}`}>{link.label}</Link>
              ))}
              <Link href="/portal" onClick={() => setOpen(false)} className="mt-1 rounded-md border border-slate-200 px-3 py-3 text-sm font-semibold text-[#122B4A]">Account</Link>
            </nav>
          </div>
        )}
      </header>
      {children}
      {!compact && (
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-slate-500"><AppLogo size={24} /><span>VSM Digital Services</span></div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-slate-500"><Link href="/track" className="hover:text-[#0B1F3A]">Track booking</Link><Link href="/portal" className="hover:text-[#0B1F3A]">Account</Link><Link href="/admin-dashboard" className="hover:text-[#0B1F3A]">Administration</Link></div>
          </div>
        </footer>
      )}
    </div>
  );
}
