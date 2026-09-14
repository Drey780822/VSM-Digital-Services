'use client';
import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchLoanDisbursementTrend, type LoanMonthlyTrendItem } from '@/lib/services/analytics.service';
import { formatCurrency } from '@/lib/services/supabase-helpers';

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-card text-xs">
      <p className="font-semibold text-foreground mb-1 text-xs">{label}</p>
      {payload.map((e) => (
        <div key={`ltt-${e.name}`} className="flex items-center justify-between gap-4 mb-1">
          <span className="text-foreground-muted capitalize text-[11px]">{e.name}</span>
          <span className="font-semibold text-foreground text-[11px]">{formatCurrency(e.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function LoanDisbursementChart() {
  const [data, setData] = useState<LoanMonthlyTrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoanDisbursementTrend()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-xs font-semibold text-foreground">Disbursements vs Repayments</h3>
          <p className="text-[10px] text-foreground-muted">ZAR · Real-time portfolio activity</p>
        </div>
      </div>
      <div className="w-full h-24">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-foreground-muted">
            Loading...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="areaDisb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="areaRepaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" name="Disbursed" dataKey="disbursed" stroke="var(--primary)" fill="url(#areaDisb)" strokeWidth={2} />
              <Area type="monotone" name="Repaid" dataKey="repaid" stroke="var(--success)" fill="url(#areaRepaid)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}