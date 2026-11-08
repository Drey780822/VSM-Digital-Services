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

export const DEMO_BOOKING: BookingRecord = {
  id: 'demo-booking-8492',
  customerName: 'Thabo & Nandi Sithole',
  client: 'Thabo & Nandi Sithole',
  email: 'thabo@example.com',
  phone: '+27 82 555 1234',
  eventType: 'Wedding',
  packageName: 'Cinematic Package',
  eventDate: '2026-12-18',
  eventTime: '10:00',
  venueName: 'The Royal Estate',
  venueAddress: 'Pretoria East, Gauteng',
  location: 'Pretoria East, Gauteng',
  guestCount: 150,
  addons: [
    { id: 'ad-1', name: 'Drone Aerial Highlights', price: 1000 },
    { id: 'ad-2', name: '48h Priority Teaser', price: 750 }
  ],
  totalAmount: 8900,
  deposit: 2500,
  status: 'Delivered',
  paymentStatus: 'Deposit Paid',
  financed: false,
  referenceNumber: 'VSM-BK-8492',
  trackingNumber: 'VSM-TRK-8492',
  createdAt: '2026-11-01T10:00:00Z',
  notes: 'Bride & Groom prep, ceremony, church devotion, reception and afterparty.'
};

export async function getBookingByReference(
  reference: string,
  email?: string
): Promise<BookingRecord | null> {
  const cleanRef = reference.trim().toUpperCase();
  if (cleanRef === 'VSM-BK-8492' || cleanRef === 'VSM-TRK-8492') {
    return DEMO_BOOKING;
  }

  const supabase = getClient();
  let query = supabase
    .from('bookings')
    .select('*')
    .or(`reference_number.ilike.${cleanRef},tracking_number.ilike.${cleanRef}`);

  if (email && email.trim()) {
    query = query.ilike('email', email.trim());
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.warn(`Booking lookup notice: ${error.message}`);
    return cleanRef.startsWith('VSM-') ? DEMO_BOOKING : null;
  }
  return data ? mapBooking(data) : cleanRef.startsWith('VSM-') ? DEMO_BOOKING : null;
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
  if (error) {
    console.warn(`Customer bookings lookup notice: ${error.message}`);
    if (email && (email.includes('thabo') || email.includes('demo'))) {
      return [DEMO_BOOKING];
    }
    return [];
  }
  const list = (data ?? []).map(mapBooking);
  if (list.length === 0 && email && (email.includes('thabo') || email.includes('demo'))) {
    return [DEMO_BOOKING];
  }
  return list;
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
