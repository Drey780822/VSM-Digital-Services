'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  DollarSign,
  FileText,
  Sparkles,
  Edit2,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  fetchCustomers,
  getCustomer360Profile,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type CustomerRecord,
  type Customer360Profile,
} from '@/lib/services/customers.service';
import StatusBadge from '@/components/booking/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/services/supabase-helpers';

export default function ClientsCRMPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selected360, setSelected360] = useState<Customer360Profile | null>(null);
  const [loading360, setLoading360] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    idNumber: '',
    address: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return customers.filter((c) => {
      return (
        !s ||
        c.fullName.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        (c.phone && c.phone.includes(s)) ||
        (c.idNumber && c.idNumber.includes(s))
      );
    });
  }, [customers, search]);

  const handleOpen360 = async (id: string) => {
    setLoading360(true);
    try {
      const p = await getCustomer360Profile(id);
      setSelected360(p);
    } catch {
      toast.error('Failed to load 360 profile');
    } finally {
      setLoading360(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      idNumber: '',
      address: '',
      notes: '',
    });
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (c: CustomerRecord) => {
    setEditingCustomer(c);
    setFormData({
      fullName: c.fullName,
      email: c.email,
      phone: c.phone || '',
      idNumber: c.idNumber || '',
      address: c.address || '',
      notes: c.notes || '',
    });
    setCreateModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      toast.error('Please enter full name and email');
      return;
    }
    setSubmitting(true);
    try {
      if (editingCustomer) {
        const updated = await updateCustomer(editingCustomer.id, formData);
        setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast.success('Client updated');
      } else {
        const created = await createCustomer(formData);
        setCustomers((prev) => [created, ...prev]);
        toast.success(`Client ${created.fullName} created`);
      }
      setCreateModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client record?')) return;
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      if (selected360?.customer.id === id) setSelected360(null);
      toast.success('Client deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Clients CRM</h1>
              <p className="text-sm text-foreground-muted">
                Unified 360° directory connecting photography bookings, loans, repayments, invoices, and memory vaults.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadCustomers}
                className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
                title="Refresh client list"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={handleOpenCreate}
                className="btn-gold px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={15} />
                <span>Add Client</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="relative w-full max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                type="text"
                placeholder="Search clients by name, email, phone, ID number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-luxury w-full pl-9 pr-4 py-2 text-xs"
              />
            </div>
            <span className="text-xs text-foreground-muted">
              {filtered.length} client{filtered.length !== 1 ? 's' : ''} registered
            </span>
          </div>

          {/* Customers Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Contact Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">ID Number</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-xs text-foreground-muted">
                        <RefreshCw size={18} className="animate-spin text-primary mx-auto mb-2" />
                        Loading client directory...
                      </td>
                    </tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-xs text-foreground-muted">
                        <Users size={28} className="text-foreground-muted/40 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-foreground">No clients found</p>
                        <p className="mt-1">Add a new client or adjust your search.</p>
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    filtered.map((c) => (
                      <tr key={c.id} className="table-row-hover transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-xs font-bold text-background flex-shrink-0">
                              {c.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{c.fullName}</div>
                              <div className="text-[10px] text-foreground-muted">{c.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-foreground-muted">{c.email}</td>
                        <td className="px-4 py-3.5 text-foreground-muted">{c.phone || '—'}</td>
                        <td className="px-4 py-3.5 text-foreground-muted font-mono">{c.idNumber || '—'}</td>
                        <td className="px-4 py-3.5 text-foreground-muted max-w-[140px] truncate">{c.address || '—'}</td>
                        <td className="px-4 py-3.5 text-foreground-muted">{formatDate(c.createdAt)}</td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpen360(c.id)}
                              className="btn-gold px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1"
                            >
                              <Eye size={12} />
                              <span>360° Profile</span>
                            </button>
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="p-1.5 rounded-md hover:bg-muted text-foreground-muted hover:text-foreground"
                              title="Edit client"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="p-1.5 rounded-md hover:bg-danger/10 text-foreground-muted hover:text-danger"
                              title="Delete client"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 360 Profile Modal */}
          {selected360 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
              <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" onClick={() => setSelected360(null)} />
              <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-card-hover p-6 z-10 space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-sm font-bold text-background">
                      {selected360.customer.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">{selected360.customer.fullName}</h3>
                      <p className="text-xs text-foreground-muted">
                        {selected360.customer.email} · {selected360.customer.phone || 'No phone'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected360(null)}
                    className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 360 Financial Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-4 rounded-xl border border-border text-center">
                  <div>
                    <span className="text-[10px] text-foreground-muted uppercase block">Lifetime Value (LTV)</span>
                    <span className="text-base font-bold text-gradient-gold">{formatCurrency(selected360.totalLifetimeValue)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-foreground-muted uppercase block">Total Bookings</span>
                    <span className="text-base font-bold text-foreground">{selected360.bookings.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-foreground-muted uppercase block">Total Loans</span>
                    <span className="text-base font-bold text-foreground">{selected360.loans.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-foreground-muted uppercase block">Active Debt Balance</span>
                    <span className="text-base font-bold text-primary">{formatCurrency(selected360.activeLoansBalance)}</span>
                  </div>
                </div>

                {/* Bookings history */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={13} className="text-primary" /> Photography Bookings ({selected360.bookings.length})
                    </h4>
                  </div>
                  {selected360.bookings.length > 0 ? (
                    <div className="space-y-1.5">
                      {selected360.bookings.map((b) => (
                        <div key={b.id} className="bg-muted/20 p-2.5 rounded-lg border border-border flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-foreground">{b.packageName}</span>
                            <span className="text-foreground-muted text-[11px] ml-2">({b.eventType} on {formatDate(b.eventDate)})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-foreground">{formatCurrency(b.totalAmount || b.deposit)}</span>
                            <StatusBadge status={b.status} className="text-[10px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground-muted italic">No bookings recorded.</p>
                  )}
                </div>

                {/* Loans & Repayments history */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-primary" /> Loans & Applications ({selected360.loans.length})
                  </h4>
                  {selected360.loans.length > 0 ? (
                    <div className="space-y-1.5">
                      {selected360.loans.map((l) => (
                        <div key={l.id} className="bg-muted/20 p-2.5 rounded-lg border border-border flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-foreground">{formatCurrency(l.amount)}</span>
                            <span className="text-foreground-muted text-[11px] ml-2">({l.purpose} · {l.termMonths} mo)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-primary font-bold">Bal: {formatCurrency(l.balance)}</span>
                            <span className="px-2 py-0.5 rounded bg-muted text-[10px] border border-border">{l.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground-muted italic">No loan applications recorded.</p>
                  )}
                </div>

                {/* Invoices */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={13} className="text-primary" /> Invoices ({selected360.invoices.length})
                  </h4>
                  {selected360.invoices.length > 0 ? (
                    <div className="space-y-1.5">
                      {selected360.invoices.map((inv) => (
                        <div key={inv.id} className="bg-muted/20 p-2.5 rounded-lg border border-border flex items-center justify-between text-xs">
                          <span className="font-mono text-foreground">{inv.invoiceNumber}</span>
                          <span className="text-foreground-muted">{formatDate(inv.issueDate)}</span>
                          <span className="font-bold text-foreground">{formatCurrency(inv.totalAmount)}</span>
                          <span className="px-2 py-0.5 rounded bg-muted text-[10px] border border-border">{inv.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground-muted italic">No invoices issued.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add / Edit Client Modal */}
          {createModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
              <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-card-hover p-6 z-10">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <h3 className="text-base font-bold text-foreground">
                    {editingCustomer ? 'Edit Client Details' : 'Add New Client'}
                  </h3>
                  <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded text-foreground-muted hover:text-foreground">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Zanele Khumalo"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="input-luxury w-full px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="zanele@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-luxury w-full px-3 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="+27 82 000 0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-luxury w-full px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                        ID Number
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

                  <div>
                    <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                      Physical / Billing Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sandton, Johannesburg"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="input-luxury w-full px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                      Internal Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add relationship remarks or preferences..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="input-luxury w-full px-3 py-2 resize-none"
                    />
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
                      Save Client
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
