'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Users, Camera, Star, ShieldCheck, HeartHandshake } from 'lucide-react';

interface TrustStatItem {
  id: string;
  icon: React.ElementType;
  value: number;
  suffix: string;
  prefix?: string;
  isFloat?: boolean;
  label: string;
  description: string;
}

const TRUST_STATS: TrustStatItem[] = [
  {
    id: 'stat-events',
    icon: Camera,
    value: 500,
    suffix: '+',
    label: 'Events Captured',
    description: 'Weddings, celebrations, graduations & summits',
  },
  {
    id: 'stat-clients',
    icon: Users,
    value: 1200,
    suffix: '+',
    label: 'Delighted Clients',
    description: 'Families and corporate teams across South Africa',
  },
  {
    id: 'stat-rating',
    icon: Star,
    value: 4.9,
    suffix: '/5',
    isFloat: true,
    label: 'Client Satisfaction',
    description: 'Based on 400+ verified customer reviews',
  },
  {
    id: 'stat-creatives',
    icon: HeartHandshake,
    value: 100,
    suffix: '%',
    label: 'Delivery SLA',
    description: 'Every memory delivered and preserved securely',
  },
];

function AnimatedCounter({
  target,
  suffix,
  prefix,
  isFloat,
}: {
  target: number;
  suffix: string;
  prefix?: string;
  isFloat?: boolean;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const steps = 50;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);
      setCount(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  const display = isFloat ? count.toFixed(1) : Math.floor(count).toLocaleString();

  return (
    <span ref={ref} className="font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
      {prefix}
      {display}
      <span className="text-vsm-gold">{suffix}</span>
    </span>
  );
}

const TESTIMONIALS = [
  {
    id: 'test-1',
    name: 'Nkosi Dlamini',
    role: 'Wedding Production · Pretoria',
    quote:
      'VSM delivered beyond our wildest expectations. The cinematic cut captured every tear and dance step of our wedding.',
    rating: 5,
    initials: 'ND',
  },
  {
    id: 'test-2',
    name: 'Kagiso Molefe',
    role: '2-Hour Graduation Shoot · TUT',
    quote:
      'Booking hourly for R850 was incredible. 80 sharp photos delivered in two days without having to pay for an expensive wedding package.',
    rating: 5,
    initials: 'KM',
  },
  {
    id: 'test-3',
    name: 'Sipho Zulu',
    role: 'Tech Summit Lead · Johannesburg',
    quote:
      'Enterprise-grade visual production. Two photographers, one videographer, and social media reels delivered same day.',
    rating: 5,
    initials: 'SZ',
  },
];

export default function TrustSection() {
  return (
    <section className="relative py-28 lg:py-36 bg-near-black overflow-hidden border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {TRUST_STATS.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-deep-navy/35 border border-white/5 hover:border-vsm-gold/25 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-corporate-navy/80 border border-vsm-gold/20 flex items-center justify-center text-vsm-gold mx-auto mb-4">
                <stat.icon size={18} />
              </div>
              <div className="mb-1">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  isFloat={stat.isFloat}
                />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                {stat.label}
              </h4>
              <p className="text-[11px] text-white/50">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-vsm-gold mb-3 block">
            Customer Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Trusted by South African Families &amp; Brands.
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="p-8 rounded-2xl bg-deep-navy/40 border border-white/10 hover:border-vsm-gold/30 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-[#D4AF37] text-vsm-gold" />
                  ))}
                </div>
                <p className="text-sm text-white/80 leading-relaxed font-normal mb-8 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-corporate-navy border border-vsm-gold/30 flex items-center justify-center text-xs font-bold text-vsm-gold flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{t.name}</h4>
                  <span className="text-[11px] text-white/50">{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
