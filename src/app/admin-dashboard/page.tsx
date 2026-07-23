import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminKPIGrid from './components/AdminKPIGrid';
import AdminChartsRow from './components/AdminChartsRow';
import BookingsTable from './components/BookingsTable';
import LoanQueue from './components/LoanQueue';
import ActivityFeed from './components/ActivityFeed';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Command Centre
              </h1>
              <p className="mt-0.5 text-sm text-foreground-muted">
                Owner operations for photography, loans, bookings, and memory vault delivery.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                Live data layer
              </span>
            </div>
          </div>
          <AdminKPIGrid />
          <AdminChartsRow />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <BookingsTable />
            </div>
            <div className="space-y-6">
              <LoanQueue />
              <ActivityFeed />
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
