'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CircularGallery from '@/components/ui/CircularGallery';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';

const SNAP_ITEMS = [
  {
    image: '/assets/images/vsm_snaps/Graduate.jpg',
    text: 'Academic Excellence',
    description: 'Tshwane University of Technology & University Graduation celebrations captured with dignity and pride.',
    alt: 'Graduate celebrating milestone'
  },
  {
    image: '/assets/images/vsm_snaps/brideandgroom.jpg',
    text: 'Royal Matrimony',
    description: 'Timeless wedding cinematography and portraits honoring sacred vows.',
    alt: 'Bride and Groom portrait'
  },
  {
    image: '/assets/images/vsm_snaps/grooves.jpg',
    text: 'Cultural Grooves',
    description: 'Electric nightlife, festivals, and music energy documented with vivid precision.',
    alt: 'Groove and party celebration'
  },
  {
    image: '/assets/images/vsm_snaps/churchdays.jpg',
    text: 'Sacred Gatherings',
    description: 'Reverent fellowship, worship, and Sunday devotion recorded with grace.',
    alt: 'Church congregation and fellowship'
  },
  {
    image: '/assets/images/vsm_snaps/best_mans.jpg',
    text: 'Brotherhood & Joy',
    description: 'Unfiltered candid moments and life-long bonds shared between groomsmen.',
    alt: 'Groomsmen celebrating'
  },
  {
    image: '/assets/images/vsm_snaps/girl_graduating.jpg',
    text: 'Next Generation',
    description: 'Stepping boldly into the professional arena with celebration and hope.',
    alt: 'Graduating student portrait'
  },
  {
    image: '/assets/images/vsm_snaps/kasi_gents.jpg',
    text: 'Street Elegance',
    description: 'Township heritage, sharp fashion, and authentic urban lifestyle expression.',
    alt: 'Gentlemen in urban attire'
  },
  {
    image: '/assets/images/vsm_snaps/ladiesss.jpg',
    text: 'Sisterhood & Radiance',
    description: 'Special occasions, birthdays, and baby showers bathed in radiant golden hour light.',
    alt: 'Ladies gathering celebration'
  },
  {
    image: '/assets/images/vsm_snaps/cake.jpg',
    text: 'The Fine Details',
    description: 'Carefully curated decor, bespoke cakes, and atmospheric party styling.',
    alt: 'Celebration cake and decor'
  },
  {
    image: '/assets/images/vsm_snaps/vibes.jpg',
    text: 'Unfiltered Energy',
    description: 'Vibrant outdoor pool parties, milestone birthdays, and unforgettable weekend grooves.',
    alt: 'Outdoor celebration vibe'
  }
];

export default function GallerySection() {
  const router = useRouter();
  const [vaultCode, setVaultCode] = useState('');

  const handleAccessVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultCode.trim()) {
      router.push(`/vault/${vaultCode.trim().toUpperCase()}`);
    }
  };

  return (
    <section id="gallery" className="relative py-28 lg:py-36 bg-near-black overflow-hidden border-b border-white/5">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-deep-navy/35 blur-[120px] pointer-events-none rounded-full" />
      
      {/* Section Header with Generous Minimalist Spacing */}
      <div className="max-w-5xl mx-auto px-6 text-center mb-16 relative z-10">
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
      </div>

      {/* 3D WebGL Circular Gallery */}
      <div className="relative w-full h-[580px] lg:h-[650px] z-10">
        <CircularGallery
          items={SNAP_ITEMS}
          bend={2.6}
          textColor="#FFFFFF"
          borderRadius={0.06}
          scrollEase={0.04}
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
