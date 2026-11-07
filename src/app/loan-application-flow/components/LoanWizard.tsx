'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StepVerification from './StepVerification';
import StepEligibility from './StepEligibility';
import StepPersonalDetails from './StepPersonalDetails';
import StepTerms from './StepTerms';
import StepConfirmation from './StepConfirmation';
import { CheckCircle } from 'lucide-react';

const STEPS = [
  { id: 'step-verify', number: 1, label: 'Verify Identity' },
  { id: 'step-eligibility', number: 2, label: 'Eligibility' },
  { id: 'step-details', number: 3, label: 'Your Details' },
  { id: 'step-terms', number: 4, label: 'Terms & Debit Order' },
  { id: 'step-confirm', number: 5, label: 'Confirmation' },
];

export interface LoanData {
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  salary: number;
  expenses: number;
  qualifiedAmount: number;
  loanAmount: number;
  term: number;
  purpose: string;
  loanType: 'photography' | 'personal';
  linkedBookingId?: string;
  linkedBookingRef?: string;
  packageSlug?: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  employer: string;
  employmentType: string;
  bankName: string;
  accountNumber: string;
  termsAccepted: boolean;
  debitOrderAccepted: boolean;
  referenceNumber: string;
}

interface InitialParams {
  package?: string;
  amount?: string;
  term?: string;
  bookingId?: string;
  bookingRef?: string;
  name?: string;
  email?: string;
  phone?: string;
  idNumber?: string;
  type?: string;
}

interface Props {
  initialParams?: InitialParams;
}

function buildInitialLoanData(params?: InitialParams): LoanData {
  const nameParts = (params?.name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const amount = Number(params?.amount) || 0;
  const term = Number(params?.term) || 6;
  const isPhotography = Boolean(params?.package || params?.bookingId || params?.type === 'photography');

  return {
    email: params?.email || '',
    phone: params?.phone || '',
    emailVerified: Boolean(params?.email),
    phoneVerified: Boolean(params?.phone),
    verificationStatus: 'unverified',
    salary: 0,
    expenses: 0,
    qualifiedAmount: amount > 0 ? amount : 0,
    loanAmount: amount,
    term: term > 0 ? term : 6,
    purpose: params?.package
      ? `Photography Package Financing: ${params.package}`
      : isPhotography
      ? 'Photography & Videography Financing'
      : 'Personal Loan',
    loanType: isPhotography ? 'photography' : 'personal',
    linkedBookingId: params?.bookingId || undefined,
    linkedBookingRef: params?.bookingRef || undefined,
    packageSlug: params?.package || undefined,
    firstName,
    lastName,
    idNumber: params?.idNumber || '',
    employer: '',
    employmentType: 'Full-Time',
    bankName: 'Standard Bank',
    accountNumber: '',
    termsAccepted: false,
    debitOrderAccepted: false,
    referenceNumber: '',
  };
}

export default function LoanWizard({ initialParams }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<LoanData>(() => buildInitialLoanData(initialParams));

  const updateData = (updates: Partial<LoanData>) => setData((d) => ({ ...d, ...updates }));

  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div>
      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                  step > s.number
                    ? 'bg-gold-gradient border-primary text-background'
                    : step === s.number
                    ? 'bg-background border-primary text-primary glow-gold' :'bg-muted border-border text-foreground-muted'
                }`}>
                  {step > s.number ? <CheckCircle size={16} /> : s.number}
                </div>
                <span className={`text-[10px] font-medium tracking-wide hidden sm:block ${
                  step >= s.number ? 'text-foreground' : 'text-foreground-muted'
                }`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${
                  step > s.number ? 'bg-gold-gradient' : 'bg-border'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="w-full bg-muted rounded-full h-1">
          <div
            className="bg-gold-gradient h-1 rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-foreground-muted">Step {step} of {STEPS.length}</span>
          <span className="text-xs text-primary font-medium">{STEPS[step - 1].label}</span>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`wizard-step-${step}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {step === 1 && <StepVerification data={data} updateData={updateData} onNext={next} />}
          {step === 2 && <StepEligibility data={data} updateData={updateData} onNext={next} onBack={back} />}
          {step === 3 && <StepPersonalDetails data={data} updateData={updateData} onNext={next} onBack={back} />}
          {step === 4 && <StepTerms data={data} updateData={updateData} onNext={next} onBack={back} />}
          {step === 5 && <StepConfirmation data={data} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}