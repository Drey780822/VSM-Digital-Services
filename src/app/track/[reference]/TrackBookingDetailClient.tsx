'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Package,
  Users,
  Hash,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import BookingFlowLayout from '@/app/book/components/BookingFlowLayout';
import BookingTimeline from '@/components/booking/BookingTimeline';
import StatusBadge from '@/components/booking/StatusBadge';
import { getBookingByReference, getBookingStatusHistory } from '@/lib/bookings/service';
import type { BookingRecord, BookingStatusHistoryEntry } from '@/lib/bookings/types';

interface Props {
  reference: string;
}

export default function TrackBookingDetailClient({ reference }: Props) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [history, setHistory] = useState<BookingStatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const emailParam = searchParams.get('email') ?? '';
      let resolvedEmail = emailParam;

      if (!resolvedEmail && typeof window !== 'undefined') {
        try {
          const session = JSON.parse(sessionStorage.getItem('vsm-track-session') || '{}');
          if (session.reference === reference) resolvedEmail = session.email;
        } catch {
          /* ignore */
        }
      }

      setEmail(resolvedEmail);

      if (!resolvedEmail) {
        setError('Email is required to view booking details.');
        setLoading(false);
        return;
      }

      try {
        const found = await getBookingByReference(reference, resolvedEmail);
        if (!found) {
          setError('Booking not found. Please verify your reference and email.');
          setLoading(false);
          return;
        }
        setBooking(found);
        const hist = await getBookingStatusHistory(found.id, resolvedEmail);
        setHistory(hist);
      } catch {
        setError('Unable to load booking details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reference, searchParams]);

  if (loading) {
    return (
      <BookingFlowLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary mb-4" />
          <p className="text-sm text-foreground-muted">Loading your booking...</p>
        </div>
      </BookingFlowLayout>
    );
  }

  if (error || !booking) {
    return (
      <BookingFlowLayout>
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <AlertCircle size={32} className="text-danger mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Booking Not Found</h2>
          <p className="text-sm text-foreground-muted mb-6">{error}</p>
          <Link href="/track" className="btn-gold inline-flex px-6 py-3 text-sm font-semibold rounded-md">
            Try Again
          </Link>
        </div>
      </BookingFlowLayout>
    );
  }

  return (
    <BookingFlowLayout>
      <Link
        href="/track"
        className="inline-flex items-center gap-2 text-xs text-foreground-muted hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to tracker
      </Link>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">
                {booking.eventType}
              </p>
              <h1 className="font-display text-2xl font-semibold text-foreground">
                {booking.client}&apos;s Event
              </h1>
              <p className="text-sm text-foreground-muted mt-1">{booking.packageName}</p>
            </div>
            <StatusBadge status={booking.status} className="self-start text-xs" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <Hash size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-[10px] text-foreground-muted uppercase tracking-wide">Reference</p>
                <p className="text-sm font-mono font-semibold text-foreground">
                  {booking.referenceNumber}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Hash size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-[10px] text-foreground-muted uppercase tracking-wide">Tracking</p>
                <p className="text-sm font-mono font-semibold text-foreground">
                  {booking.trackingNumber}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-[10px] text-foreground-muted uppercase tracking-wide">Event Date</p>
                <p className="text-sm text-foreground">
                  {new Date(booking.eventDate).toLocaleDateString('en-ZA', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}{' '}
                  at {booking.eventTime}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-[10px] text-foreground-muted uppercase tracking-wide">Venue</p>
                <p className="text-sm text-foreground">{booking.venueName}</p>
                <p className="text-xs text-foreground-muted">{booking.venueAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-[10px] text-foreground-muted uppercase tracking-wide">Guests</p>
                <p className="text-sm text-foreground">{booking.guestCount}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-[10px] text-foreground-muted uppercase tracking-wide">Total</p>
                <p className="text-sm font-semibold text-primary">
                  R {booking.deposit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {booking.addons.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2">
                Add-ons
              </p>
              <div className="flex flex-wrap gap-2">
                {booking.addons.map((addon) => (
                  <span
                    key={addon.id}
                    className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-gold"
                  >
                    {addon.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 lg:p-8">
          <h2 className="text-sm font-semibold text-foreground mb-6">Booking Progress</h2>
          <BookingTimeline currentStatus={booking.status} history={history} />
        </div>

        {booking.status === 'Gallery Uploaded' || booking.status === 'Delivered' ? (
          <div className="bg-primary/5 border border-gold rounded-2xl p-6 text-center">
            <p className="text-sm font-semibold text-foreground mb-1">Memory Vault Ready</p>
            <p className="text-xs text-foreground-muted">
              Your gallery is available. Vincent will share your secure gallery link via email.
            </p>
          </div>
        ) : (
          <div className="bg-muted/30 border border-border rounded-2xl p-6 text-center">
            <p className="text-xs text-foreground-muted">
              You&apos;ll receive email updates at{' '}
              <span className="text-foreground">{email}</span> when your booking status changes.
            </p>
          </div>
        )}
      </div>
    </BookingFlowLayout>
  );
}
