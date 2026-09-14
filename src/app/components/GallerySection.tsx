'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import { fetchGalleryItems, type GalleryItemRecord } from '@/lib/services/gallery.service';

const CATEGORIES = ['All', 'Wedding', 'Birthday', 'Corporate', 'Graduation', 'Funeral', 'Groove'];

interface DisplayGalleryItem {
  id: string;
  category: string;
  title: string;
  location: string;
  src: string;
  alt: string;
  span: string;
}

export default function GallerySection() {
  const router = useRouter();
  const [items, setItems] = useState<DisplayGalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [vaultCode, setVaultCode] = useState('');

  useEffect(() => {
    fetchGalleryItems(true)
      .then((data: GalleryItemRecord[]) => {
        if (data && data.length > 0) {
          setItems(
            data.map((item, idx) => ({
              id: item.id,
              category: item.category,
              title: item.title,
              location: 'South Africa',
              src: item.imageUrl,
              alt: item.title,
              span: idx === 0 ? 'col-span-2 row-span-2' : idx === 5 ? 'col-span-2' : '',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const filtered = activeCategory === 'All'
    ? items
    : items.filter((g) => g.category.toLowerCase() === activeCategory.toLowerCase());

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevItem = () =>
    setLightboxIndex((i) => (i !== null ? (i - 1 + filtered.length) % filtered.length : null));
  const nextItem = () =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % filtered.length : null));

  const handleAccessVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultCode.trim()) {
      router.push(`/vault/${encodeURIComponent(vaultCode.trim())}`);
    }
  };

  return (
    <section id="gallery" className="relative py-24 lg:py-32 bg-background overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
            Our Work
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-light text-foreground mb-4">
            Moments We&apos;ve <span className="text-gradient-gold italic">Preserved</span>
          </h2>
          <p className="text-foreground-muted max-w-xl mx-auto text-base leading-relaxed">
            A curated selection from our portfolio. Every event tells a story — we make sure
            it&apos;s told beautifully.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={`cat-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-gold-gradient text-background shadow-sm'
                  : 'bg-muted text-foreground-muted hover:text-foreground hover:bg-background-elevated border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px]">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className={`relative rounded-xl overflow-hidden group cursor-pointer ${item.span}`}
              onClick={() => openLightbox(i)}
            >
              <AppImage
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-semibold text-primary tracking-wide mb-1">
                  {item.category}
                </span>
                <span className="text-sm font-semibold text-foreground">{item.title}</span>
                <span className="text-xs text-foreground-muted">{item.location}</span>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ZoomIn size={14} className="text-primary" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Memory Vault CTA & Direct Access Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 px-6 py-4 bg-glass border border-gold rounded-2xl shadow-card max-w-xl w-full">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Lock size={18} className="text-primary flex-shrink-0" />
              <div className="text-left">
                <span className="text-xs font-bold text-foreground block">
                  Access Your Private Memory Vault
                </span>
                <span className="text-[11px] text-foreground-muted block">
                  Enter the 8-character access code from your delivery confirmation.
                </span>
              </div>
            </div>

            <form onSubmit={handleAccessVault} className="flex items-center gap-1.5 w-full sm:w-auto">
              <input
                type="text"
                placeholder="e.g. WED-9482"
                value={vaultCode}
                onChange={(e) => setVaultCode(e.target.value.toUpperCase())}
                className="input-luxury px-3 py-1.5 text-xs font-mono w-28 text-center"
              />
              <button
                type="submit"
                className="btn-gold px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 flex-shrink-0"
              >
                <span>Unlock</span>
                <ArrowRight size={12} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-4xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <AppImage
                  src={filtered[lightboxIndex].src}
                  alt={filtered[lightboxIndex].alt}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary tracking-wide">
                    {filtered[lightboxIndex].category}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">
                    {filtered[lightboxIndex].title}
                  </h3>
                  <p className="text-sm text-foreground-muted">{filtered[lightboxIndex].location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevItem}
                    className="w-10 h-10 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={18} className="text-foreground" />
                  </button>
                  <button
                    onClick={nextItem}
                    className="w-10 h-10 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight size={18} className="text-foreground" />
                  </button>
                </div>
              </div>
              <button
                onClick={closeLightbox}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-glass border border-gold flex items-center justify-center hover:bg-primary/20 transition-colors"
                aria-label="Close lightbox"
              >
                <X size={16} className="text-foreground" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}