import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export type BookingStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Scheduled'
  | 'Event Completed'
  | 'Gallery Uploaded'
  | 'Delivered'
  | 'Rejected';

export interface BookingRecord {
  id: string;
  client: string;
  email: string;
  phone: string;
  eventType: string;
  packageName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  deposit: number;
  status: BookingStatus;
  financed: boolean;
  referenceNumber: string;
  notes?: string;
  createdAt: string;
}

export interface LoanApplicationRecord {
  id: string;
  applicant: string;
  amount: number;
  purpose: string;
  applied: string;
  salary: number;
  risk: 'Low' | 'Medium' | 'High';
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Funded';
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

const BOOKING_STORAGE_KEY = 'vsm-bookings';
const LOAN_STORAGE_KEY = 'vsm-loans';
const NOTIFICATION_STORAGE_KEY = 'vsm-notifications';

const seedBookings: BookingRecord[] = [
  {
    id: 'bk-001',
    client: 'Nkosi Dlamini',
    email: 'nkosi@example.com',
    phone: '+27 82 111 2222',
    eventType: 'Wedding',
    packageName: 'Legacy Collection',
    eventDate: '2026-06-14',
    eventTime: '16:00',
    location: 'Sandton Convention Centre',
    deposit: 7250,
    status: 'Approved',
    financed: true,
    referenceNumber: 'VSM-20260614-001',
    createdAt: '2026-05-20T10:00:00.000Z',
  },
  {
    id: 'bk-002',
    client: 'Zanele Mokoena',
    email: 'zanele@example.com',
    phone: '+27 71 333 4444',
    eventType: 'Birthday',
    packageName: 'Cinematic Experience',
    eventDate: '2026-06-21',
    eventTime: '19:30',
    location: 'Soweto, JHB',
    deposit: 4450,
    status: 'Scheduled',
    financed: false,
    referenceNumber: 'VSM-20260621-002',
    createdAt: '2026-05-21T09:30:00.000Z',
  },
  {
    id: 'bk-003',
    client: 'Sipho Khumalo',
    email: 'sipho@example.com',
    phone: '+27 84 555 6666',
    eventType: 'Corporate',
    packageName: 'Essential Memories',
    eventDate: '2026-06-28',
    eventTime: '09:00',
    location: 'Sandton City',
    deposit: 2250,
    status: 'Under Review',
    financed: false,
    referenceNumber: 'VSM-20260628-003',
    createdAt: '2026-05-22T11:00:00.000Z',
  },
];

const seedLoans: LoanApplicationRecord[] = [
  {
    id: 'ln-041',
    applicant: 'Sibusiso Mahlangu',
    amount: 8900,
    purpose: 'Cinematic Package',
    applied: '2026-05-26',
    salary: 18500,
    risk: 'Low',
    status: 'Under Review',
    referenceNumber: 'LOAN-20260526-041',
  },
  {
    id: 'ln-042',
    applicant: 'Palesa Dlamini',
    amount: 4500,
    purpose: 'Essential Package',
    applied: '2026-05-27',
    salary: 12000,
    risk: 'Low',
    status: 'Approved',
    referenceNumber: 'LOAN-20260527-042',
  },
];

function readStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorageItem<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeedData() {
  if (typeof window === 'undefined') {
    return;
  }

  const existingBookings = readStorageItem<BookingRecord[]>(BOOKING_STORAGE_KEY, []);
  if (existingBookings.length === 0) {
    writeStorageItem(BOOKING_STORAGE_KEY, seedBookings);
  }

  const existingLoans = readStorageItem<LoanApplicationRecord[]>(LOAN_STORAGE_KEY, []);
  if (existingLoans.length === 0) {
    writeStorageItem(LOAN_STORAGE_KEY, seedLoans);
  }

  const existingNotifications = readStorageItem<
    Array<{ id: string; message: string; time: string }>
  >(NOTIFICATION_STORAGE_KEY, []);
  if (existingNotifications.length === 0) {
    writeStorageItem(NOTIFICATION_STORAGE_KEY, [
      { id: 'notif-1', message: 'New booking request received', time: '8 min ago' },
      { id: 'notif-2', message: 'Gallery upload pending for 2 events', time: '35 min ago' },
    ]);
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  ensureSeedData();
  const bookings = await getBookings();
  const loans = await getLoanApplications();
  const completed = bookings.filter(
    (booking) =>
      booking.status === 'Event Completed' ||
      booking.status === 'Gallery Uploaded' ||
      booking.status === 'Delivered'
  ).length;
  const upcoming = bookings.filter((booking) =>
    ['Approved', 'Scheduled'].includes(booking.status)
  ).length;
  const pendingLoans = loans.filter(
    (loan) => loan.status === 'Submitted' || loan.status === 'Under Review'
  ).length;
  const approvedLoans = loans.filter(
    (loan) => loan.status === 'Approved' || loan.status === 'Funded'
  ).length;
  const revenueThisMonth = bookings.reduce((total, booking) => total + booking.deposit, 0);
  const revenueThisYear = revenueThisMonth * 12;

  return {
    totalCustomers: new Set(bookings.map((booking) => booking.client)).size + 2,
    totalBookings: bookings.length,
    activeBookings: bookings.filter(
      (booking) => !['Delivered', 'Rejected'].includes(booking.status)
    ).length,
    upcomingEvents: upcoming,
    completedEvents: completed,
    pendingLoans,
    approvedLoans,
    revenueThisMonth,
    revenueThisYear,
    galleryQueue: 3,
    notifications: 4,
  };
}

export async function getBookings(): Promise<BookingRecord[]> {
  ensureSeedData();
  const localBookings = readStorageItem<BookingRecord[]>(BOOKING_STORAGE_KEY, []);

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data as BookingRecord[];
        }
      }
    } catch {
      // fall back silently to local storage
    }
  }

  return localBookings;
}

export async function getLoanApplications(): Promise<LoanApplicationRecord[]> {
  ensureSeedData();
  const localLoans = readStorageItem<LoanApplicationRecord[]>(LOAN_STORAGE_KEY, []);

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('loan_applications')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data as LoanApplicationRecord[];
        }
      }
    } catch {
      // fall back silently to local storage
    }
  }

  return localLoans;
}

export async function createBooking(
  payload: Omit<BookingRecord, 'id' | 'createdAt'>
): Promise<BookingRecord> {
  const booking: BookingRecord = {
    id: `bk-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    ...payload,
  };

  const existing = readStorageItem<BookingRecord[]>(BOOKING_STORAGE_KEY, []);
  const next = [booking, ...existing];
  writeStorageItem(BOOKING_STORAGE_KEY, next);

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.from('bookings').insert({
          id: booking.id,
          customer_name: booking.client,
          event_type: booking.eventType,
          package_name: booking.packageName,
          event_date: booking.eventDate,
          event_time: booking.eventTime,
          location: booking.location,
          status: booking.status,
          total_amount: booking.deposit,
          reference_number: booking.referenceNumber,
          created_at: booking.createdAt,
        });
      }
    } catch {
      // ignore and preserve local persistence
    }
  }

  return booking;
}

export async function createLoanApplication(
  payload: Omit<LoanApplicationRecord, 'id'>
): Promise<LoanApplicationRecord> {
  const application: LoanApplicationRecord = {
    id: `ln-${Date.now().toString(36).toUpperCase()}`,
    ...payload,
  };

  const existing = readStorageItem<LoanApplicationRecord[]>(LOAN_STORAGE_KEY, []);
  const next = [application, ...existing];
  writeStorageItem(LOAN_STORAGE_KEY, next);

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.from('loan_applications').insert({
          id: application.id,
          applicant_name: application.applicant,
          amount: application.amount,
          purpose: application.purpose,
          status: application.status,
          reference_number: application.referenceNumber,
          created_at: new Date().toISOString(),
        });
      }
    } catch {
      // ignore and preserve local persistence
    }
  }

  return application;
}

export async function getNotifications(): Promise<
  Array<{ id: string; message: string; time: string }>
> {
  ensureSeedData();
  return readStorageItem(
    NOTIFICATION_STORAGE_KEY,
    [] as Array<{ id: string; message: string; time: string }>
  );
}
