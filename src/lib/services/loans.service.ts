import { getClient, generateReference } from './supabase-helpers';
import { calculateAmortization } from './eligibility.engine';

export type LoanStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Disbursed'
  | 'Repaid'
  | 'Defaulted';

export type RiskLevel = 'Low' | 'Medium' | 'High';
export type LoanType = 'photography' | 'personal';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface LoanRecord {
  id: string;
  customerId?: string;
  applicantName: string;
  applicant: string; // compatibility alias
  email: string;
  phone: string;
  idNumber?: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  term: number; // compatibility alias
  monthlyInstalment: number;
  totalPayable: number;
  balance: number;
  purpose: string;
  loanType: LoanType;
  salary: number;
  expenses: number;
  employer?: string;
  employmentType?: string;
  bankName?: string;
  accountNumber?: string;
  riskLevel: RiskLevel;
  risk: RiskLevel; // compatibility alias
  status: LoanStatus;
  verificationStatus: VerificationStatus;
  dueDate?: string;
  referenceNumber: string;
  rejectionReason?: string;
  notes?: string;
  linkedBookingId?: string;
  disbursedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoanFilter {
  status?: string;
  riskLevel?: string;
  loanType?: string;
  search?: string;
  overdueOnly?: boolean;
}

export interface CreateLoanInput {
  customerId?: string;
  applicantName: string;
  email: string;
  phone: string;
  idNumber?: string;
  amount: number;
  interestRate?: number;
  termMonths?: number;
  purpose: string;
  loanType?: LoanType;
  salary?: number;
  expenses?: number;
  employer?: string;
  employmentType?: string;
  bankName?: string;
  accountNumber?: string;
  riskLevel?: RiskLevel;
  status?: LoanStatus;
  verificationStatus?: VerificationStatus;
  notes?: string;
  linkedBookingId?: string;
}

export function calculateLoanTerms(amount: number, annualRate = 18.0, termMonths = 6) {
  const calc = calculateAmortization(amount, termMonths, annualRate);
  return {
    monthlyInstalment: calc.monthlyInstalment,
    totalPayable: calc.totalPayable,
    totalInterest: calc.totalInterest,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapLoan(row: Record<string, any>): LoanRecord {
  const applicantName = row.applicant_name || row.applicant || '';
  const risk = (row.risk_level || row.risk || 'Low') as RiskLevel;
  const term = Number(row.term_months || row.term || 6);
  const loanType = (row.loan_type || (row.linked_booking_id ? 'photography' : 'personal')) as LoanType;
  const verification = (row.verification_status || 'unverified') as VerificationStatus;

  return {
    id: row.id,
    customerId: row.customer_id ?? undefined,
    applicantName,
    applicant: applicantName,
    email: row.email || '',
    phone: row.phone || '',
    idNumber: row.id_number ?? undefined,
    amount: Number(row.amount || 0),
    interestRate: Number(row.interest_rate || 18.0),
    termMonths: term,
    term,
    monthlyInstalment: Number(row.monthly_instalment || 0),
    totalPayable: Number(row.total_payable || 0),
    balance: Number(row.balance ?? row.total_payable ?? 0),
    purpose: row.purpose || (loanType === 'photography' ? 'Photography Package Financing' : 'Personal Loan'),
    loanType,
    salary: Number(row.salary || 0),
    expenses: Number(row.expenses || 0),
    employer: row.employer ?? undefined,
    employmentType: row.employment_type ?? undefined,
    bankName: row.bank_name ?? undefined,
    accountNumber: row.account_number ?? undefined,
    riskLevel: risk,
    risk,
    status: (row.status || 'Submitted') as LoanStatus,
    verificationStatus: verification,
    dueDate: row.due_date ?? undefined,
    referenceNumber: row.reference_number || '',
    rejectionReason: row.rejection_reason ?? undefined,
    notes: row.notes ?? undefined,
    linkedBookingId: row.linked_booking_id ?? undefined,
    disbursedAt: row.disbursed_at ?? undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function fetchLoans(filters?: LoanFilter): Promise<LoanRecord[]> {
  const supabase = getClient();
  let query = supabase.from('loans').select('*').order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'All') {
    query = query.eq('status', filters.status);
  }
  if (filters?.riskLevel && filters.riskLevel !== 'All') {
    query = query.eq('risk_level', filters.riskLevel);
  }
  if (filters?.loanType && filters.loanType !== 'All') {
    query = query.eq('loan_type', filters.loanType);
  }

  const { data, error } = await query;
  if (error) {
    // If recursive policy issue or table missing, return empty array safely
    console.warn(`fetchLoans notice: ${error.message}`);
    return [];
  }

  let list = (data ?? []).map(mapLoan);
  if (filters?.search && filters.search.trim()) {
    const s = filters.search.toLowerCase().trim();
    list = list.filter(
      (l) =>
        l.applicantName.toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s) ||
        l.phone.includes(s) ||
        l.referenceNumber.toLowerCase().includes(s) ||
        (l.idNumber && l.idNumber.includes(s))
    );
  }

  if (filters?.overdueOnly) {
    const today = new Date().toISOString().slice(0, 10);
    list = list.filter(
      (l) => l.balance > 0 && l.dueDate && l.dueDate < today && l.status !== 'Repaid'
    );
  }

  return list;
}

export async function getLoanById(id: string): Promise<LoanRecord | null> {
  const supabase = getClient();
  const { data, error } = await supabase.from('loans').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.warn(`getLoanById error: ${error.message}`);
    return null;
  }
  return data ? mapLoan(data) : null;
}

export async function getCustomerLoans(email: string): Promise<LoanRecord[]> {
  const supabase = getClient();
  const cleanEmail = email.toLowerCase().trim();
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .ilike('email', cleanEmail)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn(`getCustomerLoans notice: ${error.message}`);
    return [];
  }
  return (data ?? []).map(mapLoan);
}

export async function createLoan(input: CreateLoanInput): Promise<LoanRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();
  const referenceNumber = generateReference('VSM-LN');
  const rate = input.interestRate ?? 18.0;
  const termMonths = input.termMonths ?? 6;

  const { monthlyInstalment, totalPayable } = calculateLoanTerms(input.amount, rate, termMonths);

  // Upsert customer
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
          full_name: input.applicantName,
          email: input.email.toLowerCase().trim(),
          phone: input.phone,
          id_number: input.idNumber ?? null,
        })
        .select('id')
        .single();
      customerId = newCust?.id;
    }
  }

  // Calculate first due date 30 days from now
  const due = new Date();
  due.setDate(due.getDate() + 30);
  const dueDateStr = due.toISOString().slice(0, 10);

  const loanType = input.loanType || (input.linkedBookingId ? 'photography' : 'personal');

  const insertRow = {
    customer_id: customerId ?? null,
    applicant_name: input.applicantName,
    email: input.email.toLowerCase().trim(),
    phone: input.phone,
    id_number: input.idNumber ?? null,
    amount: input.amount,
    interest_rate: rate,
    term_months: termMonths,
    monthly_instalment: monthlyInstalment,
    total_payable: totalPayable,
    balance: totalPayable,
    purpose: input.purpose,
    loan_type: loanType,
    salary: input.salary ?? 0,
    expenses: input.expenses ?? 0,
    employer: input.employer ?? null,
    employment_type: input.employmentType ?? 'Employed',
    bank_name: input.bankName ?? null,
    account_number: input.accountNumber ?? null,
    risk_level: input.riskLevel ?? 'Low',
    status: input.status || 'Submitted',
    verification_status: input.verificationStatus || 'unverified',
    due_date: dueDateStr,
    reference_number: referenceNumber,
    notes: input.notes ?? null,
    linked_booking_id: input.linkedBookingId ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from('loans').insert(insertRow).select().single();
  if (error) throw new Error(`Failed to create loan: ${error.message}`);

  // Create initial notification & audit log
  try {
    await supabase.from('notifications').insert({
      title: 'New Loan Application',
      message: `${input.applicantName} applied for R ${input.amount.toLocaleString()} (${referenceNumber})`,
      type: 'loan',
      reference_id: data.id,
      reference_type: 'loan',
    });
  } catch {}

  try {
    await supabase.from('activity_logs').insert({
      actor: input.applicantName,
      action: 'LOAN_SUBMITTED',
      entity: 'loan',
      entity_id: data.id,
      metadata: { reference: referenceNumber, amount: input.amount, purpose: input.purpose },
    });
  } catch {}

  return mapLoan(data);
}

export async function updateLoan(id: string, updates: Partial<CreateLoanInput>): Promise<LoanRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();

  const updateData: Record<string, unknown> = {
    updated_at: now,
  };

  if (updates.applicantName !== undefined) updateData.applicant_name = updates.applicantName;
  if (updates.email !== undefined) updateData.email = updates.email.toLowerCase().trim();
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.idNumber !== undefined) updateData.id_number = updates.idNumber;
  if (updates.amount !== undefined) {
    updateData.amount = updates.amount;
    const rate = updates.interestRate ?? 18.0;
    const term = updates.termMonths ?? 6;
    const calc = calculateLoanTerms(updates.amount, rate, term);
    updateData.monthly_instalment = calc.monthlyInstalment;
    updateData.total_payable = calc.totalPayable;
  }
  if (updates.interestRate !== undefined) updateData.interest_rate = updates.interestRate;
  if (updates.termMonths !== undefined) updateData.term_months = updates.termMonths;
  if (updates.purpose !== undefined) updateData.purpose = updates.purpose;
  if (updates.loanType !== undefined) updateData.loan_type = updates.loanType;
  if (updates.salary !== undefined) updateData.salary = updates.salary;
  if (updates.expenses !== undefined) updateData.expenses = updates.expenses;
  if (updates.employer !== undefined) updateData.employer = updates.employer;
  if (updates.employmentType !== undefined) updateData.employment_type = updates.employmentType;
  if (updates.bankName !== undefined) updateData.bank_name = updates.bankName;
  if (updates.accountNumber !== undefined) updateData.account_number = updates.accountNumber;
  if (updates.riskLevel !== undefined) updateData.risk_level = updates.riskLevel;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.verificationStatus !== undefined) updateData.verification_status = updates.verificationStatus;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  const { data, error } = await supabase.from('loans').update(updateData).eq('id', id).select().single();
  if (error) throw new Error(`Failed to update loan: ${error.message}`);
  return mapLoan(data);
}

export async function updateLoanStatus(
  id: string,
  newStatus: LoanStatus,
  rejectionReason?: string,
  notes?: string,
  changedBy = 'admin'
): Promise<LoanRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();

  const updateData: Record<string, unknown> = {
    status: newStatus,
    updated_at: now,
  };

  if (rejectionReason) updateData.rejection_reason = rejectionReason;
  if (notes) updateData.notes = notes;

  if (newStatus === 'Disbursed') {
    const due = new Date();
    due.setDate(due.getDate() + 30);
    updateData.due_date = due.toISOString().slice(0, 10);
    updateData.disbursed_at = now;
  }

  const { data, error } = await supabase.from('loans').update(updateData).eq('id', id).select().single();
  if (error) throw new Error(`Failed to update loan status: ${error.message}`);

  // Create notification
  try {
    await supabase.from('notifications').insert({
      title: `Loan Status: ${newStatus}`,
      message: `Loan ${data.reference_number} for ${data.applicant_name} changed to ${newStatus}.`,
      type: 'loan',
      reference_id: data.id,
      reference_type: 'loan',
    });
  } catch {}

  // Create activity log
  const actionName = newStatus === 'Approved' ? 'LOAN_APPROVED'
    : newStatus === 'Rejected' ? 'LOAN_REJECTED'
    : newStatus === 'Disbursed' ? 'LOAN_DISBURSED'
    : 'LOAN_STATUS_CHANGED';

  try {
    await supabase.from('activity_logs').insert({
      actor: changedBy,
      action: actionName,
      entity: 'loan',
      entity_id: data.id,
      metadata: { reference: data.reference_number, newStatus, rejectionReason },
    });
  } catch {}

  return mapLoan(data);
}

export async function deleteLoan(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from('loans').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete loan: ${error.message}`);
}
