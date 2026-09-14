'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { fetchLoans, updateLoanStatus, type LoanRecord } from '@/lib/services/loans.service';
import { formatCurrency } from '@/lib/services/supabase-helpers';

const RISK_STYLES: Record<string, string> = {
  Low: 'text-success bg-success/10 border-success/30',
  Medium: 'text-warning bg-warning/10 border-warning/30',
  High: 'text-danger bg-danger/10 border-danger/30',
};

export default function LoanQueue() {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPendingLoans = async () => {
    setLoading(true);
    try {
      const data = await fetchLoans({ status: 'Submitted' });
      const underReview = await fetchLoans({ status: 'Under Review' });
      setLoans([...data, ...underReview]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingLoans();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    setProcessingId(id);
    try {
      await updateLoanStatus(id, 'Approved', undefined, 'Approved from Quick Queue by Owner');
      setLoans((prev) => prev.filter((l) => l.id !== id));
      toast.success(`Loan approved for ${name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve loan');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setProcessingId(id);
    try {
      await updateLoanStatus(id, 'Rejected', 'Credit risk assessment', 'Rejected from Quick Queue');
      setLoans((prev) => prev.filter((l) => l.id !== id));
      toast.error(`Loan application rejected for ${name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject loan');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Loan Approval Queue</h3>
            <Link
              href="/admin-dashboard/loans"
              className="text-xs text-primary hover:text-primary-light transition-colors font-medium"
            >
              All loans →
            </Link>
          </div>
          <p className="text-xs text-foreground-muted mt-0.5">{loans.length} pending review</p>
        </div>
        <button
          onClick={loadPendingLoans}
          className="p-1.5 rounded-md hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
          title="Refresh loan queue"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
        {loading && (
          <div className="p-8 text-center text-xs text-foreground-muted">
            <RefreshCw size={18} className="animate-spin text-primary mx-auto mb-2" />
            Loading loan queue...
          </div>
        )}
        {!loading && loans.length === 0 && (
          <div className="p-6 text-center">
            <CheckCircle size={24} className="text-success mx-auto mb-1.5" />
            <p className="text-xs font-medium text-foreground">All caught up!</p>
            <p className="text-[11px] text-foreground-muted mt-0.5">No pending loan applications.</p>
          </div>
        )}
        {!loading &&
          loans.map((loan) => (
            <div
              key={loan.id}
              className="p-3.5 hover:bg-muted/30 transition-colors duration-150 group"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground flex-shrink-0">
                    {loan.applicantName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">
                      {loan.applicantName}
                    </div>
                    <div className="text-[10px] text-foreground-muted">
                      {loan.referenceNumber || loan.id.slice(0, 8)}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-semibold text-foreground counter-value">
                    {formatCurrency(loan.amount)}
                  </div>
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${RISK_STYLES[loan.riskLevel] || RISK_STYLES.Low}`}
                  >
                    {loan.riskLevel === 'High' && <AlertTriangle size={8} className="inline mr-0.5" />}
                    {loan.riskLevel} Risk
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1 text-[10px] text-foreground-muted">
                <span className="truncate max-w-[160px]">{loan.purpose}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    onClick={() => handleApprove(loan.id, loan.applicantName)}
                    disabled={processingId === loan.id}
                    className="w-6 h-6 rounded-md bg-success/10 hover:bg-success/20 text-success flex items-center justify-center transition-colors disabled:opacity-50"
                    title="Approve loan"
                  >
                    <CheckCircle size={13} />
                  </button>
                  <button
                    onClick={() => handleReject(loan.id, loan.applicantName)}
                    disabled={processingId === loan.id}
                    className="w-6 h-6 rounded-md bg-danger/10 hover:bg-danger/20 text-danger flex items-center justify-center transition-colors disabled:opacity-50"
                    title="Reject loan"
                  >
                    <XCircle size={13} />
                  </button>
                  <Link
                    href={`/admin-dashboard/loans?selected=${loan.id}`}
                    className="w-6 h-6 rounded-md bg-muted hover:bg-background-elevated flex items-center justify-center transition-colors text-foreground-muted"
                    title="View loan details"
                  >
                    <Eye size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
