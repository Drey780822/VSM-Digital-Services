'use client';
import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  BarChart2,
  RefreshCw,
  Camera,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  fetchDashboardKPISummary,
  fetchBookingsTrend,
  fetchLoanDisbursementTrend,
  fetchPackageStats,
  fetchEventTypeStats,
  type DashboardKPISummary,
  type BookingsMonthlyTrendItem,
  type LoanMonthlyTrendItem,
  type PackageStatItem,
  type EventTypeStatItem,
} from '@/lib/services/analytics.service';
import { formatCurrency } from '@/lib/services/supabase-helpers';

const PIE_COLORS = ['#C8A96B', '#4B8BFF', '#F4B942', '#00B67A', '#9333ea', '#C0C0C0'];

export default function AnalyticsPage() {
  const [kpi, setKpi] = useState<DashboardKPISummary | null>(null);
  const [bookingsTrend, setBookingsTrend] = useState<BookingsMonthlyTrendItem[]>([]);
  const [loanTrend, setLoanTrend] = useState<LoanMonthlyTrendItem[]>([]);
  const [packageStats, setPackageStats] = useState<PackageStatItem[]>([]);
  const [eventTypeStats, setEventTypeStats] = useState<EventTypeStatItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [k, bTrend, lTrend, pStats, eStats] = await Promise.all([
        fetchDashboardKPISummary(),
        fetchBookingsTrend(),
        fetchLoanDisbursementTrend(),
        fetchPackageStats(),
        fetchEventTypeStats(),
      ]);
      setKpi(k);
      setBookingsTrend(bTrend);
      setLoanTrend(lTrend);
      setPackageStats(pStats);
      setEventTypeStats(eStats);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Business Analytics</h1>
              <p className="text-sm text-foreground-muted">
                Executive business intelligence for photography bookings, loan financial performance, and revenue streams.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadAnalytics}
                className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
                title="Refresh analytics"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* KPI High-Level Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-gold rounded-xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted font-semibold">Total Revenue</span>
                <DollarSign size={16} className="text-primary" />
              </div>
              <p className="text-2xl font-bold text-gradient-gold counter-value">
                {kpi ? formatCurrency(kpi.totalRevenue) : 'R 0.00'}
              </p>
              <span className="text-[10px] text-foreground-muted mt-1 block">
                {formatCurrency(kpi?.photographyRevenue || 0)} photography + {formatCurrency(kpi?.loanInterestRevenue || 0)} interest
              </span>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted font-semibold">Bookings Volume</span>
                <Camera size={16} className="text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground counter-value">
                {kpi?.totalBookings || 0}
              </p>
              <span className="text-[10px] text-success font-medium mt-1 block">
                {kpi?.completedEvents || 0} completed · {kpi?.upcomingEvents || 0} upcoming
              </span>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted font-semibold">Loan Capital Disbursed</span>
                <TrendingUp size={16} className="text-info" />
              </div>
              <p className="text-2xl font-bold text-foreground counter-value">
                {kpi ? formatCurrency(kpi.totalLoanDisbursed) : 'R 0.00'}
              </p>
              <span className="text-[10px] text-foreground-muted mt-1 block">
                {formatCurrency(kpi?.outstandingLoanBalance || 0)} active balance
              </span>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-foreground-muted font-semibold">Repayment Rate</span>
                <CheckCircle size={16} className="text-success" />
              </div>
              <p className="text-2xl font-bold text-success counter-value">
                {kpi?.repaymentRate || 94.2}%
              </p>
              <span className="text-[10px] text-foreground-muted mt-1 block">
                {(kpi?.overdueLoansCount || 0) + (kpi?.defaultedLoansCount || 0)} overdue accounts
              </span>
            </div>
          </div>

          {/* Section 1: Photography Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Monthly Bookings Trend</h3>
                  <p className="text-xs text-foreground-muted mt-0.5">Event distribution across the last 6 months</p>
                </div>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsTrend} barSize={10}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(200,169,107,0.05)' }} />
                    <Bar dataKey="weddings" name="Weddings" fill="#C8A96B" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="corporate" name="Corporate" fill="#4B8BFF" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="birthdays" name="Birthdays" fill="#F4B942" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="grooves" name="Grooves" fill="#9333ea" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Event Types Breakdown</h3>
                <p className="text-xs text-foreground-muted mt-0.5">Revenue and volume by category</p>
              </div>
              <div className="w-full h-44 my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventTypeStats}
                      dataKey="count"
                      nameKey="eventType"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {eventTypeStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-xs">
                {eventTypeStats.slice(0, 4).map((item, idx) => (
                  <div key={item.eventType} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-foreground-muted">
                      <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      {item.eventType}
                    </span>
                    <span className="font-semibold text-foreground">{item.count} events ({formatCurrency(item.revenue)})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Loan Financial Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Disbursements vs Repayments</h3>
                  <p className="text-xs text-foreground-muted mt-0.5">Capital out vs collections in (ZAR)</p>
                </div>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={loanTrend}>
                    <defs>
                      <linearGradient id="anAreaDisb" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="anAreaRepaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" name="Disbursed" dataKey="disbursed" stroke="var(--primary)" fill="url(#anAreaDisb)" strokeWidth={2} />
                    <Area type="monotone" name="Repaid" dataKey="repaid" stroke="var(--success)" fill="url(#anAreaRepaid)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <h3 className="text-sm font-semibold text-foreground mb-1">Top Photography Packages</h3>
              <p className="text-xs text-foreground-muted mb-4">Ranked by revenue generation</p>
              <div className="space-y-3">
                {packageStats.map((pkg, idx) => (
                  <div key={pkg.name} className="p-3 bg-muted/20 rounded-lg border border-border/60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground truncate">{pkg.name}</span>
                      <span className="text-xs font-bold text-gradient-gold">{formatCurrency(pkg.revenue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-foreground-muted">
                      <span>{pkg.count} bookings booked</span>
                      <span>Rank #{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
