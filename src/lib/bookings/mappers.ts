import type { BookingRecord, BookingStatus, BookingStatusHistoryEntry } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapBookingRow(row: Record<string, any>): BookingRecord {
  const venueName = row.venue_name || '';
  const venueAddress = row.venue_address || row.location || '';

  return {
    id: row.id,
    customerId: row.customer_id ?? undefined,
    client: row.customer_name || row.client || '',
    email: row.email || '',
    phone: row.phone || '',
    idNumber: row.id_number ?? undefined,
    eventType: row.event_type || '',
    packageName: row.package_name || '',
    eventDate: row.event_date || '',
    eventTime: row.event_time || '',
    venueName,
    venueAddress,
    location: venueAddress || row.location || '',
    guestCount: row.guest_count ?? 0,
    addons: Array.isArray(row.addons) ? row.addons : [],
    deposit: Number(row.total_amount ?? row.deposit ?? 0),
    status: (row.status || 'Submitted') as BookingStatus,
    financed: Boolean(row.financed),
    referenceNumber: row.reference_number || '',
    trackingNumber: row.tracking_number || '',
    notes: row.notes ?? undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at ?? undefined,
  };
}

export function mapHistoryRow(row: Record<string, any>): BookingStatusHistoryEntry {
  return {
    id: row.id,
    bookingId: row.booking_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    notes: row.notes ?? undefined,
    changedBy: row.changed_by || 'system',
    createdAt: row.created_at,
  };
}

export function bookingToInsertRow(
  booking: Omit<BookingRecord, 'id' | 'createdAt'> & { customerId?: string }
) {
  return {
    customer_id: booking.customerId ?? null,
    customer_name: booking.client,
    email: booking.email,
    phone: booking.phone,
    id_number: booking.idNumber ?? null,
    event_type: booking.eventType,
    package_name: booking.packageName,
    event_date: booking.eventDate,
    event_time: booking.eventTime,
    venue_name: booking.venueName,
    venue_address: booking.venueAddress,
    location: booking.venueAddress || booking.location,
    guest_count: booking.guestCount,
    addons: booking.addons,
    status: booking.status,
    total_amount: booking.deposit,
    financed: booking.financed,
    reference_number: booking.referenceNumber,
    tracking_number: booking.trackingNumber,
    notes: booking.notes ?? null,
  };
}
