'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CircularGallery from '@/components/ui/CircularGallery';
import { Lock, ArrowRight, Sparkles, LayoutGrid, Eye, X, CheckCircle2 } from 'lucide-react';

interface SnapItem {
  image: string;
  text: string;
  category: string;
  description: string;
  alt: string;
}

const SNAP_ITEMS: SnapItem[] = [
  {
    image: '/assets/images/vsm_snaps/Graduate.jpg',
    text: 'Academic Excellence',
    category: 'Graduation',
    description: 'Tshwane University of Technology & University Graduation celebrations captured with dignity and pride.',
    alt: 'Graduate celebrating milestone'
  },
  {
    image: '/assets/images/vsm_snaps/brideandgroom.jpg',
    text: 'Royal Matrimony',
    category: 'Wedding',
    description: 'Timeless wedding cinematography and portraits honoring sacred vows.',
    alt: 'Bride and Groom portrait'
  },
  {
    image: '/assets/images/vsm_snaps/grooves.jpg',
    text: 'Cultural Grooves',
    category: 'Nightlife & Groove',
    description: 'Electric nightlife, festivals, and music energy documented with vivid precision.',
    alt: 'Groove and party celebration'
  },
  {
    image: '/assets/images/vsm_snaps/churchdays.jpg',
    text: 'Sacred Gatherings',
    category: 'Devotion',
    description: 'Reverent fellowship, worship, and Sunday devotion recorded with grace.',
    alt: 'Church congregation and fellowship'
  },
  {
    image: '/assets/images/vsm_snaps/best_mans.jpg',
    text: 'Brotherhood & Joy',
    category: 'Groomsmen',
    description: 'Unfiltered candid moments and life-long bonds shared between groomsmen.',
    alt: 'Groomsmen celebrating'
  },
  {
    image: '/assets/images/vsm_snaps/girl_graduating.jpg',
    text: 'Next Generation',
    category: 'Graduation',
    description: 'Stepping boldly into the professional arena with celebration and hope.',
    alt: 'Graduating student portrait'
  },
  {
    image: '/assets/images/vsm_snaps/kasi_gents.jpg',
    text: 'Street Elegance',
    category: 'Urban Lifestyle',
    description: 'Township heritage, sharp fashion, and authentic urban lifestyle expression.',
    alt: 'Gentlemen in urban attire'
  },
  {
    image: '/assets/images/vsm_snaps/ladiesss.jpg',
    text: 'Sisterhood & Radiance',
    category: 'Celebration',
    description: 'Special occasions, birthdays, and baby showers bathed in radiant golden hour light.',
    alt: 'Ladies gathering celebration'
  },
  {
    image: '/assets/images/vsm_snaps/cake.jpg',
    text: 'The Fine Details',
    category: 'Decor & Styling',
    description: 'Carefully curated decor, bespoke cakes, and atmospheric party styling.',
    alt: 'Celebration cake and decor'
  },
  {
    image: '/assets/images/vsm_snaps/vibes.jpg',
    text: 'Unfiltered Energy',
    category: 'Parties & Vibes',
    description: 'Vibrant outdoor pool parties, milestone birthdays, and unforgettable weekend grooves.',
    alt: 'Outdoor celebration vibe'
  }
];

export default function GallerySection() {
  const router = useRouter();
  const [vaultCode, setVaultCode] = useState('');
  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d');
  const [selectedItem, setSelectedItem] = useState<SnapItem | null>(null);

  const handleAccessVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultCode.trim()) {
      router.push(`/vault/${vaultCode.trim().toUpperCase()}`);
    }
  };

  return (
    <section id="gallery" className="relative py-24 lg:py-32 bg-near-black overflow-hidden border-b border-white/5">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-deep-navy/40 blur-[130px] pointer-events-none rounded-full" />
      
      {/* Section Header with Generous Minimalist Spacing */}
      <div className="max-w-5xl mx-auto px-6 text-center mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-navy border border-vsm-gold/25 text-vsm-gold text-xs font-semibold uppercase tracking-widest mb-4">
          <Sparkles size={13} className="text-vsm-gold" />
          <span>Curated Moments</span>
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-5">
          Moments That Live Forever.
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-white/60 max-w-2xl mx-auto font-normal leading-relaxed">
          From high-energy cultural grooves to intimate ceremonies and milestone celebrations,
          experience life captured through the lens of VSM creators.
        </p>

        {/* View Mode Switcher */}
        <div className="mt-8 inline-flex items-center p-1.5 rounded-full bg-corporate-navy/80 border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              viewMode === '3d'
                ? 'bg-vsm-gold text-near-black shadow-lg shadow-vsm-gold/20'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sparkles size={13} />
            <span>3D Arc Flow</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-vsm-gold text-near-black shadow-lg shadow-vsm-gold/20'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <LayoutGrid size={13} />
            <span>Editorial Mosaic</span>
          </button>
        </div>
      </div>

      {/* Main Showcase Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {viewMode === '3d' ? (
          <div>
            <div className="relative w-full h-[580px] lg:h-[650px]">
              <CircularGallery
                items={SNAP_ITEMS}
                bend={2.5}
                textColor="#FFFFFF"
                borderRadius={0.06}
                scrollEase={0.05}
                scrollSpeed={2.2}
                wave={0.7}
                itemSize={1.05}
                itemAspect={0.75}
                gap={0.24}
                shadow={0.35}
                openOnClick={true}
              />
            </div>
            {/* Helper Interaction Hint */}
            <div className="text-center mt-6 text-xs text-white/40 tracking-wider uppercase font-medium">
              Drag or scroll horizontally to browse • Click any card to expand details
            </div>
          </div>
        ) : (
          /* Editorial Grid Mode */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {SNAP_ITEMS.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedItem(item)}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 hover:border-vsm-gold/60 transition-all duration-300 cursor-pointer shadow-xl bg-corporate-navy/30"
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-near-black/90 via-near-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 rounded-full bg-deep-navy/80 backdrop-blur-md border border-vsm-gold/30 text-vsm-gold text-[10px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <h4 className="text-white text-sm sm:text-base font-bold font-manrope leading-snug line-clamp-1">
                    {item.text}
                  </h4>
                  <div className="flex items-center gap-1.5 text-vsm-gold text-xs font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye size={12} />
                    <span>View Moment</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Detail Modal for Selected Moment */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-near-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-deep-navy border border-vsm-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-vsm-gold hover:text-near-black transition-all z-20"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden mb-6 shadow-inner border border-white/10">
              <img
                src={selectedItem.image}
                alt={selectedItem.alt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-vsm-gold/15 border border-vsm-gold/30 text-vsm-gold text-xs font-bold uppercase tracking-wider">
                {selectedItem.category}
              </span>
              <span className="text-white/40 text-xs flex items-center gap-1">
                <CheckCircle2 size={12} className="text-vsm-gold" /> Verified VSM Production
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-manrope">
              {selectedItem.text}
            </h3>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6">
              {selectedItem.description}
            </p>
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 rounded-full border border-white/20 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  router.push('/book');
                }}
                className="btn-gold px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>Book This Coverage</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimalist Memory Vault Access Strip */}
      <div className="max-w-xl mx-auto px-6 mt-16 relative z-10">
        <form
          onSubmit={handleAccessVault}
          className="p-2 sm:p-2.5 rounded-full bg-deep-navy/70 border border-vsm-gold/20 backdrop-blur-xl flex items-center justify-between shadow-2xl transition-all hover:border-vsm-gold/40"
        >
          <div className="flex items-center gap-3 pl-4 flex-1">
            <Lock size={16} className="text-vsm-gold flex-shrink-0" />
            <input
              type="text"
              value={vaultCode}
              onChange={(e) => setVaultCode(e.target.value)}
              placeholder="Enter Private Memory Vault Code (e.g. VSM-8492)"
              className="w-full bg-transparent text-white placeholder-white/40 text-xs sm:text-sm font-medium outline-none"
            />
          </div>
          <button
            type="submit"
            className="btn-gold px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 flex-shrink-0"
          >
            <span>Open Vault</span>
            <ArrowRight size={13} />
          </button>
        </form>
      </div>
    </section>
  );
}
