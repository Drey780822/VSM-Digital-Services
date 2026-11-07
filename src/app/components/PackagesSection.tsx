'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Camera, Video, Crown, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import {
  fetchActivePackages,
  OFFICIAL_PACKAGES,
  type PackageRecord,
} from '@/lib/services/packages.service';
import { calculateAmortization, formatZAR } from '@/lib/services/eligibility.engine';

const ICONS_BY_TIER: Record<string, React.ElementType> = {
  Essential: Camera,
  Cinematic: Video,
  Legacy: Crown,
};

export default function PackagesSection() {
  const [packages, setPackages] = useState<PackageRecord[]>(OFFICIAL_PACKAGES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchActivePackages()
      .then((data: PackageRecord[]) => {
        if (mounted && data && data.length > 0) {
          setPackages(data);
        }
      })
      .catch((err: unknown) => {
        console.warn('Could not fetch packages from Supabase, using defaults:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section
      id="packages"
      className="relative py-24 lg:py-32 bg-background-secondary overflow-hidden"
    >
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="blob-gold absolute top-1/2 left-0 w-80 h-80 opacity-20" />
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-gold/30 text-primary text-xs font-semibold tracking-widest uppercase mb-3">
            <Sparkles size={13} />
            Two Services · One Platform
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-light text-foreground mb-4">
            Choose Your <span className="text-gradient-gold italic">Experience</span>
          </h2>
          <p className="text-foreground-muted max-w-xl mx-auto text-base leading-relaxed">
            Three tiers of luxury production — pay directly upon booking or split with instant Smart Financing over 3–24 months.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {packages.map((pkg, i) => {
            const TierIcon = ICONS_BY_TIER[pkg.tier] || Camera;
            const amort = calculateAmortization(pkg.price, 6);
            const isPopular = pkg.isHighlighted;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
                  isPopular
                    ? 'border-2 border-gold-strong glow-gold scale-[1.02] lg:scale-105'
                    : 'border border-border hover:border-gold'
                }`}
                style={{
                  background: isPopular
                    ? 'linear-gradient(160deg, #1A1A1F 0%, #222228 100%)'
                    : 'var(--card)',
                }}
              >
                {isPopular && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-gold-gradient text-background shadow-md">
                    Most Popular
                  </div>
                )}

                <div className="p-7 lg:p-8 flex flex-col flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                      isPopular ? 'bg-gold-gradient' : 'bg-muted'
                    }`}
                  >
                    <TierIcon
                      size={20}
                      className={isPopular ? 'text-background' : 'text-primary'}
                    />
                  </div>

                  <div className="text-xs font-semibold tracking-widest uppercase text-foreground-muted mb-1">
                    {pkg.tier} Production
                  </div>
                  <h3
                    className={`font-display text-2xl font-semibold mb-2 ${
                      isPopular ? 'text-gradient-gold' : 'text-foreground'
                    }`}
                  >
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-foreground-muted leading-relaxed mb-6 min-h-[40px]">
                    {pkg.description}
                  </p>

                  <div className="mb-1">
                    <span
                      className={`font-display text-3xl font-semibold ${
                        isPopular ? 'text-gradient-gold' : 'text-foreground'
                      }`}
                    >
                      R {pkg.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-primary font-medium mb-6 flex items-center gap-1">
                    <TrendingUp size={12} />
                    or from {formatZAR(amort.monthlyInstalment)}/month with Smart Financing
                  </div>

                  <div className="section-divider mb-6" />

                  <ul className="space-y-3 mb-8 flex-1">
                    {pkg.features.map((feature, idx) => (
                      <li key={`${pkg.id}-feat-${idx}`} className="flex items-start gap-3">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isPopular ? 'bg-gold-gradient' : 'bg-primary/20'
                          }`}
                        >
                          <Check
                            size={10}
                            className={isPopular ? 'text-background' : 'text-primary'}
                          />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                    <Link
                      href={`/book?package=${encodeURIComponent(pkg.slug)}&mode=direct`}
                      className={`w-full py-3.5 text-sm font-semibold rounded-md text-center transition-all duration-200 shadow-md ${
                        isPopular ? 'btn-gold' : 'btn-silver'
                      }`}
                    >
                      Book {pkg.tier}
                    </Link>
                    <Link
                      href={`/book?package=${encodeURIComponent(pkg.slug)}&mode=finance`}
                      className="text-center text-xs text-foreground-muted hover:text-primary transition-colors duration-200 py-1 flex items-center justify-center gap-1.5"
                    >
                      <TrendingUp size={13} className="text-primary" />
                      Finance this package over 3–24 months →
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-foreground-muted">
            All photography services include VAT. Custom packages available for large corporate galas.{' '}
            <a
              href="mailto:info@vsm.co.za"
              className="text-primary hover:text-primary-light transition-colors underline"
            >
              Contact Vincent
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
