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
  Sparkles,
} from 'lucide-react';
import { fetchDashboardKPISummary, type DashboardKPISummary } from '@/lib/services/analytics.service';
import { formatCurrency } from '@/lib/services/supabase-helpers';

interface KPICard {
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
  gold: 'border-gold bg-card',
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
  const [summary, setSummary] = useState<DashboardKPISummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardKPISummary()
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  const kpis: KPICard[] = [
    {
      id: 'kpi-bookings',
      label: 'Active Bookings',
      value: summary ? summary.activeBookings.toString() : '0',
      change: `${summary?.upcomingEvents || 0} upcoming`,
      changePositive: true,
      icon: Camera,
      description: 'Active event pipeline',
      span: 'col-span-1',
      variant: 'default',
    },
    {
      id: 'kpi-pending-loans',
      label: 'Pending Loan Reviews',
      value: summary ? summary.pendingLoans.toString() : '0',
      change: `${summary?.pendingLoans || 0} applications awaiting review`,
      changePositive: summary && summary.pendingLoans > 0 ? false : true,
      icon: Clock,
      description: 'Requires owner assessment',
      span: 'col-span-1',
      variant: summary && summary.pendingLoans > 0 ? 'warning' : 'default',
    },
    {
      id: 'kpi-revenue',
      label: 'Total Realized Revenue',
      value: summary ? formatCurrency(summary.totalRevenue) : 'R 0.00',
      change: `${formatCurrency(summary?.photographyRevenue || 0)} photography`,
      changePositive: true,
      icon: DollarSign,
      description: 'Combined photography & loan repayments',
      span: 'col-span-2 lg:col-span-2',
      variant: 'gold',
    },
    {
      id: 'kpi-active-loans',
      label: 'Active Loan Portfolio',
      value: summary ? formatCurrency(summary.outstandingLoanBalance) : 'R 0.00',
      change: `${summary?.activeLoansCount || 0} active borrowers`,
      changePositive: true,
      icon: TrendingUp,
      description: 'Outstanding balance tracking',
      span: 'col-span-1',
      variant: 'default',
    },
    {
      id: 'kpi-completed-events',
      label: 'Completed Events',
      value: summary ? summary.completedEvents.toString() : '0',
      change: `${summary?.galleryQueueCount || 0} vaults in queue`,
      changePositive: true,
      icon: CheckCircle,
      description: 'Delivered & archived photos',
      span: 'col-span-1',
      variant: 'default',
    },
    {
      id: 'kpi-defaults',
      label: 'Overdue / Defaults',
      value: summary ? (summary.overdueLoansCount + summary.defaultedLoansCount).toString() : '0',
      change: summary && summary.overdueLoansCount > 0 ? 'Action required' : 'Portfolio healthy',
      changePositive: summary && (summary.overdueLoansCount + summary.defaultedLoansCount) > 0 ? false : true,
      icon: AlertTriangle,
      description: 'Days overdue & penalties',
      span: 'col-span-1',
      variant: summary && (summary.overdueLoansCount + summary.defaultedLoansCount) > 0 ? 'danger' : 'default',
    },
    {
      id: 'kpi-clients',
      label: 'Total Clients',
      value: summary ? summary.totalCustomers.toString() : '0',
      change: `${summary?.totalBookings || 0} bookings tracked`,
      changePositive: true,
      icon: Users,
      description: 'Unified CRM directory',
      span: 'col-span-1',
      variant: 'default',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
          className={`rounded-xl border p-4 sm:p-5 transition-all duration-200 hover:shadow-card-hover ${variantStyles[kpi.variant]} ${kpi.span}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${variantIconBg[kpi.variant]}`}>
              <kpi.icon size={16} className={variantIconColor[kpi.variant]} />
            </div>
            {kpi.variant === 'danger' && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-full border border-danger/20">
                <AlertTriangle size={9} />
                Alert
              </span>
            )}
            {kpi.variant === 'warning' && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20">
                <Clock size={9} />
                Action
              </span>
            )}
            {kpi.variant === 'gold' && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-gold">
                <Sparkles size={9} />
                Live Revenue
              </span>
            )}
          </div>

          <div className={`text-2xl font-bold mb-0.5 counter-value ${variantValueColor[kpi.variant]}`}>
            {loading ? <span className="opacity-40 animate-pulse">...</span> : kpi.value}
          </div>
          <div className="text-xs font-medium text-foreground-muted mb-1.5 tracking-wide">
            {kpi.label}
          </div>
          <div className="text-[11px] font-medium">
            {kpi.changePositive === true && <span className="text-success">{kpi.change}</span>}
            {kpi.changePositive === false && <span className="text-danger">{kpi.change}</span>}
            {kpi.changePositive === null && <span className="text-foreground-muted">{kpi.change}</span>}
          </div>
          <div className="text-[10px] text-foreground-muted/70 mt-0.5 truncate">{kpi.description}</div>
        </motion.div>
      ))}
    </div>
  );
}
