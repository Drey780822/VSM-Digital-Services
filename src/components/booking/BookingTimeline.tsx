'use client';

import { CheckCircle, Circle } from 'lucide-react';
import { BOOKING_STATUS_ORDER } from '@/lib/bookings/constants';
import type { BookingStatus, BookingStatusHistoryEntry } from '@/lib/bookings/types';

interface BookingTimelineProps {
  currentStatus: BookingStatus | string;
  history?: BookingStatusHistoryEntry[];
}

export default function BookingTimeline({ currentStatus, history = [] }: BookingTimelineProps) {
  const isRejected = currentStatus === 'Rejected';
  const currentIndex = isRejected
    ? -1
    : BOOKING_STATUS_ORDER.indexOf(currentStatus as BookingStatus);

  const historyByStatus = new Map<string, BookingStatusHistoryEntry>();
  history.forEach((entry) => {
    if (!historyByStatus.has(entry.toStatus)) {
      historyByStatus.set(entry.toStatus, entry);
    }
  });

  if (isRejected) {
    const rejectedEntry = history.find((h) => h.toStatus === 'Rejected');
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4">
          <Circle size={16} className="mt-0.5 text-danger fill-danger" />
          <div>
            <p className="text-sm font-semibold text-danger">Booking Rejected</p>
            {rejectedEntry?.notes && (
              <p className="mt-1 text-xs text-foreground-muted">{rejectedEntry.notes}</p>
            )}
            {rejectedEntry?.createdAt && (
              <p className="mt-1 text-[10px] text-foreground-muted">
                {new Date(rejectedEntry.createdAt).toLocaleString('en-ZA')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ol className="relative space-y-0">
      {BOOKING_STATUS_ORDER.map((status, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const entry = historyByStatus.get(status);

        return (
          <li key={status} className="relative flex gap-4 pb-6 last:pb-0">
            {index < BOOKING_STATUS_ORDER.length - 1 && (
              <span
                className={`absolute left-[11px] top-6 h-full w-0.5 ${isComplete && index < currentIndex ? 'bg-primary' : 'bg-border'}`}
              />
            )}
            <div
              className={`relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                isComplete
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-border bg-muted text-foreground-muted'
              } ${isCurrent ? 'ring-2 ring-primary/30' : ''}`}
            >
              {isComplete ? <CheckCircle size={14} /> : <Circle size={10} />}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={`text-sm font-medium ${isComplete ? 'text-foreground' : 'text-foreground-muted'}`}
              >
                {status}
                {isCurrent && (
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Current
                  </span>
                )}
              </p>
              {entry && (
                <p className="mt-0.5 text-[10px] text-foreground-muted">
                  {new Date(entry.createdAt).toLocaleString('en-ZA')}
                  {entry.notes ? ` · ${entry.notes}` : ''}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
