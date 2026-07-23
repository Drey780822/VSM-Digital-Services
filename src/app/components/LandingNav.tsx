'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Menu, X, Phone } from 'lucide-react';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Packages', href: '#packages' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Financing', href: '#financing' },
  { label: 'About', href: '#community' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-glass-dark border-b border-gold py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <AppLogo size={36} />
            <span className="font-display text-xl font-semibold tracking-wide text-gradient-gold hidden sm:block"></span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks?.map((link) => (
              <a
                key={`nav-${link?.label}`}
                href={link?.href}
                className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors duration-200 tracking-wide"
              >
                {link?.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+27000000000"
              className="flex items-center gap-2 text-sm text-foreground-muted hover:text-primary transition-colors duration-200"
            >
              <Phone size={14} />
              <span>+27 000 000 0000</span>
            </a>
            <Link href="#booking" className="btn-gold px-5 py-2.5 text-sm font-semibold rounded-md">
              Book Event
            </Link>
            <Link
              href="/loan-application-flow"
              className="btn-silver px-5 py-2.5 text-sm font-medium rounded-md"
            >
              Apply for Loan
            </Link>
          </div>

          <button
            className="lg:hidden p-2 text-foreground-muted hover:text-primary transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>
      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-72 bg-background-secondary border-l border-gold flex flex-col transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <span className="font-display text-lg text-gradient-gold font-semibold">VSM</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 text-foreground-muted hover:text-primary transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 p-5 flex flex-col gap-1">
            {navLinks?.map((link) => (
              <a
                key={`mobile-nav-${link?.label}`}
                href={link?.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-medium text-foreground-muted hover:text-primary hover:bg-muted/50 rounded-md transition-all duration-200"
              >
                {link?.label}
              </a>
            ))}
          </div>
          <div className="p-5 border-t border-border flex flex-col gap-3">
            <Link
              href="#booking"
              onClick={() => setMobileOpen(false)}
              className="btn-gold w-full py-3 text-sm font-semibold rounded-md text-center"
            >
              Book Event
            </Link>
            <Link
              href="/loan-application-flow"
              onClick={() => setMobileOpen(false)}
              className="btn-silver w-full py-3 text-sm font-medium rounded-md text-center"
            >
              Apply for Loan
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
