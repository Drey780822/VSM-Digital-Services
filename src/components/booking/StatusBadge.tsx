import type { BookingStatus } from '@/lib/bookings/types';

const STATUS_STYLES: Record<string, string> = {
  Submitted: 'status-pending',
  'Under Review': 'status-pending',
  Approved: 'status-approved',
  Scheduled: 'status-scheduled',
  'Event Completed': 'status-completed',
  'Gallery Uploaded': 'status-completed',
  Delivered: 'status-completed',
  Rejected: 'status-rejected',
};

interface StatusBadgeProps {
  status: BookingStatus | string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold ${STATUS_STYLES[status] || 'status-pending'} ${className}`}
    >
      {status}
    </span>
  );
}

export { STATUS_STYLES };
