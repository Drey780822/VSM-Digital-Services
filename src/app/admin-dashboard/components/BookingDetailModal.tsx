'use client';
import { useEffect, useState } from 'react';
import { X, Loader2, Calendar, MapPin, Mail, Phone, User, DollarSign, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import BookingTimeline from '@/components/booking/BookingTimeline';
import StatusBadge from '@/components/booking/StatusBadge';
import {
  getBookingStatusHistory,
  updateBookingStatus,
  type BookingRecord,
  type BookingStatus,
} from '@/lib/services/bookings.service';
import { formatCurrency, formatDate } from '@/lib/services/supabase-helpers';

const OWNER_STATUSES: BookingStatus[] = [
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

interface Props {
  booking: BookingRecord;
  onClose: () => void;
  onUpdated: (booking: BookingRecord) => void;
}

export default function BookingDetailModal({ booking, onClose, onUpdated }: Props) {
  const [history, setHistory] = useState<Awaited<ReturnType<typeof getBookingStatusHistory>>>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [newStatus, setNewStatus] = useState<BookingStatus>(booking.status);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getBookingStatusHistory(booking.id)
      .then(setHistory)
      .finally(() => setLoadingHistory(false));
  }, [booking.id]);

  const handleStatusUpdate = async () => {
    if (newStatus === booking.status && !notes) return;
    setUpdating(true);
    try {
      const updated = await updateBookingStatus(
        booking.id,
        newStatus,
        notes || undefined,
        'owner'
      );
      toast.success(`Booking updated to ${newStatus}`);
      onUpdated(updated);
      const hist = await getBookingStatusHistory(booking.id);
      setHistory(hist);
      setNotes('');
    } catch {
      toast.error('Failed to update booking status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-card-hover z-10">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur-md p-4 sm:p-5 z-20">
          <div>
            <h3 className="text-base font-semibold text-foreground">{booking.customerName}</h3>
            <p className="text-xs text-foreground-muted font-mono">{booking.referenceNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Header row */}
          <div className="flex items-center justify-between bg-muted/20 p-3 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <StatusBadge status={booking.status} className="text-xs" />
              {booking.financed && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-gold">
                  Financed
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs text-foreground-muted block">Total Fee</span>
              <span className="text-base font-bold text-gradient-gold">
                {formatCurrency(booking.totalAmount || booking.deposit)}
              </span>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-muted/30 rounded-lg p-2.5 flex items-start gap-2">
              <Calendar size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-foreground-muted uppercase tracking-wide">Date & Time</p>
                <p className="text-foreground font-medium mt-0.5">
                  {formatDate(booking.eventDate)} at {booking.eventTime}
                </p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-2.5 flex items-start gap-2">
              <Sparkles size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-foreground-muted uppercase tracking-wide">Package</p>
                <p className="text-foreground font-medium mt-0.5 truncate">{booking.packageName}</p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-2.5 flex items-start gap-2">
              <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-foreground-muted uppercase tracking-wide">Venue</p>
                <p className="text-foreground font-medium mt-0.5 truncate">{booking.venueName || booking.location}</p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-2.5 flex items-start gap-2">
              <User size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-foreground-muted uppercase tracking-wide">Guests</p>
                <p className="text-foreground font-medium mt-0.5">{booking.guestCount || 'Not specified'}</p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-2.5 flex items-start gap-2">
              <Mail size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-foreground-muted uppercase tracking-wide">Email</p>
                <p className="text-foreground font-medium mt-0.5 truncate">{booking.email}</p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-2.5 flex items-start gap-2">
              <Phone size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-foreground-muted uppercase tracking-wide">Phone</p>
                <p className="text-foreground font-medium mt-0.5">{booking.phone}</p>
              </div>
            </div>
          </div>

          {/* Add-ons */}
          {booking.addons && booking.addons.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-3 border border-border">
              <p className="text-[10px] text-foreground-muted uppercase tracking-wide mb-1.5 font-semibold">
                Selected Add-ons
              </p>
              <div className="flex flex-wrap gap-1.5">
                {booking.addons.map((a) => (
                  <span key={a.id || a.name} className="px-2 py-0.5 rounded bg-muted text-[11px] text-foreground border border-border/80">
                    {a.name} ({formatCurrency(a.price)})
                  </span>
                ))}
              </div>
            </div>
          )}

          {booking.notes && (
            <div className="bg-muted/30 rounded-lg p-3 border border-border">
              <p className="text-[10px] text-foreground-muted uppercase tracking-wide mb-1 font-semibold">Special Instructions / Notes</p>
              <p className="text-xs text-foreground leading-relaxed">{booking.notes}</p>
            </div>
          )}

          {/* Quick Operations Links */}
          <div className="flex gap-2">
            <Link
              href={`/admin-dashboard/invoices?bookingId=${booking.id}&clientName=${encodeURIComponent(booking.customerName)}&email=${encodeURIComponent(booking.email)}&amount=${booking.totalAmount || booking.deposit}`}
              className="flex-1 btn-silver py-2 text-xs font-medium rounded-md flex items-center justify-center gap-1.5"
            >
              <FileText size={13} />
              Create Invoice
            </Link>
            <Link
              href={`/admin-dashboard/vaults?action=new&bookingId=${booking.id}&clientName=${encodeURIComponent(booking.customerName)}&email=${encodeURIComponent(booking.email)}&title=${encodeURIComponent(`${booking.customerName} - ${booking.eventType}`)}&eventDate=${booking.eventDate}`}
              className="flex-1 btn-silver py-2 text-xs font-medium rounded-md flex items-center justify-center gap-1.5"
            >
              <Sparkles size={13} />
              Create Memory Vault
            </Link>
          </div>

          {/* Update Status Form */}
          <div className="border-t border-border pt-4">
            <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2">
              Update Status Workflow
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as BookingStatus)}
              className="input-luxury w-full px-3 py-2 text-xs mb-2 bg-muted/40"
            >
              {OWNER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Add status change notes or internal remark..."
              className="input-luxury w-full px-3 py-2 text-xs resize-none mb-2"
            />
            <button
              onClick={handleStatusUpdate}
              disabled={updating || (newStatus === booking.status && !notes)}
              className="btn-gold w-full py-2.5 text-xs font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {updating && <Loader2 size={13} className="animate-spin" />}
              Apply Status Update
            </button>
          </div>

          {/* Status History Timeline */}
          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-3">
              Status History Trail
            </h4>
            {loadingHistory ? (
              <div className="flex justify-center py-4">
                <Loader2 size={18} className="animate-spin text-primary" />
              </div>
            ) : (
              <BookingTimeline currentStatus={booking.status} history={history} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
