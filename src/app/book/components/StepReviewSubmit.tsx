'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle, ShieldAlert, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { calculateBookingTotal } from '@/lib/bookings/constants';
import { createBooking } from '@/lib/bookings/service';
import type { BookingFormData, EventType } from '@/lib/bookings/types';

interface Props {
  data: BookingFormData;
  updateData: (u: Partial<BookingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepReviewSubmit({ data, updateData, onNext, onBack }: Props) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = calculateBookingTotal(data.packagePrice, data.addons);

  const handleSubmit = async () => {
    if (!user) {
      setError('Please sign in or create an account before submitting your booking.');
      toast.error('Please sign in before submitting your booking.');
      router.push('/auth/login?redirect=/book');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const isFinanced = data.paymentPreference === 'finance';
      const booking = await createBooking({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        idNumber: data.idNumber,
        eventType: data.eventType as EventType,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        guestCount: data.guestCount,
        packageId: data.packageId,
        packageName: data.packageName,
        packagePrice: data.packagePrice,
        addons: data.addons,
        notes: data.notes || undefined,
        financed: isFinanced,
        paymentPreference: data.paymentPreference,
        financeTerm: data.financeTerm,
      });

      updateData({
        referenceNumber: booking.referenceNumber,
        trackingNumber: booking.trackingNumber,
        bookingId: booking.id,
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'vsm-track-session',
          JSON.stringify({ email: data.email, reference: booking.referenceNumber, bookingId: booking.id })
        );
      }

      toast.success(
        isFinanced
          ? 'Booking registered! Now let’s set up your Smart Financing.'
          : 'Booking submitted successfully!'
      );
      onNext();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to submit booking. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isFinanced = data.paymentPreference === 'finance';
  const summaryRows = [
    { label: 'Name', value: data.fullName },
    { label: 'Email', value: data.email },
    { label: 'Phone', value: data.phone },
    { label: 'ID Number', value: data.idNumber },
    { label: 'Event Type', value: data.eventType },
    {
      label: 'Event Date & Time',
      value: `${data.eventDate} at ${data.eventTime}`,
    },
    { label: 'Venue', value: data.venueName },
    { label: 'Address', value: data.venueAddress },
    { label: 'Guests', value: String(data.guestCount) },
    { label: 'Package', value: data.packageName },
    {
      label: 'Add-ons',
      value: data.addons.length
        ? data.addons.map((a) => a.name).join(', ')
        : 'None',
    },
    { label: 'Estimated Total', value: `R ${total.toLocaleString()}` },
    {
      label: 'Payment Method',
      value: isFinanced
        ? `Smart Financing (${data.financeTerm || 6} monthly instalments)`
        : 'Pay Directly (Invoice & Deposit)',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-7 lg:p-8">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-1">
          Review Your Booking
        </h2>
        <p className="text-sm text-foreground-muted">
          Confirm your details before submitting to Vincent for review.
        </p>
      </div>

      {authLoading ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-3.5 text-xs text-foreground-muted">
          <Loader2 size={14} className="animate-spin text-primary" />
          <span>Verifying authentication status...</span>
        </div>
      ) : user ? (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-xs text-success">
          <div className="flex items-center gap-2.5">
            <CheckCircle size={16} className="text-success flex-shrink-0" />
            <span>
              Signed in as <strong className="text-foreground">{user.email}</strong>. Booking will be linked to your account.
            </span>
          </div>
          <span className="hidden sm:inline-flex rounded-full bg-success/20 px-2.5 py-0.5 text-[10px] font-bold text-success uppercase tracking-wider">
            Verified Account
          </span>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">Sign In Required to Complete Booking</h4>
              <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                An authenticated VSM account is required to confirm your booking. This connects your event to the customer portal for real-time tracking, contract signing, and private memory vault access.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/auth/login?redirect=/book"
                  className="btn-gold px-4 py-2 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 shadow"
                >
                  <LogIn size={13} />
                  Sign In / Register Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-muted/40 border border-border rounded-xl p-5 mb-6 space-y-3">
        {summaryRows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
            <span className="text-foreground-muted flex-shrink-0">{row.label}</span>
            <span className="text-foreground font-medium text-right">{row.value}</span>
          </div>
        ))}
        {data.notes && (
          <div className="pt-2 border-t border-border">
            <span className="text-xs text-foreground-muted">Notes</span>
            <p className="text-sm text-foreground mt-1">{data.notes}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

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
          disabled={submitting || authLoading}
          className="btn-gold flex-1 py-3 text-sm font-semibold rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Submitting Booking...
            </>
          ) : !user ? (
            <>
              Sign In to Submit Booking
              <ArrowRight size={15} />
            </>
          ) : (
            <>
              Submit Booking
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
