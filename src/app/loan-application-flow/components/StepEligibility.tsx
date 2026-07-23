'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowRight, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { LoanData } from './LoanWizard';

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
  'Wedding Photography Package',
  'Birthday Event Package',
  'Graduation Photography',
  'Corporate Event Coverage',
  'Funeral Coverage',
  'Groove / Party Event',
  'Personal Loan',
  'Other',
];

const INTEREST_RATE = 0.18;

function calcQualified(salary: number, expenses: number): number {
  const disposable = salary - expenses;
  const maxMonthly = disposable * 0.3;
  const months = 24;
  const r = INTEREST_RATE / 12;
  const principal = (maxMonthly * (Math.pow(1 + r, months) - 1)) / (r * Math.pow(1 + r, months));
  return Math.max(0, Math.floor(principal / 500) * 500);
}

export default function StepEligibility({ data, updateData, onNext, onBack }: Props) {
  const [result, setResult] = useState<number | null>(data.qualifiedAmount || null);
  const [selectedAmount, setSelectedAmount] = useState(data.loanAmount || 0);
  const [selectedTerm, setSelectedTerm] = useState(data.term || 6);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EligibilityForm>({
    defaultValues: {
      salary: data.salary || undefined,
      expenses: data.expenses || undefined,
      purpose: data.purpose || '',
    },
  });

  const salary = watch('salary');
  const expenses = watch('expenses');
  const disposable = (Number(salary) || 0) - (Number(expenses) || 0);
  const dtiRatio = salary > 0 ? (expenses / salary) * 100 : 0;

  const onCheck = (values: EligibilityForm) => {
    const qualified = calcQualified(Number(values.salary), Number(values.expenses));
    setResult(qualified);
    setSelectedAmount(Math.min(qualified, 14500));
    updateData({
      salary: Number(values.salary),
      expenses: Number(values.expenses),
      qualifiedAmount: qualified,
      purpose: values.purpose,
    });
  };

  const monthly = (() => {
    if (!selectedAmount || !selectedTerm) return 0;
    const r = INTEREST_RATE / 12;
    return (
      (selectedAmount * r * Math.pow(1 + r, selectedTerm)) / (Math.pow(1 + r, selectedTerm) - 1)
    );
  })();

  const canContinue = result !== null && selectedAmount > 0 && result > 0;

  const proceed = () => {
    updateData({ loanAmount: selectedAmount, term: selectedTerm });
    onNext();
  };

  const TERMS = [3, 6, 12, 18, 24];

  return (
    <div className="bg-card border border-border rounded-2xl p-7 lg:p-8">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-1">
          Check Your Eligibility
        </h2>
        <p className="text-sm text-foreground-muted">
          Enter your monthly income and expenses to get an instant estimate.
        </p>
      </div>

      <form onSubmit={handleSubmit(onCheck)} className="space-y-5 mb-6">
        <div>
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
            Gross Monthly Salary (ZAR) <span className="text-danger">*</span>
          </label>
          <p className="text-xs text-foreground-muted mb-1.5">
            Your total income before deductions
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
              placeholder="18 500"
              className="input-luxury w-full pl-8 pr-4 py-3 text-sm"
            />
          </div>
          {errors.salary && <p className="text-xs text-danger mt-1.5">{errors.salary.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
            Total Monthly Expenses (ZAR) <span className="text-danger">*</span>
          </label>
          <p className="text-xs text-foreground-muted mb-1.5">
            Rent, food, transport, existing loan repayments
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
              placeholder="11 200"
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
                  className={`h-1.5 rounded-full transition-all duration-300 ${dtiRatio > 70 ? 'bg-danger' : dtiRatio > 50 ? 'bg-warning' : 'progress-bar-gold'}`}
                  style={{ width: `${Math.min(100, dtiRatio)}%` }}
                />
              </div>
              <span
                className={`text-xs font-medium ${dtiRatio > 70 ? 'text-danger' : dtiRatio > 50 ? 'text-warning' : 'text-success'}`}
              >
                {dtiRatio.toFixed(0)}% DTI
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
            Loan Purpose <span className="text-danger">*</span>
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
          className="btn-gold w-full py-3.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2"
        >
          <TrendingUp size={15} />
          Check My Eligibility
        </button>
      </form>

      {/* Result */}
      {result !== null && (
        <div
          className={`rounded-xl border p-5 mb-6 ${result > 0 ? 'border-success/40 bg-success/5' : 'border-danger/40 bg-danger/5'}`}
        >
          {result > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-success" />
                <span className="text-sm font-semibold text-foreground">You pre-qualify!</span>
              </div>
              <p className="text-xs text-foreground-muted mb-4">
                Based on your income and expenses, you qualify for up to:
              </p>
              <div className="font-display text-4xl font-semibold text-gradient-gold counter-value mb-1">
                R {result.toLocaleString()}
              </div>
              <p className="text-xs text-foreground-muted mb-5">
                Maximum pre-approved amount · Subject to final review
              </p>

              {/* Amount Slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-foreground-muted mb-1.5">
                  <span>Loan Amount</span>
                  <span className="text-primary font-semibold counter-value">
                    R {selectedAmount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={result}
                  step={500}
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(Number(e.target.value))}
                  className="w-full accent-primary"
                  aria-label="Select loan amount"
                />
                <div className="flex justify-between text-[10px] text-foreground-muted mt-1">
                  <span>R 1,000</span>
                  <span>R {result.toLocaleString()}</span>
                </div>
              </div>

              {/* Term */}
              <div className="mb-5">
                <div className="text-xs text-foreground-muted mb-2">Repayment Term</div>
                <div className="flex gap-2">
                  {TERMS.map((t) => (
                    <button
                      key={`elig-term-${t}`}
                      type="button"
                      onClick={() => setSelectedTerm(t)}
                      className={`flex-1 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                        selectedTerm === t
                          ? 'bg-gold-gradient text-background font-semibold'
                          : 'bg-muted text-foreground-muted hover:text-foreground border border-border'
                      }`}
                    >
                      {t}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly */}
              <div className="bg-background rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-foreground-muted">Monthly Instalment</div>
                  <div className="font-display text-2xl font-semibold text-gradient-gold counter-value">
                    R {Math.ceil(monthly).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-foreground-muted">Total Repayable</div>
                  <div className="text-sm font-semibold text-foreground counter-value">
                    R {Math.ceil(monthly * selectedTerm).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 mt-3 p-3 bg-info/5 border border-info/20 rounded-lg">
                <Info size={13} className="text-info flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-foreground-muted leading-relaxed">
                  This is a pre-qualification estimate at 18% p.a. Final approval is subject to
                  credit checks and VSM&apos;s lending criteria.
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Unable to pre-qualify</p>
                <p className="text-xs text-foreground-muted">
                  Based on your current income and expenses, we&apos;re unable to offer a
                  pre-approval. Please reduce your expenses or contact us to explore options.
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
          className="btn-gold flex-1 py-3 text-sm font-semibold rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
