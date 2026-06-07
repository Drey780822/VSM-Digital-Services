'use client';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const DATA = [
  { month: 'Dec', weddings: 4, corporate: 2, birthdays: 3, funerals: 1, grooves: 2 },
  { month: 'Jan', weddings: 6, corporate: 3, birthdays: 4, funerals: 2, grooves: 1 },
  { month: 'Feb', weddings: 8, corporate: 4, birthdays: 5, funerals: 1, grooves: 3 },
  { month: 'Mar', weddings: 5, corporate: 6, birthdays: 3, funerals: 3, grooves: 2 },
  { month: 'Apr', weddings: 7, corporate: 5, birthdays: 6, funerals: 2, grooves: 4 },
  { month: 'May', weddings: 9, corporate: 4, birthdays: 8, funerals: 1, grooves: 5 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-card text-xs">
      <p className="font-semibold text-foreground mb-3 text-sm">{label}</p>
      {payload.map((entry) => (
        <div key={`tt-${entry.name}`} className="flex items-center justify-between gap-6 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm" style={{ background: entry.color }} />
            <span className="text-foreground-muted capitalize">{entry.name}</span>
          </div>
          <span className="font-semibold text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function BookingsTrendChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Bookings by Event Type</h3>
          <p className="text-xs text-foreground-muted mt-0.5">Dec 2025 – May 2026</p>
        </div>
        <span className="text-xs text-success font-medium bg-success/10 px-2.5 py-1 rounded-full">+18% YoY</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={DATA} barSize={10} barGap={2}>
          <defs>
            <linearGradient id="barWedding" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--primary-dark)" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,169,107,0.05)' }} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
          <Bar dataKey="weddings" fill="url(#barWedding)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="corporate" fill="var(--info)" radius={[3, 3, 0, 0]} fillOpacity={0.8} />
          <Bar dataKey="birthdays" fill="var(--secondary)" radius={[3, 3, 0, 0]} fillOpacity={0.6} />
          <Bar dataKey="funerals" fill="var(--muted-foreground)" radius={[3, 3, 0, 0]} fillOpacity={0.7} />
          <Bar dataKey="grooves" fill="var(--success)" radius={[3, 3, 0, 0]} fillOpacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}