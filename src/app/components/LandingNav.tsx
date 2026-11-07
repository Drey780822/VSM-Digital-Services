'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import GooeyNav from '@/components/ui/GooeyNav';
import { Menu, X, Calendar, User } from 'lucide-react';

const navItems = [
  { label: 'Moments', href: '#gallery' },
  { label: 'Services', href: '#services' },
  { label: 'Experiences', href: '#packages' },
  { label: 'Corporate', href: '#business-brief' },
  { label: 'Financing', href: '#financing' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-near-black/85 backdrop-blur-xl border-b border-vsm-gold/15 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-10 h-10 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/assets/images/logos/vsm-symbol-gold-transparent-1024.png"
                alt="VSM Symbol"
                fill
                sizes="40px"
                className="object-contain drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]"
                priority
              />
            </div>
          </Link>

          {/* Desktop Gooey Navigation */}
          <div className="hidden lg:block">
            <GooeyNav
              items={navItems}
              theme="dark"
              size="sm"
              color="#D4AF37"
              activeTextColor="#070B12"
              timeVariance={200}
              gooeyness={0.4}
              particleCount={12}
            />
          </div>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/portal"
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-vsm-gold transition-colors flex items-center gap-1.5"
            >
              <User size={14} className="text-vsm-gold" />
              <span>Portal</span>
            </Link>
            <Link
              href="/book"
              className="btn-gold px-5 py-2 text-xs uppercase tracking-wider font-bold rounded-full flex items-center gap-2 shadow-gold"
            >
              <Calendar size={13} />
              <span>Book Event</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white/80 hover:text-vsm-gold transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 bg-near-black/80 backdrop-blur-md transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-80 bg-deep-navy border-l border-vsm-gold/20 flex flex-col p-6 transition-transform duration-300 shadow-2xl ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image
                  src="/assets/images/logos/vsm-symbol-gold-transparent-1024.png"
                  alt="VSM Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-white tracking-tight">VSM Services</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 text-white/70 hover:text-vsm-gold transition-colors"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 py-8 flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={`mobile-${item.label}`}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-medium text-white/85 hover:text-vsm-gold hover:bg-corporate-navy/50 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            <Link
              href="/book"
              onClick={() => setMobileOpen(false)}
              className="btn-gold w-full py-3 text-center text-xs uppercase tracking-wider font-bold rounded-lg shadow-gold"
            >
              Book an Event
            </Link>
            <Link
              href="/portal"
              onClick={() => setMobileOpen(false)}
              className="btn-silver w-full py-2.5 text-center text-xs uppercase tracking-wider font-medium rounded-lg"
            >
              Client & Creator Portal
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
