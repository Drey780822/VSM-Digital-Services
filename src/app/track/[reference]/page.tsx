import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import BookingFlowLayout from '@/app/book/components/BookingFlowLayout';
import TrackBookingDetailClient from './TrackBookingDetailClient';

interface Props {
  params: Promise<{ reference: string }>;
}

function LoadingFallback() {
  return (
    <BookingFlowLayout>
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-sm text-foreground-muted">Loading your booking...</p>
      </div>
    </BookingFlowLayout>
  );
}

export default async function TrackBookingDetailPage({ params }: Props) {
  const { reference } = await params;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <TrackBookingDetailClient reference={decodeURIComponent(reference)} />
    </Suspense>
  );
}
