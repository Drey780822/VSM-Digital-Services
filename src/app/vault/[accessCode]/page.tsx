'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Sparkles,
  Download,
  Eye,
  Calendar,
  Heart,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import AppImage from '@/components/ui/AppImage';
import AppLogo from '@/components/ui/AppLogo';
import {
  getVaultByAccessCode,
  incrementVaultViews,
  incrementVaultDownloads,
  type MemoryVaultRecord,
} from '@/lib/services/vaults.service';
import { formatDate } from '@/lib/services/supabase-helpers';

export default function ClientMemoryVaultPage() {
  const params = useParams();
  const accessCode = (params?.accessCode as string) || '';

  const [vault, setVault] = useState<MemoryVaultRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [favoritedIds, setFavoritedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!accessCode) return;
    setLoading(true);
    getVaultByAccessCode(accessCode)
      .then((data) => {
        setVault(data);
        if (data) incrementVaultViews(data.id).catch(() => {});
      })
      .catch(() => {
        toast.error('Failed to load memory vault');
      })
      .finally(() => setLoading(false));
  }, [accessCode]);

  const handleToggleFavorite = (fileId: string) => {
    setFavoritedIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
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
    toast.success('Downloading high-resolution photo...');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Gallery link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 size={32} className="animate-spin text-primary mb-3" />
        <p className="text-sm font-semibold text-foreground">Unlocking Memory Vault...</p>
        <p className="text-xs text-foreground-muted mt-1">Fetching your curated photographs</p>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/40 border border-border flex items-center justify-center text-primary mb-4">
          <Lock size={28} />
        </div>
        <h1 className="text-xl font-bold text-foreground">Memory Vault Not Found</h1>
        <p className="text-xs text-foreground-muted max-w-sm mt-2">
          The access code <span className="font-mono text-primary font-bold">{accessCode}</span> is invalid or has expired. Please verify your link or contact VSM Digital Services.
        </p>
      </div>
    );
  }

  const files = vault.files || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AppLogo size={28} />
          <div>
            <span className="text-sm font-display font-semibold text-gradient-gold block leading-none">
              VSM Digital Services
            </span>
            <span className="text-[10px] text-foreground-muted uppercase tracking-wider">
              Private Memory Vault
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="btn-silver px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5"
          >
            <Share2 size={13} />
            <span className="hidden sm:inline">Share Vault</span>
          </button>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative h-72 sm:h-96 w-full flex items-end justify-start overflow-hidden border-b border-border">
        {vault.coverImageUrl ? (
          <AppImage src={vault.coverImageUrl} alt={vault.title} fill className="object-cover brightness-75" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-card to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="relative z-10 p-6 sm:p-12 max-w-4xl space-y-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 border border-gold px-3 py-1 rounded-full">
            <Sparkles size={11} /> {vault.eventType || 'Photography Collection'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
            {vault.title}
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-primary" /> {formatDate(vault.eventDate)}
            </span>
            <span>·</span>
            <span>Dedicated to {vault.clientName}</span>
            <span>·</span>
            <span>{files.length} High-Resolution Photos</span>
          </p>
        </div>
      </section>

      {/* Delivery Message */}
      {vault.deliveryNotes && (
        <section className="max-w-4xl mx-auto px-6 py-6 w-full">
          <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 text-center space-y-1 shadow-card">
            <Sparkles size={20} className="text-primary mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-foreground italic leading-relaxed">
              &quot;{vault.deliveryNotes}&quot;
            </p>
            <p className="text-[11px] text-primary font-medium pt-1">
              — Vincent S. Mabogoane & Team
            </p>
          </div>
        </section>
      )}

      {/* Photos Masonry / Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {files.length === 0 ? (
          <div className="text-center py-20 text-foreground-muted">
            <p className="text-sm font-semibold text-foreground">Photos are being processed</p>
            <p className="text-xs mt-1">Our editors are finalizing your high-resolution gallery.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, idx) => (
              <div
                key={file.id}
                className="relative rounded-xl overflow-hidden group aspect-square bg-card border border-border shadow-card cursor-pointer"
                onClick={() => setLightboxIndex(idx)}
              >
                <AppImage src={file.fileUrl} alt={file.fileName} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-3 flex-col">
                  <div className="w-full flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(file.id);
                      }}
                      className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                        favoritedIds.includes(file.id) ? 'bg-primary text-background' : 'bg-background/70 text-foreground hover:text-primary'
                      }`}
                      title="Favorite"
                    >
                      <Heart size={14} fill={favoritedIds.includes(file.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <span className="text-[10px] text-foreground font-medium truncate max-w-[120px]">{file.fileName}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSingle(file.fileUrl, file.fileName);
                      }}
                      className="p-2 rounded-full bg-background/80 hover:bg-primary hover:text-background text-foreground transition-colors backdrop-blur-md"
                      title="Download photo"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && files[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-muted/60 text-foreground hover:text-primary z-50"
          >
            <X size={24} />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={() => setLightboxIndex(lightboxIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-muted/60 text-foreground hover:text-primary z-50"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {lightboxIndex < files.length - 1 && (
            <button
              onClick={() => setLightboxIndex(lightboxIndex + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-muted/60 text-foreground hover:text-primary z-50"
            >
              <ChevronRight size={24} />
            </button>
          )}

          <div className="relative max-w-5xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full h-[75vh]">
              <AppImage
                src={files[lightboxIndex].fileUrl}
                alt={files[lightboxIndex].fileName}
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-4 flex items-center justify-between w-full max-w-md px-4">
              <span className="text-xs text-foreground-muted">
                {lightboxIndex + 1} of {files.length}
              </span>
              <button
                onClick={() => handleDownloadSingle(files[lightboxIndex].fileUrl, files[lightboxIndex].fileName)}
                className="btn-gold px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Download size={14} />
                Download High-Res
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-foreground-muted">
        <p>© {new Date().getFullYear()} VSM Digital Services · Crafted with luxury in South Africa</p>
      </footer>
    </div>
  );
}
