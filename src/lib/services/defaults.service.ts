import { getClient } from './supabase-helpers';
import { fetchLoans, type LoanRecord } from './loans.service';

export interface DefaultedLoanItem {
  loan: LoanRecord;
  daysOverdue: number;
  agingCategory: '1-30 Days' | '31-60 Days' | '60+ Days' | 'Defaulted';
  suggestedPenalty: number;
}

export async function fetchDefaultsAndOverdue(): Promise<DefaultedLoanItem[]> {
  const allLoans = await fetchLoans();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const items: DefaultedLoanItem[] = [];

  for (const loan of allLoans) {
    if (loan.status === 'Repaid' || loan.status === 'Rejected') continue;

    let isOverdue = false;
    let daysOverdue = 0;

    if (loan.dueDate) {
      const due = new Date(loan.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - due.getTime();
      daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (daysOverdue > 0 && loan.balance > 0) {
        isOverdue = true;
      }
    }

    if (loan.status === 'Defaulted') {
      isOverdue = true;
      if (daysOverdue <= 0) daysOverdue = 61;
    }

    if (isOverdue) {
      let agingCategory: '1-30 Days' | '31-60 Days' | '60+ Days' | 'Defaulted' = '1-30 Days';
      if (loan.status === 'Defaulted' || daysOverdue > 60) {
        agingCategory = loan.status === 'Defaulted' ? 'Defaulted' : '60+ Days';
      } else if (daysOverdue > 30) {
        agingCategory = '31-60 Days';
      }

      // 5% standard NCR late payment penalty on overdue monthly instalment
      const suggestedPenalty = Math.round(loan.monthlyInstalment * 0.05 * 100) / 100;

      items.push({
        loan,
        daysOverdue,
        agingCategory,
        suggestedPenalty,
      });
    }
  }

  // Sort by highest days overdue
  return items.sort((a, b) => b.daysOverdue - a.daysOverdue);
}

export async function applyLatePenalty(
  loanId: string,
  penaltyAmount: number,
  note?: string
): Promise<void> {
  const supabase = getClient();
  const { data: loan } = await supabase
    .from('loans')
    .select('balance, total_payable, notes')
    .eq('id', loanId)
    .single();

  if (!loan) throw new Error('Loan not found');

  const currentBalance = Number(loan.balance ?? loan.total_payable);
  const newBalance = currentBalance + penaltyAmount;
  const existingNotes = loan.notes ? `${loan.notes}\n` : '';
  const penaltyNote = `[${new Date().toLocaleDateString('en-ZA')}] Late penalty of R ${penaltyAmount} applied. ${note || ''}`;

  await supabase
    .from('loans')
    .update({
      balance: newBalance,
      notes: `${existingNotes}${penaltyNote}`,
      updated_at: new Date().toISOString(),
    })
    .eq('id', loanId);

  // Notify owner
  await supabase.from('notifications').insert({
    title: 'Late Penalty Applied',
    message: `Applied R ${penaltyAmount} late penalty to loan ID ${loanId}`,
    type: 'default',
    reference_id: loanId,
    reference_type: 'loan',
  });
}

export async function markAsDefaulted(loanId: string, reason: string): Promise<void> {
  const supabase = getClient();
  await supabase
    .from('loans')
    .update({
      status: 'Defaulted',
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', loanId);

  await supabase.from('notifications').insert({
    title: 'Loan Defaulted',
    message: `Loan ID ${loanId} marked as Defaulted: ${reason}`,
    type: 'default',
    reference_id: loanId,
    reference_type: 'loan',
  });
}
