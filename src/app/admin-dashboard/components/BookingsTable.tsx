'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, Eye, Download, RefreshCw, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchBookings, type BookingRecord } from '@/lib/services/bookings.service';
import StatusBadge from '@/components/booking/StatusBadge';
import BookingDetailModal from './BookingDetailModal';
import { formatCurrency, formatDate } from '@/lib/services/supabase-helpers';

const EVENT_TYPE_COLORS: Record<string, string> = {
  Wedding: 'text-primary',
  Birthday: 'text-info',
  Corporate: 'text-secondary',
  Graduation: 'text-success',
  Funeral: 'text-foreground-muted',
  Groove: 'text-purple-400',
};

type SortKey = 'client' | 'eventType' | 'date' | 'status' | 'deposit';

export default function BookingsTable() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 6;

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch {
      toast.error('Failed to load live bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return bookings.filter(
      (b) =>
        b.customerName.toLowerCase().includes(s) ||
        b.eventType.toLowerCase().includes(s) ||
        b.status.toLowerCase().includes(s) ||
        b.referenceNumber.toLowerCase().includes(s) ||
        b.packageName.toLowerCase().includes(s)
    );
  }, [bookings, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      if (sortKey === 'client') {
        av = a.customerName;
        bv = b.customerName;
      } else if (sortKey === 'eventType') {
        av = a.eventType;
        bv = b.eventType;
      } else if (sortKey === 'date') {
        av = a.eventDate;
        bv = b.eventDate;
      } else if (sortKey === 'status') {
        av = a.status;
        bv = b.status;
      } else if (sortKey === 'deposit') {
        av = a.totalAmount || a.deposit || 0;
        bv = b.totalAmount || b.deposit || 0;
        return sortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const exportCSV = () => {
    if (bookings.length === 0) {
      toast.info('No bookings to export');
      return;
    }
    const headers = ['Reference', 'Client', 'Email', 'Phone', 'Event Type', 'Package', 'Event Date', 'Time', 'Total', 'Status'];
    const rows = bookings.map((b) => [
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
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vsm-bookings-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Bookings exported to CSV');
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="flex flex-col ml-1">
      <ChevronUp
        size={8}
        className={
          sortKey === col && sortDir === 'asc' ? 'text-primary' : 'text-foreground-muted opacity-40'
        }
      />
      <ChevronDown
        size={8}
        className={
          sortKey === col && sortDir === 'desc'
            ? 'text-primary'
            : 'text-foreground-muted opacity-40'
        }
      />
    </span>
  );

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Recent Bookings</h3>
            <Link
              href="/admin-dashboard/bookings"
              className="text-xs text-primary hover:text-primary-light transition-colors font-medium"
            >
              View all →
            </Link>
          </div>
          <p className="text-xs text-foreground-muted mt-0.5">
            {bookings.length} total · {bookings.filter((b) => b.status === 'Submitted' || b.status === 'Under Review').length}{' '}
            pending review
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-luxury px-3 py-1.5 text-xs w-36 sm:w-48"
          />
          <button
            onClick={loadBookings}
            className="p-2 rounded-md bg-muted hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-colors"
            title="Refresh bookings"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={exportCSV}
            className="btn-silver px-2.5 py-1.5 text-xs font-medium rounded-md flex items-center gap-1"
            title="Export CSV"
          >
            <Download size={12} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <Link
            href="/admin-dashboard/bookings?action=new"
            className="btn-gold px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New Booking</span>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">
                <button className="flex items-center hover:text-foreground transition-colors" onClick={() => handleSort('client')}>
                  Client <SortIcon col="client" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">
                <button className="flex items-center hover:text-foreground transition-colors" onClick={() => handleSort('eventType')}>
                  Event Type <SortIcon col="eventType" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">
                Package
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">
                <button className="flex items-center hover:text-foreground transition-colors" onClick={() => handleSort('date')}>
                  Event Date <SortIcon col="date" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">
                <button className="flex items-center hover:text-foreground transition-colors" onClick={() => handleSort('deposit')}>
                  Amount <SortIcon col="deposit" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">
                <button className="flex items-center hover:text-foreground transition-colors" onClick={() => handleSort('status')}>
                  Status <SortIcon col="status" />
                </button>
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-xs text-foreground-muted">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={14} className="animate-spin text-primary" />
                    <span>Loading live bookings...</span>
                  </div>
                </td>
              </tr>
            )}
            {!loading && paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-xs text-foreground-muted">
                  <p className="font-medium text-foreground">No bookings found.</p>
                  <p className="mt-1 text-[11px]">Share your booking link or create a booking using the button above.</p>
                </td>
              </tr>
            )}
            {!loading &&
              paginated.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-border/50 table-row-hover transition-colors duration-150 group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center text-[10px] font-bold text-background flex-shrink-0">
                        {b.customerName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">{b.customerName}</div>
                        <div className="text-[10px] text-foreground-muted font-mono truncate">{b.referenceNumber || b.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${EVENT_TYPE_COLORS[b.eventType] || 'text-foreground'}`}>
                      {b.eventType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted max-w-[130px] truncate">
                    {b.packageName}
                  </td>
                  <td className="px-4 py-3 text-foreground counter-value">
                    {formatDate(b.eventDate)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground counter-value">
                    {formatCurrency(b.totalAmount || b.deposit)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-muted hover:bg-primary/20 hover:text-primary transition-colors text-foreground-muted"
                      title="View & Edit booking"
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
        <span className="text-xs text-foreground-muted">
          Showing {sorted.length === 0 ? 0 : (page - 1) * perPage + 1}–
          {Math.min(page * perPage, sorted.length)} of {sorted.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2.5 py-1 rounded text-xs text-foreground-muted bg-muted hover:bg-background-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          <span className="text-xs text-foreground-muted px-2">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2.5 py-1 rounded text-xs text-foreground-muted bg-muted hover:bg-background-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>

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
    </div>
  );
}
