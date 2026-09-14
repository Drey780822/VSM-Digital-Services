export type {
  BookingStatus,
  PaymentStatus,
  BookingRecord,
  BookingStatusHistoryEntry,
} from '@/lib/services/bookings.service';

export type EventType =
  | 'Wedding'
  | 'Funeral'
  | 'Birthday'
  | 'Graduation'
  | 'Groove'
  | 'Corporate'
  | 'Corporate Event';

export interface BookingAddon {
  id: string;
  name: string;
  price: number;
}

export interface CreateBookingPayload {
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  eventType: EventType;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  guestCount: number;
  packageId: string;
  packageName: string;
  packagePrice: number;
  addons: BookingAddon[];
  notes?: string;
}

export interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  eventType: EventType | '';
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  guestCount: number;
  packageId: string;
  packageName: string;
  packagePrice: number;
  addons: BookingAddon[];
  notes: string;
  referenceNumber: string;
  trackingNumber: string;
}
