'use client';
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const DATA = [
  { month: 'Dec', disbursed: 28000, repaid: 18000 },
  { month: 'Jan', disbursed: 35000, repaid: 22000 },
  { month: 'Feb', disbursed: 42000, repaid: 31000 },
  { month: 'Mar', disbursed: 38000, repaid: 28000 },
  { month: 'Apr', disbursed: 51000, repaid: 35000 },
  { month: 'May', disbursed: 47000, repaid: 40000 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-card text-xs">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((e) => (
        <div key={`ltt-${e.name}`} className="flex items-center justify-between gap-4 mb-1">
          <span className="text-foreground-muted capitalize">{e.name}</span>
          <span className="font-semibold text-foreground">R {e.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function LoanDisbursementChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold text-foreground">Loan Disbursements vs Repayments</h3>
          <p className="text-[10px] text-foreground-muted">ZAR · last 6 months</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={90}>
        <AreaChart data={DATA}>
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
          <Area type="monotone" dataKey="disbursed" stroke="var(--primary)" fill="url(#areaDisb)" strokeWidth={2} />
          <Area type="monotone" dataKey="repaid" stroke="var(--success)" fill="url(#areaRepaid)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}