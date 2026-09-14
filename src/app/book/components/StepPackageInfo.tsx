'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Camera } from 'lucide-react';
import {
  BOOKING_ADDONS,
  PACKAGES,
  calculateBookingTotal,
} from '@/lib/bookings/constants';
import type { BookingAddon, BookingFormData } from '@/lib/bookings/types';

interface Props {
  data: BookingFormData;
  updateData: (u: Partial<BookingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepPackageInfo({ data, updateData, onNext, onBack }: Props) {
  const [selectedPackageId, setSelectedPackageId] = useState(data.packageId);
  const [selectedAddons, setSelectedAddons] = useState<BookingAddon[]>(data.addons);
  const [notes, setNotes] = useState(data.notes);

  const selectedPackage = PACKAGES.find((p) => p.id === selectedPackageId);
  const total = selectedPackage
    ? calculateBookingTotal(selectedPackage.price, selectedAddons)
    : 0;

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
    });
    onNext();
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-7 lg:p-8">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-1">
          Package & Add-ons
        </h2>
        <p className="text-sm text-foreground-muted">
          Select your photography package and any optional extras.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase">
          Photography Package <span className="text-danger">*</span>
        </label>
        {PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            type="button"
            onClick={() => setSelectedPackageId(pkg.id)}
            className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${
              selectedPackageId === pkg.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-muted/30 hover:border-gold'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    selectedPackageId === pkg.id ? 'bg-gold-gradient' : 'bg-muted'
                  }`}
                >
                  <Camera
                    size={16}
                    className={selectedPackageId === pkg.id ? 'text-background' : 'text-primary'}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{pkg.name}</p>
                  <p className="text-xs text-foreground-muted">{pkg.tier} tier</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">
                  R {pkg.price.toLocaleString()}
                </p>
                {selectedPackageId === pkg.id && (
                  <Check size={14} className="text-primary ml-auto mt-1" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

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
                <p className="text-[10px] text-primary">+ R {addon.price.toLocaleString()}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
          Special Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="input-luxury w-full px-4 py-3 text-sm resize-none"
          placeholder="Any special requests, cultural considerations, or timeline notes..."
        />
      </div>

      {selectedPackage && (
        <div className="bg-muted/40 border border-gold rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-muted">Estimated Total</span>
            <span className="text-xl font-semibold text-gradient-gold">
              R {total.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-foreground-muted mt-1">
            Final quote confirmed by Vincent after review. Financing available.
          </p>
        </div>
      )}

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
          disabled={!selectedPackageId}
          className="btn-gold flex-1 py-3 text-sm font-semibold rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Review Booking
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
