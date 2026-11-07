'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Send, CheckCircle2, Calendar, Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CorporateBriefSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organization: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    eventType: 'Summit / Conference',
    eventDate: '',
    requirements: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate brief receipt & CRM pipeline ingest
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Corporate brief received! A VSM production lead will respond within 4 hours.');
    }, 600);
  };

  return (
    <section id="business-brief" className="relative py-28 lg:py-36 bg-near-black overflow-hidden border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Description Column */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-deep-navy border border-vsm-gold/25 text-vsm-gold text-xs font-semibold uppercase tracking-widest mb-4">
              <Building2 size={13} className="text-vsm-gold" />
              <span>Enterprise &amp; Tech Coverage</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              VSM for Business.
            </h2>
            <p className="text-sm sm:text-base text-white/65 leading-relaxed mb-8 font-normal">
              Organizing an AWS Summit, developer hackathon, university showcase, or brand activation?
              Don&apos;t settle for generic packages. We dispatch multi-camera crews equipped for same-day
              social media deliverables, keynote audio/video capture, and executive portraits.
            </p>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 text-xs text-white/80">
                <CheckCircle2 size={16} className="text-vsm-gold flex-shrink-0" />
                <span>Custom proposals, formal invoices &amp; SLA contracts</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/80">
                <CheckCircle2 size={16} className="text-vsm-gold flex-shrink-0" />
                <span>Same-day highlight reels &amp; live social clips</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/80">
                <CheckCircle2 size={16} className="text-vsm-gold flex-shrink-0" />
                <span>Dedicated production coordinator on-site</span>
              </div>
            </div>
          </div>

          {/* Right Intake Form Column */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-2xl bg-deep-navy/40 border border-vsm-gold/25 shadow-2xl backdrop-blur-xl">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-vsm-gold/15 border border-vsm-gold/40 flex items-center justify-center text-vsm-gold mx-auto mb-4">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Corporate Brief Received</h3>
                  <p className="text-sm text-white/60 max-w-md mx-auto mb-6">
                    Thank you. Your request has been logged in our Opportunities pipeline. A VSM Senior Producer will contact you shortly with a tailored quote.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs text-vsm-gold font-bold uppercase tracking-wider hover:underline"
                  >
                    Submit another brief
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-lg font-bold text-white mb-4">Request Corporate Coverage Brief</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                        Organization / Brand
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AWS, Microsoft, TUT"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-corporate-navy/80 border border-white/10 text-white text-xs placeholder-white/30 focus:border-vsm-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                        Event Category
                      </label>
                      <select
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-corporate-navy/80 border border-white/10 text-white text-xs focus:border-vsm-gold focus:outline-none"
                      >
                        <option value="Summit / Conference">Summit / Conference</option>
                        <option value="Developer Hackathon">Developer Hackathon</option>
                        <option value="University Showcase">University Showcase</option>
                        <option value="Brand Activation / Launch">Brand Activation / Launch</option>
                        <option value="Executive Portraits / AGM">Executive Portraits / AGM</option>
                        <option value="Awards & Gala Dinner">Awards &amp; Gala Dinner</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-corporate-navy/80 border border-white/10 text-white text-xs placeholder-white/30 focus:border-vsm-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                        Work Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-corporate-navy/80 border border-white/10 text-white text-xs placeholder-white/30 focus:border-vsm-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                      Event Date &amp; Scope Requirements
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Event date, venue, hours, expected crew (e.g. 2 photographers, 1 videographer), deliverables needed..."
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-corporate-navy/80 border border-white/10 text-white text-xs placeholder-white/30 focus:border-vsm-gold focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-gold py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold"
                  >
                    <span>{loading ? 'Submitting...' : 'Submit Corporate Brief'}</span>
                    <Send size={13} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
