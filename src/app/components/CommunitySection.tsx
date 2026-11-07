'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, MapPin, Briefcase } from 'lucide-react';

const IMPACT_ITEMS = [
  {
    id: 'impact-1',
    icon: Heart,
    title: 'Milestones Preserved',
    description:
      'We believe every family milestone deserves high-tier visual artistry regardless of ticket size. Flexible pricing bridges the gap.',
  },
  {
    id: 'impact-2',
    icon: Briefcase,
    title: 'Creative Opportunities',
    description:
      'Connecting talented South African photographers and videographers to paid summits, weddings, and enterprise campaigns.',
  },
  {
    id: 'impact-3',
    icon: MapPin,
    title: 'Proudly South African',
    description:
      'Rooted in Gauteng, capturing memories from Tshwane to Soweto, Sandton, and across the provinces.',
  },
  {
    id: 'impact-4',
    icon: Users,
    title: 'Community Empowerment',
    description:
      'Responsible financial options designed for real people. Fair rates, zero hidden traps, transparent support.',
  },
];

export default function CommunitySection() {
  return (
    <section id="community" className="relative py-28 lg:py-36 bg-near-black overflow-hidden border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-vsm-gold mb-3 block">
              Our Vision
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              More Than Just a Booking.{' '}
              <span className="text-vsm-gold">A Creative Ecosystem.</span>
            </h2>
            <p className="text-sm sm:text-base text-white/65 leading-relaxed mb-6 font-normal">
              VSM is the platform that helps people capture, finance, manage, and preserve
              important moments — while creating sustainable, professional opportunities for the creatives delivering those moments.
            </p>
            <p className="text-sm sm:text-base text-white/65 leading-relaxed mb-8 font-normal">
              From township celebrations to corporate hackathons and royal weddings, we bring
              world-class media production and digital archiving into the hands of every community.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-0.5 bg-vsm-gold" />
              <span className="text-sm text-vsm-gold font-semibold uppercase tracking-wider">
                Capture Moments · Empower Lives
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {IMPACT_ITEMS.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-deep-navy/35 border border-white/5 hover:border-vsm-gold/25 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-corporate-navy/80 border border-vsm-gold/20 flex items-center justify-center text-vsm-gold mb-4">
                  <item.icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed font-normal">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
