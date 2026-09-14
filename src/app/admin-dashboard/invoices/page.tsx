'use client';
import React, { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Printer,
  Download,
  CheckCircle,
  Trash2,
  X,
  Loader2,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchInvoices,
  createInvoice,
  updateInvoiceStatus,
  recordInvoicePayment,
  deleteInvoice,
  type InvoiceRecord,
  type InvoiceItem,
  type InvoiceStatus,
} from '@/lib/services/invoices.service';
import { formatCurrency, formatDate } from '@/lib/services/supabase-helpers';

const INVOICE_STATUS_BADGES: Record<InvoiceStatus, string> = {
  Draft: 'bg-muted text-foreground-muted border-border',
  Sent: 'bg-info/15 text-info border-info/30',
  Paid: 'bg-success/15 text-success border-success/30',
  Overdue: 'bg-danger/15 text-danger border-danger/30',
  Cancelled: 'bg-muted text-foreground-muted border-border',
};

function InvoicesContent() {
  const searchParams = useSearchParams();
  const queryBookingId = searchParams.get('bookingId');
  const queryClientName = searchParams.get('clientName');
  const queryEmail = searchParams.get('email');
  const queryAmount = searchParams.get('amount');

  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(Boolean(queryBookingId || queryClientName));
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    bookingId?: string;
    dueDate: string;
    items: InvoiceItem[];
    taxRate: number;
    discountAmount: number;
    notes: string;
  }>({
    customerName: queryClientName || '',
    customerEmail: queryEmail || '',
    customerPhone: '',
    customerAddress: '',
    bookingId: queryBookingId || undefined,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    items: [
      {
        description: 'Photography Package Service',
        quantity: 1,
        unitPrice: queryAmount ? Number(queryAmount) : 8900,
        amount: queryAmount ? Number(queryAmount) : 8900,
      },
    ],
    taxRate: 0,
    discountAmount: 0,
    notes: 'Thank you for choosing VSM Digital Services. Please use your invoice number as the EFT reference.',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchInvoices();
      setInvoices(data);
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return invoices.filter((inv) => {
      const matchSearch =
        !s ||
        inv.invoiceNumber.toLowerCase().includes(s) ||
        inv.customerName.toLowerCase().includes(s) ||
        inv.customerEmail.toLowerCase().includes(s);
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }],
    });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, val: string | number) => {
    const newItems = [...formData.items];
    const target = { ...newItems[index], [field]: val };
    target.amount = (target.quantity || 1) * (target.unitPrice || 0);
    newItems[index] = target;
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerEmail || formData.items.length === 0) {
      toast.error('Please complete all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createInvoice(formData);
      setInvoices((prev) => [created, ...prev]);
      toast.success(`Invoice ${created.invoiceNumber} generated!`);
      setCreateModalOpen(false);
      setSelectedInvoice(created);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      const updated = await recordInvoicePayment(id);
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
      if (selectedInvoice?.id === id) setSelectedInvoice(updated);
      toast.success('Invoice marked as Paid');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment update failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvoice(id);
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      if (selectedInvoice?.id === id) setSelectedInvoice(null);
      toast.success('Invoice deleted');
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Invoicing System</h1>
          <p className="text-sm text-foreground-muted">
            Generate branded luxury invoices, track payment status, and export printable statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadInvoices}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
            title="Refresh invoices"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-gold px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search by invoice number, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-luxury w-full pl-9 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-muted">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-luxury px-3 py-1.5 text-xs bg-muted/40"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-foreground-muted">
                    <RefreshCw size={18} className="animate-spin text-primary mx-auto mb-2" />
                    Loading invoices...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-foreground-muted">
                    <FileText size={28} className="text-foreground-muted/40 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">No invoices found</p>
                    <p className="mt-1">Click &quot;Create Invoice&quot; to issue a new bill to a client.</p>
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((inv) => (
                  <tr key={inv.id} className="table-row-hover transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-foreground">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-foreground">{inv.customerName}</div>
                      <div className="text-[10px] text-foreground-muted">{inv.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3.5 text-foreground-muted">{formatDate(inv.issueDate)}</td>
                    <td className="px-4 py-3.5 text-foreground-muted">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3.5 font-bold text-gradient-gold counter-value">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${INVOICE_STATUS_BADGES[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 rounded-md hover:bg-muted text-foreground-muted hover:text-primary transition-colors"
                          title="View / Print Invoice"
                        >
                          <Eye size={14} />
                        </button>
                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => handleMarkPaid(inv.id)}
                            className="p-1.5 rounded-md hover:bg-success/10 text-foreground-muted hover:text-success transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirmId(inv.id)}
                          className="p-1.5 rounded-md hover:bg-danger/10 text-foreground-muted hover:text-danger transition-colors"
                          title="Delete invoice"
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

      {/* Luxury Printable Invoice Preview Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 print:p-0">
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm print:hidden" onClick={() => setSelectedInvoice(null)} />
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-card-hover p-6 sm:p-8 z-10 space-y-6 print:border-none print:shadow-none print:p-0">
            {/* Action Bar (hidden on print) */}
            <div className="flex items-center justify-between border-b border-border pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground-muted">Status:</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${INVOICE_STATUS_BADGES[selectedInvoice.status]}`}>
                  {selectedInvoice.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedInvoice.status !== 'Paid' && (
                  <button
                    onClick={() => handleMarkPaid(selectedInvoice.id)}
                    className="btn-gold px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle size={13} />
                    Mark as Paid
                  </button>
                )}
                <button
                  onClick={handlePrint}
                  className="btn-silver px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1"
                >
                  <Printer size={13} />
                  Print / PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Invoice Printable Document */}
            <div className="space-y-6 text-xs">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gradient-gold">VSM DIGITAL SERVICES</h2>
                  <p className="text-[11px] text-foreground-muted mt-1 leading-relaxed">
                    Photography & Financial Solutions<br />
                    Gauteng, South Africa<br />
                    info@vsm.co.za | +27 82 000 0000
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold text-foreground">TAX INVOICE</h3>
                  <p className="font-mono text-xs text-primary font-bold">{selectedInvoice.invoiceNumber}</p>
                  <p className="text-[10px] text-foreground-muted mt-1">Issue Date: {formatDate(selectedInvoice.issueDate)}</p>
                  <p className="text-[10px] text-foreground-muted">Due Date: {formatDate(selectedInvoice.dueDate)}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="bg-muted/20 p-4 rounded-xl border border-border">
                <span className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold block mb-1">
                  Billed To
                </span>
                <p className="text-sm font-bold text-foreground">{selectedInvoice.customerName}</p>
                <p className="text-foreground-muted">{selectedInvoice.customerEmail}</p>
                {selectedInvoice.customerPhone && <p className="text-foreground-muted">{selectedInvoice.customerPhone}</p>}
                {selectedInvoice.customerAddress && <p className="text-foreground-muted">{selectedInvoice.customerAddress}</p>}
              </div>

              {/* Line Items Table */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] font-semibold text-foreground-muted uppercase">
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 text-foreground">{item.description}</td>
                      <td className="py-2.5 text-center text-foreground-muted">{item.quantity}</td>
                      <td className="py-2.5 text-right text-foreground-muted">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2.5 text-right font-semibold text-foreground">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation Breakdown */}
              <div className="border-t border-border pt-3 space-y-1.5 text-right">
                <div className="flex justify-between text-foreground-muted">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedInvoice.discountAmount)}</span>
                  </div>
                )}
                {selectedInvoice.taxAmount > 0 && (
                  <div className="flex justify-between text-foreground-muted">
                    <span>VAT ({selectedInvoice.taxRate}%):</span>
                    <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gradient-gold border-t border-border pt-2">
                  <span>Total Amount Due:</span>
                  <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                </div>
              </div>

              {/* Banking Details / Footer */}
              <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-1">
                <span className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold block mb-1">
                  Payment Details (EFT)
                </span>
                <p className="text-foreground font-semibold">Bank: Standard Bank</p>
                <p className="text-foreground-muted">Account Name: VSM Digital Services</p>
                <p className="text-foreground-muted">Reference: <span className="font-mono text-primary font-bold">{selectedInvoice.invoiceNumber}</span></p>
              </div>

              {selectedInvoice.notes && (
                <p className="text-[10px] text-foreground-muted italic text-center">
                  {selectedInvoice.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-card-hover p-6 z-10">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground">Create Tax Invoice</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded text-foreground-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full client name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Client Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="client@email.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Phone / Address
                  </label>
                  <input
                    type="text"
                    placeholder="Contact info"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase">
                    Invoice Line Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>

                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg border border-border">
                    <input
                      type="text"
                      required
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="input-luxury flex-1 px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      className="input-luxury w-16 px-2 py-1.5 text-center text-xs"
                    />
                    <input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                      className="input-luxury w-24 px-2 py-1.5 text-right text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-foreground-muted hover:text-danger"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                  Invoice Notes
                </label>
                <textarea
                  rows={2}
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
                  Generate Invoice
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
            <h4 className="text-sm font-bold text-foreground mb-2">Delete Invoice</h4>
            <p className="text-xs text-foreground-muted mb-5">
              Are you sure you want to delete this invoice record?
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="btn-silver flex-1 py-2 text-xs font-medium rounded-lg">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="btn-gold flex-1 py-2 text-xs font-semibold rounded-lg bg-danger hover:bg-danger/90 text-white">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvoicesManagementPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<div className="p-8 text-center text-xs text-foreground-muted">Loading Invoices...</div>}>
          <InvoicesContent />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
