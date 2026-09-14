'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = calculateBookingTotal(data.packagePrice, data.addons);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
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
      });

      updateData({
        referenceNumber: booking.referenceNumber,
        trackingNumber: booking.trackingNumber,
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'vsm-track-session',
          JSON.stringify({ email: data.email, reference: booking.referenceNumber })
        );
      }

      toast.success('Booking submitted successfully!');
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

  const summaryRows = [
    { label: 'Name', value: data.fullName },
    { label: 'Email', value: data.email },
    { label: 'Phone', value: data.phone },
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
          disabled={submitting}
          className="btn-gold flex-1 py-3 text-sm font-semibold rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Submitting...
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
