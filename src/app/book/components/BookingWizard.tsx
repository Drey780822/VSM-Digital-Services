'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import type { BookingFormData } from '@/lib/bookings/types';
import { getPackageBySlug } from '@/lib/bookings/constants';
import StepCustomerInfo from './StepCustomerInfo';
import StepEventInfo from './StepEventInfo';
import StepPackageInfo from './StepPackageInfo';
import StepReviewSubmit from './StepReviewSubmit';
import StepBookingConfirmation from './StepBookingConfirmation';

const STEPS = [
  { id: 'step-customer', number: 1, label: 'Your Details' },
  { id: 'step-event', number: 2, label: 'Event Info' },
  { id: 'step-package', number: 3, label: 'Package' },
  { id: 'step-review', number: 4, label: 'Review' },
  { id: 'step-confirm', number: 5, label: 'Confirmed' },
];

function buildInitialData(packageSlug?: string, initialMode: 'direct' | 'finance' = 'direct'): BookingFormData {
  const pkg = packageSlug ? getPackageBySlug(packageSlug) : undefined;
  return {
    fullName: '',
    email: '',
    phone: '',
    idNumber: '',
    eventType: '',
    eventDate: '',
    eventTime: '',
    venueName: '',
    venueAddress: '',
    guestCount: 50,
    packageId: pkg?.id ?? '',
    packageName: pkg?.name ?? '',
    packagePrice: pkg?.price ?? 0,
    addons: [],
    notes: '',
    referenceNumber: '',
    trackingNumber: '',
    bookingId: '',
    paymentPreference: initialMode,
    financeTerm: 6,
  };
}

interface Props {
  initialPackage?: string;
  initialMode?: 'direct' | 'finance';
}

const DRAFT_KEY = 'vsm_booking_draft_v1';

export default function BookingWizard({ initialPackage, initialMode = 'direct' }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<BookingFormData>(() => {
    const initial = buildInitialData(initialPackage, initialMode);
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...initial, ...parsed };
        }
      } catch {
        // ignore
      }
    }
    return initial;
  });

  const updateData = (updates: Partial<BookingFormData>) => {
    setData((current) => {
      const nextData = { ...current, ...updates };
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify(nextData));
        } catch {
          // ignore
        }
      }
      return nextData;
    });
  };

  const next = () => {
    setStep((s) => {
      const nextStep = Math.min(5, s + 1);
      if (nextStep === 5 && typeof window !== 'undefined') {
        sessionStorage.removeItem(DRAFT_KEY);
      }
      return nextStep;
    });
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                    step > s.number
                      ? 'bg-gold-gradient border-primary text-background'
                      : step === s.number
                        ? 'bg-background border-primary text-primary glow-gold'
                        : 'bg-muted border-border text-foreground-muted'
                  }`}
                >
                  {step > s.number ? <CheckCircle size={16} /> : s.number}
                </div>
                <span
                  className={`text-[10px] font-medium tracking-wide hidden sm:block ${
                    step >= s.number ? 'text-foreground' : 'text-foreground-muted'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${
                    step > s.number ? 'bg-gold-gradient' : 'bg-border'
                  }`}
                />
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
          <span className="text-xs text-foreground-muted">
            Step {step} of {STEPS.length}
          </span>
          <span className="text-xs text-primary font-medium">{STEPS[step - 1].label}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`booking-step-${step}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {step === 1 && (
            <StepCustomerInfo data={data} updateData={updateData} onNext={next} />
          )}
          {step === 2 && (
            <StepEventInfo data={data} updateData={updateData} onNext={next} onBack={back} />
          )}
          {step === 3 && (
            <StepPackageInfo data={data} updateData={updateData} onNext={next} onBack={back} />
          )}
          {step === 4 && (
            <StepReviewSubmit data={data} updateData={updateData} onNext={next} onBack={back} />
          )}
          {step === 5 && <StepBookingConfirmation data={data} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
