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
  userId?: string;
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
  financedLoanId?: string;
  referenceNumber: string;
  tracking_number?: string;
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
  userId?: string;
  customerId?: string;
  customerName: string;
  email: string;
  phone: string;
  idNumber?: string;
  eventType: string;
  commercialModel?: 'hourly' | 'package' | 'quotation';
  hours?: number;
  mediaType?: 'photo' | 'video' | 'both';
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
  depositAmount?: number;
  balanceDue?: number;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: 'eft' | 'cash' | 'yoco' | 'payfast' | 'financed';
  financed?: boolean;
  financedLoanId?: string;
  notes?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBooking(row: Record<string, any>): BookingRecord {
  const venueName = row.venue_name || '';
  const venueAddress = row.venue_address || row.location || '';
  const clientName = row.customer_name || row.client || '';
  const totalAmount = Number(row.total_amount ?? 0);
  const deposit = Number(row.deposit_amount ?? row.deposit ?? totalAmount);

  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    customerId: row.customer_id ?? undefined,
    customerName: clientName,
    client: clientName,
    email: row.email || '',
    phone: row.phone || '',
    idNumber: row.id_number ?? undefined,
    eventType: row.event_type || 'Wedding',
    packageId: row.package_id ?? undefined,
    packageName: row.package_name || (row.commercial_model === 'hourly' ? `${row.event_type} (Hourly)` : 'Custom Package'),
    eventDate: row.event_date || '',
    eventTime: row.event_time || '12:00',
    venueName,
    venueAddress,
    location: venueAddress || venueName || 'TBD Venue',
    guestCount: Number(row.guest_count ?? 0),
    addons: Array.isArray(row.addons) ? row.addons : [],
    totalAmount,
    deposit,
    status: (row.status || 'Submitted') as BookingStatus,
    paymentStatus: (row.payment_status || 'Unpaid') as PaymentStatus,
    financed: Boolean(row.financed),
    financedLoanId: row.financed_loan_id ?? row.linked_loan_id ?? undefined,
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
  if (error) {
    console.warn(`fetchBookings notice: ${error.message}`);
    return [];
  }

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
  if (error) {
    console.warn(`getBookingById notice: ${error.message}`);
    return null;
  }
  return data ? mapBooking(data) : null;
}

export async function getCustomerBookings(email: string): Promise<BookingRecord[]> {
  const supabase = getClient();
  const cleanEmail = email.toLowerCase().trim();

  // Try RPC first (bypasses potential RLS recursion)
  try {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('get_customer_bookings', {
      p_email: cleanEmail,
    });
    if (!rpcErr && rpcData && Array.isArray(rpcData)) {
      return rpcData.map(mapBooking);
    }
  } catch {
    // fallback to direct query
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .ilike('email', cleanEmail)
    .order('event_date', { ascending: false });

  if (error) {
    console.warn(`getCustomerBookings notice: ${error.message}`);
    return [];
  }

  return (data ?? []).map(mapBooking);
}

export async function getBookingByReference(
  reference: string,
  email: string
): Promise<BookingRecord | null> {
  const supabase = getClient();
  const cleanRef = reference.trim();
  const cleanEmail = email.toLowerCase().trim();

  try {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('get_booking_by_reference', {
      p_reference: cleanRef,
      p_email: cleanEmail,
    });
    if (!rpcErr && rpcData && rpcData.length > 0) {
      return mapBooking(rpcData[0]);
    }
  } catch {
    // fallback
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .ilike('reference_number', cleanRef)
    .ilike('email', cleanEmail)
    .maybeSingle();

  if (error) {
    console.warn(`getBookingByReference notice: ${error.message}`);
    return null;
  }

  return data ? mapBooking(data) : null;
}

export async function createBooking(input: CreateBookingInput): Promise<BookingRecord> {
  const supabase = getClient();

  // 1. Explicitly validate that an authenticated user exists
  // Derive user ID directly from authenticated session; do NOT trust client-supplied user_id
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const authenticatedUser = authData?.user;

  if (!authenticatedUser || authError) {
    throw new Error('Please sign in before creating a booking.');
  }

  const authenticatedUserId = authenticatedUser.id;
  const now = new Date().toISOString();
  const referenceNumber = generateReference('VSM-BK');
  const trackingNumber = generateReference('TRK');

  // 2. Deduplicate/Upsert customer record
  let customerId = input.customerId;
  const cleanEmail = (input.email || authenticatedUser.email || '').toLowerCase().trim();

  if (!customerId && cleanEmail) {
    const { data: existingCust } = await supabase
      .from('customers')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingCust?.id) {
      customerId = existingCust.id;
    } else {
      const { data: newCust } = await supabase
        .from('customers')
        .insert({
          full_name: input.customerName || (authenticatedUser.user_metadata?.full_name as string) || 'Valued Client',
          email: cleanEmail,
          phone: input.phone,
          id_number: input.idNumber ?? null,
          address: input.venueAddress ?? null,
        })
        .select('id')
        .single();
      customerId = newCust?.id;
    }
  }

  const isValidUUID = (str?: string) =>
    Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

  const depositVal = input.depositAmount ?? input.deposit ?? Math.round(input.totalAmount * 0.5);
  const balanceVal = input.balanceDue ?? (input.totalAmount - depositVal);

  const insertRow = {
    customer_id: customerId ?? null,
    customer_name: input.customerName || (authenticatedUser.user_metadata?.full_name as string) || 'Valued Client',
    email: cleanEmail,
    phone: input.phone || null,
    id_number: input.idNumber ?? null,
    event_type: input.eventType || 'Birthday',
    commercial_model: input.commercialModel || (input.packageId ? 'package' : 'hourly'),
    event_date: input.eventDate,
    event_time: input.eventTime || '12:00',
    venue_name: input.venueName || 'Venue',
    venue_address: input.venueAddress || '',
    location: input.venueAddress || input.venueName || 'Venue',
    guest_count: input.guestCount || 0,
    hours: input.hours || 2,
    media_type: input.mediaType || 'both',
    package_id: isValidUUID(input.packageId) ? input.packageId : null,
    package_name: input.packageName || 'Custom Package',
    addons: input.addons || [],
    total_amount: input.totalAmount,
    deposit_amount: depositVal,
    balance_due: balanceVal,
    status: input.status || 'Submitted',
    payment_status: input.paymentStatus || 'Unpaid',
    payment_method: input.paymentMethod || (input.financed ? 'financed' : 'eft'),
    financed: Boolean(input.financed),
    reference_number: referenceNumber,
    tracking_number: trackingNumber,
    notes: input.notes ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from('bookings').insert(insertRow).select().single();
  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`);
  }

  // Add initial activity log
  try {
    await supabase.from('activity_logs').insert({
      actor: cleanEmail,
      action: 'Created Booking',
      entity: 'bookings',
      entity_id: data.id,
      metadata: { reference: referenceNumber, total: input.totalAmount, deposit: depositVal },
      created_at: now,
    });
  } catch {}

  // Add notification for Operations
  try {
    await supabase.from('notifications').insert({
      title: 'New Booking Created',
      message: `${input.customerName} booked ${input.packageName} for ${input.eventDate} (${referenceNumber})`,
      type: 'booking',
      reference_id: data.id,
      reference_type: 'booking',
    });
  } catch {}

  // Add activity log
  try {
    await supabase.from('activity_logs').insert({
      actor: input.customerName,
      action: 'BOOKING_CREATED',
      entity: 'booking',
      entity_id: data.id,
      metadata: { reference: referenceNumber, package: input.packageName, total: input.totalAmount },
    });
  } catch {}

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
  if (updates.financedLoanId !== undefined) updateData.financed_loan_id = updates.financedLoanId;
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

  try {
    await supabase.from('booking_status_history').insert({
      booking_id: bookingId,
      from_status: fromStatus,
      to_status: newStatus,
      notes: notes ?? null,
      changed_by: changedBy,
      created_at: now,
    });
  } catch {}

  // Create activity log
  try {
    await supabase.from('activity_logs').insert({
      actor: changedBy,
      action: 'BOOKING_STATUS_CHANGED',
      entity: 'booking',
      entity_id: bookingId,
      metadata: { reference: current.referenceNumber, fromStatus, toStatus: newStatus, notes },
    });
  } catch {}

  // Create notification
  try {
    await supabase.from('notifications').insert({
      title: `Booking Status: ${newStatus}`,
      message: `Booking ${current.referenceNumber} (${current.customerName}) moved to ${newStatus}.`,
      type: 'booking',
      reference_id: bookingId,
      reference_type: 'booking',
    });
  } catch {}

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

  if (error) {
    console.warn(`getBookingStatusHistory notice: ${error.message}`);
    return [];
  }

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
