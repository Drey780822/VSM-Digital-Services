import AdminLayout from './components/AdminLayout';
import AdminKPIGrid from './components/AdminKPIGrid';
import AdminChartsRow from './components/AdminChartsRow';
import BookingsTable from './components/BookingsTable';
import LoanQueue from './components/LoanQueue';
import ActivityFeed from './components/ActivityFeed';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Command Centre</h1>
            <p className="text-sm text-foreground-muted mt-0.5">Thursday, 28 May 2026 — Good morning, Vince</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/30 text-xs text-success font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Live Data
            </span>
          </div>
        </div>
        <AdminKPIGrid />
        <AdminChartsRow />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
  );
}