'use client';
import React, { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  CreditCard,
  Plus,
  Search,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle,
  X,
  Loader2,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchRepayments,
  recordRepayment,
  deleteRepayment,
  type RepaymentRecord,
  type PaymentMethod,
} from '@/lib/services/repayments.service';
import { fetchLoans, type LoanRecord } from '@/lib/services/loans.service';
import { formatCurrency, formatDateTime } from '@/lib/services/supabase-helpers';

const PAYMENT_METHODS: PaymentMethod[] = [
  'EFT',
  'Debit Order',
  'PayFast',
  'Ozow',
  'Cash',
  'Direct Deposit',
];

function RepaymentsContent() {
  const searchParams = useSearchParams();
  const queryLoanId = searchParams.get('loanId');

  const [repayments, setRepayments] = useState<RepaymentRecord[]>([]);
  const [activeLoans, setActiveLoans] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');

  const [recordModalOpen, setRecordModalOpen] = useState(Boolean(queryLoanId));
  const [selectedLoanId, setSelectedLoanId] = useState(queryLoanId || '');
  const [amount, setAmount] = useState<number>(1000);
  const [method, setMethod] = useState<PaymentMethod>('EFT');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [repayData, loansData] = await Promise.all([
        fetchRepayments(),
        fetchLoans(),
      ]);
      setRepayments(repayData);
      setActiveLoans(loansData.filter((l) => l.status === 'Disbursed' || l.status === 'Approved' || l.balance > 0));
    } catch {
      toast.error('Failed to load repayment records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return repayments.filter((r) => {
      const matchSearch =
        !s ||
        r.referenceNumber.toLowerCase().includes(s) ||
        (r.applicantName && r.applicantName.toLowerCase().includes(s)) ||
        (r.transactionId && r.transactionId.toLowerCase().includes(s));
      const matchMethod = methodFilter === 'All' || r.paymentMethod === methodFilter;
      return matchSearch && matchMethod;
    });
  }, [repayments, search, methodFilter]);

  const totalCollected = useMemo(() => {
    return repayments.reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [repayments]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId || amount <= 0) {
      toast.error('Please select a loan and enter a valid payment amount.');
      return;
    }
    setSubmitting(true);
    try {
      const recorded = await recordRepayment({
        loanId: selectedLoanId,
        amount,
        paymentMethod: method,
        transactionId: transactionId || undefined,
        notes: notes || undefined,
      });
      setRepayments((prev) => [recorded, ...prev]);
      toast.success(`Repayment of ${formatCurrency(amount)} recorded successfully!`);
      setRecordModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Record failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    try {
      await deleteRepayment(id);
      setRepayments((prev) => prev.filter((r) => r.id !== id));
      toast.success('Repayment record deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast.info('No repayments to export');
      return;
    }
    const headers = ['Reference', 'Borrower', 'Amount', 'Payment Method', 'Status', 'Transaction ID', 'Date', 'Notes'];
    const rows = filtered.map((r) => [
      r.referenceNumber,
      `"${(r.applicantName || '').replace(/"/g, '""')}"`,
      r.amount,
      r.paymentMethod,
      r.status,
      r.transactionId || '',
      r.paymentDate,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `vsm-repayments-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Repayment ledger exported');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Repayments Ledger</h1>
          <p className="text-sm text-foreground-muted">
            Track loan collections, record manual repayments, and verify balance reductions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
            title="Refresh repayments"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={exportCSV}
            className="btn-silver px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Export Ledger</span>
          </button>
          <button
            onClick={() => {
              if (activeLoans.length > 0 && !selectedLoanId) {
                setSelectedLoanId(activeLoans[0].id);
                setAmount(activeLoans[0].monthlyInstalment || 1000);
              }
              setRecordModalOpen(true);
            }}
            className="btn-gold px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} />
            <span>Record Repayment</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-[10px] text-foreground-muted uppercase font-semibold">Total Collections</span>
          <p className="text-2xl font-bold text-gradient-gold counter-value mt-1">{formatCurrency(totalCollected)}</p>
          <span className="text-[10px] text-success font-medium">All-time loan returns</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-[10px] text-foreground-muted uppercase font-semibold">Total Payments Logged</span>
          <p className="text-2xl font-bold text-foreground counter-value mt-1">{repayments.length}</p>
          <span className="text-[10px] text-foreground-muted">Verified transactions</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-[10px] text-foreground-muted uppercase font-semibold">Average Payment Size</span>
          <p className="text-2xl font-bold text-primary counter-value mt-1">
            {formatCurrency(repayments.length > 0 ? totalCollected / repayments.length : 0)}
          </p>
          <span className="text-[10px] text-foreground-muted">Per instalment</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search by borrower, ref, transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-luxury w-full pl-9 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-muted">Payment Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="input-luxury px-3 py-1.5 text-xs bg-muted/40"
          >
            <option value="All">All Methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
                <th className="px-4 py-3">Reference & Date</th>
                <th className="px-4 py-3">Borrower</th>
                <th className="px-4 py-3">Amount Repaid</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-xs text-foreground-muted">
                    <RefreshCw size={18} className="animate-spin text-primary mx-auto mb-2" />
                    Loading repayment records...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-xs text-foreground-muted">
                    <CreditCard size={28} className="text-foreground-muted/40 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">No repayments recorded</p>
                    <p className="mt-1">Click &quot;Record Repayment&quot; to log a payment against an active loan.</p>
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((r) => (
                  <tr key={r.id} className="table-row-hover transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-foreground font-semibold">{r.referenceNumber}</div>
                      <div className="text-[10px] text-foreground-muted">{formatDateTime(r.paymentDate)}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-foreground">{r.applicantName || 'Loan Customer'}</div>
                      <div className="text-[10px] text-foreground-muted font-mono">{r.loanReference || r.loanId.slice(0, 8)}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-success counter-value">
                      +{formatCurrency(r.amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-muted text-[11px] text-foreground border border-border">
                        {r.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-foreground-muted text-[11px]">
                      {r.transactionId || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1 text-success text-[11px] font-semibold">
                        <CheckCircle size={12} />
                        Completed
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-foreground-muted max-w-[150px] truncate">
                      {r.notes || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-md hover:bg-danger/10 text-foreground-muted hover:text-danger transition-colors"
                        title="Delete repayment"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Repayment Modal */}
      {recordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setRecordModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-card-hover p-6 z-10">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground">Record Loan Repayment</h3>
              <button
                onClick={() => setRecordModalOpen(false)}
                className="p-1 rounded text-foreground-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                  Select Active Loan *
                </label>
                <select
                  required
                  value={selectedLoanId}
                  onChange={(e) => {
                    setSelectedLoanId(e.target.value);
                    const match = activeLoans.find((l) => l.id === e.target.value);
                    if (match) setAmount(match.monthlyInstalment || 1000);
                  }}
                  className="input-luxury w-full px-3 py-2 bg-muted/40"
                >
                  <option value="">-- Select a borrower --</option>
                  {activeLoans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.applicantName} ({l.referenceNumber}) — Balance: {formatCurrency(l.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                  Repayment Amount (ZAR) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="input-luxury w-full px-3 py-2 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Payment Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    className="input-luxury w-full px-3 py-2 bg-muted/40"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Transaction / Proof ID
                  </label>
                  <input
                    type="text"
                    placeholder="EFT Ref or Ozow ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional payment notes or confirmation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-luxury w-full px-3 py-2 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setRecordModalOpen(false)}
                  className="btn-silver px-3 py-2 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  Submit Repayment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RepaymentsPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<div className="p-8 text-center text-xs text-foreground-muted">Loading Repayments...</div>}>
          <RepaymentsContent />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
