'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, MapPin, Zap } from 'lucide-react';

const IMPACT_ITEMS = [
  {
    id: 'impact-1',
    icon: Heart,
    title: 'Families First',
    description: 'We believe every family deserves cinematic memories regardless of budget. Our financing bridges the gap.',
  },
  {
    id: 'impact-2',
    icon: Users,
    title: 'Community Lending',
    description: 'Responsible loans designed for working South Africans. Fair rates, transparent terms, human support.',
  },
  {
    id: 'impact-3',
    icon: MapPin,
    title: 'Proudly South African',
    description: 'Rooted in Johannesburg, serving communities from Cape Town to Limpopo. African excellence, global standards.',
  },
  {
    id: 'impact-4',
    icon: Zap,
    title: 'Empowering Moments',
    description: 'From township grooves to Sandton weddings — every event deserves a cinematic legacy.',
  },
];

export default function CommunitySection() {
  return (
    <section id="community" className="relative py-24 lg:py-32 bg-background overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="blob-gold absolute bottom-0 right-1/3 w-80 h-80 opacity-20" />
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">Our Purpose</span>
            <h2 className="font-display text-4xl lg:text-5xl font-light text-foreground mb-6">
              More Than Photography.{' '}
              <span className="text-gradient-gold italic">Community Empowerment.</span>
            </h2>
            <p className="text-foreground-muted text-base leading-relaxed mb-6">
              VSCOBAR was born from a simple belief: every South African family deserves to have their most important moments preserved with dignity and artistry — regardless of income.
            </p>
            <p className="text-foreground-muted text-base leading-relaxed mb-8">
              We combine luxury photography with responsible financial services to create a platform that doesn&apos;t just capture memories — it empowers the communities that create them.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-1 bg-gold-gradient rounded-full" />
              <span className="font-display text-lg italic text-foreground-muted">
                &ldquo;Capture moments. Empower lives.&rdquo;
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {IMPACT_ITEMS?.map((item, i) => (
              <motion.div
                key={item?.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="luxury-card p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <item.icon size={18} className="text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{item?.title}</h3>
                <p className="text-xs text-foreground-muted leading-relaxed">{item?.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}