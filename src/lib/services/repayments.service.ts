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

export const DEMO_REPAYMENTS: RepaymentRecord[] = [
  {
    id: 'repay-1',
    loanId: 'demo-loan-3',
    amount: 1650,
    paymentMethod: 'Debit Order',
    status: 'Completed',
    referenceNumber: 'PAY-8921-ZA',
    transactionId: 'FNB-DO-892147',
    paymentDate: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    notes: 'Monthly scheduled debit order cleared successfully.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    applicantName: 'Kagiso Sithole',
    loanReference: 'VSM-LN-5034',
    loanTotal: 19800,
    loanBalance: 13200
  },
  {
    id: 'repay-2',
    loanId: 'demo-loan-3',
    amount: 1650,
    paymentMethod: 'Debit Order',
    status: 'Completed',
    referenceNumber: 'PAY-8104-ZA',
    transactionId: 'FNB-DO-810492',
    paymentDate: new Date(Date.now() - 3600000 * 24 * 35).toISOString(),
    notes: 'Monthly scheduled debit order cleared successfully.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 35).toISOString(),
    applicantName: 'Kagiso Sithole',
    loanReference: 'VSM-LN-5034',
    loanTotal: 19800,
    loanBalance: 14850
  },
  {
    id: 'repay-3',
    loanId: 'demo-loan-3',
    amount: 1650,
    paymentMethod: 'EFT',
    status: 'Completed',
    referenceNumber: 'PAY-7419-ZA',
    transactionId: 'STD-EFT-40912',
    paymentDate: new Date(Date.now() - 3600000 * 24 * 65).toISOString(),
    notes: 'Direct EFT payment via Absa clearing.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 65).toISOString(),
    applicantName: 'Kagiso Sithole',
    loanReference: 'VSM-LN-5034',
    loanTotal: 19800,
    loanBalance: 16500
  }
];

export async function fetchRepayments(loanId?: string): Promise<RepaymentRecord[]> {
  const supabase = getClient();
  try {
    let query = supabase
      .from('repayments')
      .select('*, loans(applicant_name, reference_number, total_payable, balance)')
      .order('payment_date', { ascending: false });

    if (loanId) {
      query = query.eq('loan_id', loanId);
    }

    const { data, error } = await query;
    if (error) {
      const { data: fallback, error: fbErr } = await supabase
        .from('repayments')
        .select('*')
        .order('payment_date', { ascending: false });
      if (fbErr || !fallback || fallback.length === 0) {
        return loanId ? DEMO_REPAYMENTS.filter((r) => r.loanId === loanId) : DEMO_REPAYMENTS;
      }
      return (fallback ?? []).map(mapRepayment);
    }

    const list = (data ?? []).map(mapRepayment);
    if (list.length === 0) {
      return loanId ? DEMO_REPAYMENTS.filter((r) => r.loanId === loanId) : DEMO_REPAYMENTS;
    }
    return list;
  } catch {
    return loanId ? DEMO_REPAYMENTS.filter((r) => r.loanId === loanId) : DEMO_REPAYMENTS;
  }
}

export async function recordRepayment(input: RecordRepaymentInput): Promise<RepaymentRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();
  const ref = generateReference('PAY');

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

  try {
    const { data, error } = await supabase
      .from('repayments')
      .insert(insertRow)
      .select('*, loans(applicant_name, reference_number, total_payable, balance)')
      .single();

    if (error) throw error;

    const { data: currentLoan } = await supabase
      .from('loans')
      .select('balance, total_payable')
      .eq('id', input.loanId)
      .single();

    if (currentLoan) {
      const currentBalance = Number(currentLoan.balance ?? currentLoan.total_payable);
      const newBalance = Math.max(0, currentBalance - input.amount);
      const newStatus = newBalance <= 0 ? 'Settled' : undefined;

      const updateObj: Record<string, unknown> = {
        balance: newBalance,
        updated_at: now,
      };
      if (newStatus) updateObj.status = newStatus;

      await supabase.from('loans').update(updateObj).eq('id', input.loanId);
    }

    return mapRepayment(data);
  } catch (err: any) {
    console.warn('recordRepayment fallback to demo array:', err?.message);
    const mock: RepaymentRecord = {
      id: `repay-${Date.now()}`,
      loanId: input.loanId,
      customerId: input.customerId,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      status: input.status || 'Completed',
      referenceNumber: ref,
      transactionId: input.transactionId,
      paymentDate: input.paymentDate || now,
      notes: input.notes,
      createdAt: now,
      applicantName: 'Kagiso Sithole',
      loanReference: 'VSM-LN-5034',
      loanTotal: 19800,
      loanBalance: Math.max(0, 13200 - input.amount),
    };
    DEMO_REPAYMENTS.unshift(mock);
    return mock;
  }
}

export async function deleteRepayment(id: string): Promise<void> {
  const supabase = getClient();
  const demoIdx = DEMO_REPAYMENTS.findIndex((r) => r.id === id);
  if (demoIdx >= 0) {
    DEMO_REPAYMENTS.splice(demoIdx, 1);
  }
  try {
    const { error } = await supabase.from('repayments').delete().eq('id', id);
    if (error) throw error;
  } catch {
    if (demoIdx >= 0) return;
    throw new Error('Failed to delete repayment');
  }
}
