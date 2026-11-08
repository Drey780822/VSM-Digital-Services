'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Landmark,
  WalletCards,
  Coins,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
  Clock,
  Building2,
  Info,
  ChevronRight,
  HelpCircle,
  FileCheck2,
  Lock,
  Loader2
} from 'lucide-react';
import PublicShell from '@/components/public/PublicShell';
import { calculateAmortization, formatZAR } from '@/lib/services/eligibility.engine';
import { formatCurrency, formatDate } from '@/lib/services/supabase-helpers';
import { DEMO_LOANS, getLoanById, type LoanRecord } from '@/lib/services/loans.service';

export default function FinancePage() {
  // Simulator State
  const [amount, setAmount] = useState<number>(6500);
  const [termMonths, setTermMonths] = useState<number>(6);
  const [activeTab, setActiveTab] = useState<'simulator' | 'track'>('simulator');

  // Status Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<LoanRecord | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Real-time calculation using engine
  const terms = useMemo(() => {
    return calculateAmortization(amount, termMonths, 18.0);
  }, [amount, termMonths]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const q = lookupQuery.trim();
      const res = await getLoanById(q);
      if (res) {
        setLookupResult(res);
      } else {
        const fallback = DEMO_LOANS.find(
          (l) =>
            l.referenceNumber.toLowerCase() === q.toLowerCase() ||
            l.email.toLowerCase() === q.toLowerCase()
        );
        if (fallback) {
          setLookupResult(fallback);
        } else {
          setLookupError('No credit facility record found for this reference or email.');
        }
      }
    } catch {
      setLookupError('Unable to query application status.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <PublicShell>
      <main className="min-h-screen bg-[#070B12] text-white selection:bg-vsm-gold/20 selection:text-white font-sans">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-deep-navy via-[#0A1627] to-[#070B12] py-20 lg:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(212,175,55,0.15),transparent)]" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-vsm-gold/[0.03] to-transparent pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-vsm-gold/30 bg-vsm-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-vsm-gold backdrop-blur-sm">
                <Sparkles size={13} />
                Smart Creative Capital & Event Credit
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Structured financing for life's{' '}
                <span className="bg-gradient-to-r from-vsm-gold via-[#F3E5AB] to-vsm-gold bg-clip-text text-transparent">
                  defining moments.
                </span>
              </h1>

              <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
                VSM provides transparent, regulated installment facilities for milestone media packages and professional creator equipment. Fixed 18.0% annual interest, zero penalty for early settlement, and automated debit order clearing across South African banks.
              </p>
            </div>

            {/* Quick Feature Pillars */}
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
                <ShieldCheck size={24} className="text-vsm-gold mb-3" />
                <h3 className="text-sm font-bold text-white">NCR Compliant Disclosure</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Fixed annual percentage rates, clear monthly amortizations, and no surprise balloon payments.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
                <Clock size={24} className="text-vsm-gold mb-3" />
                <h3 className="text-sm font-bold text-white">Same-Day Underwriting</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Automated debt-to-income (DTI) affordability assessment with responses in under 24 hours.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
                <Building2 size={24} className="text-vsm-gold mb-3" />
                <h3 className="text-sm font-bold text-white">Direct SA Bank Clearing</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Seamless automated debit orders through Standard Bank, FNB, Capitec, Nedbank, and Absa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dual Lane Architectural Separation */}
        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Two Distinct Credit Solutions
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Clear commercial separation ensures visual production clients and standalone borrowers access the exact facility they require.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Lane 1: Event Service Financing */}
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-deep-navy to-corporate-navy p-8 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-vsm-gold/30 bg-vsm-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-vsm-gold">
                    <WalletCards size={13} />
                    Lane 01 · Embedded Service Credit
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">Orders ≥ R3,000</span>
                </div>

                <h3 className="mt-5 text-2xl font-bold text-white">
                  Finance a Major Event Package
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-300">
                  Designed for weddings, milestone anniversaries, and grand productions. Secure your calendar date today with an initial deposit (e.g. R1,500), then split the remainder into 3 to 6 manageable monthly installments without delaying production.
                </p>

                <div className="mt-6 space-y-2.5 rounded-2xl bg-white/[0.03] border border-white/5 p-4 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-vsm-gold" /> Available seamlessly during booking checkout
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-vsm-gold" /> Protects your wedding date with small initial deposit
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-vsm-gold" /> Memory Vault preserved even while paying installments
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">Build package to qualify</span>
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 rounded-xl bg-vsm-gold px-5 py-2.5 text-xs font-bold text-deep-navy shadow-md shadow-vsm-gold/20 hover:bg-[#E7C766] transition-all"
                >
                  Configure Event Package <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Lane 2: Standalone Personal & Equipment Loans */}
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-deep-navy to-[#0A1627] p-8 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <Landmark size={13} />
                    Lane 02 · Standalone Facility
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-400">R2,000 – R35,000</span>
                </div>

                <h3 className="mt-5 text-2xl font-bold text-white">
                  Personal Loans & Creator Equipment
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-300">
                  An independent credit facility not tied to a visual booking. Geared for creative professionals financing camera bodies, lighting rigs, or personal needs. Evaluated independently based on your individual employment and affordability.
                </p>

                <div className="mt-6 space-y-2.5 rounded-2xl bg-white/[0.03] border border-white/5 p-4 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" /> Independent underwriting — no booking required
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" /> Funds disbursed directly to your South African bank
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" /> Flexible 3, 6, 9, or 12 month repayment schedules
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">Direct online application</span>
                <Link
                  href="/loan-application-flow"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all"
                >
                  Apply For Personal Loan <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Calculator & Application Status Section */}
        <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/15 bg-corporate-navy/40 p-6 md:p-10 backdrop-blur-xl shadow-2xl">
            {/* Tab Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {activeTab === 'simulator'
                    ? 'Credit Simulator & Amortization'
                    : 'Track Application Status'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {activeTab === 'simulator'
                    ? 'Simulate your monthly installment and total repayment before applying.'
                    : 'Check real-time underwriting status using your VSM-LN reference.'}
                </p>
              </div>

              <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('simulator')}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === 'simulator'
                      ? 'bg-vsm-gold text-deep-navy shadow-md shadow-vsm-gold/20'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Affordability Calculator
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('track')}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === 'track'
                      ? 'bg-vsm-gold text-deep-navy shadow-md shadow-vsm-gold/20'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Track Application
                </button>
              </div>
            </div>

            {/* TAB 1: Simulator */}
            {activeTab === 'simulator' && (
              <div className="grid gap-8 lg:grid-cols-12">
                {/* Sliders & Controls (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Amount Slider */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-vsm-gold">
                        Financing Amount
                      </label>
                      <span className="text-2xl font-extrabold text-white font-mono">
                        {formatCurrency(amount)}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={2000}
                      max={35000}
                      step={500}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="mt-4 w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                    />

                    <div className="mt-2 flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>R 2,000</span>
                      <span>R 18,500</span>
                      <span>R 35,000</span>
                    </div>

                    {/* Quick amount chips */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[3000, 6500, 12000, 20000, 30000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val)}
                          className={`rounded-lg px-3 py-1 text-xs font-mono font-medium transition-all ${
                            amount === val
                              ? 'bg-vsm-gold/20 text-vsm-gold border border-vsm-gold/40'
                              : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                          }`}
                        >
                          {formatCurrency(val)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Term Selector */}
                  <div className="pt-4 border-t border-white/10">
                    <label className="block text-xs font-bold uppercase tracking-wider text-vsm-gold mb-3">
                      Repayment Term
                    </label>

                    <div className="grid grid-cols-4 gap-3">
                      {[3, 6, 9, 12].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTermMonths(t)}
                          className={`rounded-xl py-3 text-center transition-all border ${
                            termMonths === t
                              ? 'bg-vsm-gold text-deep-navy font-bold border-vsm-gold shadow-lg shadow-vsm-gold/20'
                              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="text-base font-bold">{t}</div>
                          <div className="text-[10px] uppercase tracking-wider opacity-80">Months</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Disclosure Note */}
                  <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 text-[11px] leading-relaxed text-slate-400 flex items-start gap-2.5">
                    <Info size={15} className="text-vsm-gold shrink-0 mt-0.5" />
                    <span>
                      Rates are fixed at 18.0% annual interest amortized monthly per National Credit Act guidelines. Actual final approval depends on verified income and bank statements.
                    </span>
                  </div>
                </div>

                {/* Calculation Output Card (5 Cols) */}
                <div className="lg:col-span-5 rounded-2xl border border-vsm-gold/30 bg-gradient-to-b from-deep-navy to-[#0B1F3A] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-vsm-gold/5 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-vsm-gold">
                      Estimated Monthly Installment
                    </span>

                    <div className="mt-2 text-4xl font-extrabold text-white font-mono tracking-tight">
                      {formatCurrency(terms.monthlyInstalment)}
                      <span className="text-sm font-normal text-slate-400 font-sans ml-1">/ month</span>
                    </div>

                    <div className="mt-6 space-y-3 border-y border-white/10 py-5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Principal Facility:</span>
                        <span className="font-semibold text-white font-mono">{formatCurrency(amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Term:</span>
                        <span className="font-semibold text-white">{termMonths} Months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Annual Interest Rate:</span>
                        <span className="font-semibold text-emerald-400">18.0% p.a. (Fixed)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Interest:</span>
                        <span className="font-semibold text-slate-200 font-mono">{formatCurrency(terms.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/5 font-bold">
                        <span className="text-white">Total Amount Repayable:</span>
                        <span className="text-vsm-gold font-mono text-sm">{formatCurrency(terms.totalPayable)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link
                      href={`/loan-application-flow?amount=${amount}&term=${termMonths}&type=personal`}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-vsm-gold px-6 py-3.5 text-xs font-bold text-deep-navy shadow-lg shadow-vsm-gold/25 hover:bg-[#E7C766] transition-all"
                    >
                      Apply For This Facility <ArrowRight size={14} />
                    </Link>

                    <p className="mt-3 text-center text-[10px] text-slate-400">
                      No commitment required to simulate · Secure 256-bit encryption
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Application Tracker */}
            {activeTab === 'track' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <form onSubmit={handleLookup} className="flex gap-3">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      required
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      placeholder="Enter Reference (e.g. VSM-LN-9481) or Applicant Email"
                      className="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:border-vsm-gold focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-vsm-gold px-6 py-3 text-xs font-bold text-deep-navy hover:bg-[#E7C766] transition-all disabled:opacity-50"
                  >
                    {lookupLoading ? <Loader2 size={14} className="animate-spin" /> : 'Query'}
                  </button>
                </form>

                {/* Demo hints */}
                <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                  <span>Try reference hints:</span>
                  {['VSM-LN-9481', 'VSM-LN-7120', 'VSM-LN-5034'].map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      onClick={() => setLookupQuery(hint)}
                      className="rounded bg-white/5 px-2 py-0.5 text-vsm-gold hover:underline font-mono"
                    >
                      {hint}
                    </button>
                  ))}
                </div>

                {lookupError && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-300">
                    {lookupError}
                  </div>
                )}

                {lookupResult && (
                  <div className="rounded-2xl border border-white/10 bg-deep-navy p-6 shadow-xl space-y-5 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-vsm-gold">
                          Credit Assessment Record
                        </span>
                        <h4 className="text-xl font-bold text-white mt-0.5">
                          {lookupResult.applicantName}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">
                          Ref: {lookupResult.referenceNumber}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          lookupResult.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : lookupResult.status === 'Disbursed'
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : lookupResult.status === 'Under Review'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {lookupResult.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-white/[0.02] border border-white/5 p-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">FACILITY</span>
                        <span className="font-bold text-white mt-0.5 block">
                          {formatCurrency(lookupResult.amount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">TERM</span>
                        <span className="font-bold text-white mt-0.5 block">
                          {lookupResult.termMonths} Months
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">MONTHLY</span>
                        <span className="font-bold text-emerald-400 mt-0.5 block">
                          {formatCurrency(lookupResult.monthlyInstalment)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">OUTSTANDING</span>
                        <span className="font-bold text-vsm-gold mt-0.5 block">
                          {formatCurrency(lookupResult.balance)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                      <strong className="text-white block mb-1">Purpose / Notes:</strong>
                      {lookupResult.purpose}
                      {lookupResult.notes && (
                        <p className="mt-2 text-slate-400 italic">“{lookupResult.notes}”</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                      <span>Submitted: {formatDate(lookupResult.createdAt)}</span>
                      <Link
                        href="/portal"
                        className="text-vsm-gold hover:underline font-semibold flex items-center gap-1"
                      >
                        Open Client Portal <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* South African Regulatory & FAQ Section */}
        <section className="border-t border-white/10 bg-corporate-navy/20 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h3 className="text-2xl font-bold text-white">Responsible Credit Commitments</h3>
              <p className="mt-2 text-xs text-slate-400">
                Operating strictly within the National Credit Act (NCA) of South Africa.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <FileCheck2 size={22} className="text-vsm-gold mb-3" />
                <h4 className="text-sm font-bold text-white">No Early Settlement Penalties</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Pay off your event package or equipment loan ahead of schedule anytime without incurring cancellation or penalty fees.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <Lock size={22} className="text-vsm-gold mb-3" />
                <h4 className="text-sm font-bold text-white">Strict Affordability Checks</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  We verify your monthly income and living expenses to prevent reckless over-indebtedness, adhering to a 40% maximum DTI ratio.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <Coins size={22} className="text-vsm-gold mb-3" />
                <h4 className="text-sm font-bold text-white">Automated Clearing Bureau</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Debit orders are processed seamlessly on your chosen payday (e.g. 25th or month-end) through registered South African banks.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
