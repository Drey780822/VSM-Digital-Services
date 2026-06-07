'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Users, Camera, TrendingUp, Star, Shield } from 'lucide-react';

const TRUST_STATS = [
  { id: 'stat-events', icon: Camera, value: 500, suffix: '+', label: 'Events Captured', description: 'Weddings, funerals, birthdays & corporate events' },
  { id: 'stat-clients', icon: Users, value: 1200, suffix: '+', label: 'Active Clients', description: 'Trusted by families and businesses across SA' },
  { id: 'stat-loans', icon: TrendingUp, value: 2.4, suffix: 'M', prefix: 'R', label: 'Loans Disbursed', description: 'Financial support delivered to our community' },
  { id: 'stat-years', icon: Award, value: 8, suffix: ' Yrs', label: 'Trusted Experience', description: 'Industry expertise since 2016' },
  { id: 'stat-rating', icon: Star, value: 4.9, suffix: '/5', label: 'Average Rating', description: 'Based on 340+ verified client reviews' },
  { id: 'stat-repay', icon: Shield, value: 94, suffix: '%', label: 'Repayment Rate', description: 'Responsible lending, community first' },
];

function AnimatedCounter({ target, suffix, prefix, isFloat }: { target: number; suffix: string; prefix?: string; isFloat?: boolean }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const steps = 60;
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
    <span ref={ref} className="counter-value">
      {prefix}{display}{suffix}
    </span>
  );
}

const TESTIMONIALS = [
  {
    id: 'test-1',
    name: 'Nkosi Dlamini',
    role: 'Wedding Client — Johannesburg',
    quote: 'VSCOBAR delivered beyond our expectations. Every photo tells a story we will treasure forever.',
    rating: 5,
    avatar: 'ND',
  },
  {
    id: 'test-2',
    name: 'Thandi Mokoena',
    role: 'Loan Client — Soweto',
    quote: 'The financing process was seamless. I was able to afford my daughter\'s graduation photoshoot without stress.',
    rating: 5,
    avatar: 'TM',
  },
  {
    id: 'test-3',
    name: 'Sipho Khumalo',
    role: 'Corporate Event — Sandton',
    quote: 'Professional, punctual, and absolutely cinematic. Our product launch looked like a Netflix production.',
    rating: 5,
    avatar: 'SK',
  },
];

export default function TrustSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-background-secondary overflow-hidden">
      <div className="blob-gold absolute top-0 right-0 w-96 h-96 opacity-50" />
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">By The Numbers</span>
          <h2 className="font-display text-4xl lg:text-5xl font-light text-foreground mb-4">
            Trust Built Through{' '}
            <span className="text-gradient-gold italic">Results</span>
          </h2>
          <p className="text-foreground-muted max-w-xl mx-auto text-base leading-relaxed">
            Eight years of delivering cinematic memories and responsible financial services to South African communities.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-20">
          {TRUST_STATS.map((stat, i) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="luxury-card p-6 text-center group"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors duration-300">
                <stat.icon size={18} className="text-primary" />
              </div>
              <div className="font-display text-2xl xl:text-3xl font-semibold text-gradient-gold mb-1 counter-value">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  isFloat={stat.value % 1 !== 0}
                />
              </div>
              <div className="text-xs font-semibold text-foreground tracking-wide mb-1">{stat.label}</div>
              <div className="text-xs text-foreground-muted leading-relaxed hidden xl:block">{stat.description}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="bg-glass border border-gold rounded-xl p-6"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={`star-${t.id}-${si}`} size={14} className="text-primary fill-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-5 font-light italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-xs font-bold text-background flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-foreground-muted">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}