'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ArrowRight, Sparkles, Building2 } from 'lucide-react';

const HERO_SLIDES = [
  {
    image: '/assets/images/vsm_snaps/brideandgroom.jpg',
    category: 'Cinematic Weddings',
    tagline: 'Timeless African matrimony documented with royal elegance.',
  },
  {
    image: '/assets/images/vsm_snaps/Graduate.jpg',
    category: 'Graduation Milestones',
    tagline: 'Academic triumphs and hard-earned pride preserved forever.',
  },
  {
    image: '/assets/images/vsm_snaps/grooves.jpg',
    category: 'Cultural Grooves & Festivals',
    tagline: 'High-energy nightlife and cultural expression in vivid clarity.',
  },
  {
    image: '/assets/images/vsm_snaps/churchdays.jpg',
    category: 'Sacred Gatherings',
    tagline: 'Sunday worship, solemn reverence, and joyful fellowship.',
  },
  {
    image: '/assets/images/vsm_snaps/best_mans.jpg',
    category: 'Brotherhood Celebrations',
    tagline: 'Unfiltered candid moments and life-long memories.',
  },
  {
    image: '/assets/images/vsm_snaps/kasi_gents.jpg',
    category: 'Urban Lifestyle & Style',
    tagline: 'Township heritage and modern street elegance.',
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-near-black pt-28 pb-20">
      {/* Background Slideshow with Smooth Crossfade & Ken Burns Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_SLIDES[currentSlide].image}
              alt={HERO_SLIDES[currentSlide].category}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Multi-layered Vignette & Brand Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-near-black via-near-black/80 to-near-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-near-black/90 via-transparent to-near-black/95" />
        <div className="absolute inset-0 bg-deep-navy/30 mix-blend-multiply" />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-deep-navy/40 blur-[150px] rounded-full" />
        <div className="absolute -top-16 right-10 w-96 h-96 bg-vsm-gold/10 blur-[120px] rounded-full" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Minimalist Top Badge */}

        {/* Primary Headline with Manrope */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-8 max-w-4xl mx-auto"
        >
          Capture Important Moments. <br />
          <span className="text-gradient-gold">Preserve Everlasting Memories.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl text-white/75 max-w-2xl mx-auto mb-12 font-normal leading-relaxed"
        >
          The dedicated platform for everyday mini-events, cinematic wedding packages,
          and enterprise summits — with intelligent, flexible financing when your moment demands it.
        </motion.p>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/book"
            className="btn-gold w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-bold uppercase tracking-wider rounded-full shadow-gold"
          >
            <Camera size={16} />
            <span>Book Your Event</span>
            <ArrowRight size={15} />
          </Link>
          <a
            href="#business-brief"
            className="btn-silver w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 text-sm font-semibold rounded-full bg-deep-navy/60 backdrop-blur-md hover:bg-deep-navy"
          >
            <Building2 size={16} className="text-vsm-gold" />
            <span>VSM for Business</span>
          </a>
        </motion.div>

        {/* Slideshow Progress Bar & Live Category Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.category}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 transition-all duration-500 rounded-full ${
                  currentSlide === idx
                    ? 'w-8 bg-vsm-gold shadow-[0_0_10px_#D4AF37]'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}: ${slide.category}`}
              />
            ))}
          </div>
          <span className="text-[11px] text-white/60 tracking-wider uppercase font-medium">
            {HERO_SLIDES[currentSlide].category}
          </span>
        </motion.div>


      </div>
    </section>
  );
}
