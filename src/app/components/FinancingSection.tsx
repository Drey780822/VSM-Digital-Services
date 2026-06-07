'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const PACKAGES_FOR_CALC = [
  { id: 'calc-essential', label: 'Essential Memories', price: 4500 },
  { id: 'calc-cinematic', label: 'Cinematic Experience', price: 8900 },
  { id: 'calc-legacy', label: 'Legacy Collection', price: 14500 },
  { id: 'calc-custom', label: 'Custom Amount', price: 0 },
];

const TERMS = [3, 6, 12, 18, 24];
const INTEREST_RATE = 0.18; // 18% per annum

function calcMonthly(principal: number, months: number): number {
  const r = INTEREST_RATE / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-ZA');
}

export default function FinancingSection() {
  const [selectedPackage, setSelectedPackage] = useState('calc-cinematic');
  const [customAmount, setCustomAmount] = useState(8900);
  const [term, setTerm] = useState(6);

  const pkg = PACKAGES_FOR_CALC.find((p) => p.id === selectedPackage);
  const principal = pkg?.id === 'calc-custom' ? customAmount : (pkg?.price ?? 8900);
  const monthly = calcMonthly(principal, term);
  const totalRepay = monthly * term;
  const totalInterest = totalRepay - principal;

  return (
    <section id="financing" className="relative py-24 lg:py-32 bg-background-secondary overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="blob-gold absolute top-1/2 right-0 w-96 h-96 opacity-25" />

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">Smart Financing</span>
            <h2 className="font-display text-4xl lg:text-5xl font-light text-foreground mb-5">
              Finance Your{' '}
              <span className="text-gradient-gold italic">Dream Event</span>
            </h2>
            <p className="text-foreground-muted text-base leading-relaxed mb-8">
              Don&apos;t let budget stand between you and your most important memories. Our smart financing lets you spread the cost of your photography package over flexible monthly instalments — with instant eligibility estimates.
            </p>

            <div className="space-y-4 mb-8">
              {[
                'No account creation required',
                'Instant eligibility in under 2 minutes',
                'Flexible 3–24 month repayment terms',
                'Transparent fees — no hidden charges',
                'Debit order for effortless repayments',
              ].map((item, i) => (
                <div key={`fin-feature-${i}`} className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-success flex-shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/loan-application-flow"
              className="btn-gold inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-md"
            >
              Start Application
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-glass border border-gold rounded-2xl p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
                  <Calculator size={18} className="text-background" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Repayment Calculator</h3>
                  <p className="text-xs text-foreground-muted">Estimate your monthly instalments</p>
                </div>
              </div>

              {/* Package Selector */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-2">
                  Select Package
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PACKAGES_FOR_CALC.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPackage(p.id)}
                      className={`px-3 py-2.5 rounded-md text-xs font-medium transition-all duration-200 text-left ${
                        selectedPackage === p.id
                          ? 'bg-gold-gradient text-background font-semibold' :'bg-muted text-foreground-muted hover:text-foreground border border-border'
                      }`}
                    >
                      {p.label}
                      {p.price > 0 && <span className="block text-xs opacity-70 mt-0.5">R {formatNumber(p.price)}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              {selectedPackage === 'calc-custom' && (
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-2">
                    Loan Amount (ZAR)
                  </label>
                  <input
                    type="range"
                    min={1000}
                    max={50000}
                    step={500}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="w-full accent-primary mb-2"
                    aria-label="Loan amount slider"
                  />
                  <div className="flex justify-between text-xs text-foreground-muted">
                    <span>R 1,000</span>
                    <span className="text-primary font-semibold">R {formatNumber(customAmount)}</span>
                    <span>R 50,000</span>
                  </div>
                </div>
              )}

              {/* Term Selector */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-2">
                  Repayment Term
                </label>
                <div className="flex gap-2">
                  {TERMS.map((t) => (
                    <button
                      key={`term-${t}`}
                      onClick={() => setTerm(t)}
                      className={`flex-1 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                        term === t
                          ? 'bg-gold-gradient text-background font-semibold' :'bg-muted text-foreground-muted hover:text-foreground border border-border'
                      }`}
                    >
                      {t}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Result */}
              <div className="bg-background rounded-xl p-5 border border-gold">
                <div className="text-center mb-4">
                  <div className="text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1">
                    Monthly Instalment
                  </div>
                  <div className="font-display text-4xl font-semibold text-gradient-gold counter-value">
                    R {formatNumber(Math.ceil(monthly))}
                  </div>
                  <div className="text-xs text-foreground-muted mt-1">over {term} months</div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center pt-4 border-t border-border">
                  <div>
                    <div className="text-xs text-foreground-muted mb-0.5">Principal</div>
                    <div className="text-sm font-semibold text-foreground counter-value">R {formatNumber(principal)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-foreground-muted mb-0.5">Interest</div>
                    <div className="text-sm font-semibold text-warning counter-value">R {formatNumber(Math.ceil(totalInterest))}</div>
                  </div>
                  <div>
                    <div className="text-xs text-foreground-muted mb-0.5">Total</div>
                    <div className="text-sm font-semibold text-foreground counter-value">R {formatNumber(Math.ceil(totalRepay))}</div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-foreground-muted mt-3 text-center">
                18% per annum. Subject to eligibility. Representative example only.
              </p>

              <Link
                href="/loan-application-flow"
                className="btn-gold w-full mt-4 py-3.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2"
              >
                Check My Eligibility
                <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}