'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Download,
  Calendar,
  Heart,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  ShieldCheck,
  Check,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Layers,
  HardDrive
} from 'lucide-react';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import {
  getVaultByAccessCode,
  incrementVaultViews,
  incrementVaultDownloads,
  type MemoryVaultRecord,
  type VaultFileRecord
} from '@/lib/services/vaults.service';
import { formatDate } from '@/lib/services/supabase-helpers';

export default function ClientMemoryVaultPage() {
  const params = useParams();
  const router = useRouter();
  const rawCode = (params?.accessCode as string) || '';
  const accessCode = decodeURIComponent(rawCode).trim().toUpperCase();

  const [vault, setVault] = useState<MemoryVaultRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [favoritedIds, setFavoritedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!accessCode) return;
    setLoading(true);
    getVaultByAccessCode(accessCode)
      .then((data) => {
        setVault(data);
        if (data) {
          incrementVaultViews(data.id).catch(() => {});
        }
      })
      .catch((err) => {
        console.error('Error loading vault:', err);
        toast.error('Failed to load memory vault');
      })
      .finally(() => setLoading(false));
  }, [accessCode]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null || !vault?.files) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev !== null && prev < (vault.files?.length || 1) - 1 ? prev + 1 : prev
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, vault]);

  const handleToggleFavorite = (fileId: string) => {
    setFavoritedIds((prev) => {
      const next = prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId];
      toast.success(prev.includes(fileId) ? 'Removed from favorites' : 'Added to favorites');
      return next;
    });
  };

  const handleDownloadSingle = async (fileUrl: string, fileName: string) => {
    if (!vault) return;
    incrementVaultDownloads(vault.id).catch(() => {});
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName || 'vsm-photo.jpg';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Starting high-resolution download...');
  };

  const handleDownloadAll = () => {
    if (!vault || !vault.files || vault.files.length === 0) return;
    incrementVaultDownloads(vault.id).catch(() => {});
    toast.info(`Downloading ${vault.files.length} high-resolution captures...`);
    vault.files.forEach((file, index) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = file.fileUrl;
        a.download = file.fileName;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 300);
    });
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Private vault link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-near-black flex flex-col items-center justify-center p-6 text-center">
        <Loader2 size={36} className="animate-spin text-vsm-gold mb-4" />
        <p className="text-base font-bold text-white tracking-wide">Unlocking Private Memory Vault...</p>
        <p className="text-xs text-white/50 mt-1">Retrieving verified photographic collections</p>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen bg-near-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-deep-navy border border-vsm-gold/30 flex items-center justify-center text-vsm-gold mb-5 shadow-2xl">
          <Lock size={28} />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Memory Vault Not Found</h1>
        <p className="text-sm text-white/60 max-w-md mx-auto mb-6 leading-relaxed">
          The access code <span className="font-mono text-vsm-gold font-bold">{accessCode}</span> could not be verified or has expired.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/vault"
            className="btn-gold px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            Try Another Code
          </Link>
          <button
            onClick={() => router.push('/vault/VSM-8492')}
            className="px-5 py-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 text-xs font-semibold uppercase tracking-wider"
          >
            Open Demo Vault
          </button>
        </div>
      </div>
    );
  }

  const allFiles = vault.files || [];
  const displayFiles =
    activeFilter === 'favorites'
      ? allFiles.filter((f) => favoritedIds.includes(f.id))
      : allFiles;

  return (
    <div className="min-h-screen bg-near-black text-clear-white flex flex-col font-sans selection:bg-vsm-gold/20 selection:text-white">
      {/* Top Floating Glass Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-near-black/85 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/vault" className="text-white/60 hover:text-white transition-colors pr-2">
            <ArrowLeft size={18} />
          </Link>
          <AppLogo size={32} />
          <div className="hidden sm:block">
            <span className="text-sm font-bold text-white block leading-tight">
              VSM Memory Vault
            </span>
            <span className="text-[10px] text-vsm-gold uppercase tracking-widest font-semibold">
              Private Client Archive
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-deep-navy border border-vsm-gold/25 text-xs text-white/80 font-mono">
            <Lock size={12} className="text-vsm-gold" />
            <span>{vault.accessCode}</span>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check size={13} className="text-green-400" /> : <Share2 size={13} />}
            <span className="hidden sm:inline">{copied ? 'Link Copied' : 'Share Vault'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAll}
            className="btn-gold px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Download All</span>
          </button>
        </div>
      </header>

      {/* Hero Cover Banner */}
      <section className="relative w-full h-[340px] sm:h-[440px] lg:h-[480px] overflow-hidden border-b border-white/5">
        <img
          src={vault.coverImageUrl || '/assets/images/vsm_snaps/brideandgroom.jpg'}
          alt={vault.title}
          className="w-full h-full object-cover brightness-[0.65]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-near-black via-near-black/50 to-transparent" />

        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-12 max-w-6xl mx-auto z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-deep-navy/90 border border-vsm-gold/30 text-vsm-gold text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles size={12} />
              <span>{vault.eventType || 'Event Production'}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium backdrop-blur-md">
              <CheckCircle2 size={12} className="text-vsm-gold" />
              <span>Verified VSM Master Delivery</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
            {vault.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-vsm-gold" />
              <span>Captured {formatDate(vault.eventDate)}</span>
            </span>
            <span>•</span>
            <span>Curated for {vault.clientName}</span>
            <span>•</span>
            <span className="font-semibold text-white">{allFiles.length} High-Res Assets</span>
          </div>
        </div>
      </section>

      {/* Vault Status & Preservation Guarantee Strip */}
      <section className="border-b border-white/5 bg-deep-navy/30 py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <HardDrive size={16} className="text-vsm-gold flex-shrink-0" />
            <span className="text-white/70">
              Preservation Tier:{' '}
              <strong className="text-white capitalize">{vault.tier || 'Included Vault'}</strong> (60-day active window).
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/50 flex items-center gap-1">
              <Eye size={12} className="text-vsm-gold" /> {vault.viewCount} views
            </span>
            <span className="text-white/50 flex items-center gap-1">
              <Download size={12} className="text-vsm-gold" /> {vault.downloadCount} downloads
            </span>
            <Link
              href="/book"
              className="text-vsm-gold hover:underline font-bold tracking-wide uppercase text-[11px]"
            >
              Extend or Upgrade Archive →
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Controls & Filter Bar */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-4 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Curated Gallery Collection
          </h2>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Click any photograph to view in full resolution or download original uncompressed files.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1 rounded-full bg-deep-navy/70 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeFilter === 'all'
                ? 'bg-vsm-gold text-near-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            All Captures ({allFiles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('favorites')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeFilter === 'favorites'
                ? 'bg-vsm-gold text-near-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Heart size={12} fill={activeFilter === 'favorites' ? 'currentColor' : 'none'} />
            <span>Favorites ({favoritedIds.length})</span>
          </button>
        </div>
      </section>

      {/* Media Masonry Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {displayFiles.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl p-8 bg-deep-navy/20">
            <Heart size={32} className="text-white/30 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Favorite Captures Yet</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto mb-4">
              Hover over any photograph in the collection and click the heart icon to save your personal favorites.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="px-5 py-2 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20"
            >
              View All Photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayFiles.map((file, idx) => {
              const isFav = favoritedIds.includes(file.id);
              return (
                <div
                  key={file.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 hover:border-vsm-gold/60 transition-all duration-300 cursor-pointer shadow-xl bg-corporate-navy/30"
                >
                  <img
                    src={file.fileUrl}
                    alt={file.fileName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-near-black/90 via-transparent to-black/30 opacity-60 group-hover:opacity-90 transition-opacity" />

                  {/* Top action buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(file.id);
                      }}
                      className={`p-2 rounded-full backdrop-blur-md transition-all ${
                        isFav
                          ? 'bg-vsm-gold text-near-black'
                          : 'bg-near-black/70 text-white hover:text-vsm-gold border border-white/20'
                      }`}
                      title={isFav ? 'Remove favorite' : 'Mark favorite'}
                    >
                      <Heart size={13} fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSingle(file.fileUrl, file.fileName);
                      }}
                      className="p-2 rounded-full bg-near-black/70 text-white hover:text-vsm-gold border border-white/20 backdrop-blur-md transition-all"
                      title="Download photo"
                    >
                      <Download size={13} />
                    </button>
                  </div>

                  {/* Bottom title label */}
                  <div className="absolute bottom-0 inset-x-0 p-3.5 z-10">
                    <span className="text-[11px] text-white/90 font-bold block truncate drop-shadow-md">
                      {file.fileName.replace(/_/g, ' ').replace(/\.[^/.]+$/, '')}
                    </span>
                    <span className="text-[10px] text-vsm-gold font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to expand
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && displayFiles[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-near-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-vsm-gold hover:text-near-black text-white flex items-center justify-center transition-all z-50 border border-white/15"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {lightboxIndex > 0 && (
            <button
              type="button"
              onClick={() => setLightboxIndex(lightboxIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-vsm-gold hover:text-near-black text-white flex items-center justify-center transition-all z-50 border border-white/15"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {lightboxIndex < displayFiles.length - 1 && (
            <button
              type="button"
              onClick={() => setLightboxIndex(lightboxIndex + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-vsm-gold hover:text-near-black text-white flex items-center justify-center transition-all z-50 border border-white/15"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          )}

          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full h-[76vh] flex items-center justify-center">
              <img
                src={displayFiles[lightboxIndex].fileUrl}
                alt={displayFiles[lightboxIndex].fileName}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            </div>

            <div className="mt-4 flex items-center justify-between w-full max-w-xl px-4 py-2 rounded-full bg-deep-navy/80 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/50 font-mono">
                  {lightboxIndex + 1} / {displayFiles.length}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[200px]">
                  {displayFiles[lightboxIndex].fileName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(displayFiles[lightboxIndex].id)}
                  className={`p-2 rounded-full transition-all ${
                    favoritedIds.includes(displayFiles[lightboxIndex].id)
                      ? 'bg-vsm-gold text-near-black'
                      : 'bg-white/10 text-white hover:text-vsm-gold'
                  }`}
                  title="Favorite"
                >
                  <Heart
                    size={14}
                    fill={favoritedIds.includes(displayFiles[lightboxIndex].id) ? 'currentColor' : 'none'}
                  />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadSingle(
                      displayFiles[lightboxIndex].fileUrl,
                      displayFiles[lightboxIndex].fileName
                    )
                  }
                  className="btn-gold px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download Original</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/40">
        <p>© {new Date().getFullYear()} VSM Digital Services · Memory Vault Cloud Delivery · POPIA Compliant</p>
      </footer>
    </div>
  );
}
