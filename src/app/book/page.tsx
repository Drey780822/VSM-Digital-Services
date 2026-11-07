import BookingFlowLayout from './components/BookingFlowLayout';
import BookingWizard from './components/BookingWizard';

interface Props {
  searchParams: Promise<{ package?: string; mode?: string }>;
}

export default async function BookPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialPackage = params.package;
  const initialMode = params.mode === 'finance' ? 'finance' : 'direct';

  return (
    <BookingFlowLayout>
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">
          Event Booking & Smart Financing
        </p>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Book Your <span className="text-gradient-gold italic">Event</span>
        </h1>
        <p className="mt-2 text-sm text-foreground-muted max-w-md mx-auto">
          Professional photography & videography with flexible payment options or 100% smart financing.
        </p>
      </div>
      <BookingWizard initialPackage={initialPackage} initialMode={initialMode} />
    </BookingFlowLayout>
  );
}
