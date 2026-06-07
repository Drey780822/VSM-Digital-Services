'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Camera, TrendingUp, Video, Image, Aperture, CreditCard, PiggyBank, BarChart2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const PHOTOGRAPHY_FEATURES = [
  { id: 'pf-1', icon: Camera, text: 'Cinematic event photography' },
  { id: 'pf-2', icon: Video, text: 'Full HD & 4K video production' },
  { id: 'pf-3', icon: Aperture, text: 'Drone aerial photography' },
  { id: 'pf-4', icon: Image, text: 'Private Memory Vault gallery' },
];

const LOAN_FEATURES = [
  { id: 'lf-1', icon: TrendingUp, text: 'Smart eligibility calculator' },
  { id: 'lf-2', icon: CreditCard, text: 'Finance your event package' },
  { id: 'lf-3', icon: PiggyBank, text: 'Flexible repayment terms' },
  { id: 'lf-4', icon: BarChart2, text: 'Personal loan dashboard' },
];

export default function ServicesSection() {
  return (
    <section id="services" className="relative py-24 lg:py-32 bg-background overflow-hidden">
      <div className="blob-gold absolute bottom-0 left-1/4 w-80 h-80 opacity-30" />
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">What We Offer</span>
          <h2 className="font-display text-4xl lg:text-5xl font-light text-foreground mb-4">
            Two Services.{' '}
            <span className="text-gradient-gold italic">One Platform.</span>
          </h2>
          <p className="text-foreground-muted max-w-xl mx-auto text-base leading-relaxed">
            Photography services and smart financing — naturally connected so you never have to compromise on your most important moments.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Photography Card */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-2xl overflow-hidden group cursor-pointer"
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20 group-hover:via-background/70 transition-all duration-500" />
            <div className="relative z-10 p-8 lg:p-10 min-h-[420px] flex flex-col justify-end">
              <div className="w-14 h-14 rounded-2xl bg-glass border border-gold flex items-center justify-center mb-6 group-hover:glow-gold-strong transition-all duration-300">
                <Camera size={24} className="text-primary" />
              </div>
              <h3 className="font-display text-3xl font-semibold text-foreground mb-3">
                Photography Services
              </h3>
              <p className="text-foreground-muted text-sm leading-relaxed mb-6">
                Cinematic event photography and videography for weddings, funerals, birthdays, graduations, grooves, and corporate events. Every moment preserved with luxury precision.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {PHOTOGRAPHY_FEATURES?.map((f) => (
                  <div key={f?.id} className="flex items-center gap-2">
                    <f.icon size={13} className="text-primary flex-shrink-0" />
                    <span className="text-xs text-foreground-muted">{f?.text}</span>
                  </div>
                ))}
              </div>
              <a
                href="#packages"
                className="btn-gold inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-md w-fit"
              >
                View Packages
                <ArrowRight size={15} />
              </a>
            </div>
          </motion.div>

          {/* Loan Card */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-2xl overflow-hidden group cursor-pointer"
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/30 group-hover:via-background/75 transition-all duration-500" />
            <div className="relative z-10 p-8 lg:p-10 min-h-[420px] flex flex-col justify-end">
              <div className="w-14 h-14 rounded-2xl bg-glass border border-gold flex items-center justify-center mb-6 group-hover:glow-gold-strong transition-all duration-300">
                <TrendingUp size={24} className="text-primary" />
              </div>
              <h3 className="font-display text-3xl font-semibold text-foreground mb-3">
                Loan Services
              </h3>
              <p className="text-foreground-muted text-sm leading-relaxed mb-6">
                Smart financing for photography packages and personal loans. No account required — just verify your identity and get an instant eligibility estimate. Community-first lending.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {LOAN_FEATURES?.map((f) => (
                  <div key={f?.id} className="flex items-center gap-2">
                    <f.icon size={13} className="text-primary flex-shrink-0" />
                    <span className="text-xs text-foreground-muted">{f?.text}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/loan-application-flow"
                className="btn-silver inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-md w-fit"
              >
                Apply Now
                <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}