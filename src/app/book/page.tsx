import BookingFlowLayout from './components/BookingFlowLayout';
import BookingWizard from './components/BookingWizard';

interface Props {
  searchParams: Promise<{ package?: string }>;
}

export default async function BookPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialPackage = params.package;

  return (
    <BookingFlowLayout>
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">
          Event Booking
        </p>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Book Your <span className="text-gradient-gold italic">Event</span>
        </h1>
        <p className="mt-2 text-sm text-foreground-muted max-w-md mx-auto">
          Professional photography and videography for weddings, funerals, birthdays, and more.
        </p>
      </div>
      <BookingWizard initialPackage={initialPackage} />
    </BookingFlowLayout>
  );
}
