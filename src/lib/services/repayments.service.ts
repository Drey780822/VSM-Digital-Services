import { getClient, generateReference } from './supabase-helpers';

export type PaymentMethod = 'EFT' | 'Debit Order' | 'PayFast' | 'Ozow' | 'Cash' | 'Direct Deposit';
export type RepaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

export interface RepaymentRecord {
  id: string;
  loanId: string;
  customerId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: RepaymentStatus;
  referenceNumber: string;
  transactionId?: string;
  paymentDate: string;
  notes?: string;
  createdAt: string;
  // Joined fields
  applicantName?: string;
  loanReference?: string;
  loanTotal?: number;
  loanBalance?: number;
}

export interface RecordRepaymentInput {
  loanId: string;
  customerId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status?: RepaymentStatus;
  transactionId?: string;
  paymentDate?: string;
  notes?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapRepayment(row: Record<string, any>): RepaymentRecord {
  const loan = row.loans;
  return {
    id: row.id,
    loanId: row.loan_id,
    customerId: row.customer_id ?? undefined,
    amount: Number(row.amount || 0),
    paymentMethod: (row.payment_method || 'EFT') as PaymentMethod,
    status: (row.status || 'Completed') as RepaymentStatus,
    referenceNumber: row.reference_number || '',
    transactionId: row.transaction_id ?? undefined,
    paymentDate: row.payment_date || row.created_at || new Date().toISOString(),
    notes: row.notes ?? undefined,
    createdAt: row.created_at || new Date().toISOString(),
    applicantName: loan?.applicant_name,
    loanReference: loan?.reference_number,
    loanTotal: loan?.total_payable ? Number(loan.total_payable) : undefined,
    loanBalance: loan?.balance !== undefined ? Number(loan.balance) : undefined,
  };
}

export async function fetchRepayments(loanId?: string): Promise<RepaymentRecord[]> {
  const supabase = getClient();
  let query = supabase
    .from('repayments')
    .select('*, loans(applicant_name, reference_number, total_payable, balance)')
    .order('payment_date', { ascending: false });

  if (loanId) {
    query = query.eq('loan_id', loanId);
  }

  const { data, error } = await query;
  if (error) {
    // If foreign key join fails, fallback to simple select
    const { data: fallback, error: fbErr } = await supabase
      .from('repayments')
      .select('*')
      .order('payment_date', { ascending: false });
    if (fbErr) throw new Error(`Failed to fetch repayments: ${fbErr.message}`);
    return (fallback ?? []).map(mapRepayment);
  }

  return (data ?? []).map(mapRepayment);
}

export async function recordRepayment(input: RecordRepaymentInput): Promise<RepaymentRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();
  const ref = generateReference('PAY');

  // Insert payment
  const insertRow = {
    loan_id: input.loanId,
    customer_id: input.customerId ?? null,
    amount: input.amount,
    payment_method: input.paymentMethod,
    status: input.status || 'Completed',
    reference_number: ref,
    transaction_id: input.transactionId ?? null,
    payment_date: input.paymentDate || now,
    notes: input.notes ?? null,
    created_at: now,
  };

  const { data, error } = await supabase
    .from('repayments')
    .insert(insertRow)
    .select('*, loans(applicant_name, reference_number, total_payable, balance)')
    .single();

  if (error) throw new Error(`Failed to record repayment: ${error.message}`);

  // Manual fallback balance deduction in case database trigger is absent
  const { data: currentLoan } = await supabase
    .from('loans')
    .select('balance, total_payable')
    .eq('id', input.loanId)
    .single();

  if (currentLoan) {
    const currentBalance = Number(currentLoan.balance ?? currentLoan.total_payable);
    const newBalance = Math.max(0, currentBalance - input.amount);
    const newStatus = newBalance <= 0 ? 'Repaid' : undefined;

    const updateObj: Record<string, unknown> = {
      balance: newBalance,
      updated_at: now,
    };
    if (newStatus) updateObj.status = newStatus;

    await supabase.from('loans').update(updateObj).eq('id', input.loanId);
  }

  return mapRepayment(data);
}

export async function deleteRepayment(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from('repayments').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete repayment: ${error.message}`);
}
