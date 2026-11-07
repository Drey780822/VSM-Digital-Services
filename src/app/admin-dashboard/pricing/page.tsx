'use client';

import React, { useEffect, useState, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  Sliders,
  Save,
  Loader2,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Building2,
  Calculator,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchEventTypes,
  fetchPricingAddons,
  fetchGlobalPricingConfig,
  saveGlobalPricingConfig,
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
  updatePackage,
  type PackageRecord,
  OFFICIAL_PACKAGES,
} from '@/lib/services/packages.service';
import { formatCurrency } from '@/lib/services/supabase-helpers';

export default function AdminPricingEnginePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Core Data
  const [globalConfig, setGlobalConfig] = useState<GlobalPricingEngineConfig>(DEFAULT_GLOBAL_CONFIG);
  const [eventTypes, setEventTypes] = useState<EventTypeRecord[]>(CANONICAL_EVENT_TYPES);
  const [packages, setPackages] = useState<PackageRecord[]>(OFFICIAL_PACKAGES);
  const [addons, setAddons] = useState<PricingAddonRecord[]>(CANONICAL_ADDONS);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'rules' | 'packages' | 'addons' | 'vaults' | 'sandbox'>('rules');

  // Sandbox Tester State
  const [testEventSlug, setTestEventSlug] = useState('birthday');
  const [testHours, setTestHours] = useState(2);
  const [testMediaType, setTestMediaType] = useState<MediaType>('both');
  const [testSelectedAddons, setTestSelectedAddons] = useState<string[]>(['same-day-preview']);

  // Fetch all live data on mount
  const loadData = async () => {
    setLoading(true);
    try {
      const [configData, eventsData, pkgsData, addonsData] = await Promise.all([
        fetchGlobalPricingConfig(),
        fetchEventTypes(),
        fetchPackages(false),
        fetchPricingAddons(),
      ]);

      setGlobalConfig(configData);
      setEventTypes(eventsData.length ? eventsData : CANONICAL_EVENT_TYPES);
      setPackages(pkgsData.length ? pkgsData : OFFICIAL_PACKAGES);
      setAddons(addonsData.length ? addonsData : CANONICAL_ADDONS);
    } catch {
      toast.error('Using local fallback pricing configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save changes to database
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      await saveGlobalPricingConfig(globalConfig);
      toast.success('Pricing engine parameters synchronized successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update configuration.');
    } finally {
      setSaving(false);
    }
  };

  // Sandbox Live Calculation
  const sandboxResult = useMemo(() => {
    const selectedEvent = eventTypes.find((e) => e.slug === testEventSlug) || eventTypes[0];
    if (selectedEvent.commercialModel === 'package') {
      const pkg = packages[0] || OFFICIAL_PACKAGES[0];
      return {
        model: 'package' as const,
        ...calculatePackagePrice(pkg, testSelectedAddons, addons),
      };
    }
    return {
      model: 'hourly' as const,
      ...calculateMiniEventPrice(
        {
          eventTypeSlug: testEventSlug,
          hours: testHours,
          mediaType: testMediaType,
          selectedAddonSlugs: testSelectedAddons,
        },
        eventTypes,
        addons,
        globalConfig.financeThreshold
      ),
    };
  }, [
    testEventSlug,
    testHours,
    testMediaType,
    testSelectedAddons,
    eventTypes,
    packages,
    addons,
    globalConfig.financeThreshold,
  ]);

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
            <p className="text-sm font-medium text-foreground-muted">
              Loading Dynamic Pricing Engine...
            </p>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mx-auto max-w-7xl space-y-8 pb-16">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#D4AF37]/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                  Commercial Engine
                </span>
                <span className="flex items-center gap-1 text-xs text-foreground-muted">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live in Supabase
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Dynamic Pricing Engine
              </h1>
              <p className="mt-1 text-sm text-foreground-muted">
                Control tariffs, event commercial models, major package deposits, and financing thresholds in real time without code deployment.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-surface-elevated transition-colors"
                title="Refresh latest data"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="btn-gold flex items-center gap-2 px-5 py-2.5 text-sm font-semibold shadow-gold-sm disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Pricing Rules
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <p className="text-xs font-medium text-foreground-muted">Base Hourly Rate</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {formatCurrency(globalConfig.hourlyRate)}
                <span className="text-xs font-normal text-foreground-muted"> /hr</span>
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <p className="text-xs font-medium text-foreground-muted">Financing Threshold</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {formatCurrency(globalConfig.financeThreshold)}
              </p>
              <p className="text-[11px] text-foreground-muted">Qualifies for monthly plans</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <p className="text-xs font-medium text-foreground-muted">Active Event Types</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {eventTypes.filter((e) => e.isActive).length} / {eventTypes.length}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <p className="text-xs font-medium text-foreground-muted">Major Packages</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {packages.length}
                <span className="text-xs font-normal text-foreground-muted"> Fixed Deposits</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border">
            {[
              { id: 'rules', label: '1. Event Models & Rates', icon: Sliders },
              { id: 'packages', label: '2. Major Packages & Deposits', icon: Sparkles },
              { id: 'addons', label: '3. Add-ons Catalog', icon: Plus },
              { id: 'vaults', label: '4. Memory Vaults', icon: ShieldCheck },
              { id: 'sandbox', label: '5. Price Simulator Sandbox', icon: Calculator },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-[#D4AF37] text-[#D4AF37]'
                      : 'border-transparent text-foreground-muted hover:border-border hover:text-foreground'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Event Models & Rules */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              {/* Global Engine Parameters */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-[#D4AF37]" />
                  Global Engine Thresholds
                </h2>
                <p className="mt-1 text-xs text-foreground-muted">
                  Default tariffs applied when an individual event category does not specify custom overrides.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground-muted">
                      Default Hourly Rate (ZAR)
                    </label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-2.5 text-xs text-foreground-muted font-bold">R</span>
                      <input
                        type="number"
                        min="100"
                        step="50"
                        value={globalConfig.hourlyRate}
                        onChange={(e) =>
                          setGlobalConfig({ ...globalConfig, hourlyRate: Number(e.target.value) })
                        }
                        className="input-luxury w-full pl-8 py-2 text-sm font-semibold"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-foreground-muted">
                      Base rate per hour for mini-events (birthdays, grads, grooves).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground-muted">
                      Minimum Booking Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={globalConfig.minimumHours}
                      onChange={(e) =>
                        setGlobalConfig({ ...globalConfig, minimumHours: Number(e.target.value) })
                      }
                      className="input-luxury mt-2 w-full py-2 text-sm font-semibold"
                    />
                    <p className="mt-1 text-[11px] text-foreground-muted">
                      Floor duration for flexible hourly bookings.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground-muted">
                      Smart Financing Threshold (ZAR)
                    </label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-2.5 text-xs text-foreground-muted font-bold">R</span>
                      <input
                        type="number"
                        min="1000"
                        step="500"
                        value={globalConfig.financeThreshold}
                        onChange={(e) =>
                          setGlobalConfig({
                            ...globalConfig,
                            financeThreshold: Number(e.target.value),
                          })
                        }
                        className="input-luxury w-full pl-8 py-2 text-sm font-semibold"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-foreground-muted">
                      Only orders equal or greater than this trigger payment plans.
                    </p>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-8 border-t border-border/60 pt-6">
                  <h3 className="text-sm font-semibold text-foreground">
                    Permitted Payment Methods
                  </h3>
                  <p className="text-xs text-foreground-muted">
                    Enable or disable payment rails for online checkout.
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      { key: 'eft', name: 'Bank EFT Transfer', desc: 'Proof of payment upload & manual review' },
                      { key: 'cash', name: 'Cash on Arrival', desc: 'Pre-approved deposit + cash settlement' },
                      { key: 'yoco', name: 'Yoco Card Gateway', desc: 'Debit / Credit card online instant' },
                      { key: 'payfast', name: 'PayFast Gateway', desc: 'Instant EFT & SnapScan payment' },
                    ].map((m) => {
                      const isChecked = globalConfig.paymentMethods[m.key as keyof typeof globalConfig.paymentMethods];
                      return (
                        <label
                          key={m.key}
                          className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all ${
                            isChecked
                              ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5'
                              : 'border-border bg-card opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-foreground">{m.name}</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setGlobalConfig({
                                  ...globalConfig,
                                  paymentMethods: {
                                    ...globalConfig.paymentMethods,
                                    [m.key]: e.target.checked,
                                  },
                                })
                              }
                              className="h-4 w-4 accent-[#D4AF37]"
                            />
                          </div>
                          <p className="mt-2 text-[11px] text-foreground-muted">{m.desc}</p>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Event Commercial Matrix Table */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      Event Categories Commercial Classification
                    </h2>
                    <p className="text-xs text-foreground-muted">
                      Determines whether the client enters an hourly coverage flow, a luxury package selector, or an enterprise quotation brief.
                    </p>
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-foreground-muted">
                        <th className="pb-3 font-semibold uppercase tracking-wider">Event Category</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider">Commercial Model</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider">Base Rate (ZAR)</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider">Min Hours</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider">Standard Deliverables</th>
                        <th className="pb-3 text-right font-semibold uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {eventTypes.map((evt, idx) => (
                        <tr key={evt.id} className="hover:bg-surface-elevated/40 transition-colors">
                          <td className="py-3.5 font-semibold text-foreground">
                            <div>{evt.name}</div>
                            <span className="text-[10px] text-foreground-muted font-mono">{evt.slug}</span>
                          </td>
                          <td className="py-3.5">
                            <select
                              value={evt.commercialModel}
                              onChange={(e) => {
                                const newModel = e.target.value as CommercialModel;
                                setEventTypes((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, commercialModel: newModel } : item
                                  )
                                );
                              }}
                              className="input-luxury rounded-lg px-2.5 py-1 text-xs font-semibold"
                            >
                              <option value="hourly">Hourly / Deliverables</option>
                              <option value="package">Production Package</option>
                              <option value="quotation">Enterprise Quotation</option>
                            </select>
                          </td>
                          <td className="py-3.5">
                            {evt.commercialModel === 'hourly' ? (
                              <div className="flex items-center gap-1">
                                <span className="text-foreground-muted font-bold">R</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="50"
                                  value={evt.baseHourlyRate}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setEventTypes((prev) =>
                                      prev.map((item, i) =>
                                        i === idx ? { ...item, baseHourlyRate: val } : item
                                      )
                                    );
                                  }}
                                  className="input-luxury w-20 px-2 py-1 text-xs font-bold"
                                />
                              </div>
                            ) : (
                              <span className="text-foreground-muted italic">N/A</span>
                            )}
                          </td>
                          <td className="py-3.5">
                            <input
                              type="number"
                              min="1"
                              max="12"
                              value={evt.minHours}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setEventTypes((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, minHours: val } : item
                                  )
                                );
                              }}
                              className="input-luxury w-16 px-2 py-1 text-xs"
                            />
                          </td>
                          <td className="py-3.5 text-foreground-muted">
                            {evt.commercialModel === 'hourly'
                              ? `${evt.baseDeliverables?.photos || 80} photos · ${evt.baseDeliverables?.videos || 2} reels`
                              : evt.commercialModel === 'package'
                              ? 'Package tiers determine scope'
                              : 'Bespoke corporate brief'}
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setEventTypes((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, isActive: !item.isActive } : item
                                  )
                                );
                              }}
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                                evt.isActive
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {evt.isActive ? 'Active' : 'Disabled'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Major Packages & Deposits */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      Major Production Packages & Fixed Deposits
                    </h2>
                    <p className="text-xs text-foreground-muted">
                      These packages represent high-tier productions (weddings, funerals, galas). Each package requires a fixed deposit to reserve the date.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {packages.map((pkg, idx) => (
                    <div
                      key={pkg.id}
                      className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                        pkg.isHighlighted
                          ? 'border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/10 to-card shadow-gold-sm'
                          : 'border-border bg-card shadow-card'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-xs font-bold uppercase text-foreground-muted">
                            {pkg.tier}
                          </span>
                          {pkg.isHighlighted && (
                            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                              Signature Tier
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-lg font-bold text-foreground">{pkg.name}</h3>
                        <p className="mt-1 text-xs text-foreground-muted">{pkg.description}</p>

                        {/* Price Fields */}
                        <div className="mt-6 space-y-3 rounded-xl border border-border/80 bg-background/50 p-4">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                              Total Package Price (ZAR)
                            </label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-2 text-xs font-bold text-[#D4AF37]">R</span>
                              <input
                                type="number"
                                min="0"
                                step="100"
                                value={pkg.price}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setPackages((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                                  );
                                }}
                                className="input-luxury w-full pl-8 py-1.5 text-base font-bold text-foreground"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              Fixed Deposit Reserve (ZAR)
                            </label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-2 text-xs font-bold text-emerald-400">R</span>
                              <input
                                type="number"
                                min="0"
                                step="100"
                                value={pkg.depositAmount}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setPackages((prev) =>
                                    prev.map((item, i) =>
                                      i === idx ? { ...item, depositAmount: val } : item
                                    )
                                  );
                                }}
                                className="input-luxury w-full pl-8 py-1.5 text-sm font-bold text-emerald-400"
                              />
                            </div>
                            <p className="mt-1 text-[10px] text-foreground-muted">
                              Customer pays this amount upfront to reserve date.
                            </p>
                          </div>
                        </div>

                        {/* Features List */}
                        <div className="mt-4">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                            Included Deliverables & Features
                          </label>
                          <ul className="mt-2 space-y-1.5 text-xs text-foreground">
                            {pkg.features.map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-6 border-t border-border pt-4">
                        <div className="flex items-center justify-between text-xs text-foreground-muted">
                          <span>Coverage Duration</span>
                          <span className="font-bold text-foreground">{pkg.durationHours} Hours</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-foreground-muted">
                          <span>Balance Due at Delivery</span>
                          <span className="font-bold text-foreground">
                            {formatCurrency(pkg.price - pkg.depositAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Add-ons Catalog */}
          {activeTab === 'addons' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      Dynamic Add-ons & Deliverables
                    </h2>
                    <p className="text-xs text-foreground-muted">
                      Customers can add these deliverables to both hourly mini-events and production packages.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {addons.map((addon, idx) => (
                    <div
                      key={addon.id}
                      className="rounded-xl border border-border bg-background/50 p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <input
                            type="text"
                            value={addon.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAddons((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                              );
                            }}
                            className="input-luxury w-full py-1 text-sm font-bold text-foreground"
                          />
                          <p className="mt-1 text-[11px] text-foreground-muted font-mono">{addon.slug}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAddons((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, isActive: !item.isActive } : item
                              )
                            );
                          }}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                            addon.isActive
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {addon.isActive ? 'Active' : 'Off'}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-foreground-muted uppercase">
                            Price (ZAR)
                          </label>
                          <div className="relative mt-1">
                            <span className="absolute left-2.5 top-1.5 text-xs text-foreground-muted font-bold">R</span>
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={addon.price}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setAddons((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                                );
                              }}
                              className="input-luxury w-full pl-6 py-1 text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-foreground-muted uppercase">
                            Unit Type
                          </label>
                          <select
                            value={addon.unit}
                            onChange={(e) => {
                              const val = e.target.value as PricingAddonRecord['unit'];
                              setAddons((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, unit: val } : item))
                              );
                            }}
                            className="input-luxury mt-1 w-full py-1 text-xs"
                          >
                            <option value="flat">Flat Fee</option>
                            <option value="per_hour">Per Hour</option>
                            <option value="per_unit">Per Unit</option>
                          </select>
                        </div>
                      </div>

                      <textarea
                        value={addon.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAddons((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, description: val } : item
                            )
                          );
                        }}
                        rows={2}
                        className="input-luxury w-full py-1 text-xs text-foreground-muted"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Memory Vaults */}
          {activeTab === 'vaults' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Memory Vault Preservation Tiers
                  </h2>
                  <p className="text-xs text-foreground-muted">
                    Post-event client delivery platform with recurring annual preservation models.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {globalConfig.vaultPlans.map((plan, idx) => (
                    <div
                      key={plan.id}
                      className="rounded-2xl border border-border bg-background/50 p-6 shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                          Tier {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {plan.price === 0 ? 'Included Free' : `R${plan.price} / yr`}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                          Annual Price (ZAR)
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-2 text-xs font-bold text-foreground-muted">R</span>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={plan.price}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setGlobalConfig({
                                ...globalConfig,
                                vaultPlans: globalConfig.vaultPlans.map((p, i) =>
                                  i === idx ? { ...p, price: val } : p
                                ),
                              });
                            }}
                            className="input-luxury w-full pl-7 py-1.5 text-sm font-bold text-foreground"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                          Customer Label / Description
                        </label>
                        <input
                          type="text"
                          value={plan.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGlobalConfig({
                              ...globalConfig,
                              vaultPlans: globalConfig.vaultPlans.map((p, i) =>
                                i === idx ? { ...p, label: val } : p
                              ),
                            });
                          }}
                          className="input-luxury mt-1 w-full py-1.5 text-xs text-foreground"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Price Simulator Sandbox */}
          {activeTab === 'sandbox' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-[#D4AF37]" />
                    Interactive Tariff Simulator
                  </h2>
                  <p className="text-xs text-foreground-muted">
                    Test how pricing behaves from the customer perspective based on event category, duration, media selection, and add-ons.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {/* Controls */}
                  <div className="space-y-5 rounded-xl border border-border/70 bg-background/50 p-5">
                    <div>
                      <label className="block text-xs font-semibold text-foreground-muted">
                        Select Event Category
                      </label>
                      <select
                        value={testEventSlug}
                        onChange={(e) => setTestEventSlug(e.target.value)}
                        className="input-luxury mt-2 w-full py-2 text-sm font-semibold"
                      >
                        {eventTypes
                          .filter((e) => e.isActive)
                          .map((e) => (
                            <option key={e.slug} value={e.slug}>
                              {e.name} ({e.commercialModel})
                            </option>
                          ))}
                      </select>
                    </div>

                    {sandboxResult.model === 'hourly' && (
                      <>
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-foreground-muted">
                              Duration (Hours)
                            </label>
                            <span className="text-sm font-bold text-[#D4AF37]">{testHours} Hours</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="8"
                            step="1"
                            value={testHours}
                            onChange={(e) => setTestHours(Number(e.target.value))}
                            className="mt-2 w-full accent-[#D4AF37]"
                          />
                          <div className="flex justify-between text-[10px] text-foreground-muted">
                            <span>1 hr</span>
                            <span>2 hrs</span>
                            <span>4 hrs</span>
                            <span>8 hrs</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-foreground-muted">
                            Media Coverage Type
                          </label>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {(['photo', 'video', 'both'] as MediaType[]).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setTestMediaType(type)}
                                className={`rounded-lg border py-2 text-xs font-bold capitalize transition-all ${
                                  testMediaType === type
                                    ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]'
                                    : 'border-border bg-card text-foreground-muted hover:border-border/80'
                                }`}
                              >
                                {type === 'both' ? 'Photo + Video' : type}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-foreground-muted">
                        Test Optional Add-ons
                      </label>
                      <div className="mt-2 space-y-2">
                        {addons
                          .filter((a) => a.isActive)
                          .map((a) => {
                            const isChecked = testSelectedAddons.includes(a.slug);
                            return (
                              <label
                                key={a.slug}
                                className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-xs transition-colors ${
                                  isChecked
                                    ? 'border-[#D4AF37]/60 bg-[#D4AF37]/5 font-semibold text-foreground'
                                    : 'border-border/60 text-foreground-muted hover:bg-card'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setTestSelectedAddons([...testSelectedAddons, a.slug]);
                                      } else {
                                        setTestSelectedAddons(
                                          testSelectedAddons.filter((s) => s !== a.slug)
                                        );
                                      }
                                    }}
                                    className="h-3.5 w-3.5 accent-[#D4AF37]"
                                  />
                                  <span>{a.name}</span>
                                </div>
                                <span className="font-bold text-foreground">
                                  +{formatCurrency(a.price)}
                                </span>
                              </label>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Customer Quote Simulation Receipt */}
                  <div className="rounded-xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#D4AF37]/10 to-card p-6 shadow-gold-sm space-y-6">
                    <div className="border-b border-border/80 pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                        Live Simulated Quote
                      </span>
                      <h3 className="mt-1 text-xl font-bold text-foreground">
                        {sandboxResult.model === 'hourly'
                          ? `${sandboxResult.eventType.name}`
                          : `${sandboxResult.package.name}`}
                      </h3>
                      <p className="mt-1 text-xs text-foreground-muted">
                        Commercial Model: <span className="font-semibold text-foreground capitalize">{sandboxResult.model}</span>
                      </p>
                    </div>

                    <div className="space-y-3 text-sm">
                      {sandboxResult.model === 'hourly' ? (
                        <>
                          <div className="flex justify-between text-foreground">
                            <span>
                              Coverage ({sandboxResult.hours} hrs @ R{sandboxResult.hourlyRate}/hr)
                            </span>
                            <span className="font-semibold">
                              {formatCurrency(sandboxResult.baseCoverageAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-foreground-muted">
                            <span>Deliverables Summary</span>
                            <span className="font-medium text-foreground">
                              {sandboxResult.deliverablesSummary}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-foreground">
                          <span>{sandboxResult.package.name}</span>
                          <span className="font-semibold">
                            {formatCurrency(sandboxResult.package.price)}
                          </span>
                        </div>
                      )}

                      {sandboxResult.addons.map((a) => (
                        <div key={a.slug} className="flex justify-between text-xs text-foreground-muted">
                          <span>+ {a.name}</span>
                          <span className="font-medium text-foreground">
                            +{formatCurrency(a.price)}
                          </span>
                        </div>
                      ))}

                      <div className="border-t border-border/80 pt-3 flex justify-between text-base font-bold text-foreground">
                        <span>Total Quotation</span>
                        <span className="text-xl text-[#D4AF37]">
                          {formatCurrency(sandboxResult.totalAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                        <span>Deposit Required Today:</span>
                        <span>{formatCurrency(sandboxResult.depositAmount)}</span>
                      </div>

                      <div className="flex justify-between text-xs text-foreground-muted">
                        <span>Balance Due on Delivery:</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(sandboxResult.balanceDue)}
                        </span>
                      </div>
                    </div>

                    {/* Smart Financing Context */}
                    <div className="rounded-xl border border-border bg-background/80 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <CreditCard className="h-4 w-4 text-[#D4AF37]" />
                          Smart Financing Lane
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            sandboxResult.isFinancingEligible
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-foreground-muted/15 text-foreground-muted'
                          }`}
                        >
                          {sandboxResult.isFinancingEligible ? 'Eligible' : 'Below Threshold (Cash/EFT)'}
                        </span>
                      </div>

                      {sandboxResult.isFinancingEligible ? (
                        <div className="mt-3 text-xs text-foreground-muted space-y-1">
                          <p>
                            Qualifies for package financing from{' '}
                            <strong className="text-foreground">
                              {formatCurrency(sandboxResult.estimatedMonthly)} / month
                            </strong>{' '}
                            over 6 months.
                          </p>
                          <p className="text-[11px] text-[#D4AF37]">
                            Customer pays fixed deposit today, remainder split seamlessly.
                          </p>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-foreground-muted">
                          Under R{globalConfig.financeThreshold}. Customers book directly with affordable hourly pricing without taking on unwanted debt.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
