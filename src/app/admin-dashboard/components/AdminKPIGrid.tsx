'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Clock,
  Users,
} from 'lucide-react';
import { getDashboardSummary } from '@/lib/owner-ops';

interface KPIData {
  id: string;
  label: string;
  value: string;
  change: string;
  changePositive: boolean | null;
  icon: typeof Camera;
  description: string;
  span: string;
  variant: 'default' | 'warning' | 'danger' | 'gold';
}

const variantStyles: Record<string, string> = {
  default: 'bg-card border-border',
  warning: 'bg-warning/5 border-warning/30',
  danger: 'bg-danger/5 border-danger/30',
  gold: 'border-gold',
};

const variantIconBg: Record<string, string> = {
  default: 'bg-muted',
  warning: 'bg-warning/15',
  danger: 'bg-danger/15',
  gold: 'bg-gold-gradient',
};

const variantIconColor: Record<string, string> = {
  default: 'text-primary',
  warning: 'text-warning',
  danger: 'text-danger',
  gold: 'text-background',
};

const variantValueColor: Record<string, string> = {
  default: 'text-foreground',
  warning: 'text-warning',
  danger: 'text-danger',
  gold: 'text-gradient-gold',
};

export default function AdminKPIGrid() {
  const [kpis, setKpis] = useState<KPIData[]>([]);

  useEffect(() => {
    getDashboardSummary().then((summary) => {
      const nextKpis: KPIData[] = [
        {
          id: 'kpi-bookings',
          label: 'Active Bookings',
          value: summary.activeBookings.toString(),
          change: `${summary.upcomingEvents} upcoming`,
          changePositive: true,
          icon: Camera,
          description: 'Live booking pipeline',
          span: 'col-span-1',
          variant: 'default',
        },
        {
          id: 'kpi-pending',
          label: 'Pending Approvals',
          value: `${summary.pendingLoans}`,
          change: `${summary.pendingLoans} owner review items`,
          changePositive: null,
          icon: Clock,
          description: 'Requires your attention',
          span: 'col-span-1',
          variant: 'warning',
        },
        {
          id: 'kpi-revenue',
          label: 'Revenue This Month',
          value: `R ${summary.revenueThisMonth.toLocaleString()}`,
          change: '+14.2% vs April',
          changePositive: true,
          icon: DollarSign,
          description: 'Photography + loan services',
          span: 'col-span-1 lg:col-span-2',
          variant: 'gold',
        },
        {
          id: 'kpi-loans',
          label: 'Approved Loans',
          value: summary.approvedLoans.toString(),
          change: `${summary.pendingLoans} pending`,
          changePositive: true,
          icon: TrendingUp,
          description: 'Loan operations status',
          span: 'col-span-1',
          variant: 'default',
        },
        {
          id: 'kpi-repayment',
          label: 'Completed Events',
          value: summary.completedEvents.toString(),
          change: `${summary.galleryQueue} gallery uploads queued`,
          changePositive: true,
          icon: CheckCircle,
          description: 'Memory vault delivery progress',
          span: 'col-span-1',
          variant: 'default',
        },
        {
          id: 'kpi-defaults',
          label: 'Notifications',
          value: summary.notifications.toString(),
          change: 'Action needed',
          changePositive: false,
          icon: AlertTriangle,
          description: 'Customer updates and reminders',
          span: 'col-span-1',
          variant: 'danger',
        },
        {
          id: 'kpi-clients',
          label: 'Total Customers',
          value: summary.totalCustomers.toString(),
          change: `${summary.totalBookings} bookings tracked`,
          changePositive: true,
          icon: Users,
          description: 'Photography + loan clients',
          span: 'col-span-1',
          variant: 'default',
        },
      ];
      setKpis(nextKpis);
    });
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className={`rounded-xl border p-5 transition-all duration-200 hover:shadow-card-hover ${variantStyles[kpi.variant]} ${kpi.span}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${variantIconBg[kpi.variant]}`}
            >
              <kpi.icon size={16} className={variantIconColor[kpi.variant]} />
            </div>
            {kpi.variant === 'danger' && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-full">
                <AlertTriangle size={9} />
                Alert
              </span>
            )}
            {kpi.variant === 'warning' && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                <Clock size={9} />
                Pending
              </span>
            )}
          </div>
          <div
            className={`text-2xl font-semibold mb-1 counter-value ${variantValueColor[kpi.variant]}`}
          >
            {kpi.value}
          </div>
          <div className="text-xs font-medium text-foreground-muted mb-2 tracking-wide">
            {kpi.label}
          </div>
          <div className="flex items-center gap-1.5">
            {kpi.changePositive === true && (
              <span className="text-[10px] font-medium text-success">{kpi.change}</span>
            )}
            {kpi.changePositive === false && (
              <span className="text-[10px] font-medium text-danger">{kpi.change}</span>
            )}
            {kpi.changePositive === null && (
              <span className="text-[10px] font-medium text-foreground-muted">{kpi.change}</span>
            )}
          </div>
          <div className="text-[10px] text-foreground-muted mt-0.5">{kpi.description}</div>
        </motion.div>
      ))}
    </div>
  );
}
