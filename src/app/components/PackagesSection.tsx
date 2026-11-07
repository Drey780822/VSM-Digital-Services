'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Camera, Video, Crown, Sparkles, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import {
  fetchActivePackages,
  OFFICIAL_PACKAGES,
  type PackageRecord,
} from '@/lib/services/packages.service';

const FIXED_DEPOSITS: Record<string, number> = {
  Essential: 1500,
  Cinematic: 2500,
  Legacy: 4000,
};

const ICONS_BY_TIER: Record<string, React.ElementType> = {
  Essential: Camera,
  Cinematic: Video,
  Legacy: Crown,
};

export default function PackagesSection() {
  const [packages, setPackages] = useState<PackageRecord[]>(OFFICIAL_PACKAGES);

  useEffect(() => {
    let mounted = true;
    fetchActivePackages()
      .then((data: PackageRecord[]) => {
        if (mounted && data && data.length > 0) {
          setPackages(data);
        }
      })
      .catch((err: unknown) => {
        console.warn('Using default package configurations:', err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="packages" className="relative py-28 lg:py-36 bg-near-black overflow-hidden border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Minimalist Switcher Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-deep-navy border border-vsm-gold/25 text-vsm-gold text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles size={13} className="text-vsm-gold" />
            <span>Major Event Productions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Weddings &amp; Milestone Productions.
          </h2>
          <p className="text-sm sm:text-base text-white/60 leading-relaxed font-normal">
            For high-ticket ceremonies, lock in your date with a transparent fixed deposit.
            Financing and balance payment schedules available upon booking.
          </p>

          {/* Everyday Events Callout Banner */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 p-3 px-5 rounded-full bg-deep-navy/80 border border-white/10 text-xs text-white/75">
            <span>🎉 Planning a birthday, graduation, or groove?</span>
            <Link href="/book" className="text-vsm-gold font-bold hover:underline inline-flex items-center gap-1">
              <span>Book hourly from R850</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg, i) => {
            const TierIcon = ICONS_BY_TIER[pkg.tier] || Camera;
            const deposit = FIXED_DEPOSITS[pkg.tier] || Math.round(pkg.price * 0.3);
            const isPopular = pkg.isHighlighted;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative rounded-2xl flex flex-col justify-between p-8 transition-all duration-300 ${
                  isPopular
                    ? 'bg-deep-navy border-2 border-vsm-gold shadow-gold-lg scale-[1.02] z-10'
                    : 'bg-deep-navy/40 border border-white/10 hover:border-vsm-gold/40'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-vsm-gold text-near-black shadow-md">
                    Recommended Production
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isPopular ? 'bg-vsm-gold text-near-black' : 'bg-corporate-navy text-vsm-gold border border-vsm-gold/20'
                      }`}
                    >
                      <TierIcon size={22} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-vsm-gold">
                      {pkg.tier}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-xs text-white/60 leading-relaxed mb-6 min-h-[36px]">
                    {pkg.description}
                  </p>

                  <div className="mb-4">
                    <div className="text-3xl font-extrabold text-white">
                      R {pkg.price.toLocaleString()}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-corporate-navy border border-vsm-gold/30 text-[11px] font-semibold text-vsm-gold">
                      <Calendar size={12} />
                      <span>Reserve date: R{deposit.toLocaleString()} deposit</span>
                    </div>
                  </div>

                  <div className="h-px bg-white/10 my-6" />

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, idx) => (
                      <li key={`${pkg.id}-feat-${idx}`} className="flex items-start gap-2.5">
                        <Check size={14} className="text-vsm-gold flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-white/80 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  <Link
                    href={`/book?package=${pkg.id}&tier=${pkg.tier}`}
                    className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all ${
                      isPopular
                        ? 'btn-gold shadow-gold'
                        : 'bg-corporate-navy text-white hover:bg-vsm-gold hover:text-near-black border border-white/10'
                    }`}
                  >
                    <span>Reserve Date</span>
                    <ArrowRight size={14} />
                  </Link>
                  <p className="text-[10px] text-center text-white/45">
                    Pay full, split deposit, or apply for smart financing on checkout.
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
