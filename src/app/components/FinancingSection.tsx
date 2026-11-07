'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight, ShieldCheck, CheckCircle2, CreditCard } from 'lucide-react';
import Link from 'next/link';

const PRODUCTION_OPTIONS = [
  { id: 'essential', label: 'Essential (R5,500)', price: 5500 },
  { id: 'cinematic', label: 'Cinematic (R8,900)', price: 8900 },
  { id: 'legacy', label: 'Legacy (R14,500)', price: 14500 },
  { id: 'custom', label: 'Custom Amount', price: 0 },
];

const TERMS = [3, 6, 12, 18, 24];
const INTEREST_RATE = 0.18; // 18% per annum

function calcMonthly(principal: number, months: number): number {
  const r = INTEREST_RATE / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-ZA');
}

export default function FinancingSection() {
  const [selectedProduction, setSelectedProduction] = useState('cinematic');
  const [customAmount, setCustomAmount] = useState(10000);
  const [term, setTerm] = useState(6);

  const selected = PRODUCTION_OPTIONS.find((p) => p.id === selectedProduction);
  const principal = selected?.id === 'custom' ? customAmount : (selected?.price ?? 8900);
  const monthly = calcMonthly(principal, term);
  const totalRepay = monthly * term;

  return (
    <section id="financing" className="relative py-28 lg:py-36 bg-near-black overflow-hidden border-b border-white/5">
      {/* Background Ambience */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-deep-navy/30 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left Column: Vision & Philosophy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-deep-navy border border-vsm-gold/25 text-vsm-gold text-xs font-semibold uppercase tracking-widest mb-4">
              <ShieldCheck size={13} className="text-vsm-gold" />
              <span>Smart Event Financing</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Never Compromise on Life&apos;s Milestones.
            </h2>
            
            <p className="text-sm sm:text-base text-white/65 leading-relaxed mb-8 font-normal">
              For major weddings, funerals, and large productions where ticket sizes exceed R3,000,
              VSM provides contextual, low-friction financing. Spread payments over 3 to 24 months
              while your crew is confirmed and your date is reserved.
            </p>

            <div className="space-y-4 mb-10">
              {[
                { title: 'Zero Surprise Fees', desc: 'Full NCR compliance with transparent monthly interest and disclosures.' },
                { title: 'Preserve Date Today', desc: 'Secure production slots immediately while payments are smoothly handled.' },
                { title: 'Dedicated Personal Loans', desc: 'Independent personal financial loans available through a discrete application portal.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-deep-navy border border-vsm-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={12} className="text-vsm-gold" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{item.title}</h4>
                    <p className="text-xs text-white/60 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/loan-application-flow"
                className="btn-gold px-7 py-3 text-xs uppercase tracking-wider font-bold rounded-lg shadow-gold flex items-center gap-2"
              >
                <span>Standalone Loan Application</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Interactive Minimalist Calculator */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="p-8 sm:p-10 rounded-2xl bg-deep-navy/50 border border-vsm-gold/25 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Instalment Calculator</h3>
                <span className="text-xs text-white/50">Instant estimate with 18% p.a. illustrative rate</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-corporate-navy border border-vsm-gold/25 flex items-center justify-center text-vsm-gold">
                <Calculator size={18} />
              </div>
            </div>

            {/* Select Package Tier or Amount */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-white/70 block mb-2 uppercase tracking-wider">
                Production / Amount
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRODUCTION_OPTIONS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProduction(p.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium text-left transition-all ${
                      selectedProduction === p.id
                        ? 'bg-vsm-gold text-near-black font-bold shadow-md'
                        : 'bg-corporate-navy/60 text-white/80 hover:bg-corporate-navy border border-white/5'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {selectedProduction === 'custom' && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/70 mb-1">
                    <span>Financing Amount</span>
                    <span className="font-bold text-vsm-gold">R {formatNumber(customAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min="3000"
                    max="50000"
                    step="500"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="w-full accent-[#D4AF37]"
                  />
                </div>
              )}
            </div>

            {/* Select Terms */}
            <div className="mb-8">
              <label className="text-xs font-semibold text-white/70 block mb-2 uppercase tracking-wider">
                Repayment Term
              </label>
              <div className="grid grid-cols-5 gap-2">
                {TERMS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTerm(m)}
                    className={`py-2 rounded-lg text-xs font-semibold text-center transition-all ${
                      term === m
                        ? 'bg-vsm-gold text-near-black shadow-md'
                        : 'bg-corporate-navy/60 text-white/75 hover:bg-corporate-navy border border-white/5'
                    }`}
                  >
                    {m} mo
                  </button>
                ))}
              </div>
            </div>

            {/* Computed Output Box */}
            <div className="p-5 rounded-xl bg-corporate-navy/70 border border-vsm-gold/20 mb-6">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs text-white/60">Estimated Monthly</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-vsm-gold">
                  R {formatNumber(monthly)}
                  <span className="text-xs text-white/50 font-normal"> /mo</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/10">
                <span>Total Repayment ({term} months)</span>
                <span className="font-medium text-white/80">R {formatNumber(totalRepay)}</span>
              </div>
            </div>

            <Link
              href="/book"
              className="w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider btn-gold text-center block shadow-gold"
            >
              Book &amp; Choose Payment on Checkout
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
