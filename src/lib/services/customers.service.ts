import { getClient } from './supabase-helpers';
import { mapBooking, type BookingRecord } from './bookings.service';
import { mapLoan, type LoanRecord } from './loans.service';
import { mapRepayment, type RepaymentRecord } from './repayments.service';

export interface CustomerRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  idNumber?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  // Computed summary
  totalBookings?: number;
  totalLoans?: number;
  lifetimeValue?: number;
}

export interface Customer360Profile {
  customer: CustomerRecord;
  bookings: BookingRecord[];
  loans: LoanRecord[];
  repayments: RepaymentRecord[];
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    amountPaid: number;
    status: string;
    issueDate: string;
  }>;
  vaults: Array<{
    id: string;
    title: string;
    accessCode: string;
    status: string;
    eventDate: string;
    coverImageUrl?: string;
  }>;
  totalLifetimeValue: number;
  activeLoansBalance: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCustomer(row: Record<string, any>): CustomerRecord {
  return {
    id: row.id,
    fullName: row.full_name || '',
    email: row.email || '',
    phone: row.phone ?? undefined,
    idNumber: row.id_number ?? undefined,
    address: row.address ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function fetchCustomers(search?: string): Promise<CustomerRecord[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch customers: ${error.message}`);

  let list = (data ?? []).map(mapCustomer);
  if (search && search.trim()) {
    const s = search.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.fullName.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        (c.phone && c.phone.includes(s)) ||
        (c.idNumber && c.idNumber.includes(s))
    );
  }
  return list;
}

export async function getCustomerById(id: string): Promise<CustomerRecord | null> {
  const supabase = getClient();
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to fetch customer: ${error.message}`);
  return data ? mapCustomer(data) : null;
}

export async function getCustomer360Profile(id: string): Promise<Customer360Profile | null> {
  const supabase = getClient();
  const customer = await getCustomerById(id);
  if (!customer) return null;

  const email = customer.email.toLowerCase().trim();

  // Fetch bookings for this customer
  const { data: bData } = await supabase
    .from('bookings')
    .select('*')
    .or(`customer_id.eq.${id},email.eq.${email}`)
    .order('event_date', { ascending: false });
  const bookings = (bData ?? []).map(mapBooking);

  // Fetch loans for this customer
  const { data: lData } = await supabase
    .from('loans')
    .select('*')
    .or(`customer_id.eq.${id},email.eq.${email}`)
    .order('created_at', { ascending: false });
  const loans = (lData ?? []).map(mapLoan);

  // Fetch repayments
  const loanIds = loans.map((l) => l.id);
  let repayments: RepaymentRecord[] = [];
  if (loanIds.length > 0) {
    const { data: rData } = await supabase
      .from('repayments')
      .select('*')
      .in('loan_id', loanIds)
      .order('payment_date', { ascending: false });
    repayments = (rData ?? []).map(mapRepayment);
  }

  // Fetch invoices
  const { data: invData } = await supabase
    .from('invoices')
    .select('id, invoice_number, total_amount, amount_paid, status, issue_date')
    .or(`customer_id.eq.${id},client_email.eq.${email}`)
    .order('issue_date', { ascending: false });
  const invoices = (invData ?? []).map((row) => ({
    id: row.id,
    invoiceNumber: row.invoice_number,
    totalAmount: Number(row.total_amount || 0),
    amountPaid: Number(row.amount_paid || 0),
    status: row.status,
    issueDate: row.issue_date,
  }));

  // Fetch vaults
  const { data: vData } = await supabase
    .from('memory_vaults')
    .select('id, title, access_code, status, event_date, cover_image_url')
    .or(`customer_id.eq.${id},client_email.eq.${email}`)
    .order('created_at', { ascending: false });
  const vaults = (vData ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    accessCode: row.access_code,
    status: row.status,
    eventDate: row.event_date,
    coverImageUrl: row.cover_image_url,
  }));

  // Calculate LTV
  const bookingRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const loanInterestEarned = repayments.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalLifetimeValue = bookingRevenue + loanInterestEarned;

  const activeLoansBalance = loans
    .filter((l) => l.status !== 'Repaid' && l.status !== 'Rejected')
    .reduce((sum, l) => sum + (l.balance || 0), 0);

  return {
    customer,
    bookings,
    loans,
    repayments,
    invoices,
    vaults,
    totalLifetimeValue,
    activeLoansBalance,
  };
}

export async function createCustomer(payload: {
  fullName: string;
  email: string;
  phone?: string;
  idNumber?: string;
  address?: string;
  notes?: string;
}): Promise<CustomerRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('customers')
    .insert({
      full_name: payload.fullName,
      email: payload.email.toLowerCase().trim(),
      phone: payload.phone || null,
      id_number: payload.idNumber || null,
      address: payload.address || null,
      notes: payload.notes || null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create customer: ${error.message}`);
  return mapCustomer(data);
}

export async function updateCustomer(
  id: string,
  updates: Partial<CustomerRecord>
): Promise<CustomerRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();

  const updateRow: Record<string, unknown> = {
    updated_at: now,
  };
  if (updates.fullName !== undefined) updateRow.full_name = updates.fullName;
  if (updates.email !== undefined) updateRow.email = updates.email.toLowerCase().trim();
  if (updates.phone !== undefined) updateRow.phone = updates.phone;
  if (updates.idNumber !== undefined) updateRow.id_number = updates.idNumber;
  if (updates.address !== undefined) updateRow.address = updates.address;
  if (updates.notes !== undefined) updateRow.notes = updates.notes;

  const { data, error } = await supabase
    .from('customers')
    .update(updateRow)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update customer: ${error.message}`);
  return mapCustomer(data);
}

export async function deleteCustomer(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete customer: ${error.message}`);
}
