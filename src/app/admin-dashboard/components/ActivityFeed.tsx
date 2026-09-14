'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Camera, TrendingUp, Sparkles, CreditCard, AlertTriangle, Bell, RefreshCw } from 'lucide-react';
import { fetchNotifications, type NotificationRecord } from '@/lib/services/notifications.service';
import { formatDateTime } from '@/lib/services/supabase-helpers';

const NOTIF_ICONS = {
  booking: Camera,
  loan: TrendingUp,
  repayment: CreditCard,
  default: AlertTriangle,
  vault: Sparkles,
  invoice: CreditCard,
  system: Bell,
};

const NOTIF_COLORS = {
  booking: 'text-primary bg-primary/10',
  loan: 'text-info bg-info/10',
  repayment: 'text-success bg-success/10',
  default: 'text-danger bg-danger/10',
  vault: 'text-purple-400 bg-purple-400/10',
  invoice: 'text-warning bg-warning/10',
  system: 'text-foreground-muted bg-muted',
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications('all');
      setActivities(data.slice(0, 6));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={loadActivities}
            className="p-1 rounded text-foreground-muted hover:text-foreground transition-colors"
            title="Refresh activity"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/admin-dashboard/notifications"
            className="text-xs text-primary transition-colors hover:text-primary-light font-medium"
          >
            View all →
          </Link>
        </div>
      </div>

      <div className="divide-y divide-border/40 max-h-72 overflow-y-auto">
        {loading && (
          <div className="p-6 text-center text-xs text-foreground-muted">
            <RefreshCw size={16} className="animate-spin text-primary mx-auto mb-1.5" />
            Loading events...
          </div>
        )}
        {!loading && activities.length === 0 && (
          <div className="p-6 text-center text-xs text-foreground-muted">
            No recent activity recorded.
          </div>
        )}
        {!loading &&
          activities.map((act) => {
            const IconComponent = NOTIF_ICONS[act.type] || Bell;
            const colorClass = NOTIF_COLORS[act.type] || NOTIF_COLORS.system;

            return (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3.5 transition-colors duration-150 hover:bg-muted/20"
              >
                <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                  <IconComponent size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold leading-tight text-foreground truncate">{act.title}</p>
                  <p className="mt-0.5 text-[11px] text-foreground-muted line-clamp-2 leading-relaxed">
                    {act.message}
                  </p>
                  <span className="mt-1 block text-[9px] text-foreground-muted/70">
                    {formatDateTime(act.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
