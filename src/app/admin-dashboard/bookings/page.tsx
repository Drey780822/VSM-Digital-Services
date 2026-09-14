'use client';
import React, { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  FileText,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from '@/components/booking/StatusBadge';
import BookingDetailModal from '../components/BookingDetailModal';
import {
  fetchBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  type BookingRecord,
  type BookingStatus,
} from '@/lib/services/bookings.service';
import { formatCurrency, formatDate } from '@/lib/services/supabase-helpers';

const EVENT_TYPES = ['All', 'Wedding', 'Birthday', 'Corporate', 'Graduation', 'Funeral', 'Groove'];
const STATUS_OPTIONS: BookingStatus[] = [
  'Submitted',
  'Under Review',
  'Approved',
  'Scheduled',
  'Event Completed',
  'Gallery Uploaded',
  'Delivered',
  'Rejected',
  'Cancelled',
];

function BookingsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  const actionParam = searchParams.get('action');

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [editingBooking, setEditingBooking] = useState<BookingRecord | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(actionParam === 'new');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state for Create / Edit
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    idNumber: '',
    eventType: 'Wedding',
    packageName: 'Cinematic Experience',
    eventDate: new Date().toISOString().slice(0, 10),
    eventTime: '12:00',
    venueName: '',
    venueAddress: '',
    guestCount: 50,
    totalAmount: 8900,
    deposit: 8900,
    status: 'Submitted' as BookingStatus,
    financed: false,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings from Supabase');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return bookings.filter((b) => {
      const matchSearch =
        !s ||
        b.customerName.toLowerCase().includes(s) ||
        b.email.toLowerCase().includes(s) ||
        b.phone.includes(s) ||
        b.referenceNumber.toLowerCase().includes(s) ||
        b.venueName.toLowerCase().includes(s);

      const matchStatus = statusFilter === 'All' || b.status === statusFilter;
      const matchType = typeFilter === 'All' || b.eventType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [bookings, search, statusFilter, typeFilter]);

  const handleOpenCreate = () => {
    setFormData({
      customerName: '',
      email: '',
      phone: '',
      idNumber: '',
      eventType: 'Wedding',
      packageName: 'Cinematic Experience',
      eventDate: new Date().toISOString().slice(0, 10),
      eventTime: '12:00',
      venueName: '',
      venueAddress: '',
      guestCount: 50,
      totalAmount: 8900,
      deposit: 8900,
      status: 'Submitted',
      financed: false,
      notes: '',
    });
    setEditingBooking(null);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (b: BookingRecord) => {
    setEditingBooking(b);
    setFormData({
      customerName: b.customerName,
      email: b.email,
      phone: b.phone,
      idNumber: b.idNumber || '',
      eventType: b.eventType,
      packageName: b.packageName,
      eventDate: b.eventDate,
      eventTime: b.eventTime,
      venueName: b.venueName,
      venueAddress: b.venueAddress,
      guestCount: b.guestCount,
      totalAmount: b.totalAmount || b.deposit,
      deposit: b.deposit || b.totalAmount,
      status: b.status,
      financed: b.financed,
      notes: b.notes || '',
    });
    setCreateModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.email || !formData.eventDate) {
      toast.error('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBooking) {
        const updated = await updateBooking(editingBooking.id, formData);
        setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        toast.success('Booking updated successfully!');
      } else {
        const created = await createBooking(formData);
        setBookings((prev) => [created, ...prev]);
        toast.success(`Booking created for ${created.customerName}`);
      }
      setCreateModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success('Booking deleted');
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast.info('No records to export');
      return;
    }
    const headers = ['Reference', 'Client', 'Email', 'Phone', 'Event Type', 'Package', 'Event Date', 'Time', 'Total', 'Status'];
    const rows = filtered.map((b) => [
      b.referenceNumber,
      `"${b.customerName.replace(/"/g, '""')}"`,
      b.email,
      b.phone,
      b.eventType,
      `"${b.packageName.replace(/"/g, '""')}"`,
      b.eventDate,
      b.eventTime,
      b.totalAmount || b.deposit,
      b.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `vsm-bookings-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export completed');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Photography Bookings</h1>
          <p className="text-sm text-foreground-muted">
            Manage scheduling, event logistics, status workflows, and memory vault delivery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
            title="Refresh from Supabase"
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
            onClick={handleOpenCreate}
            className="btn-gold px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} />
            <span>Create Booking</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search by client, reference, email, phone, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-luxury w-full pl-9 pr-4 py-2 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 text-xs text-foreground-muted flex-shrink-0">
            <Filter size={13} />
            <span>Status:</span>
          </div>
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

          <div className="flex items-center gap-1.5 text-xs text-foreground-muted flex-shrink-0 ml-2">
            <span>Type:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-luxury px-2.5 py-1.5 text-xs bg-muted/40"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
                <th className="px-4 py-3">Client & Reference</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Venue / Location</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-xs text-foreground-muted">
                    <RefreshCw size={18} className="animate-spin text-primary mx-auto mb-2" />
                    Loading bookings from Supabase...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-xs text-foreground-muted">
                    <Calendar size={28} className="text-foreground-muted/40 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">No bookings found</p>
                    <p className="mt-1">Try adjusting your search criteria or create a new booking.</p>
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((b) => (
                  <tr key={b.id} className="table-row-hover transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-xs font-bold text-background flex-shrink-0">
                          {b.customerName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate">{b.customerName}</div>
                          <div className="text-[10px] text-foreground-muted font-mono">{b.referenceNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-foreground">{b.eventType}</span>
                    </td>
                    <td className="px-4 py-3.5 text-foreground-muted max-w-[140px] truncate">
                      {b.packageName}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-foreground font-medium">{formatDate(b.eventDate)}</div>
                      <div className="text-[10px] text-foreground-muted">{b.eventTime}</div>
                    </td>
                    <td className="px-4 py-3.5 text-foreground-muted max-w-[140px] truncate">
                      {b.venueName || b.location || '—'}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-foreground counter-value">
                      {formatCurrency(b.totalAmount || b.deposit)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 rounded-md hover:bg-muted text-foreground-muted hover:text-primary transition-colors"
                          title="View & Status Workflow"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 rounded-md hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
                          title="Edit booking"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(b.id)}
                          className="p-1.5 rounded-md hover:bg-danger/10 text-foreground-muted hover:text-danger transition-colors"
                          title="Delete booking"
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

      {/* Selected Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdated={(updated) => {
            setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
            setSelectedBooking(updated);
          }}
        />
      )}

      {/* Create / Edit Booking Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-card-hover p-6 z-10">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <h3 className="text-base font-bold text-foreground">
                {editingBooking ? 'Edit Booking' : 'Create Photography Booking'}
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground-muted uppercase tracking-wide text-[10px] font-semibold mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                    placeholder="e.g. Sipho Ndlovu"
                  />
                </div>
                <div>
                  <label className="block text-foreground-muted uppercase tracking-wide text-[10px] font-semibold mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                    placeholder="sipho@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground-muted uppercase tracking-wide text-[10px] font-semibold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                    placeholder="+27 82 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-foreground-muted uppercase tracking-wide text-[10px] font-semibold mb-1">
                    ID Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                    placeholder="SA ID Number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground-muted uppercase tracking-wide text-[10px] font-semibold mb-1">
                    Event Type *
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="input-luxury w-full px-3 py-2 bg-muted/40"
                  >
                    {EVENT_TYPES.filter((t) => t !== 'All').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-foreground-muted uppercase tracking-wide text-[10px] font-semibold mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.packageName}
                    onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                    placeholder="e.g. Cinematic Experience"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground-muted uppercase tracking-wide text-[10px] font-semibold mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-foreground-muted uppercase tracking-wide text-[10px] font-semibold mb-1">
                    Event Time
                  </label>
                  <input
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground-muted uppercase tracking-wide text-[10px] font-semibold mb-1">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                    placeholder="e.g. Sandton Convention Centre"
                  />
                </div>
                <div>
                  <label className="block text-foreground-muted uppercase tracking-wide text-[10px] font-semibold mb-1">
                    Venue Address / Location
                  </label>
                  <input
                    type="text"
                    value={formData.venueAddress}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                    placeholder="e.g. 161 Maude St, Sandton"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-foreground-muted uppercase tracking-wide text-[10px] font-semibold mb-1">
                    Total Fee (ZAR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-foreground-muted uppercase tracking-wide text-[10px] font-semibold mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BookingStatus })}
                    className="input-luxury w-full px-3 py-2 bg-muted/40"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                    <input
                      type="checkbox"
                      checked={formData.financed}
                      onChange={(e) => setFormData({ ...formData, financed: e.target.checked })}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Financed via VSM Loan</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-foreground-muted uppercase tracking-wide text-[10px] font-semibold mb-1">
                  Admin Notes / Special Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-luxury w-full px-3 py-2 resize-none"
                  placeholder="Add optional internal notes..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-silver px-4 py-2 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold px-5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  {editingBooking ? 'Save Changes' : 'Create Booking'}
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
            <h4 className="text-sm font-bold text-foreground mb-2">Delete Booking</h4>
            <p className="text-xs text-foreground-muted mb-5">
              Are you sure you want to delete this booking? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-silver flex-1 py-2 text-xs font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
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

export default function BookingsManagementPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<div className="p-8 text-center text-xs text-foreground-muted">Loading Bookings...</div>}>
          <BookingsContent />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
