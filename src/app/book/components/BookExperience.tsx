'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Building2,
  ShieldCheck,
  Sparkles,
  Camera,
  Video,
  Layers,
  ChevronRight,
  Loader2,
  FileText,
  UploadCloud,
  HelpCircle,
  Briefcase,
  Users,
  MapPin,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';
import PublicShell from '@/components/public/PublicShell';
import { useAuth } from '@/contexts/AuthContext';
import { createBooking } from '@/lib/bookings/service';
import { submitCorporateEnquiry } from '@/lib/services/business.service';
import { uploadPaymentProof } from '@/lib/services/payment-proofs.service';
import {
  fetchEventTypes,
  fetchPricingAddons,
  fetchGlobalPricingConfig,
  calculateMiniEventPrice,
  calculatePackagePrice,
  CANONICAL_EVENT_TYPES,
  CANONICAL_ADDONS,
  DEFAULT_GLOBAL_CONFIG,
  type EventTypeRecord,
  type PricingAddonRecord,
  type GlobalPricingEngineConfig,
  type CommercialModel,
  type MediaType,
} from '@/lib/services/pricing.service';
import {
  fetchPackages,
  type PackageRecord,
  OFFICIAL_PACKAGES,
} from '@/lib/services/packages.service';
import { formatCurrency } from '@/lib/services/supabase-helpers';

export default function BookExperience() {
  const router = useRouter();
  const { user } = useAuth();

  // Data Loading
  const [loading, setLoading] = useState(true);
  const [eventTypes, setEventTypes] = useState<EventTypeRecord[]>(CANONICAL_EVENT_TYPES);
  const [packages, setPackages] = useState<PackageRecord[]>(OFFICIAL_PACKAGES);
  const [addonsCatalog, setAddonsCatalog] = useState<PricingAddonRecord[]>(CANONICAL_ADDONS);
  const [config, setConfig] = useState<GlobalPricingEngineConfig>(DEFAULT_GLOBAL_CONFIG);

  // Flow State
  const [step, setStep] = useState(1);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string>('birthday');

  // Mini Event / Hourly Configurator State
  const [hourlyHours, setHourlyHours] = useState<number>(2);
  const [mediaType, setMediaType] = useState<MediaType>('both');
  const [selectedAddonSlugs, setSelectedAddonSlugs] = useState<string[]>(['same-day-preview']);

  // Package Configurator State
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg-essential');
  const [packageAddonSlugs, setPackageAddonSlugs] = useState<string[]>([]);

  // Corporate Quote Brief State
  const [corporateForm, setCorporateForm] = useState({
    organisation: '',
    contactName: '',
    email: '',
    phone: '',
    eventName: '',
    eventDate: '',
    location: '',
    expectedAttendance: '150',
    crewNeeds: '2 Photographers, 1 Videographer, Drone Aerial Operator',
    deliverables: 'Same-day 15-photo PR teaser, 4K highlight video recap, full digital gallery',
    estimatedBudget: 'R15,000 - R25,000',
    notes: '',
  });

  // Client Details Form State
  const [clientForm, setClientForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    idNumber: '',
    eventDate: '',
    eventTime: '13:00',
    venueName: '',
    venueAddress: '',
    guestCount: '60',
    notes: '',
  });

  // Payment Selection State
  const [paymentChoice, setPaymentChoice] = useState<'eft' | 'cash' | 'finance'>('eft');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<{
    id: string;
    reference: string;
    trackingNumber: string;
    totalAmount: number;
    depositAmount: number;
    balanceDue: number;
    paymentMethod: string;
    isCorporateQuote?: boolean;
  } | null>(null);

  // Fetch engine configuration on mount
  useEffect(() => {
    Promise.all([
      fetchEventTypes(),
      fetchPackages(true),
      fetchPricingAddons(),
      fetchGlobalPricingConfig(),
    ])
      .then(([evts, pkgs, addons, cfg]) => {
        setEventTypes(evts.length ? evts : CANONICAL_EVENT_TYPES);
        setPackages(pkgs.length ? pkgs : OFFICIAL_PACKAGES);
        setAddonsCatalog(addons.length ? addons : CANONICAL_ADDONS);
        setConfig(cfg);
        if (pkgs.length > 0) {
          setSelectedPackageId(pkgs[0].id);
        }
      })
      .catch(() => {
        toast.error('Using offline rates. You can still plan your event.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      setClientForm((prev) => ({
        ...prev,
        email: prev.email || user.email || '',
        fullName: prev.fullName || (user.user_metadata?.full_name as string) || '',
      }));
    }
  }, [user]);

  // Current active event record
  const currentEvent = useMemo(() => {
    return (
      eventTypes.find((e) => e.slug === selectedEventSlug) ||
      eventTypes[0] ||
      CANONICAL_EVENT_TYPES[0]
    );
  }, [eventTypes, selectedEventSlug]);

  const commercialModel = currentEvent.commercialModel;

  // Selected package record for production packages
  const currentPackage = useMemo(() => {
    return (
      packages.find((p) => p.id === selectedPackageId || p.slug === selectedPackageId) ||
      packages[0] ||
      OFFICIAL_PACKAGES[0]
    );
  }, [packages, selectedPackageId]);

  // Hourly Pricing Engine Calculation
  const hourlyCalculation = useMemo(() => {
    return calculateMiniEventPrice(
      {
        eventTypeSlug: currentEvent.slug,
        hours: hourlyHours,
        mediaType,
        selectedAddonSlugs,
      },
      eventTypes,
      addonsCatalog,
      config.financeThreshold
    );
  }, [currentEvent, hourlyHours, mediaType, selectedAddonSlugs, eventTypes, addonsCatalog, config.financeThreshold]);

  // Package Pricing Engine Calculation
  const packageCalculation = useMemo(() => {
    return calculatePackagePrice(currentPackage, packageAddonSlugs, addonsCatalog);
  }, [currentPackage, packageAddonSlugs, addonsCatalog]);

  // Active Quote Values
  const activeQuote = useMemo(() => {
    if (commercialModel === 'hourly') {
      return {
        model: 'hourly' as const,
        totalAmount: hourlyCalculation.totalAmount,
        depositAmount: hourlyCalculation.depositAmount,
        balanceDue: hourlyCalculation.balanceDue,
        isFinancingEligible: hourlyCalculation.isFinancingEligible,
        estimatedMonthly: hourlyCalculation.estimatedMonthly,
        summary: `${hourlyCalculation.hours} Hours · ${hourlyCalculation.deliverablesSummary}`,
      };
    }
    if (commercialModel === 'package') {
      return {
        model: 'package' as const,
        totalAmount: packageCalculation.totalAmount,
        depositAmount: packageCalculation.depositAmount,
        balanceDue: packageCalculation.balanceDue,
        isFinancingEligible: true,
        estimatedMonthly: packageCalculation.estimatedMonthly,
        summary: `${currentPackage.name} (${currentPackage.tier} Tier)`,
      };
    }
    return {
      model: 'quotation' as const,
      totalAmount: 0,
      depositAmount: 0,
      balanceDue: 0,
      isFinancingEligible: false,
      estimatedMonthly: 0,
      summary: 'Bespoke Corporate Quotation',
    };
  }, [commercialModel, hourlyCalculation, packageCalculation, currentPackage]);

  // Step Validation
  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(selectedEventSlug);
    if (step === 2) {
      if (commercialModel === 'quotation') {
        return Boolean(
          corporateForm.organisation &&
          corporateForm.contactName &&
          corporateForm.email &&
          corporateForm.phone &&
          corporateForm.location
        );
      }
      if (commercialModel === 'hourly') return hourlyHours >= currentEvent.minHours;
      if (commercialModel === 'package') return Boolean(selectedPackageId);
    }
    if (step === 3) {
      return Boolean(
        clientForm.fullName &&
        clientForm.email &&
        clientForm.phone &&
        clientForm.eventDate &&
        clientForm.venueName &&
        clientForm.venueAddress
      );
    }
    return true;
  }, [step, selectedEventSlug, commercialModel, corporateForm, hourlyHours, currentEvent, selectedPackageId, clientForm]);

  // Handle Corporate Brief Submission
  const handleCorporateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await submitCorporateEnquiry({
        organisation: corporateForm.organisation,
        contactName: corporateForm.contactName,
        email: corporateForm.email,
        phone: corporateForm.phone,
        eventName: corporateForm.eventName || `${corporateForm.organisation} Event`,
        eventDate: corporateForm.eventDate || '',
        location: corporateForm.location,
        coverageNeeds: `${corporateForm.expectedAttendance} attendees. ${corporateForm.notes || ''}`,
        crewNeeds: corporateForm.crewNeeds,
        deliverables: corporateForm.deliverables,
      });

      setSubmittedBooking({
        id: result.id,
        reference: `CORP-${result.id.slice(0, 8).toUpperCase()}`,
        trackingNumber: `TRK-${result.id.slice(0, 8).toUpperCase()}`,
        totalAmount: 0,
        depositAmount: 0,
        balanceDue: 0,
        paymentMethod: 'invoice',
        isCorporateQuote: true,
      });
      toast.success('Corporate brief received! Our enterprise director will respond within 4 hours.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit brief. Please contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Event Booking Submission
  const handleBookingSubmit = async () => {
    if (!user) {
      // Store draft in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'vsm_draft_booking',
          JSON.stringify({
            selectedEventSlug,
            commercialModel,
            hourlyHours,
            mediaType,
            selectedAddonSlugs,
            selectedPackageId,
            packageAddonSlugs,
            clientForm,
            paymentChoice,
          })
        );
      }
      router.push('/auth/login?redirect=/book');
      return;
    }

    setSubmitting(true);
    try {
      const chosenAddons =
        commercialModel === 'hourly'
          ? addonsCatalog
              .filter((a) => selectedAddonSlugs.includes(a.slug))
              .map((a) => ({ id: a.id, name: a.name, price: a.price }))
          : addonsCatalog
              .filter((a) => packageAddonSlugs.includes(a.slug))
              .map((a) => ({ id: a.id, name: a.name, price: a.price }));

      const packageName =
        commercialModel === 'hourly'
          ? `${hourlyHours}h ${currentEvent.name} Coverage`
          : currentPackage.name;

      const basePrice =
        commercialModel === 'hourly'
          ? hourlyCalculation.baseCoverageAmount
          : currentPackage.price;

      const result = await createBooking({
        fullName: clientForm.fullName,
        email: clientForm.email,
        phone: clientForm.phone,
        idNumber: clientForm.idNumber || 'Not provided',
        eventType: currentEvent.name as never,
        commercialModel: commercialModel as 'hourly' | 'package',
        hours: commercialModel === 'hourly' ? hourlyHours : currentPackage.durationHours,
        mediaType: commercialModel === 'hourly' ? mediaType : 'both',
        eventDate: clientForm.eventDate,
        eventTime: clientForm.eventTime,
        venueName: clientForm.venueName,
        venueAddress: clientForm.venueAddress,
        guestCount: Number(clientForm.guestCount) || 1,
        packageId: commercialModel === 'package' ? currentPackage.id : `hourly-${hourlyHours}h`,
        packageName,
        packagePrice: basePrice,
        depositAmount: activeQuote.depositAmount,
        balanceDue: activeQuote.balanceDue,
        paymentMethod: paymentChoice === 'finance' ? 'financed' : paymentChoice,
        addons: chosenAddons,
        notes: `${clientForm.notes ? clientForm.notes + '\n' : ''}Commercial lane: ${commercialModel.toUpperCase()}. Preferred payment: ${paymentChoice.toUpperCase()}.`,
        financed: paymentChoice === 'finance',
        paymentPreference: paymentChoice === 'finance' ? 'finance' : 'direct',
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'vsm-track-session',
          JSON.stringify({
            email: clientForm.email,
            reference: result.referenceNumber,
            bookingId: result.id,
          })
        );
      }

      setSubmittedBooking({
        id: result.id,
        reference: result.referenceNumber,
        trackingNumber: result.trackingNumber,
        totalAmount: activeQuote.totalAmount,
        depositAmount: activeQuote.depositAmount,
        balanceDue: activeQuote.balanceDue,
        paymentMethod: paymentChoice,
      });

      toast.success('Your event has been recorded! Date reserve is pending deposit confirmation.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit booking. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PublicShell compact>
        <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
          <p className="text-sm font-semibold text-foreground-muted">
            Initialising Booking Engine...
          </p>
        </div>
      </PublicShell>
    );
  }

  // Confirmation Success View
  if (submittedBooking) {
    return (
      <PublicShell compact>
        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-card text-center sm:p-12 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                {submittedBooking.isCorporateQuote ? 'Enterprise Brief Received' : 'Booking Request Submitted'}
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {submittedBooking.isCorporateQuote
                  ? 'We have received your event brief'
                  : 'Your date is tentatively reserved'}
              </h1>
              <p className="mt-2 max-w-md mx-auto text-sm text-foreground-muted">
                {submittedBooking.isCorporateQuote
                  ? 'A dedicated VSM Executive Producer has been assigned and will prepare your quotation within 4 hours.'
                  : 'Your booking has been registered. Complete your deposit payment to lock in your creative crew.'}
              </p>
            </div>

            {/* Reference Strip */}
            <div className="rounded-2xl border border-border bg-background/60 p-5 grid grid-cols-2 gap-4 text-left sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">Reference</p>
                <p className="mt-1 text-sm font-bold text-foreground font-mono">{submittedBooking.reference}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">Tracking Code</p>
                <p className="mt-1 text-sm font-bold text-[#D4AF37] font-mono">{submittedBooking.trackingNumber}</p>
              </div>
              {!submittedBooking.isCorporateQuote && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">Deposit Required</p>
                  <p className="mt-1 text-sm font-bold text-emerald-400">{formatCurrency(submittedBooking.depositAmount)}</p>
                </div>
              )}
            </div>

            {/* EFT Proof of Payment Upload */}
            {submittedBooking.paymentMethod === 'eft' && !submittedBooking.isCorporateQuote && (
              <div className="mt-6 text-left border border-border/80 rounded-2xl p-6 bg-surface-elevated/40 space-y-4">
                <div className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-[#D4AF37]" />
                  <h3 className="text-sm font-bold text-foreground">Upload EFT Proof of Payment</h3>
                </div>
                <p className="text-xs text-foreground-muted">
                  Please deposit to: <strong>VSM Digital Services (Pty) Ltd</strong> · FNB Cheque Account: <strong>629 112 443 12</strong> · Branch: <strong>250655</strong> · Ref: <strong>{submittedBooking.reference}</strong>
                </p>
                <ProofOfPaymentUploader bookingId={submittedBooking.id} />
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-4">
              <Link href="/portal" className="btn-gold px-6 py-3 text-sm font-semibold shadow-gold-sm">
                Open Client Portal
              </Link>
              <Link
                href={`/track/${encodeURIComponent(submittedBooking.reference)}`}
                className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-surface-elevated transition-colors"
              >
                Track Status Online
              </Link>
            </div>
          </div>
        </main>
      </PublicShell>
    );
  }

  return (
    <PublicShell compact>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Top Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-md bg-[#D4AF37]/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Visual Moments
              </span>
              <span className="text-xs text-foreground-muted">· Transparent Pricing</span>
            </div>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Book Your Coverage
            </h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Choose your event type. The platform automatically assigns the most affordable, transparent commercial model.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-xs font-semibold text-foreground-muted shadow-sm">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Guaranteed Date Hold & Zero Hidden Fees</span>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="mb-10 grid grid-cols-4 gap-3" aria-label="Booking flow progress">
          {[
            { num: '01', title: 'Event Type', desc: 'Select Category' },
            { num: '02', title: 'Coverage', desc: 'Configure Scope' },
            { num: '03', title: 'Logistics', desc: 'Date & Location' },
            { num: '04', title: 'Reserve', desc: 'Deposit & Payment' },
          ].map((s, idx) => {
            const stepNum = idx + 1;
            const isCurrent = step === stepNum;
            const isCompleted = step > stepNum;
            return (
              <div
                key={s.num}
                className={`border-t-2 pt-3 transition-colors ${
                  isCurrent
                    ? 'border-[#D4AF37] text-foreground'
                    : isCompleted
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-border text-foreground-muted/60'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span>{s.num}</span>
                  <span>{s.title}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-foreground-muted hidden sm:block">{s.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Main Form + Sidebar Grid */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          {/* Main Wizard Area */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            {/* STEP 1: EVENT SELECTION */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    What event are we capturing?
                  </h2>
                  <p className="mt-1 text-xs text-foreground-muted">
                    We do not force R5,500 packages onto birthdays or baby showers. Select your category to unlock custom hourly rates or production tiers.
                  </p>
                </div>

                {/* Everyday / Mini Events */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                      Everyday & Mini Events
                    </span>
                    <span className="text-[11px] text-foreground-muted">· Flexible hourly or deliverables from R400/hr</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {eventTypes
                      .filter((e) => e.commercialModel === 'hourly' && e.isActive)
                      .map((evt) => {
                        const isSelected = selectedEventSlug === evt.slug;
                        return (
                          <button
                            key={evt.id}
                            type="button"
                            onClick={() => setSelectedEventSlug(evt.slug)}
                            className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                              isSelected
                                ? 'border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/15 to-card shadow-gold-sm ring-1 ring-[#D4AF37]'
                                : 'border-border bg-background/50 hover:border-border/80 hover:bg-surface-elevated'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-foreground">{evt.name}</span>
                                <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-semibold text-[#D4AF37]">
                                  From R{evt.baseHourlyRate}/hr
                                </span>
                              </div>
                              <p className="mt-1.5 text-xs text-foreground-muted line-clamp-2">
                                {evt.description}
                              </p>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-[11px] text-foreground-muted font-medium border-t border-border/40 pt-2">
                              <span>Min {evt.minHours}h coverage</span>
                              <span>·</span>
                              <span>{evt.baseDeliverables?.photos || 80} photos included</span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Major Events */}
                <div className="pt-4 border-t border-border/60">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                      Major Events & Milestone Ceremonies
                    </span>
                    <span className="text-[11px] text-foreground-muted">· Premium cinematic packages with fixed deposit</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {eventTypes
                      .filter((e) => e.commercialModel === 'package' && e.isActive)
                      .map((evt) => {
                        const isSelected = selectedEventSlug === evt.slug;
                        return (
                          <button
                            key={evt.id}
                            type="button"
                            onClick={() => setSelectedEventSlug(evt.slug)}
                            className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                              isSelected
                                ? 'border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/15 to-card shadow-gold-sm ring-1 ring-[#D4AF37]'
                                : 'border-border bg-background/50 hover:border-border/80 hover:bg-surface-elevated'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-foreground">{evt.name}</span>
                                <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                  Fixed Deposit Reserve
                                </span>
                              </div>
                              <p className="mt-1.5 text-xs text-foreground-muted line-clamp-2">
                                {evt.description}
                              </p>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-[11px] text-foreground-muted font-medium border-t border-border/40 pt-2">
                              <span>Essential · Cinematic · Legacy</span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Enterprise / Corporate */}
                <div className="pt-4 border-t border-border/60">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                      VSM for Business & Corporate
                    </span>
                    <span className="text-[11px] text-foreground-muted">· Enterprise brief & tailored multi-camera quotation</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {eventTypes
                      .filter((e) => e.commercialModel === 'quotation' && e.isActive)
                      .slice(0, 6)
                      .map((evt) => {
                        const isSelected = selectedEventSlug === evt.slug;
                        return (
                          <button
                            key={evt.id}
                            type="button"
                            onClick={() => setSelectedEventSlug(evt.slug)}
                            className={`rounded-2xl border p-3.5 text-left transition-all ${
                              isSelected
                                ? 'border-[#D4AF37] bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]'
                                : 'border-border bg-background/50 hover:border-border/80 hover:bg-surface-elevated'
                            }`}
                          >
                            <span className="block font-bold text-xs text-foreground">{evt.name}</span>
                            <span className="mt-1 block text-[10px] text-foreground-muted uppercase tracking-wider">
                              Custom Quote
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: LANE-SPECIFIC CONFIGURATOR */}
            {step === 2 && (
              <div className="space-y-6">
                {/* LANE A: MINI-EVENTS HOURLY BUILDER */}
                {commercialModel === 'hourly' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#D4AF37]/15 px-2 py-0.5 text-xs font-bold uppercase text-[#D4AF37]">
                          Everyday Mini-Event Builder
                        </span>
                        <span className="text-xs text-foreground-muted">{currentEvent.name}</span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground">
                        Customise Duration & Deliverables
                      </h2>
                      <p className="mt-1 text-xs text-foreground-muted">
                        Pay only for the exact hours and creative output you need.
                      </p>
                    </div>

                    {/* Hours Duration Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                          1. Coverage Duration
                        </label>
                        <span className="text-sm font-bold text-[#D4AF37]">
                          {hourlyHours} Hours Selected
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6">
                        {[1, 2, 3, 4, 5, 6].map((h) => {
                          const isSelected = hourlyHours === h;
                          return (
                            <button
                              key={h}
                              type="button"
                              onClick={() => setHourlyHours(h)}
                              className={`rounded-xl border py-3 text-center transition-all ${
                                isSelected
                                  ? 'border-[#D4AF37] bg-[#D4AF37] text-[#070B12] font-bold shadow-gold-sm'
                                  : 'border-border bg-background/60 text-foreground font-semibold hover:border-border/80'
                              }`}
                            >
                              <span className="block text-sm">{h}h</span>
                              <span className="text-[10px] opacity-75">
                                {h === 1 ? 'Quick shoot' : h === 2 ? 'Standard' : 'Extended'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Media Type Selection */}
                    <div className="space-y-3 pt-3 border-t border-border/60">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                        2. Creative Media Format
                      </label>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {[
                          {
                            type: 'photo' as MediaType,
                            icon: Camera,
                            title: 'Photography Only',
                            desc: 'Color-graded high-resolution portraits & candid action.',
                          },
                          {
                            type: 'video' as MediaType,
                            icon: Video,
                            title: 'Cinematic Video Only',
                            desc: '4K film highlight reel with licensed music & vertical cuts.',
                          },
                          {
                            type: 'both' as MediaType,
                            icon: Sparkles,
                            title: 'Photo + Video (Best)',
                            desc: 'Full coverage crew capturing both timeless stills & reels.',
                          },
                        ].map((m) => {
                          const isSelected = mediaType === m.type;
                          const Icon = m.icon;
                          return (
                            <button
                              key={m.type}
                              type="button"
                              onClick={() => setMediaType(m.type)}
                              className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                                isSelected
                                  ? 'border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/15 to-card ring-1 ring-[#D4AF37]'
                                  : 'border-border bg-background/50 hover:bg-surface-elevated'
                              }`}
                            >
                              <div>
                                <Icon className="h-5 w-5 text-[#D4AF37]" />
                                <span className="mt-2 block font-bold text-sm text-foreground">
                                  {m.title}
                                </span>
                                <p className="mt-1 text-xs text-foreground-muted">{m.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Deliverables Summary Card */}
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-foreground">Included Deliverables</p>
                          <p className="text-xs text-foreground-muted">
                            {hourlyCalculation.deliverablesSummary} · Private Memory Vault online link
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Included Free
                      </span>
                    </div>

                    {/* Add-ons for Hourly */}
                    <div className="space-y-3 pt-3 border-t border-border/60">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                        3. Optional Add-ons & Fast Delivery
                      </label>

                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {addonsCatalog
                          .filter((a) => a.applicableModels.includes('hourly') && a.isActive)
                          .map((a) => {
                            const isSelected = selectedAddonSlugs.includes(a.slug);
                            return (
                              <button
                                key={a.slug}
                                type="button"
                                onClick={() => {
                                  setSelectedAddonSlugs((prev) =>
                                    isSelected
                                      ? prev.filter((s) => s !== a.slug)
                                      : [...prev, a.slug]
                                  );
                                }}
                                className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                                  isSelected
                                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                                    : 'border-border bg-background/50 hover:bg-surface-elevated'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                                      isSelected
                                        ? 'border-[#D4AF37] bg-[#D4AF37] text-[#070B12]'
                                        : 'border-border'
                                    }`}
                                  >
                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                  </div>
                                  <div>
                                    <span className="text-xs font-semibold text-foreground block">
                                      {a.name}
                                    </span>
                                    <span className="text-[10px] text-foreground-muted block line-clamp-1">
                                      {a.description}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-foreground flex-shrink-0">
                                  +{formatCurrency(a.price)}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {/* LANE B: MAJOR PRODUCTION PACKAGES */}
                {commercialModel === 'package' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#D4AF37]/15 px-2 py-0.5 text-xs font-bold uppercase text-[#D4AF37]">
                          Major Production Lane
                        </span>
                        <span className="text-xs text-foreground-muted">{currentEvent.name}</span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground">
                        Select Production Package
                      </h2>
                      <p className="mt-1 text-xs text-foreground-muted">
                        Each production package includes a complete creative crew and is reserved with a fixed deposit.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {packages.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`cursor-pointer rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                              isSelected
                                ? 'border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/15 to-card ring-2 ring-[#D4AF37] shadow-gold-sm'
                                : 'border-border bg-background/50 hover:bg-surface-elevated'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-[10px] font-bold uppercase text-foreground-muted">
                                  {pkg.tier}
                                </span>
                                {pkg.isHighlighted && (
                                  <span className="rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-[10px] font-bold text-[#D4AF37]">
                                    Most Popular
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-3 font-bold text-base text-foreground">{pkg.name}</h3>
                              <p className="mt-1 text-xs text-foreground-muted line-clamp-2">
                                {pkg.description}
                              </p>

                              <div className="mt-4 border-t border-border/60 pt-3">
                                <span className="text-xl font-bold text-foreground">
                                  {formatCurrency(pkg.price)}
                                </span>
                                <div className="mt-1 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                                  <span>Fixed Deposit:</span>
                                  <span>{formatCurrency(pkg.depositAmount)}</span>
                                </div>
                              </div>

                              <ul className="mt-4 space-y-1.5 text-xs text-foreground">
                                {pkg.features.slice(0, 5).map((f, i) => (
                                  <li key={i} className="flex items-start gap-1.5 text-[11px]">
                                    <Check className="h-3.5 w-3.5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                                    <span>{f}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <button
                              type="button"
                              className={`mt-6 w-full rounded-xl py-2 text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-[#D4AF37] text-[#070B12]'
                                  : 'border border-border bg-card text-foreground'
                              }`}
                            >
                              {isSelected ? 'Selected' : 'Select Package'}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add-ons for Package */}
                    <div className="space-y-3 pt-3 border-t border-border/60">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                        Optional Upgrades & Add-ons
                      </label>

                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {addonsCatalog
                          .filter((a) => a.applicableModels.includes('package') && a.isActive)
                          .map((a) => {
                            const isSelected = packageAddonSlugs.includes(a.slug);
                            return (
                              <button
                                key={a.slug}
                                type="button"
                                onClick={() => {
                                  setPackageAddonSlugs((prev) =>
                                    isSelected
                                      ? prev.filter((s) => s !== a.slug)
                                      : [...prev, a.slug]
                                  );
                                }}
                                className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                                  isSelected
                                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                                    : 'border-border bg-background/50 hover:bg-surface-elevated'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                                      isSelected
                                        ? 'border-[#D4AF37] bg-[#D4AF37] text-[#070B12]'
                                        : 'border-border'
                                    }`}
                                  >
                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                  </div>
                                  <div>
                                    <span className="text-xs font-semibold text-foreground block">
                                      {a.name}
                                    </span>
                                    <span className="text-[10px] text-foreground-muted block line-clamp-1">
                                      {a.description}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-foreground flex-shrink-0">
                                  +{formatCurrency(a.price)}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {/* LANE C: CORPORATE QUOTATION BRIEF */}
                {commercialModel === 'quotation' && (
                  <form onSubmit={handleCorporateSubmit} className="space-y-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#D4AF37]/15 px-2 py-0.5 text-xs font-bold uppercase text-[#D4AF37]">
                          Enterprise Quotation Brief
                        </span>
                        <span className="text-xs text-foreground-muted">{currentEvent.name}</span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground">
                        Tell us about your organization and event
                      </h2>
                      <p className="mt-1 text-xs text-foreground-muted">
                        We build bespoke production teams for AWS summits, Microsoft workshops, university showcases, and hackathons.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-foreground-muted block">Organisation / Brand Name *</label>
                        <input
                          type="text"
                          required
                          value={corporateForm.organisation}
                          onChange={(e) => setCorporateForm({ ...corporateForm, organisation: e.target.value })}
                          placeholder="e.g. Tshwane University of Technology"
                          className="input-luxury mt-1.5 w-full py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground-muted block">Event Name *</label>
                        <input
                          type="text"
                          required
                          value={corporateForm.eventName}
                          onChange={(e) => setCorporateForm({ ...corporateForm, eventName: e.target.value })}
                          placeholder="e.g. Annual Tech Summit & Awards"
                          className="input-luxury mt-1.5 w-full py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground-muted block">Contact Person *</label>
                        <input
                          type="text"
                          required
                          value={corporateForm.contactName}
                          onChange={(e) => setCorporateForm({ ...corporateForm, contactName: e.target.value })}
                          placeholder="e.g. Thabang Dikotope"
                          className="input-luxury mt-1.5 w-full py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground-muted block">Official Email Address *</label>
                        <input
                          type="email"
                          required
                          value={corporateForm.email}
                          onChange={(e) => setCorporateForm({ ...corporateForm, email: e.target.value })}
                          placeholder="e.g. events@tut.ac.za"
                          className="input-luxury mt-1.5 w-full py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground-muted block">Contact Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={corporateForm.phone}
                          onChange={(e) => setCorporateForm({ ...corporateForm, phone: e.target.value })}
                          placeholder="e.g. 012 382 5000"
                          className="input-luxury mt-1.5 w-full py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground-muted block">Venue / City Location *</label>
                        <input
                          type="text"
                          required
                          value={corporateForm.location}
                          onChange={(e) => setCorporateForm({ ...corporateForm, location: e.target.value })}
                          placeholder="e.g. Sandton Convention Centre"
                          className="input-luxury mt-1.5 w-full py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-foreground-muted block">Event Date</label>
                        <input
                          type="date"
                          value={corporateForm.eventDate}
                          onChange={(e) => setCorporateForm({ ...corporateForm, eventDate: e.target.value })}
                          className="input-luxury mt-1.5 w-full py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground-muted block">Expected Attendance</label>
                        <input
                          type="text"
                          value={corporateForm.expectedAttendance}
                          onChange={(e) => setCorporateForm({ ...corporateForm, expectedAttendance: e.target.value })}
                          placeholder="e.g. 250 delegates"
                          className="input-luxury mt-1.5 w-full py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground-muted block">Crew & Production Scope</label>
                      <input
                        type="text"
                        value={corporateForm.crewNeeds}
                        onChange={(e) => setCorporateForm({ ...corporateForm, crewNeeds: e.target.value })}
                        placeholder="e.g. 2 photographers, 1 videographer, drone aerial operator"
                        className="input-luxury mt-1.5 w-full py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground-muted block">Key Deliverables Required</label>
                      <textarea
                        rows={2}
                        value={corporateForm.deliverables}
                        onChange={(e) => setCorporateForm({ ...corporateForm, deliverables: e.target.value })}
                        placeholder="e.g. Same-day social media reel, 4K stage keynote recording, high-res PR photo album"
                        className="input-luxury mt-1.5 w-full py-2 text-sm"
                      />
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="btn-silver px-4 py-2.5 text-xs font-semibold"
                      >
                        <ArrowLeft size={14} className="mr-1.5 inline" /> Back
                      </button>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-gold px-6 py-2.5 text-sm font-semibold shadow-gold-sm disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin mr-2 inline" />
                            Transmitting Brief...
                          </>
                        ) : (
                          <>
                            Submit Corporate Brief <ArrowRight size={16} className="ml-2 inline" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* STEP 3: LOGISTICS & CLIENT DETAILS */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Event Logistics & Details
                  </h2>
                  <p className="mt-1 text-xs text-foreground-muted">
                    We use these coordinates to assign and dispatch our on-site creative team.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground-muted block">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={clientForm.fullName}
                      onChange={(e) => setClientForm({ ...clientForm, fullName: e.target.value })}
                      placeholder="e.g. Thabang Dikotope"
                      className="input-luxury mt-1.5 w-full py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground-muted block">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      placeholder="e.g. you@example.com"
                      className="input-luxury mt-1.5 w-full py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground-muted block">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      placeholder="e.g. 082 123 4567"
                      className="input-luxury mt-1.5 w-full py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground-muted block">ID Number (Optional)</label>
                    <input
                      type="text"
                      value={clientForm.idNumber}
                      onChange={(e) => setClientForm({ ...clientForm, idNumber: e.target.value })}
                      placeholder="Required only if applying for financing"
                      className="input-luxury mt-1.5 w-full py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground-muted block">Event Date *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().slice(0, 10)}
                      value={clientForm.eventDate}
                      onChange={(e) => setClientForm({ ...clientForm, eventDate: e.target.value })}
                      className="input-luxury mt-1.5 w-full py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground-muted block">Coverage Start Time *</label>
                    <input
                      type="time"
                      required
                      value={clientForm.eventTime}
                      onChange={(e) => setClientForm({ ...clientForm, eventTime: e.target.value })}
                      className="input-luxury mt-1.5 w-full py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground-muted block">Venue / Location Name *</label>
                    <input
                      type="text"
                      required
                      value={clientForm.venueName}
                      onChange={(e) => setClientForm({ ...clientForm, venueName: e.target.value })}
                      placeholder="e.g. Pretoria Botanical Gardens"
                      className="input-luxury mt-1.5 w-full py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground-muted block">Estimated Guest Count</label>
                    <input
                      type="number"
                      min="1"
                      value={clientForm.guestCount}
                      onChange={(e) => setClientForm({ ...clientForm, guestCount: e.target.value })}
                      placeholder="50"
                      className="input-luxury mt-1.5 w-full py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground-muted block">Venue Physical Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={clientForm.venueAddress}
                    onChange={(e) => setClientForm({ ...clientForm, venueAddress: e.target.value })}
                    placeholder="Street address, suburb, city, and province"
                    className="input-luxury mt-1.5 w-full py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground-muted block">Creative Notes or Special Requests</label>
                  <textarea
                    rows={2}
                    value={clientForm.notes}
                    onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                    placeholder="Key moments to capture, aesthetic preferences, schedule timings..."
                    className="input-luxury mt-1.5 w-full py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: PAYMENT PATH & FINANCING */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Reserve Your Date
                  </h2>
                  <p className="mt-1 text-xs text-foreground-muted">
                    Your date is locked into our operational dispatch queue as soon as your deposit is verified.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* EFT Option */}
                  <label
                    onClick={() => setPaymentChoice('eft')}
                    className={`flex cursor-pointer items-start justify-between rounded-2xl border p-5 transition-all ${
                      paymentChoice === 'eft'
                        ? 'border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/15 to-card ring-1 ring-[#D4AF37]'
                        : 'border-border bg-background/50 hover:bg-surface-elevated'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full p-1 bg-[#D4AF37]/20 text-[#D4AF37]">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-foreground block">
                          Bank EFT Transfer (Standard)
                        </span>
                        <p className="mt-1 text-xs text-foreground-muted">
                          Pay your deposit via online banking EFT. Upload proof of payment on confirmation for instant verification.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      Reserve: {formatCurrency(activeQuote.depositAmount)}
                    </span>
                  </label>

                  {/* Cash on Arrival Option */}
                  <label
                    onClick={() => setPaymentChoice('cash')}
                    className={`flex cursor-pointer items-start justify-between rounded-2xl border p-5 transition-all ${
                      paymentChoice === 'cash'
                        ? 'border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/15 to-card ring-1 ring-[#D4AF37]'
                        : 'border-border bg-background/50 hover:bg-surface-elevated'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full p-1 bg-[#D4AF37]/20 text-[#D4AF37]">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-foreground block">
                          Cash Settlement with Deposit Hold
                        </span>
                        <p className="mt-1 text-xs text-foreground-muted">
                          Pay the reserve deposit today, and settle the remaining balance in cash with the team lead on shoot day.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Smart Financing Lane (ONLY if total >= threshold) */}
                  {activeQuote.isFinancingEligible ? (
                    <label
                      onClick={() => setPaymentChoice('finance')}
                      className={`flex cursor-pointer items-start justify-between rounded-2xl border p-5 transition-all ${
                        paymentChoice === 'finance'
                          ? 'border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/20 to-card ring-2 ring-[#D4AF37] shadow-gold-sm'
                          : 'border-[#D4AF37]/50 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full p-1 bg-[#D4AF37] text-[#070B12]">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">
                              Smart Photography Financing
                            </span>
                            <span className="rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-[10px] font-bold text-[#D4AF37]">
                              From {formatCurrency(activeQuote.estimatedMonthly)}/mo
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-foreground-muted">
                            Reserve with your fixed deposit today, and spread the balance over 3, 6, or 12 manageable instalments.
                          </p>
                        </div>
                      </div>
                    </label>
                  ) : (
                    <div className="rounded-xl border border-border bg-background/50 p-3.5 text-xs text-foreground-muted flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[#D4AF37] flex-shrink-0" />
                      <span>
                        Affordable mini-event coverage under {formatCurrency(config.financeThreshold)} — straightforward direct booking with zero debt.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            {commercialModel !== 'quotation' && (
              <div className="mt-8 flex items-center justify-between border-t border-border/80 pt-5">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="btn-silver px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    disabled={!canContinue}
                    onClick={() => setStep((s) => s + 1)}
                    className="btn-gold px-6 py-2.5 text-sm font-semibold shadow-gold-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleBookingSubmit}
                    className="btn-gold px-8 py-3 text-sm font-bold shadow-gold-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Confirming Reserve...
                      </>
                    ) : (
                      <>
                        Confirm & Reserve Date <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Persistent Order Summary Sidebar */}
          <aside className="rounded-3xl border border-border bg-card p-6 shadow-card lg:sticky lg:top-24 space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                Live Estimate Summary
              </p>
              <h2 className="mt-1 text-lg font-bold text-foreground">
                {currentEvent.name}
              </h2>
              <span className="inline-block mt-0.5 rounded bg-surface-elevated px-2 py-0.5 text-[10px] font-semibold text-foreground-muted uppercase">
                {commercialModel === 'hourly'
                  ? 'Hourly / Deliverables Lane'
                  : commercialModel === 'package'
                  ? 'Production Package Lane'
                  : 'Enterprise Quotation'}
              </span>
            </div>

            {commercialModel === 'quotation' ? (
              <div className="space-y-3 text-xs text-foreground-muted border-t border-border/60 pt-4">
                <p>
                  Enterprise summits, hackathons, and conferences receive bespoke multi-camera proposals tailored to your marketing and PR needs.
                </p>
                <div className="rounded-xl border border-border bg-background/50 p-3 space-y-1">
                  <p className="font-semibold text-foreground">Includes:</p>
                  <p>· Multi-camera photo & cinematic video</p>
                  <p>· Same-day PR deliverables for social media</p>
                  <p>· Dedicated executive production manager</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 border-t border-border/60 pt-4 text-xs">
                {/* Line Items */}
                <div className="space-y-2">
                  <div className="flex justify-between text-foreground">
                    <span>
                      {commercialModel === 'hourly'
                        ? `Coverage (${hourlyHours}h @ R${currentEvent.baseHourlyRate}/hr)`
                        : currentPackage.name}
                    </span>
                    <span className="font-bold">
                      {formatCurrency(
                        commercialModel === 'hourly'
                          ? hourlyCalculation.baseCoverageAmount
                          : currentPackage.price
                      )}
                    </span>
                  </div>

                  {commercialModel === 'hourly' && (
                    <div className="flex justify-between text-foreground-muted text-[11px]">
                      <span>Deliverables included:</span>
                      <span className="font-medium text-foreground">{hourlyCalculation.deliverablesSummary}</span>
                    </div>
                  )}

                  {/* Add-on rows */}
                  {commercialModel === 'hourly' &&
                    hourlyCalculation.addons.map((a) => (
                      <div key={a.slug} className="flex justify-between text-foreground-muted">
                        <span>+ {a.name}</span>
                        <span className="font-semibold text-foreground">+{formatCurrency(a.price)}</span>
                      </div>
                    ))}

                  {commercialModel === 'package' &&
                    packageCalculation.addons.map((a) => (
                      <div key={a.slug} className="flex justify-between text-foreground-muted">
                        <span>+ {a.name}</span>
                        <span className="font-semibold text-foreground">+{formatCurrency(a.price)}</span>
                      </div>
                    ))}
                </div>

                {/* Total and Deposit Breakdown */}
                <div className="border-t border-border/80 pt-3 space-y-2">
                  <div className="flex justify-between text-sm font-bold text-foreground">
                    <span>Total Estimate</span>
                    <span className="text-base text-[#D4AF37] font-extrabold">
                      {formatCurrency(activeQuote.totalAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs font-bold text-emerald-400">
                    <span>Deposit Due Today:</span>
                    <span>{formatCurrency(activeQuote.depositAmount)}</span>
                  </div>

                  <div className="flex justify-between text-[11px] text-foreground-muted px-1">
                    <span>Balance at Delivery:</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(activeQuote.balanceDue)}
                    </span>
                  </div>
                </div>

                {/* Smart Financing Teaser */}
                {activeQuote.isFinancingEligible && (
                  <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-3 text-[11px] space-y-1">
                    <p className="font-bold text-[#D4AF37] flex items-center gap-1">
                      <Sparkles size={13} />
                      Smart Financing Option
                    </p>
                    <p className="text-foreground-muted">
                      Pay <strong>{formatCurrency(activeQuote.depositAmount)}</strong> deposit now, remainder from{' '}
                      <strong className="text-foreground">{formatCurrency(activeQuote.estimatedMonthly)}/mo</strong>.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-border/60 pt-3 text-[11px] text-foreground-muted space-y-1">
              <p className="flex items-center gap-1.5">
                <Check size={12} className="text-emerald-400" /> Free rescheduling up to 72h before event
              </p>
              <p className="flex items-center gap-1.5">
                <Check size={12} className="text-emerald-400" /> Digital Memory Vault cloud delivery
              </p>
            </div>
          </aside>
        </div>
      </main>
    </PublicShell>
  );
}

// Proof of payment upload component for confirmation screen
function ProofOfPaymentUploader({ bookingId }: { bookingId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadPaymentProof(bookingId, file);
      setUploaded(true);
      toast.success('Proof of payment received! Our verification team is reviewing it.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed. You can also upload later on /track.');
    } finally {
      setUploading(false);
    }
  };

  if (uploaded) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-semibold flex items-center gap-2">
        <CheckCircle2 size={16} />
        <span>Proof of payment attached successfully. Status: Verification in progress.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="input-luxury text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:bg-[#D4AF37] file:text-[#070B12] file:font-semibold"
      />
      <button
        type="button"
        disabled={!file || uploading}
        onClick={handleUpload}
        className="btn-gold px-4 py-2 text-xs font-semibold disabled:opacity-50 whitespace-nowrap"
      >
        {uploading ? 'Uploading...' : 'Submit Slip'}
      </button>
    </div>
  );
}
