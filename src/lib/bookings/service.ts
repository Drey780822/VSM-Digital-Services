import {
  fetchBookings,
  getBookingById,
  createBooking as createBookingInternal,
  updateBookingStatus as updateBookingStatusInternal,
  getBookingStatusHistory as getBookingStatusHistoryInternal,
  type BookingRecord,
  type BookingStatus,
  type BookingStatusHistoryEntry,
  mapBooking,
} from '@/lib/services/bookings.service';
import { getClient, isSupabaseConfigured } from '@/lib/services/supabase-helpers';
import type { CreateBookingPayload } from './types';

export {
  fetchBookings,
  getBookingById,
  type BookingRecord,
  type BookingStatus,
  type BookingStatusHistoryEntry,
};

export async function createBooking(payload: CreateBookingPayload): Promise<BookingRecord> {
  return createBookingInternal({
    customerName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    idNumber: payload.idNumber,
    eventType: payload.eventType,
    packageId: payload.packageId,
    packageName: payload.packageName,
    eventDate: payload.eventDate,
    eventTime: payload.eventTime,
    venueName: payload.venueName,
    venueAddress: payload.venueAddress,
    guestCount: payload.guestCount,
    addons: payload.addons,
    totalAmount: payload.packagePrice,
    deposit: payload.packagePrice,
    notes: payload.notes,
  });
}

export async function getBookings(): Promise<BookingRecord[]> {
  return fetchBookings();
}

export async function getBookingByReference(
  reference: string,
  email: string
): Promise<BookingRecord | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .ilike('reference_number', reference.trim())
    .ilike('email', email.trim())
    .maybeSingle();

  if (error) throw new Error(`Booking lookup failed: ${error.message}`);
  return data ? mapBooking(data) : null;
}

export async function getCustomerBookings(email: string): Promise<BookingRecord[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .ilike('email', email.trim())
    .order('event_date', { ascending: false });

  if (error) throw new Error(`Customer bookings lookup failed: ${error.message}`);
  return (data ?? []).map(mapBooking);
}

export async function getBookingStatusHistory(
  bookingId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _email?: string
): Promise<BookingStatusHistoryEntry[]> {
  return getBookingStatusHistoryInternal(bookingId);
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  changedBy = 'owner',
  notes?: string
): Promise<BookingRecord> {
  return updateBookingStatusInternal(bookingId, newStatus, notes, changedBy);
}

export async function getOwnerBookingHistory(
  bookingId: string
): Promise<BookingStatusHistoryEntry[]> {
  return getBookingStatusHistoryInternal(bookingId);
}
