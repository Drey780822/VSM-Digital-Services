'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Film, Building2, CreditCard, Archive, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const CORE_SERVICES = [
  {
    step: '01',
    title: 'Everyday & Mini Events',
    subtitle: 'From R850 · Hourly or Deliverables',
    description: 'Birthdays, graduations, baby showers, pool parties, and grooves. Book exact hours without being forced into high-ticket packages.',
    icon: Camera,
    features: ['1h, 2h, 3h or 4+ hours', 'Edited photos + video reels', 'Fast 48h digital delivery', 'Add drone or express options'],
    ctaText: 'Calculate Mini Event',
    ctaLink: '/book',
    highlight: false,
  },
  {
    step: '02',
    title: 'Major Event Productions',
    subtitle: 'From R5,500 · Fixed Deposit to Reserve',
    description: 'Weddings, funerals, and milestone family celebrations. Complete cinematic production teams, drone aerials, and luxury albums.',
    icon: Film,
    features: ['Multi-camera crew coverage', 'Cinematic feature film & highlights', 'Reserve date with fixed deposit', 'Financing available on checkout'],
    ctaText: 'Explore Packages',
    ctaLink: '#packages',
    highlight: true,
  },
  {
    step: '03',
    title: 'VSM for Business & Summits',
    subtitle: 'Bespoke Enterprise Proposals',
    description: 'Tech summits, AWS Community Days, university hackathons, brand activations, and executive headshots with same-day social media turnarounds.',
    icon: Building2,
    features: ['Multi-photographer crews', 'Same-day social media clips', 'Interviews & keynote recording', 'Corporate invoicing & SLA contract'],
    ctaText: 'Request Corporate Brief',
    ctaLink: '#business-brief',
    highlight: false,
  },
  {
    step: '04',
    title: 'Smart Financing & Assistance',
    subtitle: 'Seamless, Contextual Credit',
    description: 'Flexible payment options for qualifying photography packages, plus standalone personal financial loans with transparent terms.',
    icon: CreditCard,
    features: ['Pay from R750/month on packages', 'Zero prepayment penalties', 'Strict NCA compliance', 'Independent personal loan application'],
    ctaText: 'Learn About Financing',
    ctaLink: '#financing',
    highlight: false,
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="relative py-28 lg:py-36 bg-near-black overflow-hidden border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-20">
          <span className="text-xs font-semibold tracking-widest uppercase text-vsm-gold mb-3 block">
            Commercial Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-5">
            Designed Around How You Actually Celebrate.
          </h2>
          <p className="text-sm sm:text-base text-white/60 leading-relaxed font-normal">
            No one should pay R5,500 for a two-hour birthday, and no corporate summit should be treated like a casual shoot.
            VSM adapts its commercial model to the exact scale of your moment.
          </p>
        </div>

        {/* Services Grid with Minimalist Breathing Room */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_SERVICES.map((s, idx) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`p-7 rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                s.highlight
                  ? 'bg-deep-navy border border-vsm-gold/40 shadow-gold'
                  : 'bg-deep-navy/40 border border-white/5 hover:border-vsm-gold/30 hover:bg-deep-navy/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold tracking-widest text-vsm-gold/70">
                    {s.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-corporate-navy/80 border border-vsm-gold/20 flex items-center justify-center text-vsm-gold">
                    <s.icon size={18} />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1.5">{s.title}</h3>
                <span className="text-xs font-semibold text-vsm-gold block mb-4">{s.subtitle}</span>
                <p className="text-xs text-white/65 leading-relaxed mb-6 font-normal">
                  {s.description}
                </p>

                <div className="space-y-2 mb-8 pt-4 border-t border-white/5">
                  {s.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                      <CheckCircle2 size={13} className="text-vsm-gold flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={s.ctaLink}
                className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-all ${
                  s.highlight
                    ? 'btn-gold shadow-gold'
                    : 'bg-corporate-navy/80 text-white/90 hover:bg-vsm-gold hover:text-near-black border border-white/10'
                }`}
              >
                <span>{s.ctaText}</span>
                <ArrowRight size={13} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
