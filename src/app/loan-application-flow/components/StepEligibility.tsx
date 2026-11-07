'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { LoanData } from './LoanWizard';
import {
  calculateEligibility,
  calculateAmortization,
  formatZAR,
  DEFAULT_LENDING_CONFIG,
  type EligibilityResult,
} from '@/lib/services/eligibility.engine';

interface Props {
  data: LoanData;
  updateData: (u: Partial<LoanData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface EligibilityForm {
  salary: number;
  expenses: number;
  purpose: string;
}

const LOAN_PURPOSES = [
  'Essential Memories Photography Package',
  'Cinematic Experience Photography & Video Package',
  'Legacy Collection Luxury Production',
  'Wedding Photography Package',
  'Birthday Event Package',
  'Graduation Photography',
  'Corporate Event Coverage',
  'Funeral Coverage',
  'Groove / Party Event',
  'Personal Loan',
  'Other',
];

export default function StepEligibility({ data, updateData, onNext, onBack }: Props) {
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(data.loanAmount || 5500);
  const [selectedTerm, setSelectedTerm] = useState<number>(data.term || 6);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EligibilityForm>({
    defaultValues: {
      salary: data.salary || undefined,
      expenses: data.expenses || undefined,
      purpose: data.purpose || (data.packageSlug ? `Photography Package: ${data.packageSlug}` : 'Photography Financing'),
    },
  });

  const salary = watch('salary');
  const expenses = watch('expenses');
  const dtiRatio = salary > 0 ? (expenses / salary) * 100 : 0;

  const onCheck = (values: EligibilityForm) => {
    const numSalary = Number(values.salary);
    const numExpenses = Number(values.expenses);

    const result = calculateEligibility({
      salary: numSalary,
      expenses: numExpenses,
      requestedAmount: selectedAmount,
      termMonths: selectedTerm,
      loanPurpose: values.purpose,
    });

    setEligibilityResult(result);

    const initialAmount = data.loanAmount > 0
      ? Math.min(data.loanAmount, result.maxQualifiedAmount)
      : Math.min(result.recommendedAmount, result.maxQualifiedAmount);

    setSelectedAmount(initialAmount > 0 ? initialAmount : 1000);

    updateData({
      salary: numSalary,
      expenses: numExpenses,
      qualifiedAmount: result.maxQualifiedAmount,
      purpose: values.purpose,
      loanAmount: initialAmount,
    });
  };

  const amortization = calculateAmortization(
    selectedAmount,
    selectedTerm,
    DEFAULT_LENDING_CONFIG.annualInterestRate
  );

  const canContinue = eligibilityResult?.isEligible && selectedAmount > 0;

  const proceed = () => {
    updateData({ loanAmount: selectedAmount, term: selectedTerm });
    onNext();
  };

  const TERMS = DEFAULT_LENDING_CONFIG.allowedTerms;

  return (
    <div className="bg-card border border-border rounded-2xl p-7 lg:p-8 shadow-xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary">
            Two Services · One Platform
          </p>
          {data.linkedBookingRef && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 border border-gold/30 text-primary">
              <Sparkles size={12} />
              Package Loan: {data.linkedBookingRef}
            </span>
          )}
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-1">
          Affordability & Credit Assessment
        </h2>
        <p className="text-sm text-foreground-muted">
          Our automated credit underwriting engine checks debt-to-income (DTI) affordability under National Credit Act regulations.
        </p>
      </div>

      <form onSubmit={handleSubmit(onCheck)} className="space-y-5 mb-6">
        <div>
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
            Gross Monthly Salary (ZAR) <span className="text-danger">*</span>
          </label>
          <p className="text-xs text-foreground-muted mb-1.5">
            Your regular verified income before tax and deductions
          </p>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted font-medium text-sm">
              R
            </span>
            <input
              {...register('salary', {
                required: 'Salary is required',
                min: { value: 3000, message: 'Minimum qualifying salary is R 3,000' },
                max: { value: 500000, message: 'Please contact us for amounts over R 500,000' },
              })}
              type="number"
              placeholder="18500"
              className="input-luxury w-full pl-8 pr-4 py-3 text-sm"
            />
          </div>
          {errors.salary && <p className="text-xs text-danger mt-1.5">{errors.salary.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
            Total Monthly Living Expenses & Debt (ZAR) <span className="text-danger">*</span>
          </label>
          <p className="text-xs text-foreground-muted mb-1.5">
            Rent, utilities, groceries, transport, and existing debt commitments
          </p>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted font-medium text-sm">
              R
            </span>
            <input
              {...register('expenses', {
                required: 'Expenses are required',
                min: { value: 0, message: 'Expenses cannot be negative' },
              })}
              type="number"
              placeholder="9500"
              className="input-luxury w-full pl-8 pr-4 py-3 text-sm"
            />
          </div>
          {errors.expenses && (
            <p className="text-xs text-danger mt-1.5">{errors.expenses.message}</p>
          )}
          {salary > 0 && expenses > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dtiRatio > 70 ? 'bg-danger' : dtiRatio > 50 ? 'bg-warning' : 'progress-bar-gold'
                  }`}
                  style={{ width: `${Math.min(100, dtiRatio)}%` }}
                />
              </div>
              <span
                className={`text-xs font-medium ${
                  dtiRatio > 70 ? 'text-danger' : dtiRatio > 50 ? 'text-warning' : 'text-success'
                }`}
              >
                {dtiRatio.toFixed(0)}% DTI
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
            Financing Purpose <span className="text-danger">*</span>
          </label>
          <select
            {...register('purpose', { required: 'Please select a purpose' })}
            className="input-luxury w-full px-4 py-3 text-sm appearance-none"
          >
            <option value="">Select purpose...</option>
            {LOAN_PURPOSES.map((p) => (
              <option key={`purpose-${p}`} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.purpose && <p className="text-xs text-danger mt-1.5">{errors.purpose.message}</p>}
        </div>

        <button
          type="submit"
          className="btn-gold w-full py-3.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 shadow-lg"
        >
          <TrendingUp size={15} />
          Evaluate Affordability & Pre-Qualify
        </button>
      </form>

      {/* Result Card */}
      {eligibilityResult !== null && (
        <div
          className={`rounded-xl border p-5 mb-6 ${
            eligibilityResult.isEligible
              ? 'border-success/40 bg-success/5 shadow-md'
              : 'border-danger/40 bg-danger/5'
          }`}
        >
          {eligibilityResult.isEligible ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-success" />
                  <span className="text-sm font-semibold text-foreground">Pre-Qualification Approved!</span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    eligibilityResult.riskCategory === 'Low'
                      ? 'bg-success/20 text-success border-success/40'
                      : eligibilityResult.riskCategory === 'Medium'
                      ? 'bg-warning/20 text-warning border-warning/40'
                      : 'bg-danger/20 text-danger border-danger/40'
                  }`}
                >
                  {eligibilityResult.riskCategory} Risk
                </span>
              </div>

              <p className="text-xs text-foreground-muted mb-3">
                Based on your net disposable income of{' '}
                <strong className="text-foreground">{formatZAR(eligibilityResult.disposableIncome)}</strong>, you qualify for up to:
              </p>

              <div className="font-display text-4xl font-bold text-gradient-gold counter-value mb-1">
                {formatZAR(eligibilityResult.maxQualifiedAmount)}
              </div>
              <p className="text-[11px] text-foreground-muted mb-5">
                Calculated with 35% disposable income cap under NCA affordability rules
              </p>

              {/* Amount Slider */}
              <div className="mb-5 p-4 rounded-xl bg-card border border-border">
                <div className="flex justify-between text-xs text-foreground-muted mb-1.5">
                  <span className="font-medium">Selected Loan Amount</span>
                  <span className="text-primary font-bold text-sm counter-value">
                    {formatZAR(selectedAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={Math.max(1000, eligibilityResult.maxQualifiedAmount)}
                  step={500}
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(Number(e.target.value))}
                  className="w-full accent-primary"
                  aria-label="Select loan amount"
                />
                <div className="flex justify-between text-[10px] text-foreground-muted mt-1">
                  <span>R 1,000</span>
                  <span>{formatZAR(eligibilityResult.maxQualifiedAmount)}</span>
                </div>
              </div>

              {/* Term Selection */}
              <div className="mb-5">
                <div className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
                  Repayment Term:
                </div>
                <div className="flex gap-2">
                  {TERMS.map((t) => (
                    <button
                      key={`elig-term-${t}`}
                      type="button"
                      onClick={() => setSelectedTerm(t)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        selectedTerm === t
                          ? 'bg-gold-gradient text-background shadow-md'
                          : 'bg-muted text-foreground-muted hover:text-foreground border border-border'
                      }`}
                    >
                      {t} mo
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Repayment Breakdown */}
              <div className="bg-background rounded-xl p-4 border border-border/80 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-foreground-muted">Monthly Instalment</div>
                  <div className="font-display text-2xl font-bold text-gradient-gold counter-value">
                    {formatZAR(amortization.monthlyInstalment)}
                  </div>
                  <div className="text-[10px] text-foreground-muted mt-0.5">Fixed interest 18% p.a.</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-foreground-muted">Total Repayable ({selectedTerm}m)</div>
                  <div className="text-base font-bold text-foreground counter-value">
                    {formatZAR(amortization.totalPayable)}
                  </div>
                  <div className="text-[10px] text-foreground-muted mt-0.5">
                    Total interest: {formatZAR(amortization.totalInterest)}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 mt-3 p-3 bg-info/5 border border-info/20 rounded-lg">
                <Info size={13} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-foreground-muted leading-relaxed">
                  {eligibilityResult.disclaimer}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Affordability Threshold Not Met</p>
                <p className="text-xs text-foreground-muted leading-relaxed mb-2">
                  {eligibilityResult.reasons.join('. ')}
                </p>
                <p className="text-[11px] text-foreground-muted">
                  Under the National Credit Act, credit providers may not grant credit that causes over-indebtedness. Consider selecting an extended term or contacting Vincent directly to discuss tailored packages.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="btn-silver flex-1 py-3 text-sm font-medium rounded-md flex items-center justify-center gap-2"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <button
          type="button"
          onClick={proceed}
          disabled={!canContinue}
          className="btn-gold flex-1 py-3 text-sm font-semibold rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Continue to Personal Details
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
