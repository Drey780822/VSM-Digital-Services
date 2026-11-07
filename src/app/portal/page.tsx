'use client';

import { useEffect, useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Mail,
  Loader2,
  Calendar,
  ChevronRight,
  AlertCircle,
  Camera,
  TrendingUp,
  Sparkles,
  CheckCircle,
  Clock,
  Printer,
  FileText,
  ExternalLink,
  CreditCard,
  Download,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import BookingFlowLayout from '@/app/book/components/BookingFlowLayout';
import StatusBadge from '@/components/booking/StatusBadge';
import { getCustomerBookings } from '@/lib/bookings/service';
import { getCustomerLoans, type LoanRecord } from '@/lib/services/loans.service';
import type { BookingRecord } from '@/lib/bookings/types';
import { formatCurrency, formatDate } from '@/lib/services/supabase-helpers';
import { formatZAR } from '@/lib/services/eligibility.engine';
import { useAuth } from '@/contexts/AuthContext';

interface PortalForm {
  email: string;
}

function CustomerPortalContent() {
  const searchParams = useSearchParams();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'loans'>('bookings');
  const [bookings, setBookings] = useState<BookingRecord[] | null>(null);
  const [loans, setLoans] = useState<LoanRecord[] | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PortalForm>();

  const loadCustomerData = async (customerEmail: string, customerUserId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const cleanEmail = customerEmail.trim().toLowerCase();
      const [bookingsRes, loansRes] = await Promise.all([
        getCustomerBookings(cleanEmail, customerUserId || user?.id).catch(() => []),
        getCustomerLoans(cleanEmail).catch(() => []),
      ]);

      setEmail(cleanEmail);
      setBookings(bookingsRes);
      setLoans(loansRes);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('vsm-portal-session', JSON.stringify({ email: cleanEmail }));
      }

      if (bookingsRes.length === 0 && loansRes.length === 0) {
        toast.info('No records found for this email address.');
      } else {
        toast.success(`Loaded ${bookingsRes.length} bookings and ${loansRes.length} loans.`);
      }
    } catch {
      setError('Unable to load your portal data. Please try again.');
      toast.error('Portal lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlEmail = searchParams.get('email');
    if (urlEmail) {
      setValue('email', urlEmail);
      loadCustomerData(urlEmail, user?.id);
      return;
    }

    if (user?.email) {
      setValue('email', user.email);
      loadCustomerData(user.email, user.id);
      return;
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(sessionStorage.getItem('vsm-portal-session') || '{}');
        if (stored.email) {
          setValue('email', stored.email);
          loadCustomerData(stored.email);
        }
      } catch {
        /* ignore */
      }
    }
  }, [searchParams, setValue, user]);

  const onSubmit = (values: PortalForm) => {
    loadCustomerData(values.email, user?.id);
  };

  const printStatement = () => {
    window.print();
  };

  return (
    <BookingFlowLayout>
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-gold/30 text-primary text-xs font-semibold tracking-widest uppercase mb-2">
          <Sparkles size={13} />
          Two Services · One Platform
        </div>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Unified Customer <span className="text-gradient-gold italic">Portal</span>
        </h1>
        <p className="mt-2 text-sm text-foreground-muted max-w-md mx-auto">
          Manage your luxury event photography bookings and smart financing accounts in one secure space.
        </p>
      </div>

      {bookings === null && loans === null ? (
        <div className="bg-card border border-border rounded-2xl p-7 lg:p-8 shadow-xl">
          {user ? (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-xs text-success">
              <div className="flex items-center gap-2">
                <CheckCircle size={15} className="text-success" />
                <span>
                  Signed in as <strong>{user.email}</strong>. Ready to access your portfolio.
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-5 flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs text-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-primary flex-shrink-0" />
                <span>Sign in for 1-click access to all your bookings and loan contracts.</span>
              </div>
              <Link
                href="/auth/login?redirect=/portal"
                className="font-semibold text-primary hover:underline flex-shrink-0"
              >
                Sign In
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
                Customer Email Address <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                  type="email"
                  className="input-luxury w-full pl-10 pr-4 py-3 text-sm"
                  placeholder="you@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-danger bg-danger/10 p-3 rounded-lg border border-danger/30">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Accessing Portal...
                </>
              ) : (
                'Access My Services'
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Bar with user info & quick actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border">
            <div>
              <span className="text-[10px] text-foreground-muted uppercase tracking-wider block">
                Active Customer Account
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{email}</span>
                {user && user.email?.toLowerCase() === email.toLowerCase() && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success border border-success/30">
                    Verified
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={printStatement}
                className="btn-silver px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5"
                title="Print official customer statement"
              >
                <Printer size={13} />
                Print Statement
              </button>
              {user ? (
                <button
                  onClick={async () => {
                    await signOut();
                    setBookings(null);
                    setLoans(null);
                    setEmail('');
                    if (typeof window !== 'undefined') {
                      sessionStorage.removeItem('vsm-portal-session');
                    }
                  }}
                  className="btn-silver px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 text-danger hover:bg-danger/10"
                  title="Sign out of account"
                >
                  <LogOut size={13} />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setBookings(null);
                    setLoans(null);
                    setEmail('');
                    if (typeof window !== 'undefined') {
                      sessionStorage.removeItem('vsm-portal-session');
                    }
                  }}
                  className="text-xs text-primary hover:text-primary-light transition-colors px-2 py-1"
                >
                  Change Account
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-muted/40 p-1 border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'bookings'
                  ? 'bg-card text-foreground shadow-sm border border-gold/40'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              <Camera size={15} className={activeTab === 'bookings' ? 'text-primary' : ''} />
              Photography Bookings
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary/15 text-primary font-bold">
                {bookings?.length || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('loans')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'loans'
                  ? 'bg-card text-foreground shadow-sm border border-gold/40'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              <TrendingUp size={15} className={activeTab === 'loans' ? 'text-primary' : ''} />
              Smart Financing & Loans
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary/15 text-primary font-bold">
                {loans?.length || 0}
              </span>
            </button>
          </div>

          {/* TAB 1: PHOTOGRAPHY BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {bookings && bookings.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <Camera size={32} className="text-primary/40 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground mb-1">No photography bookings found</p>
                  <p className="text-xs text-foreground-muted mb-5">
                    Ready to capture your wedding, celebration, or corporate event?
                  </p>
                  <Link href="/book" className="btn-gold inline-flex px-6 py-3 text-sm font-semibold rounded-md shadow-lg">
                    Book an Event Package
                  </Link>
                </div>
              ) : (
                bookings?.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-card border border-border rounded-2xl p-6 hover:border-gold/60 transition-all duration-200 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            {booking.eventType}
                          </span>
                          <StatusBadge status={booking.status} />
                          {booking.financed && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                              <TrendingUp size={10} /> Smart Financed
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{booking.packageName}</h3>
                        <p className="text-xs text-foreground-muted mt-0.5">
                          Reference: <span className="font-mono text-foreground font-semibold">{booking.referenceNumber}</span> · Tracking: <span className="font-mono">{booking.trackingNumber}</span>
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-foreground-muted uppercase tracking-wider block">Total Amount</span>
                        <span className="text-lg font-bold text-gradient-gold">
                          R {(booking.totalAmount || booking.deposit).toLocaleString()}
                        </span>
                        <span className="text-[11px] text-foreground-muted block mt-0.5">
                          Payment: <strong className="text-foreground">{booking.paymentStatus}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border mb-4 text-xs">
                      <div>
                        <span className="text-[10px] text-foreground-muted uppercase block">Event Date</span>
                        <span className="font-medium text-foreground">
                          {formatDate(booking.eventDate)} at {booking.eventTime}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-foreground-muted uppercase block">Venue</span>
                        <span className="font-medium text-foreground truncate block">
                          {booking.venueName || 'To be confirmed'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-foreground-muted uppercase block">Guests</span>
                        <span className="font-medium text-foreground">{booking.guestCount} guests</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
                      <div className="flex items-center gap-2">
                        {booking.financed && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('loans');
                              // Find linked loan if available
                              const match = loans?.find(
                                (l) => l.linkedBookingId === booking.id || l.purpose?.includes(booking.referenceNumber)
                              );
                              if (match) setSelectedLoan(match);
                            }}
                            className="text-xs font-semibold text-primary hover:text-primary-light flex items-center gap-1"
                          >
                            <TrendingUp size={12} /> View Linked Loan →
                          </button>
                        )}
                        {(booking.status === 'Gallery Uploaded' || booking.status === 'Delivered') && (
                          <Link
                            href={`/vault/${encodeURIComponent(booking.referenceNumber)}`}
                            className="text-xs font-semibold text-gradient-gold flex items-center gap-1 hover:underline"
                          >
                            <Sparkles size={12} /> Open Memory Vault
                          </Link>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <Link
                          href={`/track/${encodeURIComponent(booking.referenceNumber)}?email=${encodeURIComponent(email)}`}
                          className="btn-silver px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1"
                        >
                          Track Event Timeline <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: SMART FINANCING & LOANS */}
          {activeTab === 'loans' && (
            <div className="space-y-4">
              {loans && loans.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <TrendingUp size={32} className="text-primary/40 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground mb-1">No active loan applications</p>
                  <p className="text-xs text-foreground-muted mb-5">
                    Finance photography packages or apply for personal loans from 3 to 24 months.
                  </p>
                  <Link
                    href="/loan-application-flow"
                    className="btn-gold inline-flex px-6 py-3 text-sm font-semibold rounded-md shadow-lg"
                  >
                    Apply for Smart Financing
                  </Link>
                </div>
              ) : (
                loans?.map((loan) => {
                  const progressPct = loan.totalPayable > 0
                    ? Math.min(100, Math.round(((loan.totalPayable - loan.balance) / loan.totalPayable) * 100))
                    : 0;

                  return (
                    <div
                      key={loan.id}
                      className="bg-card border border-border rounded-2xl p-6 hover:border-gold/60 transition-all duration-200 shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">
                              {loan.loanType === 'photography' ? 'Photography Financing' : 'Personal Loan'}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                loan.status === 'Approved' || loan.status === 'Disbursed'
                                  ? 'bg-success/15 text-success border-success/30'
                                  : loan.status === 'Submitted' || loan.status === 'Under Review'
                                  ? 'bg-warning/15 text-warning border-warning/30'
                                  : loan.status === 'Repaid'
                                  ? 'bg-primary/20 text-primary border-gold'
                                  : 'bg-danger/15 text-danger border-danger/30'
                              }`}
                            >
                              {loan.status}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-foreground-muted">
                              {loan.verificationStatus}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-foreground">{loan.purpose}</h3>
                          <p className="text-xs text-foreground-muted mt-0.5">
                            Reference: <span className="font-mono text-foreground font-semibold">{loan.referenceNumber}</span>
                            {loan.linkedBookingId && (
                              <span className="ml-2 text-primary font-medium">· Linked to Event Booking</span>
                            )}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-foreground-muted uppercase tracking-wider block">
                            Outstanding Balance
                          </span>
                          <span className="text-xl font-bold text-gradient-gold counter-value">
                            {formatCurrency(loan.balance)}
                          </span>
                          <span className="text-[11px] text-foreground-muted block mt-0.5">
                            Instalment: <strong className="text-foreground">{formatZAR(loan.monthlyInstalment)}/mo</strong>
                          </span>
                        </div>
                      </div>

                      {/* Repayment Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-foreground-muted mb-1.5">
                          <span>Repayment Progress</span>
                          <span>{progressPct}% Paid</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gold-gradient h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border mb-4 text-xs">
                        <div>
                          <span className="text-[10px] text-foreground-muted uppercase block">Principal</span>
                          <span className="font-semibold text-foreground">{formatCurrency(loan.amount)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-foreground-muted uppercase block">Term</span>
                          <span className="font-semibold text-foreground">{loan.termMonths} Months</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-foreground-muted uppercase block">Interest Rate</span>
                          <span className="font-semibold text-foreground">{loan.interestRate}% p.a.</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-foreground-muted uppercase block">Next Due Date</span>
                          <span className="font-semibold text-foreground">
                            {loan.dueDate ? formatDate(loan.dueDate) : '1st of next month'}
                          </span>
                        </div>
                      </div>

                      {/* Repayment Schedule & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
                        <div className="text-xs text-foreground-muted flex items-center gap-1.5">
                          <CreditCard size={13} className="text-primary" />
                          <span>Debit Order: <strong>{loan.bankName}</strong> (•••• {loan.accountNumber?.slice(-4) || 'Direct'})</span>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                          {loan.linkedBookingId && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('bookings')}
                              className="btn-silver px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1"
                            >
                              <Camera size={12} /> View Event Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Customer Support Footer */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border text-center text-xs text-foreground-muted">
            Need help with your booking or financing account? Contact VSM Support at{' '}
            <a href="mailto:info@vsm.co.za" className="text-primary underline">
              info@vsm.co.za
            </a>{' '}
            or call our client services desk.
          </div>
        </div>
      )}
    </BookingFlowLayout>
  );
}

export default function CustomerPortalPage() {
  return (
    <Suspense
      fallback={
        <BookingFlowLayout>
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-sm text-foreground-muted">Loading customer portal...</p>
          </div>
        </BookingFlowLayout>
      }
    >
      <CustomerPortalContent />
    </Suspense>
  );
}
