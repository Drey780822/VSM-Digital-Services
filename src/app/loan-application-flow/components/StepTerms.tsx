'use client';
import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, FileText, CreditCard, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { LoanData } from './LoanWizard';

interface Props {
  data: LoanData;
  updateData: (u: Partial<LoanData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const INTEREST_RATE = 0.18;

function generateRef(): string {
  return `VSC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function StepTerms({ data, updateData, onNext, onBack }: Props) {
  const [termsAccepted, setTermsAccepted] = useState(data.termsAccepted);
  const [debitAccepted, setDebitAccepted] = useState(data.debitOrderAccepted);
  const [submitting, setSubmitting] = useState(false);

  const monthly = (() => {
    if (!data.loanAmount || !data.term) return 0;
    const r = INTEREST_RATE / 12;
    return (data.loanAmount * r * Math.pow(1 + r, data.term)) / (Math.pow(1 + r, data.term) - 1);
  })();

  const totalRepay = monthly * data.term;
  const totalInterest = totalRepay - data.loanAmount;

  const canSubmit = termsAccepted && debitAccepted;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    updateData({ termsAccepted: true, debitOrderAccepted: true });
    // Backend integration point: submit loan application to Supabase, trigger admin notification
    setTimeout(() => {
      const ref = generateRef();
      updateData({ referenceNumber: ref });
      setSubmitting(false);
      toast.success('Application submitted successfully!');
      onNext();
    }, 2000);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-7 lg:p-8">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Terms & Debit Order</h2>
        <p className="text-sm text-foreground-muted">Review your loan summary and authorise the debit order before submitting.</p>
      </div>

      {/* Loan Summary */}
      <div className="bg-muted/40 border border-border rounded-xl p-5 mb-6">
        <h3 className="text-xs font-semibold text-foreground-muted tracking-widest uppercase mb-4">Loan Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Applicant', value: `${data.firstName} ${data.lastName}` },
            { label: 'Purpose', value: data.purpose },
            { label: 'Loan Amount', value: `R ${data.loanAmount.toLocaleString()}` },
            { label: 'Term', value: `${data.term} months` },
            { label: 'Monthly Instalment', value: `R ${Math.ceil(monthly).toLocaleString()}` },
            { label: 'Total Interest', value: `R ${Math.ceil(totalInterest).toLocaleString()}` },
            { label: 'Total Repayable', value: `R ${Math.ceil(totalRepay).toLocaleString()}` },
            { label: 'Interest Rate', value: '18% p.a.' },
          ].map((item) => (
            <div key={`summary-${item.label}`}>
              <div className="text-[10px] font-semibold text-foreground-muted tracking-wide uppercase mb-0.5">{item.label}</div>
              <div className="text-sm font-semibold text-foreground counter-value">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-info/5 border border-info/20 rounded-lg flex items-start gap-2">
          <AlertTriangle size={13} className="text-warning flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-foreground-muted leading-relaxed">
            A 5% late payment penalty applies to overdue instalments. Debit order runs on the 1st of each month. Missed payments are reported to the NCR.
          </p>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={14} className="text-primary" />
          <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Terms & Conditions</span>
        </div>
        <div className="bg-muted/30 border border-border rounded-xl p-4 h-40 overflow-y-auto text-xs text-foreground-muted leading-relaxed mb-3 space-y-2">
          <p><strong className="text-foreground">1. Loan Agreement.</strong> This agreement is between the Applicant and VSCOBAR Financial Services (Pty) Ltd, a registered credit provider under the National Credit Act (NCA) of South Africa.</p>
          <p><strong className="text-foreground">2. Interest Rate.</strong> The annual interest rate is 18% per annum, calculated monthly on the reducing balance. The initiation fee is included in the total cost of credit disclosed.</p>
          <p><strong className="text-foreground">3. Repayment.</strong> Monthly instalments are due on the 1st of each calendar month via debit order. The applicant authorises VSCOBAR to debit the stated bank account for the agreed instalment amount.</p>
          <p><strong className="text-foreground">4. Late Payment.</strong> A penalty of 5% of the overdue amount will be charged for any instalment not received within 5 business days of the due date. Persistent non-payment may result in legal action and credit bureau reporting.</p>
          <p><strong className="text-foreground">5. Privacy.</strong> Your personal information is processed in accordance with the Protection of Personal Information Act (POPIA). We will not sell or share your data with third parties without your consent.</p>
          <p><strong className="text-foreground">6. Cancellation.</strong> You may cancel this agreement within 5 business days of signing without penalty. After this cooling-off period, early settlement is allowed with a settlement fee equivalent to one month&apos;s instalment.</p>
        </div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => setTermsAccepted((v) => !v)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 cursor-pointer ${
              termsAccepted ? 'bg-gold-gradient border-primary' : 'border-border bg-muted group-hover:border-primary/50'
            }`}
          >
            {termsAccepted && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#0B0B0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-xs text-foreground-muted leading-relaxed">
            I have read, understood, and agree to the <span className="text-primary">Terms and Conditions</span> and the <span className="text-primary">National Credit Act</span> disclosures above. <span className="text-danger">*</span>
          </span>
        </label>
      </div>

      {/* Debit Order */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={14} className="text-primary" />
          <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Debit Order Authorisation</span>
        </div>
        <div className="bg-muted/30 border border-border rounded-xl p-4 mb-3">
          <p className="text-xs text-foreground-muted leading-relaxed">
            I, <span className="text-foreground font-semibold">{data.firstName} {data.lastName}</span>, hereby authorise VSCOBAR Financial Services (Pty) Ltd to debit my{' '}
            <span className="text-foreground font-semibold">{data.bankName || 'selected bank'}</span> account{' '}
            <span className="text-foreground font-mono">{data.accountNumber || '—'}</span> with{' '}
            <span className="text-primary font-semibold">R {Math.ceil(monthly).toLocaleString()}</span> on the 1st of each month for{' '}
            <span className="text-primary font-semibold">{data.term} months</span>, commencing on the 1st of the month following loan approval.
          </p>
        </div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => setDebitAccepted((v) => !v)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 cursor-pointer ${
              debitAccepted ? 'bg-gold-gradient border-primary' : 'border-border bg-muted group-hover:border-primary/50'
            }`}
          >
            {debitAccepted && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#0B0B0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-xs text-foreground-muted leading-relaxed">
            I authorise the debit order as described above and confirm that I am the account holder of the stated bank account. <span className="text-danger">*</span>
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="btn-silver flex-1 py-3 text-sm font-medium rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="btn-gold flex-1 py-3 text-sm font-semibold rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <><Loader2 size={15} className="animate-spin" /> Submitting...</>
          ) : (
            <>Submit Application <ArrowRight size={15} /></>
          )}
        </button>
      </div>
    </div>
  );
}