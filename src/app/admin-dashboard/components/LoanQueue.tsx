'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getLoanApplications, type LoanApplicationRecord } from '@/lib/owner-ops';

const RISK_STYLES: Record<string, string> = {
  Low: 'text-success bg-success/10 border-success/30',
  Medium: 'text-warning bg-warning/10 border-warning/30',
  High: 'text-danger bg-danger/10 border-danger/30',
};

export default function LoanQueue() {
  const [loans, setLoans] = useState<LoanApplicationRecord[]>([]);

  useEffect(() => {
    getLoanApplications().then(setLoans);
  }, []);

  const approve = (id: string, name: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
    toast.success(`Loan approved for ${name}`);
  };

  const reject = (id: string, name: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
    toast.error(`Loan rejected for ${name}`);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Loan Approval Queue</h3>
          <p className="text-xs text-foreground-muted mt-0.5">{loans.length} pending review</p>
        </div>
        <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
      </div>

      <div className="divide-y divide-border/50">
        {loans.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle size={28} className="text-success mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-foreground-muted mt-1">No pending loan applications.</p>
          </div>
        ) : (
          loans.map((loan) => (
            <div
              key={loan.id}
              className="p-4 hover:bg-muted/30 transition-colors duration-150 group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground flex-shrink-0">
                    {loan.applicant
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">
                      {loan.applicant}
                    </div>
                    <div className="text-[10px] text-foreground-muted">
                      {loan.id} · {loan.applied}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-foreground counter-value">
                    R {loan.amount.toLocaleString()}
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${RISK_STYLES[loan.risk]}`}
                  >
                    {loan.risk === 'High' && <AlertTriangle size={8} className="inline mr-0.5" />}
                    {loan.risk} Risk
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-foreground-muted">
                    {loan.purpose} · Salary R {loan.salary.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    onClick={() => approve(loan.id, loan.applicant)}
                    className="w-6 h-6 rounded-md bg-success/10 hover:bg-success/20 flex items-center justify-center transition-colors"
                    title="Approve loan"
                  >
                    <CheckCircle size={12} className="text-success" />
                  </button>
                  <button
                    onClick={() => reject(loan.id, loan.applicant)}
                    className="w-6 h-6 rounded-md bg-danger/10 hover:bg-danger/20 flex items-center justify-center transition-colors"
                    title="Reject loan"
                  >
                    <XCircle size={12} className="text-danger" />
                  </button>
                  <button
                    className="w-6 h-6 rounded-md bg-muted hover:bg-background-elevated flex items-center justify-center transition-colors"
                    title="View full application"
                  >
                    <Eye size={12} className="text-foreground-muted" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
