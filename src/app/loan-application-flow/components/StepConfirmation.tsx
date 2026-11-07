'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, MessageCircle, Mail, Clock, Phone } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import type { LoanData } from './LoanWizard';

import { calculateAmortization, formatZAR } from '@/lib/services/eligibility.engine';

interface Props {
  data: LoanData;
}

export default function StepConfirmation({ data }: Props) {
  const copyRef = () => {
    navigator.clipboard.writeText(data.referenceNumber);
    toast.success('Reference number copied');
  };

  const amort = calculateAmortization(data.loanAmount, data.term, 18.0);
  const monthly = amort.monthlyInstalment;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border rounded-2xl p-7 lg:p-8 text-center shadow-xl"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-success/10 border-2 border-success/40 flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle size={36} className="text-success" />
      </motion.div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-gold/30 text-primary text-xs font-semibold tracking-widest uppercase mb-3">
        Smart Financing Pre-Approval
      </div>

      <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
        Application Submitted!
      </h2>
      <p className="text-sm text-foreground-muted mb-6 max-w-md mx-auto leading-relaxed">
        Your loan application has been submitted to VSM Credit Underwriting. Our team will review your pre-approval within 24 business hours.
      </p>

      {/* Linked Booking Callout */}
      {data.linkedBookingRef && (
        <div className="bg-primary/10 border border-gold/50 rounded-xl p-4 mb-6 text-left flex items-center justify-between">
          <div>
            <span className="text-[10px] text-primary uppercase font-bold tracking-wider block">
              Linked Photography Booking
            </span>
            <span className="font-mono text-sm font-bold text-foreground">
              {data.linkedBookingRef}
            </span>
          </div>
          <Link
            href={`/track/${encodeURIComponent(data.linkedBookingRef)}?email=${encodeURIComponent(data.email)}`}
            className="btn-silver px-3 py-1.5 text-xs font-semibold rounded-md"
          >
            Track Event
          </Link>
        </div>
      )}

      {/* Reference Number */}
      <div className="bg-muted/40 border border-gold rounded-xl p-4 mb-6 inline-flex flex-col items-center w-full max-w-sm mx-auto">
        <span className="text-xs font-semibold text-foreground-muted tracking-widest uppercase mb-2">
          Loan Reference Number
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl font-bold text-gradient-gold tracking-widest">
            {data.referenceNumber}
          </span>
          <button
            onClick={copyRef}
            className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors"
            title="Copy reference number"
          >
            <Copy size={14} className="text-foreground-muted hover:text-primary" />
          </button>
        </div>
        <span className="text-xs text-foreground-muted mt-1">
          Save this reference to track your financing status
        </span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6 text-left">
        {[
          { label: 'Applicant', value: `${data.firstName} ${data.lastName}` },
          { label: 'Loan Amount', value: formatZAR(data.loanAmount) },
          { label: 'Monthly Instalment', value: `${formatZAR(monthly)}/mo` },
          { label: 'Repayment Term', value: `${data.term} months` },
        ].map((item) => (
          <div key={`conf-${item.label}`} className="bg-muted/30 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-foreground-muted tracking-wide uppercase mb-0.5">
              {item.label}
            </div>
            <div className="text-sm font-semibold text-foreground counter-value">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="text-left mb-6">
        <h3 className="text-xs font-semibold text-foreground-muted tracking-widest uppercase mb-3">
          What Happens Next
        </h3>
        <div className="space-y-3">
          {[
            { icon: Clock, text: 'Our credit team reviews your pre-approval within 24 business hours', step: '01' },
            { icon: Phone, text: 'We may contact you to verify bank statements or employment', step: '02' },
            { icon: Mail, text: 'Official loan agreement is sent for digital signature via SMS/Email', step: '03' },
            { icon: CheckCircle, text: 'Once approved, your photography event date is locked in!', step: '04' },
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
          href={`/portal?email=${encodeURIComponent(data.email)}`}
          className="btn-gold flex-1 py-3 text-sm font-semibold rounded-md flex items-center justify-center gap-2 shadow-lg"
        >
          View in Customer Portal
        </Link>
        {data.linkedBookingRef ? (
          <Link
            href={`/track/${encodeURIComponent(data.linkedBookingRef)}?email=${encodeURIComponent(data.email)}`}
            className="btn-silver flex-1 py-3 text-sm font-medium rounded-md flex items-center justify-center gap-2"
          >
            Track Booking
          </Link>
        ) : (
          <Link
            href="/"
            className="btn-silver flex-1 py-3 text-sm font-medium rounded-md flex items-center justify-center gap-2"
          >
            Back to Home
          </Link>
        )}
      </div>

      <p className="text-xs text-foreground-muted mt-4">
        Confirmation sent to <span className="text-foreground">{data.email}</span> and <span className="text-foreground">{data.phone}</span>
      </p>
    </motion.div>
  );
}