'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicShell from '@/components/public/PublicShell';
import {
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Download,
  HardDrive,
  Clock,
  Share2,
  Check,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const VAULT_TIERS = [
  {
    name: 'Included Vault',
    tag: 'Standard With Booking',
    badge: 'Included',
    price: 'Free',
    period: 'for 60 days',
    description: 'Complimentary high-speed cloud access delivered with every verified VSM production.',
    features: [
      '60-Day Full-Resolution Access',
      'High-Res Photo & Highlight Reel Downloads',
      'Private Encrypted Access Code',
      'Mobile & Desktop Optimized Sharing',
    ],
    highlight: false,
  },
  {
    name: 'Premium Vault',
    tag: 'Most Popular for Milestones',
    badge: 'R199 / yr',
    price: 'R199',
    period: 'per year',
    description: 'Extended multi-device preservation for weddings, graduations, and milestone family celebrations.',
    features: [
      '1-Year Extended Cloud Preservation',
      '4K Video Streaming & Master Cut',
      'Unlimited Guest & Family Downloads',
      'Zero Cloud Storage Expiration Warnings',
      'Priority Re-Download Server Bandwidth',
    ],
    highlight: true,
  },
  {
    name: 'Family Archive',
    tag: 'Generational Preservation',
    badge: 'R399 / yr',
    price: 'R399',
    period: 'per year',
    description: 'Permanent, uncompressed storage designed to protect your family heritage forever.',
    features: [
      'Permanent Lifetime Cloud Storage',
      'Full RAW Uncompressed Photo & Audio Masters',
      'Multi-Redundant Secure Cloud Backup',
      'Private Family Legacy Link & Direct USB Dispatch Option',
      'Dedicated VSM Media Concierge',
    ],
    highlight: false,
  },
];

export default function VaultPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = accessCode.trim().toUpperCase();
    if (!clean) {
      setError('Please enter a valid vault access code');
      return;
    }
    router.push(`/vault/${clean}`);
  };

  const handleDemoClick = (code: string) => {
    setAccessCode(code);
    router.push(`/vault/${code}`);
  };

  return (
    <PublicShell>
      <main className="min-h-screen bg-near-black text-clear-white pb-24">
        {/* Subtle Ambient Background Glow */}
        <div className="relative overflow-hidden py-20 lg:py-28 border-b border-white/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[320px] bg-deep-navy/40 blur-[130px] pointer-events-none rounded-full" />

          <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-navy border border-vsm-gold/30 text-vsm-gold text-xs font-semibold uppercase tracking-widest mb-5">
              <Sparkles size={13} className="text-vsm-gold" />
              <span>VSM Memory Vault</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Come Back to What <span className="text-vsm-gold">Matters.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/65 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
              Your private digital sanctuary for event photographs, cinematic reels, and high-resolution master downloads — organized beautifully around your milestone.
            </p>

            {/* Access Code Form */}
            <div className="max-w-xl mx-auto">
              <form
                onSubmit={handleUnlock}
                className="p-2 sm:p-2.5 rounded-full bg-deep-navy/80 border border-vsm-gold/30 backdrop-blur-xl flex items-center justify-between shadow-2xl transition-all hover:border-vsm-gold/50"
              >
                <div className="flex items-center gap-3 pl-4 flex-1">
                  <Lock size={18} className="text-vsm-gold flex-shrink-0" />
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                    placeholder="Enter Private Code (e.g. VSM-8492)"
                    className="w-full bg-transparent text-white placeholder-white/40 text-sm sm:text-base font-semibold tracking-wider uppercase outline-none"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="btn-gold px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 flex-shrink-0 shadow-lg"
                >
                  <span>Open Vault</span>
                  <ArrowRight size={14} />
                </button>
              </form>

              {error && <p className="text-red-400 text-xs mt-3 text-left pl-6">{error}</p>}

              {/* Instant Demo Shortcut */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/50">
                <span>Want to see an authentic gallery?</span>
                <button
                  type="button"
                  onClick={() => handleDemoClick('VSM-8492')}
                  className="text-vsm-gold hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <span>Try Demo Vault: VSM-8492</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Value Features Row */}
        <div className="max-w-7xl mx-auto px-6 py-16 border-b border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-deep-navy/30 border border-white/5 hover:border-vsm-gold/20 transition-all">
              <div className="w-10 h-10 rounded-full bg-deep-navy border border-vsm-gold/30 flex items-center justify-center text-vsm-gold mb-4">
                <Download size={18} />
              </div>
              <h3 className="text-white text-base font-bold mb-1">Instant High-Res Downloads</h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                Download individual high-resolution photographs or entire batches in one click. Optimized for print and digital albums.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-deep-navy/30 border border-white/5 hover:border-vsm-gold/20 transition-all">
              <div className="w-10 h-10 rounded-full bg-deep-navy border border-vsm-gold/30 flex items-center justify-center text-vsm-gold mb-4">
                <Share2 size={18} />
              </div>
              <h3 className="text-white text-base font-bold mb-1">Seamless Family Sharing</h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                Share your private access code or dedicated web link with family, guests, and wedding attendees across any mobile or desktop screen.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-deep-navy/30 border border-white/5 hover:border-vsm-gold/20 transition-all">
              <div className="w-10 h-10 rounded-full bg-deep-navy border border-vsm-gold/30 flex items-center justify-center text-vsm-gold mb-4">
                <HardDrive size={18} />
              </div>
              <h3 className="text-white text-base font-bold mb-1">Long-Term Digital Vault</h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                Never worry about lost phones or hard drive failures. VSM cloud preserves your moments with bank-grade cloud encryption.
              </p>
            </div>
          </div>
        </div>

        {/* Memory Preservation Tiers */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-vsm-gold mb-3 block">
              Continuous Preservation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Configurable Memory Vault Plans
            </h2>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed font-normal">
              Every VSM booking includes 60 days of cloud access. Extend or archive your memories permanently when your moment demands lifelong protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VAULT_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`p-8 rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                  tier.highlight
                    ? 'bg-deep-navy border-2 border-vsm-gold shadow-gold relative'
                    : 'bg-deep-navy/30 border border-white/10 hover:border-vsm-gold/30'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-vsm-gold text-near-black text-[11px] font-extrabold uppercase tracking-wider">
                    Recommended for Weddings & Grads
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-vsm-gold/80">
                      {tier.tag}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-semibold">
                      {tier.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-white/60 text-xs sm:text-sm mb-6 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-white/10">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">{tier.price}</span>
                    <span className="text-white/50 text-xs font-medium">{tier.period}</span>
                  </div>

                  <ul className="space-y-3.5 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80">
                        <Check size={16} className="text-vsm-gold flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/book"
                  className={`w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider text-center transition-all ${
                    tier.highlight
                      ? 'btn-gold shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Book With This Tier
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* POPIA & Trust Strip */}
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="p-6 rounded-2xl bg-corporate-navy/30 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-vsm-gold flex-shrink-0" />
              <div className="text-left">
                <span className="font-bold text-white block">POPIA Compliant & Encrypted</span>
                <span>Your private photos and videos are accessible only via your unique cryptographic key.</span>
              </div>
            </div>
            <Link href="/portal" className="text-vsm-gold hover:underline font-semibold flex-shrink-0">
              Go to Customer Portal →
            </Link>
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
