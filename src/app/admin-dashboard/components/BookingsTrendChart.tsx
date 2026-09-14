'use client';
import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { fetchBookingsTrend, type BookingsMonthlyTrendItem } from '@/lib/services/analytics.service';

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
    <div className="bg-card border border-border rounded-xl p-3.5 shadow-card text-xs">
      <p className="font-semibold text-foreground mb-2 text-xs">{label}</p>
      {payload.map((entry) => (
        <div key={`tt-${entry.name}`} className="flex items-center justify-between gap-5 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: entry.color }} />
            <span className="text-foreground-muted capitalize text-[11px]">{entry.name}</span>
          </div>
          <span className="font-semibold text-foreground text-[11px]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function BookingsTrendChart() {
  const [data, setData] = useState<BookingsMonthlyTrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingsTrend()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Bookings by Event Type</h3>
          <p className="text-xs text-foreground-muted mt-0.5">Live 6-Month Trend</p>
        </div>
        <span className="text-xs text-primary font-medium bg-primary/10 border border-gold px-2.5 py-1 rounded-full">
          Live Data
        </span>
      </div>

      <div className="w-full h-56">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-foreground-muted">
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={8} barGap={2}>
              <defs>
                <linearGradient id="barWedding" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--primary-dark)" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,169,107,0.05)' }} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              <Bar dataKey="weddings" name="Weddings" fill="url(#barWedding)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="corporate" name="Corporate" fill="var(--info)" radius={[2, 2, 0, 0]} fillOpacity={0.8} />
              <Bar dataKey="birthdays" name="Birthdays" fill="var(--warning)" radius={[2, 2, 0, 0]} fillOpacity={0.7} />
              <Bar dataKey="graduation" name="Graduations" fill="var(--success)" radius={[2, 2, 0, 0]} fillOpacity={0.7} />
              <Bar dataKey="funeral" name="Funerals" fill="var(--muted-foreground)" radius={[2, 2, 0, 0]} fillOpacity={0.7} />
              <Bar dataKey="grooves" name="Grooves" fill="#9333ea" radius={[2, 2, 0, 0]} fillOpacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}