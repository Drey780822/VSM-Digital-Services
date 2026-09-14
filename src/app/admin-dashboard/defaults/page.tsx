'use client';
import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  AlertTriangle,
  RefreshCw,
  Phone,
  Mail,
  DollarSign,
  CheckCircle,
  FileText,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  fetchDefaultsAndOverdue,
  applyLatePenalty,
  markAsDefaulted,
  type DefaultedLoanItem,
} from '@/lib/services/defaults.service';
import { formatCurrency, formatDate } from '@/lib/services/supabase-helpers';

const AGING_STYLES: Record<string, string> = {
  '1-30 Days': 'bg-warning/15 text-warning border-warning/30',
  '31-60 Days': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  '60+ Days': 'bg-danger/20 text-danger border-danger/40',
  Defaulted: 'bg-danger/30 text-danger border-danger font-bold',
};

export default function DefaultsManagementPage() {
  const [items, setItems] = useState<DefaultedLoanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingPenaltyId, setApplyingPenaltyId] = useState<string | null>(null);

  const loadDefaults = async () => {
    setLoading(true);
    try {
      const data = await fetchDefaultsAndOverdue();
      setItems(data);
    } catch {
      toast.error('Failed to load overdue and defaulted loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDefaults();
  }, []);

  const handleApplyPenalty = async (loanId: string, penalty: number) => {
    setApplyingPenaltyId(loanId);
    try {
      await applyLatePenalty(loanId, penalty, 'Standard 5% late penalty');
      toast.success(`Late penalty of ${formatCurrency(penalty)} applied to loan`);
      loadDefaults();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Penalty failed');
    } finally {
      setApplyingPenaltyId(null);
    }
  };

  const handleMarkDefaulted = async (loanId: string) => {
    const reason = prompt('Enter default rationale:');
    if (!reason) return;
    try {
      await markAsDefaulted(loanId, reason);
      toast.success('Loan marked as Defaulted');
      loadDefaults();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const totalAtRisk = items.reduce((sum, it) => sum + (it.loan.balance || 0), 0);

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Loan Defaults & Overdue</h1>
              <p className="text-sm text-foreground-muted">
                Dynamic overdue aging, debt recovery management, late penalties, and collection tracking.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadDefaults}
                className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
                title="Refresh defaults"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-danger/30 bg-danger/5 rounded-xl p-4">
              <span className="text-[10px] text-danger uppercase font-semibold flex items-center gap-1">
                <AlertTriangle size={12} /> Total Capital At Risk
              </span>
              <p className="text-2xl font-bold text-danger counter-value mt-1">{formatCurrency(totalAtRisk)}</p>
              <span className="text-[10px] text-foreground-muted">Outstanding on overdue loans</span>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <span className="text-[10px] text-foreground-muted uppercase font-semibold">Overdue Accounts</span>
              <p className="text-2xl font-bold text-foreground counter-value mt-1">{items.length}</p>
              <span className="text-[10px] text-foreground-muted">Accounts past payment due date</span>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <span className="text-[10px] text-foreground-muted uppercase font-semibold">Overdue 60+ Days / Defaults</span>
              <p className="text-2xl font-bold text-danger counter-value mt-1">
                {items.filter((it) => it.daysOverdue > 60 || it.loan.status === 'Defaulted').length}
              </p>
              <span className="text-[10px] text-foreground-muted">Critical collection phase</span>
            </div>
          </div>

          {/* Defaults List */}
          <div className="space-y-4">
            {loading && (
              <div className="p-16 text-center text-xs text-foreground-muted bg-card border border-border rounded-xl">
                <RefreshCw size={20} className="animate-spin text-primary mx-auto mb-2" />
                Calculating overdue aging and defaults...
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="p-12 text-center text-xs text-foreground-muted bg-card border border-border rounded-xl">
                <CheckCircle size={32} className="text-success mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">Zero Defaults</p>
                <p className="mt-1">All active loans are up to date and performing within terms.</p>
              </div>
            )}
            {!loading &&
              items.map((item) => (
                <div
                  key={item.loan.id}
                  className="bg-card border border-border hover:border-danger/40 rounded-xl p-5 shadow-card transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground truncate">{item.loan.applicantName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${AGING_STYLES[item.agingCategory]}`}>
                        {item.daysOverdue} Days Overdue ({item.agingCategory})
                      </span>
                      <span className="font-mono text-[10px] text-foreground-muted">
                        {item.loan.referenceNumber}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted pt-1">
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-primary" /> {item.loan.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-primary" /> {item.loan.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-primary" /> Due Date: {item.loan.dueDate ? formatDate(item.loan.dueDate) : '—'}
                      </span>
                    </div>

                    {item.loan.notes && (
                      <p className="text-[11px] text-foreground-muted/80 bg-muted/20 p-2 rounded border border-border/50 max-w-xl">
                        {item.loan.notes}
                      </p>
                    )}
                  </div>

                  {/* Financials & Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-border">
                    <div className="text-left md:text-right">
                      <div className="text-base font-bold text-danger counter-value">
                        {formatCurrency(item.loan.balance)}
                      </div>
                      <div className="text-[10px] text-foreground-muted">
                        Monthly: {formatCurrency(item.loan.monthlyInstalment)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleApplyPenalty(item.loan.id, item.suggestedPenalty)}
                        disabled={applyingPenaltyId === item.loan.id}
                        className="btn-silver px-3 py-1.5 text-xs font-medium rounded-lg hover:border-warning hover:text-warning transition-colors"
                        title="Apply 5% NCR late payment penalty"
                      >
                        + 5% Penalty ({formatCurrency(item.suggestedPenalty)})
                      </button>

                      {item.loan.status !== 'Defaulted' && (
                        <button
                          onClick={() => handleMarkDefaulted(item.loan.id)}
                          className="btn-silver px-3 py-1.5 text-xs font-medium rounded-lg text-danger hover:border-danger hover:bg-danger/10 transition-colors"
                        >
                          Mark Defaulted
                        </button>
                      )}

                      <Link
                        href={`/admin-dashboard/repayments?loanId=${item.loan.id}`}
                        className="btn-gold px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1"
                      >
                        <DollarSign size={13} />
                        Record Recovery
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
