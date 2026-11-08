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

import { calculateBookingTotal } from './constants';

export async function createBooking(payload: CreateBookingPayload): Promise<BookingRecord> {
  const isFinanced = Boolean(payload.financed || payload.paymentPreference === 'finance');
  const total = calculateBookingTotal(payload.packagePrice, payload.addons);
  const deposit = payload.depositAmount ?? (payload.commercialModel === 'package' ? Math.round(total * 0.4) : Math.round(total * 0.5));

  return createBookingInternal({
    customerName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    idNumber: payload.idNumber,
    eventType: payload.eventType,
    commercialModel: payload.commercialModel || 'hourly',
    hours: payload.hours || 2,
    mediaType: payload.mediaType || 'both',
    packageId: payload.packageId,
    packageName: payload.packageName,
    eventDate: payload.eventDate,
    eventTime: payload.eventTime,
    venueName: payload.venueName,
    venueAddress: payload.venueAddress,
    guestCount: payload.guestCount,
    addons: payload.addons,
    totalAmount: total,
    depositAmount: deposit,
    deposit: deposit,
    balanceDue: payload.balanceDue ?? (total - deposit),
    notes: payload.notes,
    financed: isFinanced,
    paymentMethod: payload.paymentMethod || (isFinanced ? 'financed' : 'eft'),
    paymentStatus: 'Unpaid',
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

export async function getCustomerBookings(
  email?: string,
  userId?: string
): Promise<BookingRecord[]> {
  const supabase = getClient();
  let query = supabase.from('bookings').select('*');

  if (userId) {
    if (email && email.trim()) {
      query = query.or(`user_id.eq.${userId},email.ilike.${email.trim().toLowerCase()}`);
    } else {
      query = query.eq('user_id', userId);
    }
  } else if (email && email.trim()) {
    query = query.ilike('email', email.trim().toLowerCase());
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      query = query.or(`user_id.eq.${user.id},email.ilike.${user.email}`);
    } else {
      return [];
    }
  }

  const { data, error } = await query.order('event_date', { ascending: false });
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
