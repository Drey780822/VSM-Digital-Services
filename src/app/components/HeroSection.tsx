'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, TrendingUp, ArrowRight } from 'lucide-react';

const PARTICLES = [
  { id: 'p1', top: '15%', left: '8%', size: 4, delay: 0 },
  { id: 'p2', top: '25%', left: '85%', size: 6, delay: 1.5 },
  { id: 'p3', top: '60%', left: '12%', size: 3, delay: 3 },
  { id: 'p4', top: '75%', left: '78%', size: 5, delay: 0.8 },
  { id: 'p5', top: '40%', left: '92%', size: 4, delay: 2.2 },
  { id: 'p6', top: '80%', left: '35%', size: 3, delay: 1.1 },
  { id: 'p7', top: '20%', left: '55%', size: 2, delay: 2.8 },
  { id: 'p8', top: '50%', left: '3%', size: 5, delay: 0.4 },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/assets/images/vs_removed_background-1779933543272.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="absolute inset-0 cinematic-overlay" />
        <div className="absolute inset-0" style={{ background: 'rgba(11,11,13,0.55)' }} />
      </div>
      {/* Ambient blobs */}
      <div className="blob-gold absolute top-1/4 left-1/4 w-96 h-96 z-[1]" />
      <div className="blob-silver absolute bottom-1/3 right-1/4 w-72 h-72 z-[1]" />
      {/* Particles */}
      {PARTICLES?.map((p) => (
        <div
          key={p?.id}
          className="particle z-[2]"
          style={{
            top: p?.top,
            left: p?.left,
            width: `${p?.size * 2}px`,
            height: `${p?.size * 2}px`,
            animationDelay: `${p?.delay}s`,
          }}
        />
      ))}
      {/* Content */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16 pt-32 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass border border-gold text-xs font-semibold tracking-widest uppercase text-primary mb-8">
            <Camera size={12} />
            African Luxury Photography & Financing
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display hero-text-hero-xl font-light text-foreground mb-6 max-w-5xl mx-auto"
        >
          Preserve Every{' '}
          <span className="text-gradient-gold italic">Moment.</span>
          <br />
          Empower Every{' '}
          <span className="text-gradient-silver italic">Life.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="text-lg lg:text-xl text-foreground-muted max-w-2xl mx-auto mb-12 leading-relaxed font-light"
        >
          VSCOBAR helps communities preserve memories and access financial support
          through one trusted digital platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#packages"
            className="btn-gold flex items-center gap-2.5 px-8 py-4 text-base font-semibold rounded-md glow-gold animate-glow-pulse"
          >
            <Camera size={18} />
            Book Your Event
            <ArrowRight size={16} />
          </a>
          <Link
            href="/loan-application-flow"
            className="btn-silver flex items-center gap-2.5 px-8 py-4 text-base font-medium rounded-md"
          >
            <TrendingUp size={18} />
            Apply For Loan
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-16 flex items-center justify-center gap-8 flex-wrap"
        >
          {[
            { value: '500+', label: 'Events Captured' },
            { value: 'R2.4M', label: 'Loans Disbursed' },
            { value: '98%', label: 'Client Satisfaction' },
            { value: '8 Yrs', label: 'Trusted Experience' },
          ]?.map((stat) => (
            <div key={`hero-stat-${stat?.label}`} className="text-center">
              <div className="font-display text-2xl font-semibold text-gradient-gold counter-value">{stat?.value}</div>
              <div className="text-xs text-foreground-muted tracking-wide mt-0.5">{stat?.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
          <span className="text-xs text-foreground-muted tracking-widest uppercase">Scroll</span>
        </motion.div>
      </div>
    </section>
  );
}