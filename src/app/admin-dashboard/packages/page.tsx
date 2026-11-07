'use client';
import React, { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Loader2,
  Sparkles,
  Clock,
  CreditCard,
  Check,
  Layers,
  Flame,
  ArrowUpDown,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchPackages,
  createPackage,
  updatePackage,
  deletePackage,
  seedCanonicalPackages,
  type PackageRecord,
  type CreatePackageInput,
} from '@/lib/services/packages.service';
import { formatCurrency } from '@/lib/services/supabase-helpers';

const TIERS = ['All', 'Essential', 'Cinematic', 'Legacy', 'Custom'];
const CATEGORIES = [
  'Photography',
  'Photography & Video',
  'Complete Luxury Production',
  'Custom',
];

function PackagesContent() {
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [financeFilter, setFinanceFilter] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formState, setFormState] = useState<CreatePackageInput & { newFeatureText: string }>({
    name: '',
    slug: '',
    tier: 'Essential',
    category: 'Photography',
    description: '',
    price: 5000,
    depositAmount: 2000,
    durationHours: 4,
    features: [''],
    isActive: true,
    isHighlighted: false,
    displayOrder: 1,
    financingAvailable: true,
    newFeatureText: '',
  });

  const loadPackages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPackages(false);
      setPackages(data);
    } catch {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const seeded = await seedCanonicalPackages();
      setPackages(seeded);
      toast.success('Successfully synced official VSM packages to database');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to seed packages');
    } finally {
      setSeeding(false);
    }
  };

  const openCreateModal = () => {
    setEditingPackage(null);
    setFormState({
      name: '',
      slug: '',
      tier: 'Essential',
      category: 'Photography',
      description: '',
      price: 5000,
      depositAmount: 2000,
      durationHours: 4,
      features: [
        'Professional event photography',
        'High-resolution digital delivery',
        'Basic post-processing edits',
      ],
      isActive: true,
      isHighlighted: false,
      displayOrder: (packages.length || 0) + 1,
      financingAvailable: true,
      newFeatureText: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (pkg: PackageRecord) => {
    setEditingPackage(pkg);
    setFormState({
      name: pkg.name,
      slug: pkg.slug,
      tier: pkg.tier,
      category: pkg.category,
      description: pkg.description,
      price: pkg.price,
      depositAmount: pkg.depositAmount,
      durationHours: pkg.durationHours,
      features: pkg.features && pkg.features.length > 0 ? [...pkg.features] : [''],
      isActive: pkg.isActive,
      isHighlighted: pkg.isHighlighted,
      displayOrder: pkg.displayOrder,
      financingAvailable: pkg.financingAvailable,
      newFeatureText: '',
    });
    setModalOpen(true);
  };

  const handlePriceChange = (val: number) => {
    setFormState((prev) => ({
      ...prev,
      price: val,
      depositAmount: Math.round(val * 0.4),
    }));
  };

  const handleAddFeature = () => {
    if (!formState.newFeatureText.trim()) return;
    setFormState((prev) => ({
      ...prev,
      features: [...prev.features.filter((f) => f.trim() !== ''), formState.newFeatureText.trim()],
      newFeatureText: '',
    }));
  };

  const handleRemoveFeature = (idx: number) => {
    setFormState((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      toast.error('Package name is required');
      return;
    }

    const cleanFeatures = formState.features.filter((f) => f.trim().length > 0);
    if (formState.newFeatureText.trim()) {
      cleanFeatures.push(formState.newFeatureText.trim());
    }

    setSubmitting(true);
    try {
      const payload: CreatePackageInput = {
        name: formState.name.trim(),
        slug: formState.slug?.trim() || formState.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tier: formState.tier,
        category: formState.category,
        description: formState.description,
        price: Number(formState.price),
        depositAmount: Number(formState.depositAmount),
        durationHours: Number(formState.durationHours),
        features: cleanFeatures,
        isActive: formState.isActive,
        isHighlighted: formState.isHighlighted,
        displayOrder: Number(formState.displayOrder),
        financingAvailable: formState.financingAvailable,
      };

      if (editingPackage) {
        const updated = await updatePackage(editingPackage.id, payload);
        setPackages((prev) => prev.map((p) => (p.id === editingPackage.id ? updated : p)));
        toast.success(`Package "${updated.name}" updated successfully`);
      } else {
        const created = await createPackage(payload);
        setPackages((prev) => [...prev, created].sort((a, b) => a.displayOrder - b.displayOrder));
        toast.success(`Package "${created.name}" created successfully`);
      }
      setModalOpen(false);
      loadPackages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save package');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (pkg: PackageRecord) => {
    try {
      const updated = await updatePackage(pkg.id, { isActive: !pkg.isActive });
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? updated : p)));
      toast.success(`${pkg.name} is now ${updated.isActive ? 'Active' : 'Inactive'}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleToggleFinancing = async (pkg: PackageRecord) => {
    try {
      const updated = await updatePackage(pkg.id, { financingAvailable: !pkg.financingAvailable });
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? updated : p)));
      toast.success(
        `Financing for ${pkg.name} ${updated.financingAvailable ? 'enabled' : 'disabled'}`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePackage(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
      toast.success('Package deleted successfully');
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return packages.filter((p) => {
      const matchSearch =
        !s ||
        p.name.toLowerCase().includes(s) ||
        p.tier.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.features.some((f) => f.toLowerCase().includes(s));

      const matchTier = tierFilter === 'All' || p.tier.toLowerCase() === tierFilter.toLowerCase();
      const matchFinance =
        financeFilter === 'All' ||
        (financeFilter === 'Financed' ? p.financingAvailable : !p.financingAvailable);

      return matchSearch && matchTier && matchFinance;
    });
  }, [packages, search, tierFilter, financeFilter]);

  const activeCount = packages.filter((p) => p.isActive).length;
  const financedCount = packages.filter((p) => p.financingAvailable && p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Package className="text-primary" size={24} />
            Package Management
          </h1>
          <p className="text-sm text-foreground-muted">
            Configure photography & videography packages, dynamic pricing, and Smart Financing eligibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadPackages}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
            title="Refresh packages"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="btn-silver px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5"
            title="Sync official VSM packages to database"
          >
            <Sparkles size={14} className={seeding ? 'animate-spin text-primary' : 'text-primary'} />
            <span>Sync Defaults</span>
          </button>
          <button
            onClick={openCreateModal}
            className="btn-gold px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} />
            <span>New Package</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground-muted font-medium">Total Packages</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{packages.length}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Layers size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground-muted font-medium">Active Offerings</p>
            <p className="text-2xl font-bold text-success mt-0.5">{activeCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-success/10 text-success">
            <CheckCircle size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground-muted font-medium">Financing Eligible</p>
            <p className="text-2xl font-bold text-primary mt-0.5">{financedCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <CreditCard size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground-muted font-medium">Price Range</p>
            <p className="text-sm font-bold text-foreground mt-1">
              {packages.length > 0
                ? `${formatCurrency(Math.min(...packages.map((p) => p.price)))} - ${formatCurrency(Math.max(...packages.map((p) => p.price)))}`
                : 'R0'}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted text-foreground-muted">
            <DollarSign size={18} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search packages, features, tiers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-luxury w-full pl-9 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-foreground-muted">Tier:</span>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="input-luxury px-2.5 py-1.5 text-xs bg-muted/40"
          >
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <span className="text-xs text-foreground-muted ml-2">Financing:</span>
          <select
            value={financeFilter}
            onChange={(e) => setFinanceFilter(e.target.value)}
            className="input-luxury px-2.5 py-1.5 text-xs bg-muted/40"
          >
            <option value="All">All Packages</option>
            <option value="Financed">Smart Financed Only</option>
            <option value="Direct">Direct Cash Only</option>
          </select>
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-xs text-foreground-muted">Loading package catalog...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Package className="mx-auto text-foreground-muted mb-3" size={36} />
          <h3 className="text-base font-semibold text-foreground">No Packages Found</h3>
          <p className="text-xs text-foreground-muted mt-1 max-w-sm mx-auto">
            {search || tierFilter !== 'All'
              ? 'Try changing your search or filters to see more results.'
              : 'Sync canonical packages or create your first package to get started.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={handleSeedDefaults} className="btn-gold px-4 py-2 text-xs font-semibold rounded-lg">
              Sync Default Packages
            </button>
            <button onClick={openCreateModal} className="btn-silver px-4 py-2 text-xs font-medium rounded-lg">
              Create Custom Package
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-card border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 relative group ${
                pkg.isHighlighted
                  ? 'border-primary/50 shadow-luxury ring-1 ring-primary/20'
                  : 'border-border hover:border-border-hover'
              } ${!pkg.isActive ? 'opacity-70 bg-card/60' : ''}`}
            >
              {/* Badges Bar */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                      pkg.tier === 'Legacy'
                        ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                        : pkg.tier === 'Cinematic'
                          ? 'bg-primary/15 text-primary border-gold'
                          : 'bg-info/15 text-info border-info/30'
                    }`}
                  >
                    {pkg.tier}
                  </span>

                  {pkg.isHighlighted && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-black">
                      <Flame size={10} />
                      POPULAR
                    </span>
                  )}
                </div>

                {/* Status indicator */}
                <button
                  onClick={() => handleToggleActive(pkg)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 transition-colors ${
                    pkg.isActive
                      ? 'bg-success/15 text-success border-success/30 hover:bg-success/25'
                      : 'bg-danger/15 text-danger border-danger/30 hover:bg-danger/25'
                  }`}
                  title="Click to toggle Active status"
                >
                  {pkg.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                  <span>{pkg.isActive ? 'Active' : 'Disabled'}</span>
                </button>
              </div>

              {/* Title & Description */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground tracking-tight">{pkg.name}</h3>
                  <span className="text-[10px] text-foreground-muted font-mono">#{pkg.displayOrder}</span>
                </div>
                <p className="text-xs text-foreground-muted mt-1.5 line-clamp-2 leading-relaxed">
                  {pkg.description || 'No description provided.'}
                </p>
              </div>

              {/* Pricing & Terms */}
              <div className="bg-muted/30 border border-border rounded-xl p-3 mb-4 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-foreground-muted">Total Price:</span>
                  <span className="text-lg font-extrabold text-foreground">{formatCurrency(pkg.price)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-foreground-muted">
                  <span>Required Deposit:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(pkg.depositAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-foreground-muted">
                  <span>Coverage Duration:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Clock size={12} className="text-primary" />
                    {pkg.durationHours} Hours
                  </span>
                </div>

                {/* Financing Tag */}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <button
                    onClick={() => handleToggleFinancing(pkg)}
                    className={`text-[10px] font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${
                      pkg.financingAvailable
                        ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                        : 'bg-muted text-foreground-muted border-border hover:bg-muted/80'
                    }`}
                    title="Click to toggle financing eligibility"
                  >
                    <CreditCard size={11} />
                    <span>
                      {pkg.financingAvailable
                        ? `Financing from ${formatCurrency(pkg.estimatedMonthly)}/mo`
                        : 'Cash / Direct Only'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-1.5 mb-5 flex-1">
                <p className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
                  Included Features ({pkg.features.length})
                </p>
                <div className="space-y-1">
                  {pkg.features.slice(0, 4).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-foreground-muted">
                      <Check size={12} className="text-primary shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{feat}</span>
                    </div>
                  ))}
                  {pkg.features.length > 4 && (
                    <p className="text-[10px] text-foreground-muted font-medium italic pl-4">
                      +{pkg.features.length - 4} more deliverables
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <div className="text-[10px] text-foreground-muted font-mono truncate">
                  slug: {pkg.slug}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
                    title="Edit Package"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(pkg.id)}
                    className="p-1.5 rounded-lg border border-border bg-card hover:bg-danger/10 text-foreground-muted hover:text-danger hover:border-danger/30 transition-colors"
                    title="Delete Package"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-card-hover p-6 z-10 space-y-4">
            <div className="flex items-center gap-3 text-danger">
              <div className="p-2 rounded-full bg-danger/10">
                <AlertCircle size={20} />
              </div>
              <h3 className="text-sm font-bold text-foreground">Confirm Package Deletion</h3>
            </div>
            <p className="text-xs text-foreground-muted">
              Are you sure you want to remove this package? Any ongoing bookings attached to this package name will remain intact in audit logs.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-silver px-3 py-1.5 text-xs font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors"
              >
                Delete Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-card-hover p-6 z-10">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Package className="text-primary" size={18} />
                {editingPackage ? `Edit Package: ${editingPackage.name}` : 'Create New Package'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded text-foreground-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Row 1: Name, Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Traditional Wedding Gold"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. traditional-wedding-gold"
                    value={formState.slug}
                    onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                    className="input-luxury w-full px-3 py-2 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Row 2: Tier, Category, Display Order */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Tier Tier
                  </label>
                  <select
                    value={formState.tier}
                    onChange={(e) => setFormState({ ...formState, tier: e.target.value })}
                    className="input-luxury w-full px-3 py-2 bg-muted/40"
                  >
                    <option value="Essential">Essential</option>
                    <option value="Cinematic">Cinematic</option>
                    <option value="Legacy">Legacy</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="input-luxury w-full px-3 py-2 bg-muted/40"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formState.displayOrder}
                    onChange={(e) => setFormState({ ...formState, displayOrder: Number(e.target.value) })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
              </div>

              {/* Row 3: Price, Deposit, Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Total Price (ZAR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={formState.price}
                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                    className="input-luxury w-full px-3 py-2 font-bold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Deposit Amount (ZAR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formState.depositAmount}
                    onChange={(e) => setFormState({ ...formState, depositAmount: Number(e.target.value) })}
                    className="input-luxury w-full px-3 py-2 font-bold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={formState.durationHours}
                    onChange={(e) => setFormState({ ...formState, durationHours: Number(e.target.value) })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
              </div>

              {/* Row 4: Toggles (Active, Highlighted, Financing) */}
              <div className="bg-muted/20 border border-border rounded-xl p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isActive}
                    onChange={(e) => setFormState({ ...formState, isActive: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-xs font-medium text-foreground">Active (Visible to Clients)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isHighlighted}
                    onChange={(e) => setFormState({ ...formState, isHighlighted: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-xs font-medium text-foreground">Featured / Most Popular</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.financingAvailable}
                    onChange={(e) => setFormState({ ...formState, financingAvailable: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-xs font-medium text-foreground">Smart Financing Enabled</span>
                </label>
              </div>

              {/* Row 5: Description */}
              <div>
                <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                  Package Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short, evocative description of what clients will experience..."
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="input-luxury w-full px-3 py-2"
                />
              </div>

              {/* Row 6: Features list */}
              <div>
                <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                  Deliverables & Features
                </label>
                <div className="space-y-2 mb-2 max-h-40 overflow-y-auto pr-1">
                  {formState.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...formState.features];
                          updated[idx] = e.target.value;
                          setFormState({ ...formState, features: updated });
                        }}
                        className="input-luxury flex-1 px-3 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1.5 text-foreground-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a new deliverable (e.g. Drone 4K footage)..."
                    value={formState.newFeatureText}
                    onChange={(e) => setFormState({ ...formState, newFeatureText: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="input-luxury flex-1 px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="btn-silver px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-silver px-4 py-2 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold px-5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  <span>{editingPackage ? 'Update Package' : 'Create Package'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPackagesPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense
          fallback={
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          }
        >
          <PackagesContent />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
