import {
  fetchBookings,
  createBooking as createBookingService,
  updateBookingStatus as updateBookingStatusService,
  type BookingRecord,
  type BookingStatus,
} from './services/bookings.service';
import {
  fetchLoans,
  createLoan as createLoanService,
  updateLoanStatus as updateLoanStatusService,
  type LoanRecord,
} from './services/loans.service';
import {
  fetchNotifications as fetchNotificationsService,
  type NotificationRecord,
} from './services/notifications.service';
import {
  fetchDashboardKPISummary,
  type DashboardKPISummary,
} from './services/analytics.service';

export type { BookingRecord, BookingStatus, LoanRecord, DashboardKPISummary, NotificationRecord };

export interface LoanApplicationRecord {
  id: string;
  applicant: string;
  amount: number;
  purpose: string;
  applied: string;
  salary: number;
  risk: 'Low' | 'Medium' | 'High';
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Disbursed' | 'Repaid' | 'Defaulted';
  referenceNumber: string;
}

export interface DashboardSummary {
  totalCustomers: number;
  totalBookings: number;
  activeBookings: number;
  upcomingEvents: number;
  completedEvents: number;
  pendingLoans: number;
  approvedLoans: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  galleryQueue: number;
  notifications: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const kpis = await fetchDashboardKPISummary();
  return {
    totalCustomers: kpis.totalCustomers,
    totalBookings: kpis.totalBookings,
    activeBookings: kpis.activeBookings,
    upcomingEvents: kpis.upcomingEvents,
    completedEvents: kpis.completedEvents,
    pendingLoans: kpis.pendingLoans,
    approvedLoans: kpis.approvedLoans,
    revenueThisMonth: kpis.totalRevenue,
    revenueThisYear: kpis.totalRevenue * 12,
    galleryQueue: kpis.galleryQueueCount,
    notifications: kpis.unreadNotificationsCount,
  };
}

export async function getBookings(): Promise<BookingRecord[]> {
  return fetchBookings();
}

export async function getLoanApplications(): Promise<LoanApplicationRecord[]> {
  const loans = await fetchLoans();
  return loans.map((l) => ({
    id: l.id,
    applicant: l.applicantName,
    amount: l.amount,
    purpose: l.purpose,
    applied: l.createdAt.slice(0, 10),
    salary: l.salary,
    risk: l.riskLevel,
    status: l.status as LoanApplicationRecord['status'],
    referenceNumber: l.referenceNumber,
  }));
}

export async function createBooking(
  payload: Omit<BookingRecord, 'id' | 'createdAt'>
): Promise<BookingRecord> {
  return createBookingService({
    customerName: payload.client,
    email: payload.email,
    phone: payload.phone,
    idNumber: payload.idNumber,
    eventType: payload.eventType,
    packageName: payload.packageName,
    eventDate: payload.eventDate,
    eventTime: payload.eventTime,
    venueName: payload.venueName,
    venueAddress: payload.venueAddress,
    guestCount: payload.guestCount,
    addons: payload.addons,
    totalAmount: payload.deposit,
    deposit: payload.deposit,
    status: payload.status,
    financed: payload.financed,
    notes: payload.notes,
  });
}

export async function createLoanApplication(payload: {
  applicant: string;
  amount: number;
  purpose: string;
  status?: string;
  referenceNumber?: string;
  salary?: number;
  risk?: string;
  email?: string;
  phone?: string;
}): Promise<LoanApplicationRecord> {
  const created = await createLoanService({
    applicantName: payload.applicant,
    email: payload.email || 'customer@vsm.co.za',
    phone: payload.phone || '+27 00 000 0000',
    amount: payload.amount,
    purpose: payload.purpose,
    salary: payload.salary || 0,
    riskLevel: (payload.risk as 'Low' | 'Medium' | 'High') || 'Low',
    status: (payload.status as 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Disbursed' | 'Repaid' | 'Defaulted') || 'Submitted',
  });

  return {
    id: created.id,
    applicant: created.applicantName,
    amount: created.amount,
    purpose: created.purpose,
    applied: created.createdAt.slice(0, 10),
    salary: created.salary,
    risk: created.riskLevel,
    status: created.status as LoanApplicationRecord['status'],
    referenceNumber: created.referenceNumber,
  };
}

export async function getNotifications(): Promise<
  Array<{ id: string; message: string; time: string }>
> {
  const notifs = await fetchNotificationsService('all');
  return notifs.slice(0, 10).map((n) => {
    const d = new Date(n.createdAt);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
    let timeStr = 'just now';
    if (diffMin > 60 * 24) timeStr = `${Math.floor(diffMin / (60 * 24))}d ago`;
    else if (diffMin > 60) timeStr = `${Math.floor(diffMin / 60)}h ago`;
    else if (diffMin > 0) timeStr = `${diffMin}m ago`;

    return {
      id: n.id,
      message: `${n.title}: ${n.message}`,
      time: timeStr,
    };
  });
}
