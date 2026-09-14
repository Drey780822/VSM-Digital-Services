'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { BookingFormData } from '@/lib/bookings/types';

interface Props {
  data: BookingFormData;
}

export default function StepBookingConfirmation({ data }: Props) {
  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const trackUrl = `/track/${encodeURIComponent(data.referenceNumber)}?email=${encodeURIComponent(data.email)}`;

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

      <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
        Booking Submitted!
      </h2>
      <p className="text-sm text-foreground-muted mb-6 max-w-md mx-auto leading-relaxed">
        Your event booking request has been received. Vincent will review it and contact you within
        24–48 hours to confirm availability and next steps.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/40 border border-gold rounded-xl p-4">
          <span className="text-xs font-semibold text-foreground-muted tracking-widest uppercase">
            Reference Number
          </span>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="font-mono text-lg font-bold text-gradient-gold">
              {data.referenceNumber}
            </span>
            <button
              onClick={() => copy(data.referenceNumber, 'Reference number')}
              className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center"
              title="Copy reference"
            >
              <Copy size={14} className="text-foreground-muted" />
            </button>
          </div>
        </div>

        <div className="bg-muted/40 border border-border rounded-xl p-4">
          <span className="text-xs font-semibold text-foreground-muted tracking-widest uppercase">
            Tracking Number
          </span>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="font-mono text-lg font-bold text-foreground">
              {data.trackingNumber}
            </span>
            <button
              onClick={() => copy(data.trackingNumber, 'Tracking number')}
              className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center"
              title="Copy tracking number"
            >
              <Copy size={14} className="text-foreground-muted" />
            </button>
          </div>
        </div>
      </div>

      <div className="text-left mb-6 bg-muted/30 rounded-xl p-4 space-y-2">
        <h3 className="text-xs font-semibold text-foreground-muted tracking-widest uppercase mb-2">
          What Happens Next
        </h3>
        {[
          'Vincent reviews your booking request',
          'You receive approval or follow-up questions',
          'Event is scheduled and confirmed',
          'After your event, photos are uploaded to your Memory Vault',
        ].map((step, i) => (
          <div key={step} className="flex items-start gap-3">
            <span className="text-[10px] font-bold text-primary mt-0.5">
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="text-xs text-foreground-muted">{step}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={trackUrl}
          className="btn-gold flex-1 py-3 text-sm font-semibold rounded-md flex items-center justify-center gap-2"
        >
          <ExternalLink size={15} />
          Track My Booking
        </Link>
        <Link
          href="/"
          className="btn-silver flex-1 py-3 text-sm font-medium rounded-md flex items-center justify-center"
        >
          Back to Home
        </Link>
      </div>

      <p className="text-xs text-foreground-muted mt-4">
        Confirmation details sent to{' '}
        <span className="text-foreground">{data.email}</span>
      </p>
    </motion.div>
  );
}
