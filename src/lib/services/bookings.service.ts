import { getClient, generateReference } from './supabase-helpers';
import type { EventType, BookingAddon } from '@/lib/bookings/types';

export type BookingStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Scheduled'
  | 'Event Completed'
  | 'Gallery Uploaded'
  | 'Delivered'
  | 'Rejected'
  | 'Cancelled';

export type PaymentStatus = 'Unpaid' | 'Deposit Paid' | 'Fully Paid' | 'Refunded';

export interface BookingRecord {
  id: string;
  customerId?: string;
  customerName: string;
  client: string; // compatibility alias
  email: string;
  phone: string;
  idNumber?: string;
  eventType: EventType | string;
  packageId?: string;
  packageName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  location: string;
  guestCount: number;
  addons: BookingAddon[];
  totalAmount: number;
  deposit: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  financed: boolean;
  referenceNumber: string;
  trackingNumber: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingStatusHistoryEntry {
  id: string;
  bookingId: string;
  fromStatus: string | null;
  toStatus: string;
  notes?: string;
  changedBy: string;
  createdAt: string;
}

export interface BookingFilter {
  status?: string;
  eventType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  financedOnly?: boolean;
}

export interface CreateBookingInput {
  customerId?: string;
  customerName: string;
  email: string;
  phone: string;
  idNumber?: string;
  eventType: string;
  packageId?: string;
  packageName: string;
  eventDate: string;
  eventTime?: string;
  venueName?: string;
  venueAddress?: string;
  guestCount?: number;
  addons?: BookingAddon[];
  totalAmount: number;
  deposit?: number;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  financed?: boolean;
  notes?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBooking(row: Record<string, any>): BookingRecord {
  const venueName = row.venue_name || '';
  const venueAddress = row.venue_address || row.location || '';
  const clientName = row.customer_name || row.client || '';
  const totalAmount = Number(row.total_amount ?? 0);
  const deposit = Number(row.deposit ?? totalAmount);

  return {
    id: row.id,
    customerId: row.customer_id ?? undefined,
    customerName: clientName,
    client: clientName,
    email: row.email || '',
    phone: row.phone || '',
    idNumber: row.id_number ?? undefined,
    eventType: row.event_type || 'Wedding',
    packageId: row.package_id ?? undefined,
    packageName: row.package_name || 'Custom Package',
    eventDate: row.event_date || '',
    eventTime: row.event_time || '12:00',
    venueName,
    venueAddress,
    location: venueAddress || venueName || 'TBD',
    guestCount: Number(row.guest_count ?? 0),
    addons: Array.isArray(row.addons) ? row.addons : [],
    totalAmount,
    deposit,
    status: (row.status || 'Submitted') as BookingStatus,
    paymentStatus: (row.payment_status || 'Unpaid') as PaymentStatus,
    financed: Boolean(row.financed),
    referenceNumber: row.reference_number || '',
    trackingNumber: row.tracking_number || '',
    notes: row.notes ?? undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function fetchBookings(filters?: BookingFilter): Promise<BookingRecord[]> {
  const supabase = getClient();
  let query = supabase.from('bookings').select('*').order('event_date', { ascending: false });

  if (filters?.status && filters.status !== 'All') {
    query = query.eq('status', filters.status);
  }
  if (filters?.eventType && filters.eventType !== 'All') {
    query = query.eq('event_type', filters.eventType);
  }
  if (filters?.startDate) {
    query = query.gte('event_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('event_date', filters.endDate);
  }
  if (filters?.financedOnly) {
    query = query.eq('financed', true);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch bookings: ${error.message}`);

  let list = (data ?? []).map(mapBooking);
  if (filters?.search && filters.search.trim()) {
    const s = filters.search.toLowerCase().trim();
    list = list.filter(
      (b) =>
        b.customerName.toLowerCase().includes(s) ||
        b.email.toLowerCase().includes(s) ||
        b.phone.includes(s) ||
        b.referenceNumber.toLowerCase().includes(s) ||
        b.venueName.toLowerCase().includes(s) ||
        b.location.toLowerCase().includes(s)
    );
  }
  return list;
}

export async function getBookingById(id: string): Promise<BookingRecord | null> {
  const supabase = getClient();
  const { data, error } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to fetch booking: ${error.message}`);
  return data ? mapBooking(data) : null;
}

export async function createBooking(input: CreateBookingInput): Promise<BookingRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();
  const referenceNumber = generateReference('VSM');
  const trackingNumber = generateReference('TRK');

  // Upsert customer record
  let customerId = input.customerId;
  if (!customerId && input.email) {
    const { data: existingCust } = await supabase
      .from('customers')
      .select('id')
      .eq('email', input.email.toLowerCase().trim())
      .maybeSingle();

    if (existingCust?.id) {
      customerId = existingCust.id;
    } else {
      const { data: newCust } = await supabase
        .from('customers')
        .insert({
          full_name: input.customerName,
          email: input.email.toLowerCase().trim(),
          phone: input.phone,
          id_number: input.idNumber ?? null,
          address: input.venueAddress ?? null,
        })
        .select('id')
        .single();
      customerId = newCust?.id;
    }
  }

  const insertRow = {
    customer_id: customerId ?? null,
    customer_name: input.customerName,
    email: input.email.toLowerCase().trim(),
    phone: input.phone,
    id_number: input.idNumber ?? null,
    event_type: input.eventType,
    package_id: input.packageId ?? null,
    package_name: input.packageName,
    event_date: input.eventDate,
    event_time: input.eventTime || '12:00',
    venue_name: input.venueName || 'Venue',
    venue_address: input.venueAddress || '',
    location: input.venueAddress || input.venueName || '',
    guest_count: input.guestCount || 0,
    addons: input.addons || [],
    total_amount: input.totalAmount,
    deposit: input.deposit ?? input.totalAmount,
    status: input.status || 'Submitted',
    payment_status: input.paymentStatus || 'Unpaid',
    financed: Boolean(input.financed),
    reference_number: referenceNumber,
    tracking_number: trackingNumber,
    notes: input.notes ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from('bookings').insert(insertRow).select().single();
  if (error) throw new Error(`Failed to create booking: ${error.message}`);

  // Add initial status history
  await supabase.from('booking_status_history').insert({
    booking_id: data.id,
    from_status: null,
    to_status: data.status,
    notes: 'Booking created',
    changed_by: 'admin',
    created_at: now,
  });

  return mapBooking(data);
}

export async function updateBooking(
  id: string,
  updates: Partial<CreateBookingInput>
): Promise<BookingRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();

  const updateData: Record<string, unknown> = {
    updated_at: now,
  };

  if (updates.customerName !== undefined) updateData.customer_name = updates.customerName;
  if (updates.email !== undefined) updateData.email = updates.email.toLowerCase().trim();
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.idNumber !== undefined) updateData.id_number = updates.idNumber;
  if (updates.eventType !== undefined) updateData.event_type = updates.eventType;
  if (updates.packageId !== undefined) updateData.package_id = updates.packageId;
  if (updates.packageName !== undefined) updateData.package_name = updates.packageName;
  if (updates.eventDate !== undefined) updateData.event_date = updates.eventDate;
  if (updates.eventTime !== undefined) updateData.event_time = updates.eventTime;
  if (updates.venueName !== undefined) updateData.venue_name = updates.venueName;
  if (updates.venueAddress !== undefined) {
    updateData.venue_address = updates.venueAddress;
    updateData.location = updates.venueAddress;
  }
  if (updates.guestCount !== undefined) updateData.guest_count = updates.guestCount;
  if (updates.addons !== undefined) updateData.addons = updates.addons;
  if (updates.totalAmount !== undefined) updateData.total_amount = updates.totalAmount;
  if (updates.deposit !== undefined) updateData.deposit = updates.deposit;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.paymentStatus !== undefined) updateData.payment_status = updates.paymentStatus;
  if (updates.financed !== undefined) updateData.financed = updates.financed;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update booking: ${error.message}`);
  return mapBooking(data);
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  notes?: string,
  changedBy = 'admin'
): Promise<BookingRecord> {
  const supabase = getClient();
  const current = await getBookingById(bookingId);
  if (!current) throw new Error('Booking not found');

  const fromStatus = current.status;
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: newStatus,
      updated_at: now,
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update booking status: ${error.message}`);

  await supabase.from('booking_status_history').insert({
    booking_id: bookingId,
    from_status: fromStatus,
    to_status: newStatus,
    notes: notes ?? null,
    changed_by: changedBy,
    created_at: now,
  });

  return mapBooking(data);
}

export async function deleteBooking(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete booking: ${error.message}`);
}

export async function getBookingStatusHistory(bookingId: string): Promise<BookingStatusHistoryEntry[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('booking_status_history')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch status history: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    bookingId: row.booking_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    notes: row.notes ?? undefined,
    changedBy: row.changed_by || 'system',
    createdAt: row.created_at,
  }));
}
