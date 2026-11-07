'use client';

import { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Camera,
  Sparkles,
  CreditCard,
  TrendingUp,
  Info,
  Loader2,
} from 'lucide-react';
import { BOOKING_ADDONS, calculateBookingTotal } from '@/lib/bookings/constants';
import {
  fetchActivePackages,
  OFFICIAL_PACKAGES,
  type PackageRecord,
} from '@/lib/services/packages.service';
import {
  calculateAmortization,
  DEFAULT_LENDING_CONFIG,
  formatZAR,
} from '@/lib/services/eligibility.engine';
import type { BookingAddon, BookingFormData } from '@/lib/bookings/types';

interface Props {
  data: BookingFormData;
  updateData: (u: Partial<BookingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepPackageInfo({ data, updateData, onNext, onBack }: Props) {
  const [packages, setPackages] = useState<PackageRecord[]>(OFFICIAL_PACKAGES);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState(data.packageId || OFFICIAL_PACKAGES[1].id);
  const [selectedAddons, setSelectedAddons] = useState<BookingAddon[]>(data.addons || []);
  const [notes, setNotes] = useState(data.notes || '');
  const [paymentPreference, setPaymentPreference] = useState<'direct' | 'finance'>(
    data.paymentPreference || 'direct'
  );
  const [financeTerm, setFinanceTerm] = useState<number>(data.financeTerm || 6);

  useEffect(() => {
    let mounted = true;
    fetchActivePackages()
      .then((res: PackageRecord[]) => {
        if (mounted && res && res.length > 0) {
          setPackages(res);
          if (!data.packageId) {
            const defaultPkg = res.find((p: PackageRecord) => p.isHighlighted) || res[0];
            setSelectedPackageId(defaultPkg.id);
          }
        }
      })
      .catch((err: unknown) => {
        console.warn('Could not fetch packages from Supabase, using official defaults:', err);
      })
      .finally(() => {
        if (mounted) setLoadingPackages(false);
      });

    return () => {
      mounted = false;
    };
  }, [data.packageId]);

  const selectedPackage =
    packages.find(
      (p) =>
        p.id === selectedPackageId ||
        p.slug === selectedPackageId ||
        selectedPackageId?.includes(p.slug)
    ) || packages[0];

  const total = selectedPackage
    ? calculateBookingTotal(selectedPackage.price, selectedAddons)
    : 0;

  const amortization = calculateAmortization(
    total,
    financeTerm,
    DEFAULT_LENDING_CONFIG.annualInterestRate
  );

  const toggleAddon = (addon: (typeof BOOKING_ADDONS)[number]) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === addon.id);
      if (exists) return prev.filter((a) => a.id !== addon.id);
      return [...prev, { id: addon.id, name: addon.name, price: addon.price }];
    });
  };

  const handleContinue = () => {
    if (!selectedPackage) return;
    updateData({
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      packagePrice: selectedPackage.price,
      addons: selectedAddons,
      notes,
      paymentPreference,
      financeTerm: paymentPreference === 'finance' ? financeTerm : undefined,
    });
    onNext();
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-7 lg:p-8 shadow-xl">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">
          Two Services · One Platform
        </p>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-1">
          Choose Package & Payment Method
        </h2>
        <p className="text-sm text-foreground-muted">
          Select your photography production tier, customize extras, and decide whether to pay directly or finance over 3–24 months.
        </p>
      </div>

      {/* Package Selection */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase">
            Photography Package <span className="text-danger">*</span>
          </label>
          {loadingPackages && (
            <span className="text-xs text-foreground-muted flex items-center gap-1">
              <Loader2 size={12} className="animate-spin text-primary" /> Loading live packages...
            </span>
          )}
        </div>

        <div className="space-y-3">
          {packages.map((pkg) => {
            const isSelected =
              selectedPackageId === pkg.id ||
              selectedPackageId === pkg.slug ||
              selectedPackageId?.includes(pkg.slug);

            const pkgAmort = calculateAmortization(pkg.price, 6);

            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedPackageId(pkg.id)}
                className={`w-full text-left rounded-xl border p-4 transition-all duration-200 relative overflow-hidden ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg glow-gold'
                    : 'border-border bg-muted/30 hover:border-gold hover:bg-muted/50'
                }`}
              >
                {pkg.isHighlighted && (
                  <div className="absolute top-0 right-0 bg-gold-gradient text-background text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'bg-gold-gradient text-background' : 'bg-muted text-primary'
                      }`}
                    >
                      <Camera size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{pkg.name}</p>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-muted text-foreground-muted border border-border">
                          {pkg.tier}
                        </span>
                      </div>
                      <p className="text-xs text-foreground-muted mt-1 max-w-md line-clamp-2">
                        {pkg.description}
                      </p>
                      <p className="text-[11px] text-primary mt-1 font-medium flex items-center gap-1">
                        <TrendingUp size={12} />
                        Or from {formatZAR(pkgAmort.monthlyInstalment)}/mo with Smart Financing
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold text-foreground counter-value">
                      R {pkg.price.toLocaleString()}
                    </p>
                    {isSelected && (
                      <div className="flex items-center justify-end gap-1 text-xs text-primary font-semibold mt-1">
                        <Check size={14} /> Selected
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Preference: Direct vs Smart Financing */}
      <div className="mb-6 p-5 rounded-xl border border-gold/40 bg-gradient-to-b from-primary/5 to-background">
        <label className="block text-xs font-semibold text-primary tracking-wider uppercase mb-3 flex items-center gap-2">
          <Sparkles size={14} />
          Payment Mode Preference
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentPreference('direct')}
            className={`p-4 rounded-xl border text-left transition-all ${
              paymentPreference === 'direct'
                ? 'border-primary bg-primary/15 ring-1 ring-primary'
                : 'border-border bg-card hover:border-gold/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CreditCard size={15} className="text-primary" />
                Pay Directly
              </span>
              {paymentPreference === 'direct' && <Check size={15} className="text-primary" />}
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Standard booking deposit, upfront quote, and official VAT invoice upon event approval.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPaymentPreference('finance')}
            className={`p-4 rounded-xl border text-left transition-all ${
              paymentPreference === 'finance'
                ? 'border-primary bg-primary/15 ring-1 ring-primary'
                : 'border-border bg-card hover:border-gold/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-gradient-gold flex items-center gap-2">
                <TrendingUp size={15} className="text-primary" />
                Finance This Package
              </span>
              {paymentPreference === 'finance' && <Check size={15} className="text-primary" />}
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Split into 3 to 24 monthly instalments. We link your loan directly to your event booking.
            </p>
          </button>
        </div>

        {/* Smart Financing Interactive Term & Amortization Calculator */}
        {paymentPreference === 'finance' && selectedPackage && (
          <div className="mt-4 pt-4 border-t border-border/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                Select Repayment Term:
              </span>
              <span className="text-xs text-primary font-medium">{financeTerm} Months</span>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {[3, 6, 12, 18, 24].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFinanceTerm(t)}
                  className={`flex-1 min-w-[60px] py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                    financeTerm === t
                      ? 'bg-gold-gradient text-background border-primary shadow-sm'
                      : 'border-border bg-muted/40 text-foreground-muted hover:border-gold hover:text-foreground'
                  }`}
                >
                  {t} mo
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 rounded-xl p-3.5 border border-border">
              <div>
                <span className="text-[10px] text-foreground-muted uppercase block">Estimated Monthly</span>
                <span className="text-sm font-bold text-gradient-gold">
                  {formatZAR(amortization.monthlyInstalment)}/mo
                </span>
              </div>
              <div>
                <span className="text-[10px] text-foreground-muted uppercase block">Term</span>
                <span className="text-sm font-semibold text-foreground">{financeTerm} Months</span>
              </div>
              <div>
                <span className="text-[10px] text-foreground-muted uppercase block">Interest (18% p.a.)</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatZAR(amortization.totalInterest)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-foreground-muted uppercase block">Total Cost</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatZAR(amortization.totalPayable)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-foreground-muted flex items-start gap-1.5 mt-2.5">
              <Info size={13} className="text-primary flex-shrink-0 mt-0.5" />
              <span>
                Underwritten by VSM Smart Financing. Subject to affordability assessment and SA ID verification. You will be guided to complete your financing details after event submission.
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Add-ons */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-3">
          Optional Add-ons
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BOOKING_ADDONS.map((addon) => {
            const selected = selectedAddons.some((a) => a.id === addon.id);
            return (
              <button
                key={addon.id}
                type="button"
                onClick={() => toggleAddon(addon)}
                className={`text-left rounded-lg border px-3 py-2.5 transition-all ${
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-muted/20 hover:border-gold'
                }`}
              >
                <p className="text-xs font-medium text-foreground">{addon.name}</p>
                <p className="text-[10px] text-primary font-semibold">+ R {addon.price.toLocaleString()}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
          Special Notes & Production Requests
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="input-luxury w-full px-4 py-3 text-sm resize-none"
          placeholder="Any special requests, cultural considerations, drone permissions, or timeline notes..."
        />
      </div>

      {/* Summary Total Box */}
      {selectedPackage && (
        <div className="bg-muted/40 border border-gold rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-foreground-muted block">Estimated Booking Total</span>
              <span className="text-xs text-primary">
                {paymentPreference === 'finance'
                  ? `Financed over ${financeTerm} months (${formatZAR(amortization.monthlyInstalment)}/mo)`
                  : 'Pay directly upon approval'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gradient-gold">
                R {total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="btn-silver flex-1 py-3 text-sm font-medium rounded-md flex items-center justify-center gap-2"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedPackage}
          className="btn-gold flex-1 py-3 text-sm font-semibold rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Review Booking
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
