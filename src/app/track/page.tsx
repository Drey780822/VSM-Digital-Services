import Link from 'next/link';
import BookingFlowLayout from '@/app/book/components/BookingFlowLayout';
import TrackLookupForm from './components/TrackLookupForm';

export default function TrackPage() {
  return (
    <BookingFlowLayout>
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">
          Booking Tracker
        </p>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Track Your <span className="text-gradient-gold italic">Booking</span>
        </h1>
        <p className="mt-2 text-sm text-foreground-muted max-w-md mx-auto">
          Enter your booking reference and email to view status and progress.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-7 lg:p-8">
        <TrackLookupForm />
      </div>

      <p className="text-center text-xs text-foreground-muted mt-6">
        Have multiple bookings?{' '}
        <Link href="/portal" className="text-primary hover:text-primary-light transition-colors">
          View all bookings in your portal
        </Link>
      </p>
    </BookingFlowLayout>
  );
}
