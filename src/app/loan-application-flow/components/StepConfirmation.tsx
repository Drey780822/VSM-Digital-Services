'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, MessageCircle, Mail, Clock, Phone } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import type { LoanData } from './LoanWizard';

interface Props {
  data: LoanData;
}

export default function StepConfirmation({ data }: Props) {
  const copyRef = () => {
    navigator.clipboard.writeText(data.referenceNumber);
    toast.success('Reference number copied');
  };

  const INTEREST_RATE = 0.18;
  const monthly = (() => {
    if (!data.loanAmount || !data.term) return 0;
    const r = INTEREST_RATE / 12;
    return (data.loanAmount * r * Math.pow(1 + r, data.term)) / (Math.pow(1 + r, data.term) - 1);
  })();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border rounded-2xl p-7 lg:p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-success/10 border-2 border-success/40 flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle size={36} className="text-success" />
      </motion.div>

      <h2 className="font-display text-3xl font-semibold text-foreground mb-2">Application Submitted!</h2>
      <p className="text-sm text-foreground-muted mb-6 max-w-md mx-auto leading-relaxed">
        Your loan application has been received. Our team will review it within 24–48 business hours and contact you via email and SMS.
      </p>

      {/* Reference Number */}
      <div className="bg-muted/40 border border-gold rounded-xl p-4 mb-6 inline-flex flex-col items-center w-full max-w-sm mx-auto">
        <span className="text-xs font-semibold text-foreground-muted tracking-widest uppercase mb-2">Application Reference</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl font-bold text-gradient-gold tracking-widest">{data.referenceNumber}</span>
          <button
            onClick={copyRef}
            className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors"
            title="Copy reference number"
          >
            <Copy size={14} className="text-foreground-muted hover:text-primary" />
          </button>
        </div>
        <span className="text-xs text-foreground-muted mt-1">Save this reference — you&apos;ll need it to track your application</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6 text-left">
        {[
          { label: 'Applicant', value: `${data.firstName} ${data.lastName}` },
          { label: 'Loan Amount', value: `R ${data.loanAmount.toLocaleString()}` },
          { label: 'Monthly Instalment', value: `R ${Math.ceil(monthly).toLocaleString()}` },
          { label: 'Repayment Term', value: `${data.term} months` },
        ].map((item) => (
          <div key={`conf-${item.label}`} className="bg-muted/30 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-foreground-muted tracking-wide uppercase mb-0.5">{item.label}</div>
            <div className="text-sm font-semibold text-foreground counter-value">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="text-left mb-6">
        <h3 className="text-xs font-semibold text-foreground-muted tracking-widest uppercase mb-3">What Happens Next</h3>
        <div className="space-y-3">
          {[
            { icon: Clock, text: 'Our credit team reviews your application within 24–48 business hours', step: '01' },
            { icon: Phone, text: 'You may be contacted for additional documentation or verification', step: '02' },
            { icon: Mail, text: 'A final decision is sent to your email with your loan agreement', step: '03' },
            { icon: CheckCircle, text: 'Once signed, funds are disbursed within 1 business day', step: '04' },
          ].map((item) => (
            <div key={`step-${item.step}`} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <item.icon size={13} className="text-primary" />
              </div>
              <p className="text-xs text-foreground-muted leading-relaxed pt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="btn-silver flex-1 py-3 text-sm font-medium rounded-md flex items-center justify-center gap-2"
        >
          Back to Home
        </Link>
        <a
          href="https://wa.me/27000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 text-sm font-semibold rounded-md flex items-center justify-center gap-2 bg-success/10 border border-success/30 text-success hover:bg-success/20 transition-colors"
        >
          <MessageCircle size={15} />
          WhatsApp Us
        </a>
      </div>

      <p className="text-xs text-foreground-muted mt-4">
        Confirmation sent to <span className="text-foreground">{data.email}</span> and <span className="text-foreground">{data.phone}</span>
      </p>
    </motion.div>
  );
}