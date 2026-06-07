import React from 'react';
import { Camera, TrendingUp, CheckCircle, AlertTriangle, Upload, CreditCard } from 'lucide-react';

const ACTIVITIES = [
  { id: 'act-1', icon: Camera, color: 'text-primary bg-primary/10', message: 'New booking received from Nkosi Dlamini', sub: 'Legacy Collection · Wedding', time: '8 min ago' },
  { id: 'act-2', icon: TrendingUp, color: 'text-info bg-info/10', message: 'Loan application submitted by Lungelo Zulu', sub: 'R 35,000 · High risk flagged', time: '23 min ago' },
  { id: 'act-3', icon: CheckCircle, color: 'text-success bg-success/10', message: 'Loan repayment received from Thandi Mokoena', sub: 'R 1,480 · Instalment 3 of 6', time: '1 hr ago' },
  { id: 'act-4', icon: Upload, color: 'text-secondary bg-secondary/10', message: 'Memory Vault delivered to Ayanda Mthembu', sub: '248 photos · 3 videos uploaded', time: '2 hrs ago' },
  { id: 'act-5', icon: AlertTriangle, color: 'text-danger bg-danger/10', message: 'Missed payment — Kabelo Sithole', sub: 'Loan ln-038 · 5% penalty applied', time: '4 hrs ago' },
  { id: 'act-6', icon: CreditCard, color: 'text-warning bg-warning/10', message: 'Deposit paid by Lerato Phiri', sub: 'R 7,250 · Booking bk-006', time: '6 hrs ago' },
];

export default function ActivityFeed() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <span className="text-xs text-primary hover:text-primary-light cursor-pointer transition-colors">View all</span>
      </div>
      <div className="divide-y divide-border/40">
        {ACTIVITIES?.map((act) => (
          <div key={act?.id} className="flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors duration-150">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${act?.color}`}>
              <act.icon size={13} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground leading-snug">{act?.message}</p>
              <p className="text-[10px] text-foreground-muted mt-0.5">{act?.sub}</p>
            </div>
            <span className="text-[10px] text-foreground-muted flex-shrink-0 mt-0.5">{act?.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}