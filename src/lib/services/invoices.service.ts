import { getClient, generateReference } from './supabase-helpers';

export type InvoiceStatus =
  | 'Draft'
  | 'Issued'
  | 'Sent'
  | 'Paid'
  | 'Partially Paid'
  | 'Overdue'
  | 'Cancelled';

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
  amount?: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  bookingId?: string;
  loanId?: string;
  clientName: string;
  customerName: string;
  clientEmail: string;
  customerEmail: string;
  clientPhone?: string;
  customerPhone?: string;
  clientAddress?: string;
  customerAddress?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxAmount: number;
  taxRate?: number;
  discount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateInvoiceInput {
  customerId?: string;
  bookingId?: string;
  loanId?: string;
  clientName?: string;
  customerName?: string;
  clientEmail?: string;
  customerEmail?: string;
  clientPhone?: string;
  customerPhone?: string;
  clientAddress?: string;
  customerAddress?: string;
  issueDate?: string;
  dueDate?: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; amount?: number; total?: number }>;
  taxRate?: number; // e.g. 15 for 15% VAT, or 0
  discount?: number;
  discountAmount?: number;
  status?: InvoiceStatus;
  notes?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapInvoice(row: Record<string, any>): InvoiceRecord {
  const items: InvoiceItem[] = Array.isArray(row.items)
    ? row.items.map((item, idx) => {
        const q = Number(item.quantity || 1);
        const p = Number(item.unitPrice ?? item.unit_price ?? 0);
        const tot = Number(item.total ?? item.amount ?? q * p);
        return {
          id: item.id || `item-${idx}`,
          description: item.description || '',
          quantity: q,
          unitPrice: p,
          total: tot,
          amount: tot,
        };
      })
    : [];

  const clientName = row.client_name || row.customer_name || 'Client';
  const clientEmail = row.client_email || row.customer_email || '';
  const clientPhone = row.client_phone || row.customer_phone || undefined;
  const clientAddress = row.client_address || row.customer_address || undefined;

  const tax = Number(row.tax || 0);
  const discount = Number(row.discount || row.discount_amount || 0);

  return {
    id: row.id,
    invoiceNumber: row.invoice_number || '',
    customerId: row.customer_id ?? undefined,
    bookingId: row.booking_id ?? undefined,
    loanId: row.loan_id ?? undefined,
    clientName,
    customerName: clientName,
    clientEmail,
    customerEmail: clientEmail,
    clientPhone,
    customerPhone: clientPhone,
    clientAddress,
    customerAddress: clientAddress,
    issueDate: row.issue_date || new Date().toISOString().slice(0, 10),
    dueDate: row.due_date || new Date().toISOString().slice(0, 10),
    items,
    subtotal: Number(row.subtotal || 0),
    tax,
    taxAmount: tax,
    taxRate: Number(row.tax_rate || 0),
    discount,
    discountAmount: discount,
    totalAmount: Number(row.total_amount || 0),
    amountPaid: Number(row.amount_paid || 0),
    status: (row.status || 'Issued') as InvoiceStatus,
    notes: row.notes ?? undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function fetchInvoices(statusFilter?: string): Promise<InvoiceRecord[]> {
  const supabase = getClient();
  let query = supabase.from('invoices').select('*').order('issue_date', { ascending: false });

  if (statusFilter && statusFilter !== 'All') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch invoices: ${error.message}`);
  return (data ?? []).map(mapInvoice);
}

export async function getInvoiceById(id: string): Promise<InvoiceRecord | null> {
  const supabase = getClient();
  const { data, error } = await supabase.from('invoices').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to fetch invoice: ${error.message}`);
  return data ? mapInvoice(data) : null;
}

export async function createInvoice(input: CreateInvoiceInput): Promise<InvoiceRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();
  const invoiceNumber = generateReference('INV');

  const cName = input.clientName || input.customerName || 'Client';
  const cEmail = (input.clientEmail || input.customerEmail || 'client@vsm.co.za').toLowerCase().trim();
  const cPhone = input.clientPhone || input.customerPhone || null;
  const cAddress = input.clientAddress || input.customerAddress || null;

  // Compute item totals
  const mappedItems: InvoiceItem[] = input.items.map((it, i) => {
    const q = Number(it.quantity || 1);
    const p = Number(it.unitPrice || 0);
    const tot = q * p;
    return {
      id: `item-${Date.now()}-${i}`,
      description: it.description,
      quantity: q,
      unitPrice: p,
      total: tot,
      amount: tot,
    };
  });

  const subtotal = mappedItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const taxRate = input.taxRate ?? 0;
  const tax = Math.round(((subtotal * taxRate) / 100) * 100) / 100;
  const discount = input.discount ?? input.discountAmount ?? 0;
  const totalAmount = Math.max(0, subtotal + tax - discount);

  const issueDate = input.issueDate || now.slice(0, 10);
  const due = new Date();
  due.setDate(due.getDate() + 14);
  const dueDate = input.dueDate || due.toISOString().slice(0, 10);

  const insertRow = {
    invoice_number: invoiceNumber,
    customer_id: input.customerId ?? null,
    booking_id: input.bookingId ?? null,
    loan_id: input.loanId ?? null,
    client_name: cName,
    client_email: cEmail,
    client_phone: cPhone,
    client_address: cAddress,
    issue_date: issueDate,
    due_date: dueDate,
    items: mappedItems,
    subtotal,
    tax,
    discount,
    total_amount: totalAmount,
    amount_paid: 0,
    status: input.status || 'Issued',
    notes: input.notes ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from('invoices').insert(insertRow).select().single();
  if (error) throw new Error(`Failed to create invoice: ${error.message}`);

  return mapInvoice(data);
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<InvoiceRecord> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('invoices')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update invoice status: ${error.message}`);
  return mapInvoice(data);
}

export async function recordInvoicePayment(id: string, amount?: number): Promise<InvoiceRecord> {
  const supabase = getClient();
  const invoice = await getInvoiceById(id);
  if (!invoice) throw new Error('Invoice not found');

  const payAmount = amount !== undefined ? amount : (invoice.totalAmount - invoice.amountPaid);
  const newPaid = invoice.amountPaid + payAmount;
  let newStatus: InvoiceStatus = invoice.status;
  if (newPaid >= invoice.totalAmount) {
    newStatus = 'Paid';
  } else if (newPaid > 0) {
    newStatus = 'Partially Paid';
  }

  const { data, error } = await supabase
    .from('invoices')
    .update({
      amount_paid: newPaid,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to record invoice payment: ${error.message}`);
  return mapInvoice(data);
}

export async function deleteInvoice(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete invoice: ${error.message}`);
}
