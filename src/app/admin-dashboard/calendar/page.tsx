'use client';
import React, { useEffect, useState, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import BookingDetailModal from '../components/BookingDetailModal';
import {
  fetchBookings,
  createBooking,
  type BookingRecord,
  type BookingStatus,
} from '@/lib/services/bookings.service';
import { formatDate } from '@/lib/services/supabase-helpers';

const EVENT_TYPE_COLORS: Record<string, string> = {
  Wedding: 'bg-primary/20 text-primary border-gold',
  Birthday: 'bg-info/20 text-info border-info/30',
  Corporate: 'bg-secondary/20 text-secondary border-secondary/30',
  Graduation: 'bg-success/20 text-success border-success/30',
  Funeral: 'bg-muted text-foreground-muted border-border',
  Groove: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  // Quick Create Modal state
  const [quickDate, setQuickDate] = useState<string | null>(null);
  const [quickClient, setQuickClient] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickType, setQuickType] = useState('Wedding');
  const [quickPackage, setQuickPackage] = useState('Cinematic Experience');
  const [quickTime, setQuickTime] = useState('14:00');
  const [quickAmount, setQuickAmount] = useState(8900);
  const [creating, setCreating] = useState(false);

  const loadCalendarBookings = async () => {
    setLoading(true);
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarBookings();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Generate 42 calendar grid cells (6 rows x 7 cols)
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      bookings: BookingRecord[];
      hasConflict: boolean;
    }> = [];

    const todayStr = new Date().toISOString().slice(0, 10);

    // Prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, day);
      const dateStr = prevDate.toISOString().slice(0, 10);
      const bList = bookings.filter((b) => b.eventDate === dateStr);
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        bookings: bList,
        hasConflict: bList.length > 1,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const currDate = new Date(year, month, day);
      const dateStr = currDate.toISOString().slice(0, 10);
      const bList = bookings.filter((b) => b.eventDate === dateStr);
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        bookings: bList,
        hasConflict: bList.length > 1,
      });
    }

    // Next month days to fill 42 cells
    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(year, month + 1, day);
      const dateStr = nextDate.toISOString().slice(0, 10);
      const bList = bookings.filter((b) => b.eventDate === dateStr);
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        bookings: bList,
        hasConflict: bList.length > 1,
      });
    }

    return cells;
  }, [year, month, bookings]);

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDate || !quickClient || !quickEmail) {
      toast.error('Please enter client name and email');
      return;
    }
    setCreating(true);
    try {
      const created = await createBooking({
        customerName: quickClient,
        email: quickEmail,
        phone: '+27 00 000 0000',
        eventType: quickType,
        packageName: quickPackage,
        eventDate: quickDate,
        eventTime: quickTime,
        totalAmount: quickAmount,
        deposit: quickAmount,
        status: 'Scheduled',
      });
      setBookings((prev) => [created, ...prev]);
      toast.success(`Booking created for ${created.customerName} on ${quickDate}`);
      setQuickDate(null);
      setQuickClient('');
      setQuickEmail('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Booking Calendar</h1>
              <p className="text-sm text-foreground-muted">
                Visual event scheduling, conflict detection, and quick booking management.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadCalendarBookings}
                className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
                title="Refresh calendar"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setQuickDate(new Date().toISOString().slice(0, 10))}
                className="btn-gold px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={14} />
                <span>Schedule Event</span>
              </button>
            </div>
          </div>

          {/* Month Bar Controls */}
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-card">
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg bg-muted hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-colors"
                title="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg bg-muted hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-colors"
                title="Next month"
              >
                <ChevronRight size={16} />
              </button>
              <h2 className="text-base font-bold text-foreground ml-2">
                {MONTH_NAMES[month]} {year}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={goToToday}
                className="btn-silver px-3 py-1.5 text-xs font-medium rounded-lg"
              >
                Today
              </button>
              <div className="hidden md:flex items-center gap-2 text-[11px] text-foreground-muted">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Wedding
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-info" /> Birthday
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary" /> Corporate
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success" /> Graduation
                </span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
            {/* Days header */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-[11px] font-semibold text-foreground-muted py-2.5">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Grid cells */}
            <div className="grid grid-cols-7 auto-rows-[115px] divide-x divide-y divide-border/60">
              {calendarCells.map((cell, idx) => (
                <div
                  key={`cell-${idx}`}
                  onClick={() => setQuickDate(cell.dateStr)}
                  className={`p-2 transition-colors relative flex flex-col justify-between cursor-pointer group ${
                    cell.isCurrentMonth
                      ? 'bg-card hover:bg-muted/30'
                      : 'bg-muted/10 opacity-40 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-gold-gradient text-background font-bold shadow-sm'
                          : cell.isCurrentMonth
                          ? 'text-foreground'
                          : 'text-foreground-muted'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cell.hasConflict && (
                      <span
                        className="flex items-center gap-0.5 text-[9px] font-bold text-danger bg-danger/15 px-1 py-0.5 rounded border border-danger/30"
                        title="Scheduling Conflict: Multiple events on same day"
                      >
                        <AlertTriangle size={9} />
                        Conflict
                      </span>
                    )}
                  </div>

                  {/* Booking event chips */}
                  <div className="space-y-1 overflow-y-auto max-h-[72px] mt-1">
                    {cell.bookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(b);
                        }}
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded border truncate cursor-pointer transition-all hover:scale-[1.02] ${
                          EVENT_TYPE_COLORS[b.eventType] || 'bg-muted text-foreground border-border'
                        }`}
                        title={`${b.customerName} (${b.eventType}) - ${b.eventTime}`}
                      >
                        <span className="font-bold mr-1">{b.eventTime || '12:00'}</span>
                        <span>{b.customerName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Booking Modal */}
          {quickDate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setQuickDate(null)} />
              <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-card-hover z-10">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Schedule Photography Booking</h3>
                    <p className="text-xs text-primary font-mono mt-0.5">{formatDate(quickDate)}</p>
                  </div>
                  <button
                    onClick={() => setQuickDate(null)}
                    className="p-1 rounded-lg text-foreground-muted hover:text-foreground"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleQuickCreate} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-foreground-muted text-[10px] font-semibold uppercase mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lerato Khumalo"
                      value={quickClient}
                      onChange={(e) => setQuickClient(e.target.value)}
                      className="input-luxury w-full px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground-muted text-[10px] font-semibold uppercase mb-1">
                      Client Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="lerato@example.com"
                      value={quickEmail}
                      onChange={(e) => setQuickEmail(e.target.value)}
                      className="input-luxury w-full px-3 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-foreground-muted text-[10px] font-semibold uppercase mb-1">
                        Event Type
                      </label>
                      <select
                        value={quickType}
                        onChange={(e) => setQuickType(e.target.value)}
                        className="input-luxury w-full px-3 py-2 bg-muted/40"
                      >
                        {['Wedding', 'Birthday', 'Corporate', 'Graduation', 'Funeral', 'Groove'].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-foreground-muted text-[10px] font-semibold uppercase mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={quickTime}
                        onChange={(e) => setQuickTime(e.target.value)}
                        className="input-luxury w-full px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-foreground-muted text-[10px] font-semibold uppercase mb-1">
                        Package
                      </label>
                      <input
                        type="text"
                        value={quickPackage}
                        onChange={(e) => setQuickPackage(e.target.value)}
                        className="input-luxury w-full px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-foreground-muted text-[10px] font-semibold uppercase mb-1">
                        Fee (ZAR)
                      </label>
                      <input
                        type="number"
                        value={quickAmount}
                        onChange={(e) => setQuickAmount(Number(e.target.value))}
                        className="input-luxury w-full px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-4">
                    <button
                      type="button"
                      onClick={() => setQuickDate(null)}
                      className="btn-silver px-3 py-2 text-xs font-medium rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="btn-gold px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                    >
                      {creating && <RefreshCw size={12} className="animate-spin" />}
                      Save Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Selected Booking Modal */}
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
      </AdminLayout>
    </ProtectedRoute>
  );
}
