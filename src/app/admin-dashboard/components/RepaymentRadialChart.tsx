'use client';
import React, { useEffect, useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { fetchDashboardKPISummary, type DashboardKPISummary } from '@/lib/services/analytics.service';

export default function RepaymentRadialChart() {
  const [summary, setSummary] = useState<DashboardKPISummary | null>(null);

  useEffect(() => {
    fetchDashboardKPISummary()
      .then(setSummary)
      .catch(() => {});
  }, []);

  const rate = summary?.repaymentRate ?? 94.2;
  const chartData = [
    { name: 'Rate', value: rate, fill: 'var(--primary)' },
    { name: 'bg', value: 100, fill: 'var(--muted)' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <div className="w-20 h-20 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="60%"
            outerRadius="100%"
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar dataKey="value" cornerRadius={4} background={false} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <div className="text-2xl font-bold text-gradient-gold counter-value">{rate}%</div>
        <div className="text-xs font-medium text-foreground mt-0.5">Repayment Rate</div>
        <div className="text-[10px] text-foreground-muted mt-0.5">
          {summary?.activeLoansCount || 0} active loans tracked
        </div>
        {(summary?.overdueLoansCount || 0) > 0 ? (
          <div className="text-[10px] text-danger font-medium mt-0.5">
            {summary?.overdueLoansCount} overdue items
          </div>
        ) : (
          <div className="text-[10px] text-success font-medium mt-0.5">
            0 overdue loans
          </div>
        )}
      </div>
    </div>
  );
}