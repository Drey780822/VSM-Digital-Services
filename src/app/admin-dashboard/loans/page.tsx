'use client';
import React, { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  TrendingUp,
  Plus,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
  AlertTriangle,
  FileText,
  User,
  X,
  Loader2,
  Download,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  fetchLoans,
  createLoan,
  updateLoanStatus,
  deleteLoan,
  calculateLoanTerms,
  type LoanRecord,
  type LoanStatus,
  type RiskLevel,
} from '@/lib/services/loans.service';
import { formatCurrency, formatDate } from '@/lib/services/supabase-helpers';

const STATUS_OPTIONS: LoanStatus[] = [
  'Submitted',
  'Under Review',
  'Approved',
  'Disbursed',
  'Repaid',
  'Defaulted',
  'Rejected',
];

const RISK_BADGES: Record<RiskLevel, string> = {
  Low: 'bg-success/15 text-success border-success/30',
  Medium: 'bg-warning/15 text-warning border-warning/30',
  High: 'bg-danger/15 text-danger border-danger/30',
};

const LOAN_STATUS_BADGES: Record<LoanStatus, string> = {
  Submitted: 'bg-info/15 text-info border-info/30',
  'Under Review': 'bg-warning/15 text-warning border-warning/30',
  Approved: 'bg-primary/20 text-primary border-gold',
  Disbursed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Repaid: 'bg-success/15 text-success border-success/30',
  Defaulted: 'bg-danger/20 text-danger border-danger/40',
  Rejected: 'bg-muted text-foreground-muted border-border',
};

function LoansContent() {
  const searchParams = useSearchParams();
  const selectedQueryId = searchParams.get('selected');

  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Loan Form state
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    idNumber: '',
    amount: 5000,
    interestRate: 18.0,
    termMonths: 6,
    purpose: 'Photography Package Financing',
    salary: 15000,
    expenses: 6000,
    employer: 'Private Enterprise',
    employmentType: 'Full-Time',
    bankName: 'Standard Bank',
    accountNumber: '',
    riskLevel: 'Low' as RiskLevel,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadLoans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLoans();
      setLoans(data);
      if (selectedQueryId) {
        const match = data.find((l) => l.id === selectedQueryId);
        if (match) setSelectedLoan(match);
      }
    } catch {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  }, [selectedQueryId]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return loans.filter((l) => {
      const matchSearch =
        !s ||
        l.applicantName.toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s) ||
        l.phone.includes(s) ||
        l.referenceNumber.toLowerCase().includes(s) ||
        (l.idNumber && l.idNumber.includes(s));
      const matchStatus = statusFilter === 'All' || l.status === statusFilter;
      const matchRisk = riskFilter === 'All' || l.riskLevel === riskFilter;
      return matchSearch && matchStatus && matchRisk;
    });
  }, [loans, search, statusFilter, riskFilter]);

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applicantName || !formData.email || formData.amount <= 0) {
      toast.error('Please fill in required fields');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createLoan(formData);
      setLoans((prev) => [created, ...prev]);
      toast.success(`Loan application registered for ${created.applicantName}`);
      setCreateModalOpen(false);
      setSelectedLoan(created);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: LoanStatus, reason?: string) => {
    if (!selectedLoan) return;
    try {
      const updated = await updateLoanStatus(selectedLoan.id, newStatus, reason);
      setSelectedLoan(updated);
      setLoans((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      toast.success(`Loan status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Status update failed');
    }
  };

  const handleDeleteLoan = async (id: string) => {
    try {
      await deleteLoan(id);
      setLoans((prev) => prev.filter((l) => l.id !== id));
      if (selectedLoan?.id === id) setSelectedLoan(null);
      toast.success('Loan deleted');
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast.info('No loans to export');
      return;
    }
    const headers = ['Reference', 'Applicant', 'Email', 'Phone', 'Amount', 'Balance', 'Monthly', 'Term', 'Risk', 'Status', 'Due Date'];
    const rows = filtered.map((l) => [
      l.referenceNumber,
      `"${l.applicantName.replace(/"/g, '""')}"`,
      l.email,
      l.phone,
      l.amount,
      l.balance,
      l.monthlyInstalment,
      l.termMonths,
      l.riskLevel,
      l.status,
      l.dueDate || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `vsm-loans-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Loans exported');
  };

  const calculatedTerms = useMemo(() => {
    return calculateLoanTerms(formData.amount, formData.interestRate, formData.termMonths);
  }, [formData.amount, formData.interestRate, formData.termMonths]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Loan Management</h1>
          <p className="text-sm text-foreground-muted">
            Underwriting, credit assessment, approval workflows, disbursements, and balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLoans}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
            title="Refresh loans"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={exportCSV}
            className="btn-silver px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-gold px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} />
            <span>New Loan</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search by applicant, ID number, ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-luxury w-full pl-9 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-foreground-muted">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-luxury px-2.5 py-1.5 text-xs bg-muted/40"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <span className="text-xs text-foreground-muted ml-2">Risk:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="input-luxury px-2.5 py-1.5 text-xs bg-muted/40"
          >
            <option value="All">All Risk</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
                <th className="px-4 py-3">Borrower</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Instalment</th>
                <th className="px-4 py-3">Outstanding Balance</th>
                <th className="px-4 py-3">Term</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Next Due</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-xs text-foreground-muted">
                    <RefreshCw size={18} className="animate-spin text-primary mx-auto mb-2" />
                    Loading loan portfolio...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center text-xs text-foreground-muted">
                    <TrendingUp size={28} className="text-foreground-muted/40 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">No loans found</p>
                    <p className="mt-1">Create a new loan application or adjust search filters.</p>
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((loan) => (
                  <tr key={loan.id} className="table-row-hover transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                          {loan.applicantName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate">{loan.applicantName}</div>
                          <div className="text-[10px] text-foreground-muted font-mono">{loan.referenceNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-foreground counter-value">
                      {formatCurrency(loan.amount)}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-foreground counter-value">
                      {formatCurrency(loan.monthlyInstalment)} / mo
                    </td>
                    <td className="px-4 py-3.5 font-bold text-primary counter-value">
                      {formatCurrency(loan.balance)}
                    </td>
                    <td className="px-4 py-3.5 text-foreground-muted">{loan.termMonths} mo</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${RISK_BADGES[loan.riskLevel]}`}>
                        {loan.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${LOAN_STATUS_BADGES[loan.status]}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-foreground-muted counter-value">
                      {loan.dueDate ? formatDate(loan.dueDate) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedLoan(loan)}
                          className="p-1.5 rounded-md hover:bg-muted text-foreground-muted hover:text-primary transition-colors"
                          title="View loan details & Underwriting"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(loan.id)}
                          className="p-1.5 rounded-md hover:bg-danger/10 text-foreground-muted hover:text-danger transition-colors"
                          title="Delete loan"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loan Details & Underwriting Drawer */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" onClick={() => setSelectedLoan(null)} />
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-card-hover p-6 z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">{selectedLoan.applicantName}</h3>
                <p className="text-xs text-foreground-muted font-mono">{selectedLoan.referenceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedLoan(null)}
                className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Financial Overview Card */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted block">Principal</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(selectedLoan.amount)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted block">Monthly Due</span>
                <span className="text-sm font-bold text-primary">{formatCurrency(selectedLoan.monthlyInstalment)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted block">Balance</span>
                <span className="text-sm font-bold text-gradient-gold">{formatCurrency(selectedLoan.balance)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted block">Status</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${LOAN_STATUS_BADGES[selectedLoan.status]}`}>
                  {selectedLoan.status}
                </span>
              </div>
            </div>

            {/* Underwriting Information */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-muted/20 p-3 rounded-lg border border-border">
                <p className="text-[10px] text-foreground-muted uppercase font-semibold">Monthly Income (Salary)</p>
                <p className="text-sm font-bold text-success mt-0.5">{formatCurrency(selectedLoan.salary)}</p>
              </div>
              <div className="bg-muted/20 p-3 rounded-lg border border-border">
                <p className="text-[10px] text-foreground-muted uppercase font-semibold">Declared Monthly Expenses</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{formatCurrency(selectedLoan.expenses)}</p>
              </div>
              <div className="bg-muted/20 p-3 rounded-lg border border-border">
                <p className="text-[10px] text-foreground-muted uppercase font-semibold">Employer / Employment</p>
                <p className="text-foreground font-medium mt-0.5">{selectedLoan.employer || 'Self-employed'} ({selectedLoan.employmentType || 'Standard'})</p>
              </div>
              <div className="bg-muted/20 p-3 rounded-lg border border-border">
                <p className="text-[10px] text-foreground-muted uppercase font-semibold">Banking Details</p>
                <p className="text-foreground font-medium mt-0.5">{selectedLoan.bankName || 'Standard Bank'} - {selectedLoan.accountNumber || '•••'}</p>
              </div>
              <div className="bg-muted/20 p-3 rounded-lg border border-border">
                <p className="text-[10px] text-foreground-muted uppercase font-semibold">Contact Email</p>
                <p className="text-foreground font-medium mt-0.5 truncate">{selectedLoan.email}</p>
              </div>
              <div className="bg-muted/20 p-3 rounded-lg border border-border">
                <p className="text-[10px] text-foreground-muted uppercase font-semibold">Phone Number</p>
                <p className="text-foreground font-medium mt-0.5">{selectedLoan.phone}</p>
              </div>
            </div>

            {/* Quick Actions for Underwriting */}
            <div className="border-t border-border pt-4">
              <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-3">Underwriting Decisions</h4>
              <div className="flex flex-wrap gap-2">
                {selectedLoan.status !== 'Approved' && selectedLoan.status !== 'Disbursed' && selectedLoan.status !== 'Repaid' && (
                  <button
                    onClick={() => handleStatusUpdate('Approved')}
                    className="btn-gold px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <CheckCircle size={14} />
                    Approve Application
                  </button>
                )}

                {selectedLoan.status === 'Approved' && (
                  <button
                    onClick={() => handleStatusUpdate('Disbursed')}
                    className="btn-gold px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <DollarSign size={14} />
                    Disburse Funds (Activate Loan)
                  </button>
                )}

                {selectedLoan.status !== 'Rejected' && selectedLoan.status !== 'Repaid' && (
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) handleStatusUpdate('Rejected', reason);
                    }}
                    className="btn-silver px-3.5 py-2 text-xs font-medium rounded-lg text-danger hover:text-danger hover:border-danger/40 flex items-center gap-1.5"
                  >
                    <XCircle size={14} />
                    Reject Loan
                  </button>
                )}

                <Link
                  href={`/admin-dashboard/repayments?loanId=${selectedLoan.id}`}
                  className="btn-silver px-3.5 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5"
                >
                  <DollarSign size={14} />
                  Record Repayment
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Loan Application Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-card-hover p-6 z-10">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground">Create Loan Application</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded text-foreground-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Applicant Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={formData.applicantName}
                    onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="applicant@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+27 82 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    SA ID Number
                  </label>
                  <input
                    type="text"
                    placeholder="13-digit ID"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Loan Amount (ZAR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Term (Months)
                  </label>
                  <select
                    value={formData.termMonths}
                    onChange={(e) => setFormData({ ...formData, termMonths: Number(e.target.value) })}
                    className="input-luxury w-full px-3 py-2 bg-muted/40"
                  >
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months</option>
                    <option value={24}>24 Months</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Risk Category
                  </label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as RiskLevel })}
                    className="input-luxury w-full px-3 py-2 bg-muted/40"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>
              </div>

              {/* Calculated preview */}
              <div className="bg-muted/30 p-3 rounded-lg border border-border grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[9px] text-foreground-muted block uppercase">Monthly Instalment</span>
                  <span className="text-xs font-bold text-primary">{formatCurrency(calculatedTerms.monthlyInstalment)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-foreground-muted block uppercase">Total Interest</span>
                  <span className="text-xs font-bold text-foreground">{formatCurrency(calculatedTerms.totalInterest)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-foreground-muted block uppercase">Total Repayable</span>
                  <span className="text-xs font-bold text-gradient-gold">{formatCurrency(calculatedTerms.totalPayable)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Salary (Gross Monthly)
                  </label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Monthly Expenses
                  </label>
                  <input
                    type="number"
                    value={formData.expenses}
                    onChange={(e) => setFormData({ ...formData, expenses: Number(e.target.value) })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
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
                  Register Loan Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-card-hover z-10 text-center">
            <h4 className="text-sm font-bold text-foreground mb-2">Delete Loan</h4>
            <p className="text-xs text-foreground-muted mb-5">
              Are you sure you want to delete this loan record?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-silver flex-1 py-2 text-xs font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLoan(deleteConfirmId)}
                className="btn-gold flex-1 py-2 text-xs font-semibold rounded-lg bg-danger hover:bg-danger/90 text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoansManagementPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<div className="p-8 text-center text-xs text-foreground-muted">Loading Loans...</div>}>
          <LoansContent />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
