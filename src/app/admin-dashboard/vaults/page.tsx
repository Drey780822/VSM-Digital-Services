'use client';
import React, { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  Sparkles,
  Plus,
  Search,
  RefreshCw,
  Copy,
  ExternalLink,
  Upload,
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  Download,
  X,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import AppImage from '@/components/ui/AppImage';
import {
  fetchMemoryVaults,
  getVaultById,
  createMemoryVault,
  updateMemoryVault,
  uploadVaultPhotos,
  deleteVaultPhoto,
  deleteMemoryVault,
  type MemoryVaultRecord,
  type VaultStatus,
} from '@/lib/services/vaults.service';
import { formatDate } from '@/lib/services/supabase-helpers';

const VAULT_STATUS_BADGES: Record<VaultStatus, string> = {
  Processing: 'bg-warning/15 text-warning border-warning/30',
  Ready: 'bg-info/15 text-info border-info/30',
  Delivered: 'bg-success/15 text-success border-success/30',
  Archived: 'bg-muted text-foreground-muted border-border',
};

function VaultsContent() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action');
  const queryBookingId = searchParams.get('bookingId');
  const queryClientName = searchParams.get('clientName');
  const queryEmail = searchParams.get('email');
  const queryTitle = searchParams.get('title');
  const queryDate = searchParams.get('eventDate');

  const [vaults, setVaults] = useState<MemoryVaultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedVault, setSelectedVault] = useState<MemoryVaultRecord | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(initialAction === 'new');
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    bookingId: queryBookingId || '',
    clientName: queryClientName || '',
    clientEmail: queryEmail || '',
    title: queryTitle || 'Wedding Memories Collection',
    eventType: 'Wedding',
    eventDate: queryDate || new Date().toISOString().slice(0, 10),
    status: 'Processing' as VaultStatus,
    deliveryNotes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadVaults = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMemoryVaults();
      setVaults(data);
    } catch {
      toast.error('Failed to load memory vaults');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVaults();
  }, [loadVaults]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return vaults.filter((v) => {
      const matchSearch =
        !s ||
        v.title.toLowerCase().includes(s) ||
        v.clientName.toLowerCase().includes(s) ||
        v.clientEmail.toLowerCase().includes(s) ||
        v.accessCode.toLowerCase().includes(s);
      const matchStatus = statusFilter === 'All' || v.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [vaults, search, statusFilter]);

  const handleOpenVaultDetail = async (id: string) => {
    try {
      const full = await getVaultById(id);
      setSelectedVault(full);
    } catch {
      toast.error('Failed to load vault details');
    }
  };

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientEmail || !formData.title) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createMemoryVault(formData);
      setVaults((prev) => [created, ...prev]);
      toast.success(`Memory Vault created with Access Code: ${created.accessCode}`);
      setCreateModalOpen(false);
      handleOpenVaultDetail(created.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedVault || !e.target.files || e.target.files.length === 0) return;
    const filesArray = Array.from(e.target.files);
    setUploading(true);
    try {
      await uploadVaultPhotos(selectedVault.id, filesArray);
      toast.success(`Uploaded ${filesArray.length} photo(s) to vault`);
      const refreshed = await getVaultById(selectedVault.id);
      setSelectedVault(refreshed);
      loadVaults();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (fileId: string, storagePath: string) => {
    if (!selectedVault) return;
    try {
      await deleteVaultPhoto(fileId, storagePath);
      toast.success('Photo removed from vault');
      const refreshed = await getVaultById(selectedVault.id);
      setSelectedVault(refreshed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete photo');
    }
  };

  const handleStatusChange = async (newStatus: VaultStatus) => {
    if (!selectedVault) return;
    try {
      const updated = await updateMemoryVault(selectedVault.id, { status: newStatus });
      setSelectedVault((prev) => (prev ? { ...prev, status: updated.status } : null));
      setVaults((prev) => prev.map((v) => (v.id === updated.id ? { ...v, status: updated.status } : v)));
      toast.success(`Vault marked as ${newStatus}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDeleteVault = async (id: string) => {
    try {
      await deleteMemoryVault(id);
      setVaults((prev) => prev.filter((v) => v.id !== id));
      if (selectedVault?.id === id) setSelectedVault(null);
      toast.success('Memory Vault deleted');
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete vault');
    }
  };

  const copyClientLink = (accessCode: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/vault/${accessCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Client gallery link copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Memory Vaults</h1>
          <p className="text-sm text-foreground-muted">
            Private client photo galleries, high-resolution storage, and delivery tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadVaults}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
            title="Refresh vaults"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-gold px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} />
            <span>Create Vault</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search by title, client, access code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-luxury w-full pl-9 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-muted">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-luxury px-3 py-1.5 text-xs bg-muted/40"
          >
            <option value="All">All Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Ready">Ready</option>
            <option value="Delivered">Delivered</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && (
          <div className="col-span-full py-16 text-center text-xs text-foreground-muted">
            <RefreshCw size={20} className="animate-spin text-primary mx-auto mb-2" />
            Loading Memory Vaults...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full bg-card border border-border rounded-2xl p-12 text-center text-xs text-foreground-muted">
            <Sparkles size={28} className="text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">No Memory Vaults Found</p>
            <p className="mt-1">Create a vault for your photography clients to deliver high-resolution photos.</p>
          </div>
        )}
        {!loading &&
          filtered.map((v) => (
            <div
              key={v.id}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-gold transition-all duration-200 flex flex-col justify-between group shadow-card"
            >
              <div>
                {/* Cover Image */}
                <div className="relative h-40 w-full bg-muted/50 overflow-hidden">
                  {v.coverImageUrl ? (
                    <AppImage src={v.coverImageUrl} alt={v.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-foreground-muted/50 gap-1.5">
                      <ImageIcon size={28} />
                      <span className="text-[10px]">No cover photo</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${VAULT_STATUS_BADGES[v.status]}`}>
                      {v.status}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold text-gradient-gold border border-gold">
                    {v.accessCode}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <div>
                    <h3 className="text-sm font-bold text-foreground truncate">{v.title}</h3>
                    <p className="text-xs text-foreground-muted truncate">{v.clientName} ({v.clientEmail})</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-foreground-muted pt-1">
                    <span>{formatDate(v.eventDate)}</span>
                    <span className="flex items-center gap-2">
                      <span title="Views" className="flex items-center gap-0.5"><Eye size={11} /> {v.viewCount}</span>
                      <span title="Downloads" className="flex items-center gap-0.5"><Download size={11} /> {v.downloadCount}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-0 border-t border-border/40 mt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => copyClientLink(v.accessCode)}
                  className="p-2 rounded-lg bg-muted hover:bg-primary/20 text-foreground-muted hover:text-primary transition-colors text-xs flex items-center gap-1"
                  title="Copy client gallery link"
                >
                  <Copy size={13} />
                  <span className="hidden sm:inline">Link</span>
                </button>
                <a
                  href={`/vault/${v.accessCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-primary/20 text-foreground-muted hover:text-primary transition-colors text-xs flex items-center gap-1"
                  title="Preview client view"
                >
                  <ExternalLink size={13} />
                  <span className="hidden sm:inline">Preview</span>
                </a>
                <button
                  onClick={() => handleOpenVaultDetail(v.id)}
                  className="btn-gold px-3 py-1.5 text-xs font-semibold rounded-lg flex-1 text-center"
                >
                  Manage Photos
                </button>
                <button
                  onClick={() => setDeleteConfirmId(v.id)}
                  className="p-2 rounded-lg hover:bg-danger/10 text-foreground-muted hover:text-danger transition-colors"
                  title="Delete vault"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Vault Photo Manager Drawer/Modal */}
      {selectedVault && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" onClick={() => setSelectedVault(null)} />
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-card-hover p-6 z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedVault.title}</h3>
                <p className="text-xs text-foreground-muted">
                  Client: {selectedVault.clientName} · Access Code: <span className="font-mono text-primary font-bold">{selectedVault.accessCode}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedVault(null)}
                className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status Workflow Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3.5 rounded-xl border border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground-muted font-medium">Status:</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${VAULT_STATUS_BADGES[selectedVault.status]}`}>
                  {selectedVault.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedVault.status !== 'Delivered' && (
                  <button
                    onClick={() => handleStatusChange('Delivered')}
                    className="btn-gold px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle size={13} />
                    Mark as Delivered
                  </button>
                )}
                {selectedVault.status !== 'Ready' && selectedVault.status !== 'Delivered' && (
                  <button
                    onClick={() => handleStatusChange('Ready')}
                    className="btn-silver px-3 py-1.5 text-xs font-medium rounded-lg"
                  >
                    Mark as Ready
                  </button>
                )}
                <button
                  onClick={() => copyClientLink(selectedVault.accessCode)}
                  className="btn-silver px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5"
                >
                  <Copy size={13} />
                  Copy Share Link
                </button>
              </div>
            </div>

            {/* Photo Upload Zone */}
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-gold transition-colors bg-muted/10">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                id="vault-photo-upload"
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="vault-photo-upload" className="cursor-pointer block">
                <Upload size={24} className="text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">Click to upload photos to Supabase Storage</p>
                <p className="text-xs text-foreground-muted mt-1">High-res JPEG, PNG, WebP supported</p>
              </label>
              {uploading && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-primary font-medium">
                  <Loader2 size={15} className="animate-spin" />
                  Uploading to Supabase Storage...
                </div>
              )}
            </div>

            {/* Photos Grid */}
            <div>
              <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-3">
                Vault Photos ({selectedVault.files?.length || 0})
              </h4>
              {selectedVault.files && selectedVault.files.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
                  {selectedVault.files.map((file) => (
                    <div key={file.id} className="relative rounded-xl overflow-hidden border border-border group aspect-square bg-muted/40">
                      <AppImage src={file.fileUrl} alt={file.fileName} fill className="object-cover" />
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDeletePhoto(file.id, file.storagePath)}
                          className="w-8 h-8 rounded-full bg-danger/80 text-white flex items-center justify-center hover:bg-danger transition-colors"
                          title="Delete photo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-foreground-muted bg-muted/10 rounded-xl border border-border">
                  No photos uploaded to this vault yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Vault Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-card-hover p-6 z-10">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground">Create Memory Vault</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded text-foreground-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVault} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                  Vault Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sibusiso & Palesa Wedding"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-luxury w-full px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Client Name"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Client Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="client@email.com"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Event Type
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="input-luxury w-full px-3 py-2 bg-muted/40"
                  >
                    {['Wedding', 'Birthday', 'Corporate', 'Graduation', 'Funeral', 'Groove'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                  Delivery Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional message displayed to the client on access..."
                  value={formData.deliveryNotes}
                  onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                  className="input-luxury w-full px-3 py-2 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-silver px-3 py-2 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  Generate Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-card-hover z-10 text-center">
            <h4 className="text-sm font-bold text-foreground mb-2">Delete Memory Vault</h4>
            <p className="text-xs text-foreground-muted mb-5">
              Are you sure you want to delete this vault and all its photos from storage?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-silver flex-1 py-2 text-xs font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteVault(deleteConfirmId)}
                className="btn-gold flex-1 py-2 text-xs font-semibold rounded-lg bg-danger hover:bg-danger/90 text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MemoryVaultsPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<div className="p-8 text-center text-xs text-foreground-muted">Loading Memory Vaults...</div>}>
          <VaultsContent />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
