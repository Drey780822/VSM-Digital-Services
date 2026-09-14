'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Mail, Loader2, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import BookingFlowLayout from '@/app/book/components/BookingFlowLayout';
import StatusBadge from '@/components/booking/StatusBadge';
import { getCustomerBookings } from '@/lib/bookings/service';
import type { BookingRecord } from '@/lib/bookings/types';

interface PortalForm {
  email: string;
}

export default function CustomerPortalPage() {
  const [bookings, setBookings] = useState<BookingRecord[] | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PortalForm>();

  const onSubmit = async (values: PortalForm) => {
    setLoading(true);
    setError(null);
    try {
      const results = await getCustomerBookings(values.email.trim());
      setEmail(values.email.trim());
      setBookings(results);

      sessionStorage.setItem(
        'vsm-portal-session',
        JSON.stringify({ email: values.email.trim() })
      );

      if (results.length === 0) {
        toast.info('No bookings found for this email address.');
      }
    } catch {
      setError('Unable to load your bookings. Please try again.');
      toast.error('Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BookingFlowLayout>
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">
          Customer Portal
        </p>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Your <span className="text-gradient-gold italic">Bookings</span>
        </h1>
        <p className="mt-2 text-sm text-foreground-muted max-w-md mx-auto">
          Enter your email to view all event bookings and track their progress.
        </p>
      </div>

      {bookings === null ? (
        <div className="bg-card border border-border rounded-2xl p-7 lg:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
                Email Address <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email',
                    },
                  })}
                  type="email"
                  className="input-luxury w-full pl-10 pr-4 py-3 text-sm"
                  placeholder="you@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-danger">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Loading...
                </>
              ) : (
                'View My Bookings'
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''} for{' '}
              <span className="text-foreground">{email}</span>
            </p>
            <button
              onClick={() => {
                setBookings(null);
                setEmail('');
              }}
              className="text-xs text-primary hover:text-primary-light transition-colors"
            >
              Change email
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-sm text-foreground-muted mb-4">No bookings found for this email.</p>
              <Link href="/book" className="btn-gold inline-flex px-6 py-3 text-sm font-semibold rounded-md">
                Book an Event
              </Link>
            </div>
          ) : (
            bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/track/${encodeURIComponent(booking.referenceNumber)}?email=${encodeURIComponent(email)}`}
                className="block bg-card border border-border rounded-xl p-5 hover:border-gold transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary">{booking.eventType}</span>
                      <StatusBadge status={booking.status} />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {booking.packageName}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(booking.eventDate).toLocaleDateString('en-ZA', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="font-mono">{booking.referenceNumber}</span>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-foreground-muted group-hover:text-primary transition-colors flex-shrink-0 mt-1"
                  />
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      <p className="text-center text-xs text-foreground-muted mt-6">
        Know your reference number?{' '}
        <Link href="/track" className="text-primary hover:text-primary-light transition-colors">
          Track a specific booking
        </Link>
      </p>
    </BookingFlowLayout>
  );
}
