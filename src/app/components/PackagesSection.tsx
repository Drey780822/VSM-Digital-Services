'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Camera, Video, Crown } from 'lucide-react';
import Link from 'next/link';

const PACKAGES = [
  {
    id: 'pkg-essential',
    tier: 'Essential',
    name: 'Essential Memories',
    price: 'R 4,500',
    priceNote: 'or from R 750/month',
    description: 'Perfect for intimate events where every moment matters.',
    highlight: false,
    badge: null,
    icon: Camera,
    features: [
      { id: 'ef-1', text: 'Professional event photography', included: true },
      { id: 'ef-2', text: 'Full event video (HD)', included: true },
      { id: 'ef-3', text: 'Private online gallery', included: true },
      { id: 'ef-4', text: 'Basic professional edits', included: true },
      { id: 'ef-5', text: '100+ edited photos delivered', included: true },
      { id: 'ef-6', text: 'Drone photography', included: false },
      { id: 'ef-7', text: 'Cinematic edits', included: false },
      { id: 'ef-8', text: 'Physical prints & album', included: false },
    ],
    cta: 'Book Essential',
    ctaStyle: 'silver',
  },
  {
    id: 'pkg-cinematic',
    tier: 'Cinematic',
    name: 'Cinematic Experience',
    price: 'R 8,900',
    priceNote: 'or from R 1,480/month',
    description: 'The complete cinematic production for events that deserve a film.',
    highlight: true,
    badge: 'Most Popular',
    icon: Video,
    features: [
      { id: 'cf-1', text: 'Professional event photography', included: true },
      { id: 'cf-2', text: 'Full cinematic event video (4K)', included: true },
      { id: 'cf-3', text: 'Drone aerial video coverage', included: true },
      { id: 'cf-4', text: 'Drone photography', included: true },
      { id: 'cf-5', text: 'Cinematic color grading & edits', included: true },
      { id: 'cf-6', text: 'Private Memory Vault gallery', included: true },
      { id: 'cf-7', text: '200+ edited photos delivered', included: true },
      { id: 'cf-8', text: 'Physical prints & album', included: false },
    ],
    cta: 'Book Cinematic',
    ctaStyle: 'gold',
  },
  {
    id: 'pkg-legacy',
    tier: 'Legacy',
    name: 'Legacy Collection',
    price: 'R 14,500',
    priceNote: 'or from R 2,416/month',
    description: 'The ultimate legacy package — everything, delivered in luxury.',
    highlight: false,
    badge: 'Premium',
    icon: Crown,
    features: [
      { id: 'lf-1', text: 'Everything in Cinematic package', included: true },
      { id: 'lf-2', text: 'Physical printed photos (50 prints)', included: true },
      { id: 'lf-3', text: 'Luxury leather-bound photo album', included: true },
      { id: 'lf-4', text: 'Framed signature prints (3)', included: true },
      { id: 'lf-5', text: 'Premium white-glove delivery', included: true },
      { id: 'lf-6', text: 'Dedicated event coordinator', included: true },
      { id: 'lf-7', text: 'Priority editing (48hr turnaround)', included: true },
      { id: 'lf-8', text: 'Lifetime Memory Vault access', included: true },
    ],
    cta: 'Book Legacy',
    ctaStyle: 'silver',
  },
];

export default function PackagesSection() {
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);

  return (
    <section id="packages" className="relative py-24 lg:py-32 bg-background-secondary overflow-hidden">
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
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">Event Packages</span>
          <h2 className="font-display text-4xl lg:text-5xl font-light text-foreground mb-4">
            Choose Your{' '}
            <span className="text-gradient-gold italic">Experience</span>
          </h2>
          <p className="text-foreground-muted max-w-xl mx-auto text-base leading-relaxed">
            Three tiers of luxury photography service — each with financing available through our smart loan platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {PACKAGES?.map((pkg, i) => (
            <motion.div
              key={pkg?.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
                pkg?.highlight
                  ? 'border-2 border-gold-strong glow-gold scale-[1.02] lg:scale-105'
                  : 'border border-border hover:border-gold'
              }`}
              style={{ background: pkg?.highlight ? 'linear-gradient(160deg, #1A1A1F 0%, #222228 100%)' : 'var(--card)' }}
            >
              {pkg?.badge && (
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                  pkg?.highlight ? 'bg-gold-gradient text-background' : 'bg-muted text-foreground-muted border border-border'
                }`}>
                  {pkg?.badge}
                </div>
              )}

              <div className="p-7 lg:p-8">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                  pkg?.highlight ? 'bg-gold-gradient' : 'bg-muted'
                }`}>
                  <pkg.icon size={20} className={pkg?.highlight ? 'text-background' : 'text-primary'} />
                </div>

                <div className="text-xs font-semibold tracking-widest uppercase text-foreground-muted mb-1">{pkg?.tier}</div>
                <h3 className={`font-display text-2xl font-semibold mb-2 ${pkg?.highlight ? 'text-gradient-gold' : 'text-foreground'}`}>
                  {pkg?.name}
                </h3>
                <p className="text-sm text-foreground-muted leading-relaxed mb-6">{pkg?.description}</p>

                <div className="mb-2">
                  <span className={`font-display text-3xl font-semibold ${pkg?.highlight ? 'text-gradient-gold' : 'text-foreground'}`}>
                    {pkg?.price}
                  </span>
                </div>
                <div className="text-xs text-foreground-muted mb-6">{pkg?.priceNote}</div>

                <div className="section-divider mb-6" />

                <ul className="space-y-3 mb-8">
                  {pkg?.features?.map((feature) => (
                    <li key={feature?.id} className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        feature?.included
                          ? pkg?.highlight ? 'bg-gold-gradient' : 'bg-primary/20' :'bg-muted'
                      }`}>
                        <Check size={10} className={feature?.included ? (pkg?.highlight ? 'text-background' : 'text-primary') : 'text-muted-foreground opacity-30'} />
                      </div>
                      <span className={`text-sm ${feature?.included ? 'text-foreground' : 'text-foreground-muted line-through opacity-50'}`}>
                        {feature?.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-3">
                  <button
                    className={`w-full py-3.5 text-sm font-semibold rounded-md transition-all duration-200 ${
                      pkg?.ctaStyle === 'gold' ? 'btn-gold' : 'btn-silver'
                    }`}
                  >
                    {pkg?.cta}
                  </button>
                  <Link
                    href="/loan-application-flow"
                    className="text-center text-xs text-foreground-muted hover:text-primary transition-colors duration-200 py-1"
                  >
                    Finance this package →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-foreground-muted">
            All packages include VAT. Custom packages available for large corporate events.{' '}
            <a href="mailto:info@vscobar.co.za" className="text-primary hover:text-primary-light transition-colors">
              Contact us
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}