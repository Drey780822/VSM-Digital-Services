'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Camera, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Clock, Users } from 'lucide-react';

const KPI_DATA = [
  {
    id: 'kpi-bookings',
    label: 'Active Bookings',
    value: '24',
    change: '+3 this week',
    changePositive: true,
    icon: Camera,
    description: '8 events this month',
    span: 'col-span-1',
    variant: 'default',
  },
  {
    id: 'kpi-pending',
    label: 'Pending Approvals',
    value: '8',
    change: '3 loans · 5 bookings',
    changePositive: null,
    icon: Clock,
    description: 'Requires your attention',
    span: 'col-span-1',
    variant: 'warning',
  },
  {
    id: 'kpi-revenue',
    label: 'Revenue This Month',
    value: 'R 68,400',
    change: '+14.2% vs April',
    changePositive: true,
    icon: DollarSign,
    description: 'Photography + loan interest',
    span: 'col-span-1 lg:col-span-2',
    variant: 'gold',
  },
  {
    id: 'kpi-loans',
    label: 'Active Loan Book',
    value: 'R 184,200',
    change: '31 active loans',
    changePositive: true,
    icon: TrendingUp,
    description: 'Total outstanding balance',
    span: 'col-span-1',
    variant: 'default',
  },
  {
    id: 'kpi-repayment',
    label: 'Repayment Rate',
    value: '94.2%',
    change: '-1.3% vs last month',
    changePositive: false,
    icon: CheckCircle,
    description: 'On-time payments this cycle',
    span: 'col-span-1',
    variant: 'default',
  },
  {
    id: 'kpi-defaults',
    label: 'Defaulted Loans',
    value: '2',
    change: 'R 14,600 at risk',
    changePositive: false,
    icon: AlertTriangle,
    description: 'Action required immediately',
    span: 'col-span-1',
    variant: 'danger',
  },
  {
    id: 'kpi-clients',
    label: 'Total Clients',
    value: '1,248',
    change: '+12 this month',
    changePositive: true,
    icon: Users,
    description: 'Photography + loan clients',
    span: 'col-span-1',
    variant: 'default',
  },
];

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
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {KPI_DATA.map((kpi, i) => (
        <motion.div
          key={kpi.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className={`rounded-xl border p-5 transition-all duration-200 hover:shadow-card-hover ${variantStyles[kpi.variant]} ${kpi.span}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${variantIconBg[kpi.variant]}`}>
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
          <div className={`text-2xl font-semibold mb-1 counter-value ${variantValueColor[kpi.variant]}`}>
            {kpi.value}
          </div>
          <div className="text-xs font-medium text-foreground-muted mb-2 tracking-wide">{kpi.label}</div>
          <div className="flex items-center gap-1.5">
            {kpi.changePositive === true && <span className="text-[10px] font-medium text-success">{kpi.change}</span>}
            {kpi.changePositive === false && <span className="text-[10px] font-medium text-danger">{kpi.change}</span>}
            {kpi.changePositive === null && <span className="text-[10px] font-medium text-foreground-muted">{kpi.change}</span>}
          </div>
          <div className="text-[10px] text-foreground-muted mt-0.5">{kpi.description}</div>
        </motion.div>
      ))}
    </div>
  );
}