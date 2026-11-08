'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Building2,
  Calendar,
  MapPin,
  Users,
  Film,
  Camera,
  Coins,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';
import { submitCorporateEnquiry } from '@/lib/services/business.service';

const CREW_OPTIONS = [
  '1 Dedicated Photographer (Keynotes & candids)',
  '1 Lead Photographer + 1 Cinematographer',
  '2 Photographers + 1 Videographer + Social Reel Editor (Recommended)',
  'Full Multicam Production Crew + Drone + Studio Headshot Booth',
];

const BUDGET_OPTIONS = [
  'R15,000 – R25,000 (Half-day or single stage)',
  'R25,000 – R45,000 (Full-day multi-track summit)',
  'R45,000 – R80,000+ (Multi-day conference / national activation)',
  'Custom Enterprise Tender / RFP',
];

export default function BusinessBrief() {
  const search = useSearchParams();
  const [form, setForm] = useState({
    organisation: '',
    contactName: '',
    email: '',
    phone: '',
    eventName: search.get('event') || '',
    eventDate: '',
    location: '',
    coverageNeeds: '',
    crewNeeds: CREW_OPTIONS[2],
    deliverables: 'Same-day keynotes reel + 200 color-graded photos + 4K aftermovie',
    estimatedBudget: 35000,
  });

  const [sending, setSending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');

  const update = (key: string, value: any) => setForm({ ...form, [key]: value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      await submitCorporateEnquiry(form);
      setComplete(true);
    } catch (err: any) {
      setError(err?.message || 'Your brief could not be submitted. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (complete) {
    return (
      <div className="rounded-3xl border border-vsm-gold/40 bg-deep-navy/80 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 rounded-full bg-vsm-gold/20 border border-vsm-gold/50 flex items-center justify-center text-vsm-gold mx-auto mb-5 shadow-gold">
          <CheckCircle2 size={32} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-vsm-gold block mb-1">
          Brief Successfully Ingested
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          Corporate Brief Received
        </h2>
        <p className="text-sm text-white/70 max-w-lg mx-auto leading-relaxed mb-8">
          Thank you, <strong className="text-white">{form.contactName}</strong>. Your scope for{' '}
          <strong className="text-vsm-gold">{form.eventName || form.organisation}</strong> has entered our enterprise proposal workflow.
          A dedicated VSM lead producer will contact you within 4 business hours with a formal proposal and SLA breakdown.
        </p>

        <div className="p-4 rounded-2xl bg-corporate-navy/40 border border-white/10 text-xs text-white/60 max-w-md mx-auto text-left mb-6">
          <div className="flex items-center gap-2 text-white font-semibold mb-1">
            <ShieldCheck size={14} className="text-vsm-gold" />
            <span>Corporate Governance Notice</span>
          </div>
          <p>Vendor registration forms, B-BBEE documentation, and formal quotation letters can be issued upon request.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setComplete(false);
            setForm({
              organisation: '',
              contactName: '',
              email: '',
              phone: '',
              eventName: '',
              eventDate: '',
              location: '',
              coverageNeeds: '',
              crewNeeds: CREW_OPTIONS[2],
              deliverables: 'Same-day keynotes reel + 200 color-graded photos + 4K aftermovie',
              estimatedBudget: 35000,
            });
          }}
          className="px-6 py-2.5 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/20 transition-all"
        >
          Submit Another Event Brief
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-white/10 bg-deep-navy/50 p-6 sm:p-10 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-deep-navy border border-vsm-gold/30 text-vsm-gold text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles size={12} />
          <span>Bespoke Corporate Brief</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Commission Visual Production
        </h2>
        <p className="text-xs sm:text-sm text-white/60 mt-1">
          Tell us about your event, expected footprint, and required creative deliverables.
        </p>
      </div>

      <div className="space-y-6">
        {/* Row 1: Organisation & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Organisation / Brand Name <span className="text-vsm-gold">*</span>
            </label>
            <div className="relative">
              <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                required
                value={form.organisation}
                onChange={(e) => update('organisation', e.target.value)}
                placeholder="e.g. AWS User Group or TUT Innovation"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-near-black/70 border border-white/15 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-vsm-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Primary Contact Person <span className="text-vsm-gold">*</span>
            </label>
            <div className="relative">
              <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                required
                value={form.contactName}
                onChange={(e) => update('contactName', e.target.value)}
                placeholder="e.g. Kagiso Ndlovu (Head of Events)"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-near-black/70 border border-white/15 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-vsm-gold transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Work Email & Direct Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Work Email Address <span className="text-vsm-gold">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="name@company.co.za"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-near-black/70 border border-white/15 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-vsm-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Direct Phone Number <span className="text-vsm-gold">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+27 82 000 0000"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-near-black/70 border border-white/15 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-vsm-gold transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Event Name & Date & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Event / Summit Name <span className="text-vsm-gold">*</span>
            </label>
            <input
              type="text"
              required
              value={form.eventName}
              onChange={(e) => update('eventName', e.target.value)}
              placeholder="e.g. Annual Tech Summit"
              className="w-full px-4 py-3 rounded-xl bg-near-black/70 border border-white/15 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-vsm-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Event Date
            </label>
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => update('eventDate', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-near-black/70 border border-white/15 text-white text-sm font-medium outline-none focus:border-vsm-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Venue & City <span className="text-vsm-gold">*</span>
            </label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="e.g. Sandton Convention Centre, JHB"
              className="w-full px-4 py-3 rounded-xl bg-near-black/70 border border-white/15 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-vsm-gold transition-colors"
            />
          </div>
        </div>

        {/* Coverage Needs */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Coverage Scope & Special Directives <span className="text-vsm-gold">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={form.coverageNeeds}
            onChange={(e) => update('coverageNeeds', e.target.value)}
            placeholder="Describe stage schedule, keynote speakers, breakout tracks, expo booths, executive headshots, or evening networking gala..."
            className="w-full px-4 py-3 rounded-xl bg-near-black/70 border border-white/15 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-vsm-gold transition-colors resize-none"
          />
        </div>

        {/* Crew Deployment Preference */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Creative Crew Deployment Preference
          </label>
          <select
            value={form.crewNeeds}
            onChange={(e) => update('crewNeeds', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-near-black/70 border border-white/15 text-white text-sm font-medium outline-none focus:border-vsm-gold transition-colors"
          >
            {CREW_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-deep-navy text-white">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Deliverables Checklist */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Target Deliverables & Turnaround Times
          </label>
          <input
            type="text"
            value={form.deliverables}
            onChange={(e) => update('deliverables', e.target.value)}
            placeholder="e.g. Same-day 9:16 Instagram Reels, 3-minute 4K highlight film, full photo gallery..."
            className="w-full px-4 py-3 rounded-xl bg-near-black/70 border border-white/15 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-vsm-gold transition-colors"
          />
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={sending}
          className="btn-gold w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold disabled:opacity-50 transition-all"
        >
          {sending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Transmitting Corporate Brief...</span>
            </>
          ) : (
            <>
              <span>Submit Enterprise Brief for Proposal</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-white/40 leading-relaxed">
          Submission creates an official enquiry in the VSM Executive Opportunities CRM. You will receive an instant copy via email.
        </p>
      </div>
    </form>
  );
}
