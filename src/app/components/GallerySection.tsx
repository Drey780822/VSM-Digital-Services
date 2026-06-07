'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

const GALLERY_ITEMS = [
{ id: 'gal-1', category: 'Wedding', title: 'Nkosi & Zanele Wedding', location: 'Sandton, JHB', src: "https://img.rocket.new/generatedImages/rocket_gen_img_133f668c9-1772253538405.png", alt: 'Bride and groom sharing a romantic first look at a luxury Johannesburg wedding venue', span: 'col-span-2 row-span-2' },
{ id: 'gal-2', category: 'Birthday', title: 'Thandi 30th Celebration', location: 'Soweto, JHB', src: "https://images.unsplash.com/photo-1638297166240-866903a7190c", alt: 'Elegant 30th birthday party setup with gold balloons and luxury table decor', span: '' },
{ id: 'gal-3', category: 'Corporate', title: 'Motsepe Foundation Gala', location: 'Pretoria', src: "https://img.rocket.new/generatedImages/rocket_gen_img_13291d46a-1773739289908.png", alt: 'Corporate gala event with stage lighting and formal attendees in evening wear', span: '' },
{ id: 'gal-4', category: 'Graduation', title: 'Wits Class of 2025', location: 'Braamfontein', src: "https://images.unsplash.com/photo-1652687879409-b7d65dec60f6", alt: 'University graduation ceremony with graduates in academic gowns tossing caps', span: '' },
{ id: 'gal-5', category: 'Funeral', title: 'Celebrating a Legacy', location: 'Durban', src: "https://img.rocket.new/generatedImages/rocket_gen_img_12128be88-1764780775213.png", alt: 'Respectful memorial service with flowers and candlelight in a dignified setting', span: '' },
{ id: 'gal-6', category: 'Groove', title: 'Afrobeats Night Out', location: 'Cape Town', src: "https://img.rocket.new/generatedImages/rocket_gen_img_15b6d345b-1773261133523.png", alt: 'Vibrant nightclub event with colorful stage lights and dancing crowd', span: 'col-span-2' }];


const CATEGORIES = ['All', 'Wedding', 'Birthday', 'Corporate', 'Graduation', 'Funeral', 'Groove'];

export default function GallerySection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = activeCategory === 'All' ?
  GALLERY_ITEMS :
  GALLERY_ITEMS.filter((g) => g.category === activeCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevItem = () => setLightboxIndex((i) => i !== null ? (i - 1 + filtered.length) % filtered.length : null);
  const nextItem = () => setLightboxIndex((i) => i !== null ? (i + 1) % filtered.length : null);

  return (
    <section id="gallery" className="relative py-24 lg:py-32 bg-background overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12">
          
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">Our Work</span>
          <h2 className="font-display text-4xl lg:text-5xl font-light text-foreground mb-4">
            Moments We&apos;ve{' '}
            <span className="text-gradient-gold italic">Preserved</span>
          </h2>
          <p className="text-foreground-muted max-w-xl mx-auto text-base leading-relaxed">
            A curated selection from our portfolio. Every event tells a story — we make sure it&apos;s told beautifully.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) =>
          <button
            key={`cat-${cat}`}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
            activeCategory === cat ?
            'bg-gold-gradient text-background' : 'bg-muted text-foreground-muted hover:text-foreground hover:bg-background-elevated border border-border'}`
            }>
            
              {cat}
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px]">
          {filtered.map((item, i) =>
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className={`relative rounded-xl overflow-hidden group cursor-pointer ${item.span}`}
            onClick={() => openLightbox(i)}>
            
              <AppImage
              src={item.src}
              alt={item.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw" />
            
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-semibold text-primary tracking-wide mb-1">{item.category}</span>
                <span className="text-sm font-semibold text-foreground">{item.title}</span>
                <span className="text-xs text-foreground-muted">{item.location}</span>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ZoomIn size={14} className="text-primary" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Memory Vault CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center">
          
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-glass border border-gold rounded-xl">
            <Lock size={16} className="text-primary" />
            <span className="text-sm text-foreground-muted">
              Already a client?{' '}
              <span className="text-primary font-semibold">Access your Memory Vault</span>
              {' '}— your private gallery delivered after your event.
            </span>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl"
          onClick={closeLightbox}>
          
            <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative max-w-4xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}>
            
              <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <AppImage
                src={filtered[lightboxIndex].src}
                alt={filtered[lightboxIndex].alt}
                fill
                className="object-cover"
                priority />
              
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary tracking-wide">{filtered[lightboxIndex].category}</span>
                  <h3 className="text-lg font-semibold text-foreground">{filtered[lightboxIndex].title}</h3>
                  <p className="text-sm text-foreground-muted">{filtered[lightboxIndex].location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={prevItem} className="w-10 h-10 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors" aria-label="Previous">
                    <ChevronLeft size={18} className="text-foreground" />
                  </button>
                  <button onClick={nextItem} className="w-10 h-10 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors" aria-label="Next">
                    <ChevronRight size={18} className="text-foreground" />
                  </button>
                </div>
              </div>
              <button
              onClick={closeLightbox}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-glass border border-gold flex items-center justify-center hover:bg-primary/20 transition-colors"
              aria-label="Close lightbox">
              
                <X size={16} className="text-foreground" />
              </button>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </section>);

}