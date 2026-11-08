'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Mail,
  Loader2,
  Calendar,
  Sparkles,
  CheckCircle,
  FileText,
  CreditCard,
  Download,
  ShieldCheck,
  Lock,
  ArrowRight,
  Upload,
  AlertCircle,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  LogOut,
  RefreshCw,
  Eye,
  Camera,
  Coins
} from 'lucide-react';
import { toast } from 'sonner';
import PublicShell from '@/components/public/PublicShell';
import { getCustomerBookings } from '@/lib/bookings/service';
import { getCustomerLoans, type LoanRecord } from '@/lib/services/loans.service';
import { getVaultsByCustomerEmail, type MemoryVaultRecord } from '@/lib/services/vaults.service';
import { uploadPaymentProof } from '@/lib/services/payment-proofs.service';
import type { BookingRecord } from '@/lib/bookings/types';
import { formatCurrency, formatDate } from '@/lib/services/supabase-helpers';
import { useAuth } from '@/contexts/AuthContext';

interface PortalForm {
  email: string;
}

function CustomerPortalInner() {
  const searchParams = useSearchParams();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'loans'>('bookings');
  const [bookings, setBookings] = useState<BookingRecord[] | null>(null);
  const [loans, setLoans] = useState<LoanRecord[] | null>(null);
  const [vaults, setVaults] = useState<MemoryVaultRecord[] | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingBookingId, setUploadingBookingId] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

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
      const [bookingsRes, loansRes, vaultsRes] = await Promise.all([
        getCustomerBookings(cleanEmail, customerUserId || user?.id).catch(() => []),
        getCustomerLoans(cleanEmail).catch(() => []),
        getVaultsByCustomerEmail(cleanEmail).catch(() => []),
      ]);

      setEmail(cleanEmail);
      setBookings(bookingsRes);
      setLoans(loansRes);
      setVaults(vaultsRes);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('vsm-portal-session', JSON.stringify({ email: cleanEmail }));
      }

      if (bookingsRes.length === 0 && loansRes.length === 0 && vaultsRes.length === 0) {
        toast.info('No active records found for this email address.');
      } else {
        toast.success(`Loaded portfolio for ${cleanEmail}`);
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

  const handleQuickDemo = (demoEmail = 'thabo@example.com') => {
    setValue('email', demoEmail);
    loadCustomerData(demoEmail);
  };

  const handleFileUpload = async (bookingId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingBookingId(bookingId);
    try {
      await uploadPaymentProof(bookingId, file);
      toast.success('Proof of payment uploaded! Admin will verify your transfer shortly.');
      setUploadSuccess(bookingId);
      // Reload customer bookings
      if (email) loadCustomerData(email);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload proof of payment.');
    } finally {
      setUploadingBookingId(null);
    }
  };

  return (
    <PublicShell>
      <main className="min-h-screen bg-near-black text-clear-white pb-24 font-sans selection:bg-vsm-gold/20 selection:text-white">
        {/* Portal Header */}
        <div className="relative overflow-hidden py-16 border-b border-white/5 bg-gradient-to-b from-deep-navy/30 via-transparent to-transparent">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-navy border border-vsm-gold/25 text-vsm-gold text-xs font-semibold uppercase tracking-widest mb-3">
                  <ShieldCheck size={13} className="text-vsm-gold" />
                  <span>Secure Client Portal</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Customer Portfolio & Memory Hub
                </h1>
                <p className="text-sm text-white/60 mt-1 max-w-xl">
                  Track your visual media productions, download delivered memory vaults, and manage your financing accounts.
                </p>
              </div>

              {email && (
                <div className="flex items-center gap-3 bg-deep-navy/60 border border-white/10 rounded-2xl p-3 px-4 backdrop-blur-md">
                  <div className="w-9 h-9 rounded-full bg-vsm-gold/20 border border-vsm-gold/40 flex items-center justify-center text-vsm-gold font-bold text-sm">
                    {email.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-xs">
                    <span className="text-white/50 block font-medium">Logged in as</span>
                    <span className="text-white font-bold truncate max-w-[180px] block">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem('vsm-portal-session');
                      setBookings(null);
                      setLoans(null);
                      setVaults(null);
                      setEmail('');
                      setValue('email', '');
                    }}
                    className="ml-2 text-white/40 hover:text-red-400 p-1.5 transition-colors"
                    title="Switch Account"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-10">
          {/* Email Lookup Card (Shown if no data loaded) */}
          {bookings === null && loans === null ? (
            <div className="max-w-xl mx-auto bg-deep-navy/40 border border-vsm-gold/25 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-deep-navy border border-vsm-gold/40 flex items-center justify-center text-vsm-gold mx-auto mb-4 shadow-gold">
                  <Lock size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Access Your Client Portal</h2>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Enter the email address used during your event booking or loan application to securely view your account.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                    Client Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      {...register('email', {
                        required: 'Please enter your email',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Enter a valid email address',
                        },
                      })}
                      type="email"
                      placeholder="e.g. thabo@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-near-black/70 border border-white/15 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-vsm-gold transition-colors"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1.5 pl-2">{errors.email.message}</p>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Verifying Portfolio...</span>
                    </>
                  ) : (
                    <>
                      <span>Open Customer Portal</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Button */}
              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-xs text-white/40 mb-3">Testing the platform?</p>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('thabo@example.com')}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-vsm-gold/20 text-vsm-gold text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                >
                  <Sparkles size={12} />
                  <span>Load Demo Client: thabo@example.com</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged-In Portal Experience */
            <div>
              {/* Tab Navigation */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('bookings')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      activeTab === 'bookings'
                        ? 'bg-vsm-gold text-near-black shadow-lg shadow-vsm-gold/20'
                        : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <Camera size={14} />
                    <span>Visual Productions ({bookings?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('loans')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      activeTab === 'loans'
                        ? 'bg-vsm-gold text-near-black shadow-lg shadow-vsm-gold/20'
                        : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <Coins size={14} />
                    <span>Smart Financing ({loans?.length || 0})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => email && loadCustomerData(email)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs flex items-center gap-1.5 transition-all"
                  title="Refresh Data"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>

              {/* Tab 1: Visual Productions & Bookings */}
              {activeTab === 'bookings' && (
                <div className="space-y-8">
                  {/* Memory Vaults Banner if Client has vaults */}
                  {vaults && vaults.length > 0 && (
                    <div className="p-6 rounded-3xl bg-gradient-to-r from-deep-navy to-corporate-navy border border-vsm-gold/30 shadow-2xl relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-vsm-gold/20 border border-vsm-gold/40 flex items-center justify-center text-vsm-gold flex-shrink-0">
                            <Sparkles size={22} />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-vsm-gold font-bold">
                              Delivered Archive Ready
                            </span>
                            <h3 className="text-xl font-bold text-white leading-tight">
                              {vaults[0].title}
                            </h3>
                            <p className="text-xs text-white/60 mt-0.5">
                              Access Code:{' '}
                              <span className="font-mono text-vsm-gold font-bold">
                                {vaults[0].accessCode}
                              </span>{' '}
                              • {vaults[0].viewCount} views • {vaults[0].downloadCount} downloads
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/vault/${vaults[0].accessCode}`}
                          className="btn-gold px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow-lg"
                        >
                          <Eye size={14} />
                          <span>Open Memory Vault</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Bookings List */}
                  {bookings && bookings.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-deep-navy/20 p-8">
                      <Camera size={36} className="text-white/30 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-white mb-1">No Active Event Bookings</h3>
                      <p className="text-xs text-white/50 max-w-sm mx-auto mb-6">
                        You do not have any active bookings recorded under this email address.
                      </p>
                      <Link
                        href="/book"
                        className="btn-gold px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
                      >
                        Book Your First Event
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {bookings?.map((booking) => {
                        const balanceDue = Math.max(0, (booking.totalAmount || 0) - (booking.deposit || 0));
                        return (
                          <div
                            key={booking.id}
                            className="p-6 sm:p-8 rounded-3xl bg-deep-navy/40 border border-white/10 hover:border-vsm-gold/30 transition-all shadow-xl"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="px-3 py-1 rounded-full bg-vsm-gold/15 border border-vsm-gold/30 text-vsm-gold text-xs font-bold uppercase tracking-wider">
                                    {booking.eventType}
                                  </span>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                      booking.status === 'Gallery Uploaded' || booking.status === 'Event Completed' || (booking.status as string) === 'Delivered'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    }`}
                                  >
                                    {booking.status}
                                  </span>
                                  <span className="text-white/40 text-xs font-mono">
                                    Ref: {booking.referenceNumber}
                                  </span>
                                </div>
                                <h3 className="text-2xl font-bold text-white">{booking.packageName}</h3>
                              </div>

                              <div className="flex items-center gap-3">
                                <Link
                                  href={`/track/${booking.referenceNumber}?email=${encodeURIComponent(email)}`}
                                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                                >
                                  <span>Track Milestone</span>
                                  <ExternalLink size={12} />
                                </Link>

                                <Link
                                  href={`/vault/VSM-8492`}
                                  className="btn-gold px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                                >
                                  <Lock size={12} />
                                  <span>Memory Vault</span>
                                </Link>
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-white/10 text-xs">
                              <div className="flex items-start gap-3">
                                <Calendar size={16} className="text-vsm-gold flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-white/50 block font-medium">Event Date</span>
                                  <span className="text-white font-bold text-sm block">
                                    {formatDate(booking.eventDate)}
                                  </span>
                                  <span className="text-white/40">{booking.eventTime || 'Full Day'}</span>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-vsm-gold flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-white/50 block font-medium">Venue Location</span>
                                  <span className="text-white font-bold text-sm block truncate max-w-[200px]">
                                    {booking.venueName || 'Selected Venue'}
                                  </span>
                                  <span className="text-white/40">{booking.location}</span>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <CreditCard size={16} className="text-vsm-gold flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-white/50 block font-medium">Financial Ledger</span>
                                  <span className="text-white font-bold text-sm block">
                                    Total: {formatCurrency(booking.totalAmount)}
                                  </span>
                                  <span className="text-vsm-gold">
                                    Deposit Paid: {formatCurrency(booking.deposit || 0)}
                                    {balanceDue > 0 ? ` (Balance: ${formatCurrency(balanceDue)})` : ' (Settled)'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Proof of Payment (POP) Upload Row */}
                            <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="text-xs text-white/60">
                                <span className="font-bold text-white block">EFT Payment Verification</span>
                                <span>
                                  {uploadSuccess === booking.id
                                    ? 'Receipt attached. VSM admin is reviewing your payment.'
                                    : 'Transferred via EFT? Upload your banking proof of payment for rapid approval.'}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <label className="cursor-pointer px-4 py-2 rounded-full bg-deep-navy border border-vsm-gold/30 hover:border-vsm-gold text-vsm-gold text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all">
                                  <Upload size={13} />
                                  <span>{uploadingBookingId === booking.id ? 'Uploading...' : 'Attach Proof of Payment'}</span>
                                  <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    disabled={uploadingBookingId === booking.id}
                                    onChange={(e) => handleFileUpload(booking.id, e)}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Smart Financing & Loans */}
              {activeTab === 'loans' && (
                <div className="space-y-8">
                  {loans && loans.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-deep-navy/20 p-8">
                      <Coins size={36} className="text-white/30 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-white mb-1">No Active Financing Accounts</h3>
                      <p className="text-xs text-white/50 max-w-md mx-auto mb-6 leading-relaxed">
                        VSM provides intelligent, contextual event financing (spread over 3 to 12 months) as well as personal financial assistance.
                      </p>
                      <Link
                        href="/finance"
                        className="btn-gold px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                      >
                        <span>Check Financing Eligibility</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {loans?.map((loan) => (
                        <div
                          key={loan.id}
                          className="p-6 sm:p-8 rounded-3xl bg-deep-navy/40 border border-white/10 shadow-xl"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 rounded-full bg-vsm-gold/15 border border-vsm-gold/30 text-vsm-gold text-xs font-bold uppercase tracking-wider">
                                  {loan.loanType === 'photography' ? 'Event Financing' : 'Personal Loan'}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
                                  {loan.status}
                                </span>
                              </div>
                              <h3 className="text-2xl font-bold text-white">
                                {formatCurrency(loan.amount)}
                              </h3>
                              <p className="text-xs text-white/50">
                                Ref: <span className="font-mono text-white/80">{loan.referenceNumber}</span>
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <span className="text-xs text-white/50 block">Monthly Instalment</span>
                              <span className="text-xl font-bold text-vsm-gold">
                                {formatCurrency(loan.monthlyInstalment)}
                                <span className="text-xs text-white/50 font-normal"> / mo</span>
                              </span>
                              <span className="text-xs text-white/40 block mt-0.5">
                                Term: {loan.termMonths} Months @ {loan.interestRate}% APR
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs text-white/70">
                            <div>
                              <span className="text-white/40 block font-medium">Total Repayable</span>
                              <span className="text-white font-bold text-sm block">
                                {formatCurrency(loan.totalPayable)}
                              </span>
                            </div>
                            <div>
                              <span className="text-white/40 block font-medium">Outstanding Balance</span>
                              <span className="text-vsm-gold font-bold text-sm block">
                                {formatCurrency(loan.balance || loan.totalPayable)}
                              </span>
                            </div>
                            <div>
                              <span className="text-white/40 block font-medium">Settlement Schedule</span>
                              <span className="text-white font-bold text-sm block">
                                Monthly Debit / EFT
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </PublicShell>
  );
}

export default function CustomerPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-near-black flex items-center justify-center text-white">
          <Loader2 size={32} className="animate-spin text-vsm-gold" />
        </div>
      }
    >
      <CustomerPortalInner />
    </Suspense>
  );
}
