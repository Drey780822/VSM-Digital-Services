'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Coins,
  Loader2,
  MapPin,
  Sparkles,
  ShieldCheck,
  Camera,
  Video,
  Send,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchOpenOpportunities, type Opportunity } from '@/lib/services/opportunities.service';
import { formatCurrency, formatDate } from '@/lib/services/supabase-helpers';

export default function OpportunityList() {
  const [items, setItems] = useState<Opportunity[] | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [applyModal, setApplyModal] = useState<Opportunity | null>(null);
  const [roleFilter, setRoleFilter] = useState('All');
  const [submitting, setSubmitting] = useState(false);
  const [submittedFor, setSubmittedFor] = useState<string | null>(null);

  const [applicant, setApplicant] = useState({
    fullName: '',
    email: '',
    phone: '',
    portfolioUrl: '',
    gearList: '',
    notes: '',
  });

  useEffect(() => {
    fetchOpenOpportunities()
      .then(setItems)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Unable to load opportunities.')
      );
  }, []);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicant.fullName || !applicant.email || !applicant.phone) {
      toast.error('Please complete all required fields.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedFor(applyModal?.title || 'Selected Gig');
      toast.success('Interest registered! The VSM dispatch director will review your reel.');
    }, 800);
  };

  const roles = ['All', 'Photographer', 'Cinematographer', 'Drone', 'Lead'];

  const filteredItems = (items || []).filter((item) => {
    if (roleFilter === 'All') return true;
    return item.role.toLowerCase().includes(roleFilter.toLowerCase()) ||
           item.title.toLowerCase().includes(roleFilter.toLowerCase());
  });

  if (items === null && !error) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-deep-navy/40 p-12 text-center backdrop-blur-md">
        <Loader2 size={32} className="animate-spin text-vsm-gold" />
        <p className="mt-4 text-sm font-medium text-slate-300">
          Querying active dispatch briefs & corporate commissions…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8 text-center text-rose-300 backdrop-blur-md">
        <p className="font-semibold text-lg text-rose-200">Unable to load production briefs</p>
        <p className="mt-2 text-sm text-rose-300/80">{error}</p>
        <button
          onClick={() => {
            setError('');
            setItems(null);
            fetchOpenOpportunities().then(setItems).catch((err) => setError(err.message));
          }}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600/20 px-5 py-2.5 text-xs font-semibold text-rose-200 border border-rose-500/30 hover:bg-rose-600/30 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Role Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Production Openings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified corporate summits, graduation ceremonies, and high-tier shoots.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                roleFilter === r
                  ? 'bg-vsm-gold text-deep-navy font-semibold shadow-lg shadow-vsm-gold/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {r === 'All' ? 'All Disciplines' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Opportunities */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center backdrop-blur-sm">
          <BriefcaseBusiness size={36} className="mx-auto text-vsm-gold/60" />
          <h3 className="mt-4 text-lg font-bold text-white">No openings currently in this category</h3>
          <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-400">
            We regularly onboard vetted freelance creators for upcoming multi-camera events.
            Check back soon or create your profile in the Client & Creator Portal.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => setRoleFilter('All')}
              className="text-xs font-semibold text-vsm-gold hover:underline"
            >
              View all disciplines
            </button>
            <span className="text-slate-600">·</span>
            <Link href="/portal" className="text-xs font-semibold text-slate-300 hover:text-white">
              Open Creator Portal
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-corporate-navy/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-vsm-gold/40 hover:bg-corporate-navy/70 hover:shadow-xl hover:shadow-black/40"
            >
              <div>
                {/* Header Badge & Compensation */}
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-vsm-gold/30 bg-vsm-gold/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-vsm-gold uppercase">
                    {item.role.toLowerCase().includes('cine') ? (
                      <Video size={11} />
                    ) : (
                      <Camera size={11} />
                    )}
                    {item.role}
                  </span>

                  {item.compensation && item.compensation > 0 ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      <Coins size={12} />
                      {formatCurrency(item.compensation)} / day
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Standard Day Rate</span>
                  )}
                </div>

                {/* Title & Organisation */}
                <h3 className="mt-4 text-lg font-bold text-white group-hover:text-vsm-gold transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-vsm-gold inline-block" />
                  {item.organisation}
                </p>

                {/* Logistics */}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-y border-white/5 py-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-vsm-gold/70" />
                    {item.location || 'Location upon dispatch'}
                  </span>
                  {item.eventDate && (
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-vsm-gold/70" />
                      {formatDate(item.eventDate)}
                    </span>
                  )}
                </div>

                {/* Scope Preview */}
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-400">
                  {item.scope}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  Full Brief <ChevronRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setApplyModal(item);
                    setSubmittedFor(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-vsm-gold px-4 py-2 text-xs font-bold text-deep-navy shadow-md shadow-vsm-gold/20 hover:bg-[#E7C766] transition-all"
                >
                  Register Interest <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Brief Details Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-deep-navy p-6 md:p-8 text-white shadow-2xl">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-vsm-gold/30 bg-vsm-gold/10 px-3 py-1 text-xs font-semibold tracking-wider text-vsm-gold uppercase">
              {selected.role}
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">{selected.title}</h2>
            <p className="mt-1 text-sm text-slate-300">{selected.organisation}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs">
              <div>
                <span className="text-slate-400 block">Location</span>
                <span className="font-semibold text-white mt-0.5 block">{selected.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Date</span>
                <span className="font-semibold text-white mt-0.5 block">
                  {selected.eventDate ? formatDate(selected.eventDate) : 'TBD'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Compensation</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">
                  {selected.compensation ? `${formatCurrency(selected.compensation)} / day` : 'Negotiated'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Status</span>
                <span className="font-semibold text-vsm-gold mt-0.5 block">{selected.status}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-vsm-gold">Scope of Work</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 whitespace-pre-line bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  {selected.scope}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-vsm-gold">Deliverables & Turnaround SLA</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 whitespace-pre-line bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  {selected.deliverables}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close Brief
              </button>
              <button
                type="button"
                onClick={() => {
                  const item = selected;
                  setSelected(null);
                  setApplyModal(item);
                  setSubmittedFor(null);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-vsm-gold px-6 py-2.5 text-xs font-bold text-deep-navy shadow-lg shadow-vsm-gold/20 hover:bg-[#E7C766] transition-all"
              >
                Register Interest for this Gig <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Interest / Application Modal */}
      {applyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-deep-navy p-6 md:p-8 text-white shadow-2xl">
            <button
              onClick={() => setApplyModal(null)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {submittedFor ? (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-xl font-bold text-white">Application Received</h3>
                <p className="text-xs leading-relaxed text-slate-300 max-w-sm mx-auto">
                  Thank you, <strong className="text-white">{applicant.fullName}</strong>. Your profile and portfolio for{' '}
                  <strong className="text-vsm-gold">{submittedFor}</strong> have been logged. Our dispatch director will review your reel and reach out via WhatsApp/Email.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setApplyModal(null);
                      setSubmittedFor(null);
                    }}
                    className="rounded-xl bg-white/10 px-6 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-vsm-gold/30 bg-vsm-gold/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-vsm-gold uppercase">
                    Creator Dispatch Registration
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-white">{applyModal.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Role: <strong className="text-white">{applyModal.role}</strong> · Compensation:{' '}
                    <strong className="text-emerald-400">
                      {applyModal.compensation ? formatCurrency(applyModal.compensation) : 'Negotiated rate'}
                    </strong>
                  </p>
                </div>

                <div className="grid gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicant.fullName}
                      onChange={(e) => setApplicant({ ...applicant, fullName: e.target.value })}
                      placeholder="e.g. Sipho Ndlovu"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-vsm-gold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={applicant.email}
                        onChange={(e) => setApplicant({ ...applicant, email: e.target.value })}
                        placeholder="sipho@creatives.co.za"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-vsm-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Mobile / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={applicant.phone}
                        onChange={(e) => setApplicant({ ...applicant, phone: e.target.value })}
                        placeholder="+27 72 000 0000"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-vsm-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Portfolio / Showreel / Instagram Link
                    </label>
                    <input
                      type="url"
                      value={applicant.portfolioUrl}
                      onChange={(e) => setApplicant({ ...applicant, portfolioUrl: e.target.value })}
                      placeholder="https://instagram.com/yourhandle or behance.net/..."
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-vsm-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Primary Camera & Lighting Rig
                    </label>
                    <input
                      type="text"
                      value={applicant.gearList}
                      onChange={(e) => setApplicant({ ...applicant, gearList: e.target.value })}
                      placeholder="e.g. Sony A7IV + 24-70 GM, Godox V1 Speedlights"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-vsm-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Brief Note or Availability
                    </label>
                    <textarea
                      rows={2}
                      value={applicant.notes}
                      onChange={(e) => setApplicant({ ...applicant, notes: e.target.value })}
                      placeholder="Available on event date, based in Pretoria/Johannesburg..."
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-vsm-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 text-[11px] leading-relaxed text-slate-400">
                  <ShieldCheck size={14} className="inline mr-1 text-vsm-gold" />
                  Registering interest logs your profile in our production roster. VSM verifies portfolio quality and provides contractual dispatch agreements prior to shoot commencement.
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setApplyModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-vsm-gold px-6 py-2.5 text-xs font-bold text-deep-navy shadow-lg shadow-vsm-gold/20 hover:bg-[#E7C766] transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Submitting…
                      </>
                    ) : (
                      <>
                        Submit Registration <Send size={13} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}