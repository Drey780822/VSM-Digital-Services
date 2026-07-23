'use client';
import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { getNotifications } from '@/lib/owner-ops';

export default function ActivityFeed() {
  const [activities, setActivities] = useState<
    Array<{ id: string; message: string; time: string }>
  >([]);

  useEffect(() => {
    getNotifications().then(setActivities);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <span className="cursor-pointer text-xs text-primary transition-colors hover:text-primary-light">
          View all
        </span>
      </div>
      <div className="divide-y divide-border/40">
        {activities.map((act) => (
          <div
            key={act.id}
            className="flex items-start gap-3 p-4 transition-colors duration-150 hover:bg-muted/20"
          >
            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Camera size={13} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium leading-snug text-foreground">{act.message}</p>
              <p className="mt-0.5 text-[10px] text-foreground-muted">Owner operations update</p>
            </div>
            <span className="mt-0.5 flex-shrink-0 text-[10px] text-foreground-muted">
              {act.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
