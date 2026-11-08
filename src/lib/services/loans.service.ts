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
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'flagged';

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

export const DEMO_LOANS: LoanRecord[] = [
  {
    id: 'demo-loan-1',
    applicantName: 'Sipho Mokoena',
    applicant: 'Sipho Mokoena',
    email: 'sipho.mokoena@gmail.com',
    phone: '+27 82 345 6789',
    idNumber: '9203145890082',
    amount: 12000,
    interestRate: 18.0,
    termMonths: 6,
    term: 6,
    monthlyInstalment: 2108,
    totalPayable: 12648,
    balance: 12648,
    purpose: 'Cinematic Wedding Package Financing',
    loanType: 'photography',
    salary: 24000,
    expenses: 6500,
    employer: 'Vodacom Corporate Midrand',
    employmentType: 'Full-Time',
    bankName: 'Capitec Bank',
    accountNumber: '1548902341',
    riskLevel: 'Low',
    risk: 'Low',
    status: 'Under Review',
    verificationStatus: 'verified',
    referenceNumber: 'VSM-LN-9481',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    notes: 'DTI 27% healthy. Wedding booked for Sandton in December.'
  },
  {
    id: 'demo-loan-2',
    applicantName: 'Lerato Khumalo',
    applicant: 'Lerato Khumalo',
    email: 'lerato.khumalo@outlook.com',
    phone: '+27 71 892 4110',
    idNumber: '9511080432085',
    amount: 6500,
    interestRate: 18.0,
    termMonths: 4,
    term: 4,
    monthlyInstalment: 1685,
    totalPayable: 6740,
    balance: 6740,
    purpose: 'Graduation & Family Archival Shoot',
    loanType: 'photography',
    salary: 19500,
    expenses: 5200,
    employer: 'TUT Department of Arts',
    employmentType: 'Full-Time',
    bankName: 'Standard Bank',
    accountNumber: '2409817652',
    riskLevel: 'Low',
    risk: 'Low',
    status: 'Approved',
    verificationStatus: 'verified',
    referenceNumber: 'VSM-LN-7120',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: 'Approved by underwriting. Debit order authorization received.'
  },
  {
    id: 'demo-loan-3',
    applicantName: 'Kagiso Sithole',
    applicant: 'Kagiso Sithole',
    email: 'kagiso.sithole@creatives.co.za',
    phone: '+27 83 555 9012',
    idNumber: '8907225109088',
    amount: 18000,
    interestRate: 18.0,
    termMonths: 12,
    term: 12,
    monthlyInstalment: 1650,
    totalPayable: 19800,
    balance: 13200,
    purpose: 'Creative Rig & Sony Alpha Equipment Facility',
    loanType: 'personal',
    salary: 32000,
    expenses: 8500,
    employer: 'Apex Visual Media Agency',
    employmentType: 'Self-Employed',
    bankName: 'FNB Private Wealth',
    accountNumber: '62019482711',
    riskLevel: 'Low',
    risk: 'Low',
    status: 'Disbursed',
    verificationStatus: 'verified',
    referenceNumber: 'VSM-LN-5034',
    disbursedAt: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 24 * 65).toISOString(),
    notes: 'R6,600 repaid across 4 successful debit orders. Account in good standing.'
  },
  {
    id: 'demo-loan-4',
    applicantName: 'Zanele Ndlovu',
    applicant: 'Zanele Ndlovu',
    email: 'zanele.ndlovu@gmail.com',
    phone: '+27 76 123 9876',
    idNumber: '9801150392081',
    amount: 4500,
    interestRate: 18.0,
    termMonths: 3,
    term: 3,
    monthlyInstalment: 1545,
    totalPayable: 4635,
    balance: 4635,
    purpose: '30th Birthday Celebration & Drone Recap',
    loanType: 'photography',
    salary: 16000,
    expenses: 4800,
    employer: 'Discovery Health',
    employmentType: 'Full-Time',
    bankName: 'Absa Bank',
    accountNumber: '4089123890',
    riskLevel: 'Low',
    risk: 'Low',
    status: 'Submitted',
    verificationStatus: 'unverified',
    referenceNumber: 'VSM-LN-3291',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    notes: 'New submission from booking checkout. Proof of income uploaded.'
  }
];

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
  const rawType = String(row.loan_type || '');
  const loanType: LoanType =
    rawType === 'package_finance' || rawType === 'photography' || row.linked_booking_id
      ? 'photography'
      : 'personal';
  const verification = (row.verification_status || 'unverified') as VerificationStatus;
  const rawStatus = String(row.status || 'Submitted');
  const status: LoanStatus =
    rawStatus === 'Under_Review'
      ? 'Under Review'
      : rawStatus === 'Settled'
      ? 'Repaid'
      : (rawStatus as LoanStatus);

  return {
    id: String(row.id),
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
    status,
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
  let list: LoanRecord[] = [];

  try {
    let query = supabase.from('loans').select('*').order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'All') {
      const dbStatus =
        filters.status === 'Under Review'
          ? 'Under_Review'
          : filters.status === 'Repaid'
          ? 'Settled'
          : filters.status;
      query = query.eq('status', dbStatus);
    }
    if (filters?.loanType && filters.loanType !== 'All') {
      const dbLoanType = filters.loanType === 'photography' ? 'package_finance' : 'personal_loan';
      query = query.eq('loan_type', dbLoanType);
    }

    const { data, error } = await query;
    if (error) {
      console.warn(`fetchLoans notice: ${error.message}`);
      list = [...DEMO_LOANS];
    } else {
      list = (data ?? []).map(mapLoan);
      if (list.length === 0) {
        list = [...DEMO_LOANS];
      }
    }
  } catch {
    list = [...DEMO_LOANS];
  }

  if (filters?.status && filters.status !== 'All') {
    list = list.filter((l) => l.status === filters.status);
  }
  if (filters?.riskLevel && filters.riskLevel !== 'All') {
    list = list.filter((l) => l.riskLevel === filters.riskLevel);
  }
  if (filters?.loanType && filters.loanType !== 'All') {
    list = list.filter((l) => l.loanType === filters.loanType);
  }
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
  try {
    const { data, error } = await supabase.from('loans').select('*').eq('id', id).maybeSingle();
    if (!error && data) return mapLoan(data);
  } catch (err) {
    console.warn('getLoanById DB notice:', err);
  }
  const fallback = DEMO_LOANS.find((l) => l.id === id || l.referenceNumber === id);
  return fallback ?? null;
}

export async function getCustomerLoans(email: string): Promise<LoanRecord[]> {
  const supabase = getClient();
  const cleanEmail = email.toLowerCase().trim();
  try {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .ilike('email', cleanEmail)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map(mapLoan);
    }
  } catch (err) {
    console.warn(`getCustomerLoans notice:`, err);
  }
  return DEMO_LOANS.filter((l) => l.email.toLowerCase().trim() === cleanEmail);
}

export async function createLoan(input: CreateLoanInput): Promise<LoanRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();
  const referenceNumber = generateReference('VSM-LN');
  const rate = input.interestRate ?? 18.0;
  const termMonths = input.termMonths ?? 6;

  const { monthlyInstalment, totalPayable } = calculateLoanTerms(input.amount, rate, termMonths);

  const dbLoanType =
    input.loanType === 'photography' || input.linkedBookingId ? 'package_finance' : 'personal_loan';
  const dbStatus =
    input.status === 'Under Review'
      ? 'Under_Review'
      : input.status === 'Repaid'
      ? 'Settled'
      : input.status || 'Submitted';
  const dbVerification =
    input.verificationStatus === 'verified' || input.verificationStatus === 'flagged'
      ? input.verificationStatus
      : 'unverified';

  let customerId = input.customerId;
  try {
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
  } catch (custErr) {
    console.warn('Customer upsert fallback:', custErr);
  }

  const due = new Date();
  due.setDate(due.getDate() + 30);
  const dueDateStr = due.toISOString().slice(0, 10);

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
    loan_type: dbLoanType,
    salary: input.salary ?? 0,
    expenses: input.expenses ?? 0,
    employer: input.employer ?? null,
    employment_type: input.employmentType ?? 'Employed',
    bank_name: input.bankName ?? null,
    account_number: input.accountNumber ?? null,
    status: dbStatus,
    verification_status: dbVerification,
    reference_number: referenceNumber,
    notes: input.notes ?? null,
    linked_booking_id: input.linkedBookingId ?? null,
    created_at: now,
    updated_at: now,
  };

  try {
    const { data, error } = await supabase.from('loans').insert(insertRow).select().single();
    if (error) throw error;

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
  } catch (err: any) {
    console.warn('createLoan fallback to demo array:', err?.message);
    const mockRecord: LoanRecord = {
      id: `loan-${Date.now()}`,
      customerId: customerId ?? undefined,
      applicantName: input.applicantName,
      applicant: input.applicantName,
      email: input.email.toLowerCase().trim(),
      phone: input.phone,
      idNumber: input.idNumber ?? undefined,
      amount: input.amount,
      interestRate: rate,
      termMonths: termMonths,
      term: termMonths,
      monthlyInstalment,
      totalPayable,
      balance: totalPayable,
      purpose: input.purpose,
      loanType: input.loanType || (input.linkedBookingId ? 'photography' : 'personal'),
      salary: input.salary ?? 0,
      expenses: input.expenses ?? 0,
      employer: input.employer ?? undefined,
      employmentType: input.employmentType ?? 'Employed',
      bankName: input.bankName ?? undefined,
      accountNumber: input.accountNumber ?? undefined,
      riskLevel: input.riskLevel ?? 'Low',
      risk: input.riskLevel ?? 'Low',
      status: input.status || 'Submitted',
      verificationStatus: input.verificationStatus || 'unverified',
      dueDate: dueDateStr,
      referenceNumber,
      notes: input.notes ?? undefined,
      linkedBookingId: input.linkedBookingId ?? undefined,
      createdAt: now,
      updatedAt: now,
    };
    DEMO_LOANS.unshift(mockRecord);
    return mockRecord;
  }
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
  if (updates.loanType !== undefined) {
    updateData.loan_type = updates.loanType === 'photography' ? 'package_finance' : 'personal_loan';
  }
  if (updates.salary !== undefined) updateData.salary = updates.salary;
  if (updates.expenses !== undefined) updateData.expenses = updates.expenses;
  if (updates.employer !== undefined) updateData.employer = updates.employer;
  if (updates.employmentType !== undefined) updateData.employment_type = updates.employmentType;
  if (updates.bankName !== undefined) updateData.bank_name = updates.bankName;
  if (updates.accountNumber !== undefined) updateData.account_number = updates.accountNumber;
  if (updates.riskLevel !== undefined) updateData.risk_level = updates.riskLevel;
  if (updates.status !== undefined) {
    updateData.status =
      updates.status === 'Under Review'
        ? 'Under_Review'
        : updates.status === 'Repaid'
        ? 'Settled'
        : updates.status;
  }
  if (updates.verificationStatus !== undefined) updateData.verification_status = updates.verificationStatus;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  const demoIdx = DEMO_LOANS.findIndex((l) => l.id === id || l.referenceNumber === id);
  if (demoIdx >= 0) {
    DEMO_LOANS[demoIdx] = {
      ...DEMO_LOANS[demoIdx],
      ...updates,
      updatedAt: now,
    };
  }

  try {
    const { data, error } = await supabase.from('loans').update(updateData).eq('id', id).select().single();
    if (error) throw error;
    return mapLoan(data);
  } catch {
    if (demoIdx >= 0) return DEMO_LOANS[demoIdx];
    throw new Error('Unable to update loan');
  }
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

  const dbStatus =
    newStatus === 'Under Review'
      ? 'Under_Review'
      : newStatus === 'Repaid'
      ? 'Settled'
      : newStatus;

  const updateData: Record<string, unknown> = {
    status: dbStatus,
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

  const demoIdx = DEMO_LOANS.findIndex((l) => l.id === id || l.referenceNumber === id);
  if (demoIdx >= 0) {
    DEMO_LOANS[demoIdx] = {
      ...DEMO_LOANS[demoIdx],
      status: newStatus,
      rejectionReason: rejectionReason ?? DEMO_LOANS[demoIdx].rejectionReason,
      notes: notes ?? DEMO_LOANS[demoIdx].notes,
      disbursedAt: newStatus === 'Disbursed' ? now : DEMO_LOANS[demoIdx].disbursedAt,
      updatedAt: now,
    };
  }

  try {
    const { data, error } = await supabase.from('loans').update(updateData).eq('id', id).select().single();
    if (error) throw error;

    try {
      await supabase.from('notifications').insert({
        title: `Loan Status: ${newStatus}`,
        message: `Loan ${data.reference_number} for ${data.applicant_name} changed to ${newStatus}.`,
        type: 'loan',
        reference_id: data.id,
        reference_type: 'loan',
      });
    } catch {}

    const actionName =
      newStatus === 'Approved'
        ? 'LOAN_APPROVED'
        : newStatus === 'Rejected'
        ? 'LOAN_REJECTED'
        : newStatus === 'Disbursed'
        ? 'LOAN_DISBURSED'
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
  } catch {
    if (demoIdx >= 0) return DEMO_LOANS[demoIdx];
    throw new Error('Failed to update loan status');
  }
}

export async function deleteLoan(id: string): Promise<void> {
  const supabase = getClient();
  const demoIdx = DEMO_LOANS.findIndex((l) => l.id === id || l.referenceNumber === id);
  if (demoIdx >= 0) {
    DEMO_LOANS.splice(demoIdx, 1);
  }
  try {
    const { error } = await supabase.from('loans').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    if (demoIdx >= 0) return;
    throw new Error(`Failed to delete loan`);
  }
}
