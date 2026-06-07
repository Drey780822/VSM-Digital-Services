'use client';
import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

const DATA = [
  { name: 'Rate', value: 94.2, fill: 'var(--primary)' },
  { name: 'bg', value: 100, fill: 'var(--muted)' },
];

export default function RepaymentRadialChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <div className="w-20 h-20 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="60%"
            outerRadius="100%"
            data={DATA}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar dataKey="value" cornerRadius={4} background={false} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <div className="text-2xl font-semibold text-gradient-gold counter-value">94.2%</div>
        <div className="text-xs font-medium text-foreground mt-0.5">Repayment Rate</div>
        <div className="text-[10px] text-foreground-muted mt-1">29/31 loans on-time</div>
        <div className="text-[10px] text-danger mt-0.5">2 loans overdue</div>
      </div>
    </div>
  );
}