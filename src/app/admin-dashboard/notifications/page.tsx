'use client';
import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  Bell,
  RefreshCw,
  CheckCircle,
  Trash2,
  Camera,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Sparkles,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type NotificationRecord,
  type NotificationType,
} from '@/lib/services/notifications.service';
import { formatDateTime } from '@/lib/services/supabase-helpers';

const TYPE_ICONS = {
  booking: Camera,
  loan: TrendingUp,
  repayment: CreditCard,
  default: AlertTriangle,
  vault: Sparkles,
  invoice: FileText,
  system: Bell,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  booking: 'text-primary bg-primary/10 border-gold',
  loan: 'text-info bg-info/10 border-info/30',
  repayment: 'text-success bg-success/10 border-success/30',
  default: 'text-danger bg-danger/10 border-danger/30',
  vault: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  invoice: 'text-warning bg-warning/10 border-warning/30',
  system: 'text-foreground-muted bg-muted border-border',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState('All');

  const loadNotifs = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications(filter);
      setNotifications(data);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, [filter]);

  const filtered = notifications.filter((n) => {
    if (typeFilter !== 'All' && n.type !== typeFilter.toLowerCase()) return false;
    return true;
  });

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      toast.success('Marked as read');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const getTargetUrl = (n: NotificationRecord) => {
    if (n.type === 'booking') return '/admin-dashboard/bookings';
    if (n.type === 'loan') return '/admin-dashboard/loans';
    if (n.type === 'repayment') return '/admin-dashboard/repayments';
    if (n.type === 'default') return '/admin-dashboard/defaults';
    if (n.type === 'vault') return '/admin-dashboard/vaults';
    if (n.type === 'invoice') return '/admin-dashboard/invoices';
    return '/admin-dashboard';
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Notifications Hub</h1>
              <p className="text-sm text-foreground-muted">
                Real-time operational alerts, customer bookings, loan reviews, and system activities.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadNotifs}
                className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
                title="Refresh notifications"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={handleMarkAllRead}
                className="btn-silver px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5"
              >
                <CheckCircle size={14} />
                <span>Mark All Read</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === 'all' ? 'bg-gold-gradient text-background' : 'bg-muted text-foreground-muted hover:text-foreground'
                }`}
              >
                All Notifications
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === 'unread' ? 'bg-gold-gradient text-background' : 'bg-muted text-foreground-muted hover:text-foreground'
                }`}
              >
                Unread Only
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground-muted">Category:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-luxury px-3 py-1.5 text-xs bg-muted/40"
              >
                <option value="All">All Categories</option>
                <option value="Booking">Bookings</option>
                <option value="Loan">Loans</option>
                <option value="Repayment">Repayments</option>
                <option value="Default">Defaults</option>
                <option value="Vault">Memory Vaults</option>
                <option value="Invoice">Invoices</option>
                <option value="System">System</option>
              </select>
            </div>
          </div>

          {/* Notification List */}
          <div className="space-y-2.5">
            {loading && (
              <div className="p-16 text-center text-xs text-foreground-muted bg-card border border-border rounded-xl">
                <RefreshCw size={20} className="animate-spin text-primary mx-auto mb-2" />
                Loading notifications...
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="p-12 text-center text-xs text-foreground-muted bg-card border border-border rounded-xl">
                <Bell size={28} className="text-foreground-muted/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">No notifications found</p>
                <p className="mt-1">You are all caught up with your operational activities.</p>
              </div>
            )}
            {!loading &&
              filtered.map((n) => {
                const IconComponent = TYPE_ICONS[n.type] || Bell;
                const badgeColor = TYPE_COLORS[n.type] || TYPE_COLORS.system;

                return (
                  <div
                    key={n.id}
                    className={`bg-card border rounded-xl p-4 transition-all flex items-start justify-between gap-4 ${
                      !n.isRead ? 'border-gold bg-card shadow-sm' : 'border-border/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${badgeColor}`}>
                        <IconComponent size={15} />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-foreground">{n.title}</h4>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-foreground-muted leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-foreground-muted/70 block pt-0.5">
                          {formatDateTime(n.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={getTargetUrl(n)}
                        className="p-1.5 rounded-md hover:bg-muted text-foreground-muted hover:text-primary transition-colors text-xs flex items-center gap-1"
                        title="Open related module"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="p-1.5 rounded-md hover:bg-muted text-foreground-muted hover:text-success transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 rounded-md hover:bg-danger/10 text-foreground-muted hover:text-danger transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
