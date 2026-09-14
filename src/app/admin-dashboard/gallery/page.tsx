'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  Image as ImageIcon,
  Plus,
  Search,
  RefreshCw,
  Upload,
  Trash2,
  CheckCircle,
  Eye,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import {
  fetchGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadGalleryImage,
  type GalleryItemRecord,
} from '@/lib/services/gallery.service';

const CATEGORIES = ['All', 'Wedding', 'Birthday', 'Corporate', 'Graduation', 'Funeral', 'Groove'];

export default function GalleryCMSPage() {
  const [items, setItems] = useState<GalleryItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Wedding');
  const [aspectRatio, setAspectRatio] = useState<'portrait' | 'landscape' | 'square'>('landscape');
  const [sortOrder, setSortOrder] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadGallery = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGalleryItems(false);
      setItems(data);
    } catch {
      toast.error('Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return items.filter((item) => {
      const matchSearch = !s || item.title.toLowerCase().includes(s);
      const matchCategory = categoryFilter === 'All' || item.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchSearch && matchCategory;
    });
  }, [items, search, categoryFilter]);

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const updated = await updateGalleryItem(id, { isActive: !current });
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      toast.success(`Item ${!current ? 'published to' : 'hidden from'} landing page`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Toggle failed');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedFile) {
      toast.error('Please provide a title and select a photo to upload');
      return;
    }
    setUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const { publicUrl, storagePath } = await uploadGalleryImage(selectedFile);

      // 2. Create record
      const created = await createGalleryItem({
        title,
        category,
        imageUrl: publicUrl,
        storagePath,
        aspectRatio,
        sortOrder,
        isActive: true,
      });

      setItems((prev) => [created, ...prev]);
      toast.success('Photo uploaded to Gallery CMS & published to landing page!');
      setCreateModalOpen(false);
      setTitle('');
      setSelectedFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGalleryItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Gallery photo deleted');
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Gallery CMS</h1>
              <p className="text-sm text-foreground-muted">
                Manage high-resolution showcase imagery on the public landing page with Supabase Storage.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/#gallery"
                target="_blank"
                className="btn-silver px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5"
              >
                <ExternalLink size={14} />
                <span>View Live Gallery</span>
              </Link>
              <button
                onClick={loadGallery}
                className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
                title="Refresh gallery"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="btn-gold px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={15} />
                <span>Upload Photo</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                type="text"
                placeholder="Search gallery photos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-luxury w-full pl-9 pr-4 py-2 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs text-foreground-muted">Category:</span>
              <div className="flex items-center gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      categoryFilter === cat
                        ? 'bg-primary/20 text-primary border border-gold font-bold'
                        : 'bg-muted/40 text-foreground-muted hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Gallery Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading && (
              <div className="col-span-full py-16 text-center text-xs text-foreground-muted">
                <RefreshCw size={20} className="animate-spin text-primary mx-auto mb-2" />
                Loading gallery photos from Supabase...
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="col-span-full bg-card border border-border rounded-2xl p-12 text-center text-xs text-foreground-muted">
                <ImageIcon size={28} className="text-foreground-muted/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">No photos found</p>
                <p className="mt-1">Click &quot;Upload Photo&quot; to add luxury photography to your landing page.</p>
              </div>
            )}
            {!loading &&
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-xl overflow-hidden shadow-card group hover:border-gold transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-muted/40 overflow-hidden">
                    <AppImage
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-md text-foreground border border-border">
                        {item.category}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleToggleActive(item.id, item.isActive)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-sm transition-colors ${
                          item.isActive
                            ? 'bg-success/20 text-success border-success/40'
                            : 'bg-muted text-foreground-muted border-border'
                        }`}
                      >
                        {item.isActive ? 'Active on Home' : 'Hidden'}
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-foreground truncate">{item.title}</h4>
                      <p className="text-[10px] text-foreground-muted capitalize">
                        {item.aspectRatio} · Order: #{item.sortOrder}
                      </p>
                    </div>
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 rounded-md hover:bg-danger/10 text-foreground-muted hover:text-danger transition-colors flex-shrink-0"
                      title="Delete photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Upload Photo Modal */}
          {createModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
              <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-card-hover p-6 z-10">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <h3 className="text-base font-bold text-foreground">Upload Landing Page Photo</h3>
                  <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded text-foreground-muted hover:text-foreground">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                      Photo Title / Caption *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elegant Traditional Wedding Showcase"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input-luxury w-full px-3 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-luxury w-full px-3 py-2 bg-muted/40"
                      >
                        {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                        Aspect Ratio
                      </label>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as 'portrait' | 'landscape' | 'square')}
                        className="input-luxury w-full px-3 py-2 bg-muted/40"
                      >
                        <option value="landscape">Landscape (16:9 / 4:3)</option>
                        <option value="portrait">Portrait (3:4)</option>
                        <option value="square">Square (1:1)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                      Select Photo File *
                    </label>
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="input-luxury w-full px-3 py-2"
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
                      disabled={uploading}
                      className="btn-gold px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                    >
                      {uploading && <Loader2 size={13} className="animate-spin" />}
                      Upload to Supabase Storage
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
                <h4 className="text-sm font-bold text-foreground mb-2">Delete Gallery Photo</h4>
                <p className="text-xs text-foreground-muted mb-5">
                  Are you sure you want to delete this photo from the gallery and storage?
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setDeleteConfirmId(null)} className="btn-silver flex-1 py-2 text-xs font-medium rounded-lg">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(deleteConfirmId)} className="btn-gold flex-1 py-2 text-xs font-semibold rounded-lg bg-danger hover:bg-danger/90 text-white">
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
