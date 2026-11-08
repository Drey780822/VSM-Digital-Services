'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BriefcaseBusiness,
  UsersRound,
  Plus,
  Save,
  Loader2,
  Calendar,
  MapPin,
  Building2,
  CheckCircle2,
  Coins,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Target,
  Sparkles,
  RefreshCw,
  Mail,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  fetchOpportunities,
  fetchOutreach,
  saveOpportunity,
  saveOutreach,
  updateOpportunityStatus,
  type Opportunity,
  type OpportunityStatus,
  type OutreachRecord,
  type OutreachStage,
} from '@/lib/services/opportunities.service';
import { formatCurrency, formatDate } from '@/lib/services/supabase-helpers';

const OPPORTUNITY_STATUSES: OpportunityStatus[] = ['Open', 'Draft', 'Closed'];
const OUTREACH_STAGES: OutreachStage[] = [
  'Prospect',
  'Contacted',
  'Conversation',
  'Proposal',
  'Negotiation',
  'Won',
  'Delivered',
];

const EMPTY_OPPORTUNITY = {
  title: '',
  organisation: '',
  location: '',
  eventDate: '',
  role: 'Lead Photographer',
  scope: '',
  deliverables: '',
  compensation: 3500,
  status: 'Open' as OpportunityStatus,
};

const EMPTY_OUTREACH = {
  organisation: '',
  sector: 'Tech & Cloud Hyperscaler',
  contactName: '',
  contactEmail: '',
  stage: 'Prospect' as OutreachStage,
  notes: '',
};

export default function AdminOpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<'gigs' | 'outreach'>('gigs');
  const [items, setItems] = useState<Opportunity[] | null>(null);
  const [outreach, setOutreach] = useState<OutreachRecord[] | null>(null);
  const [opportunity, setOpportunity] = useState(EMPTY_OPPORTUNITY);
  const [prospect, setProspect] = useState(EMPTY_OUTREACH);
  const [saving, setSaving] = useState(false);
  const [showGigModal, setShowGigModal] = useState(false);
  const [showProspectModal, setShowProspectModal] = useState(false);

  const load = () => {
    setItems(null);
    setOutreach(null);
    Promise.all([fetchOpportunities(), fetchOutreach()])
      .then(([nextItems, nextOutreach]) => {
        setItems(nextItems);
        setOutreach(nextOutreach);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Could not load opportunities.');
        setItems([]);
        setOutreach([]);
      });
  };

  useEffect(load, []);

  const saveNewOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await saveOpportunity(opportunity);
      setItems((current) => [saved, ...(current || [])]);
      setOpportunity(EMPTY_OPPORTUNITY);
      setShowGigModal(false);
      toast.success('Creative gig published to creator board!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save opportunity.');
    } finally {
      setSaving(false);
    }
  };

  const saveNewOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await saveOutreach(prospect);
      setOutreach((current) => [saved, ...(current || [])]);
      setProspect(EMPTY_OUTREACH);
      setShowProspectModal(false);
      toast.success('Outreach target added to sales pipeline!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save outreach target.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: OpportunityStatus) => {
    try {
      await updateOpportunityStatus(id, status);
      setItems((prev) =>
        prev?.map((item) => (item.id === id ? { ...item, status } : item)) || []
      );
      toast.success(`Gig status updated to ${status}.`);
    } catch {
      toast.error('Could not update gig status.');
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mx-auto max-w-7xl space-y-8 font-sans selection:bg-vsm-gold/20 selection:text-white">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-navy border border-vsm-gold/25 text-vsm-gold text-xs font-semibold uppercase tracking-widest mb-2">
                <UsersRound size={13} className="text-vsm-gold" />
                <span>Creator Dispatch & B2B Outreach</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Creative Opportunities & B2B Outreach
              </h1>
              <p className="text-sm text-white/60 mt-1 max-w-xl">
                Deploy accredited South African creative talent on enterprise shoots and proactively prospect high-value organizations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={load}
                className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw size={14} className={items === null ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>

              {activeTab === 'gigs' ? (
                <button
                  type="button"
                  onClick={() => setShowGigModal(true)}
                  className="btn-gold px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-gold"
                >
                  <Plus size={15} />
                  <span>+ Post Creator Gig</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowProspectModal(true)}
                  className="btn-gold px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-gold"
                >
                  <Plus size={15} />
                  <span>+ Add Target Organisation</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <button
              type="button"
              onClick={() => setActiveTab('gigs')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'gigs'
                  ? 'bg-vsm-gold text-near-black shadow-lg shadow-vsm-gold/20'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <BriefcaseBusiness size={14} />
              <span>Creative Gigs & Dispatch ({items?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('outreach')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'outreach'
                  ? 'bg-vsm-gold text-near-black shadow-lg shadow-vsm-gold/20'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <Target size={14} />
              <span>B2B Target Outreach ({outreach?.length || 0})</span>
            </button>
          </div>

          {/* Tab 1: Creator Gigs Dispatch */}
          {activeTab === 'gigs' && (
            <div className="space-y-6">
              {items === null ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/50">
                  <Loader2 size={32} className="animate-spin text-vsm-gold mb-3" />
                  <p className="text-sm">Loading creative opportunities...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="p-16 rounded-3xl bg-deep-navy/20 border border-dashed border-white/10 text-center">
                  <BriefcaseBusiness size={36} className="text-white/30 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">No Active Creator Gigs</h3>
                  <p className="text-xs text-white/50 max-w-sm mx-auto mb-6">
                    Publish roles for photographers, drone pilots, and videographers when enterprise events are booked.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowGigModal(true)}
                    className="btn-gold px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  >
                    Post First Creator Gig
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map((gig) => (
                    <div
                      key={gig.id}
                      className="p-6 sm:p-7 rounded-3xl bg-deep-navy/40 border border-white/10 hover:border-vsm-gold/30 transition-all shadow-xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <span className="px-3 py-1 rounded-full bg-vsm-gold/20 border border-vsm-gold/30 text-vsm-gold text-xs font-bold uppercase tracking-wider">
                            {gig.role}
                          </span>
                          <select
                            value={gig.status}
                            onChange={(e) =>
                              handleUpdateStatus(gig.id, e.target.value as OpportunityStatus)
                            }
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider outline-none ${
                              gig.status === 'Open'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-white/10 text-white/60 border border-white/15'
                            }`}
                          >
                            {OPPORTUNITY_STATUSES.map((st) => (
                              <option key={st} value={st} className="bg-deep-navy text-white">
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">{gig.title}</h3>
                        <p className="text-xs text-white/60 mb-4">{gig.organisation}</p>

                        <div className="space-y-2 text-xs text-white/70 py-4 border-y border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin size={13} className="text-vsm-gold" />
                              <span>{gig.location || 'Johannesburg / Pretoria'}</span>
                            </div>
                            {gig.compensation ? (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                <Coins size={12} />
                                <span>{formatCurrency(gig.compensation)}</span>
                              </div>
                            ) : null}
                          </div>
                          {gig.eventDate && (
                            <div className="flex items-center gap-2">
                              <Calendar size={13} className="text-vsm-gold" />
                              <span>{formatDate(gig.eventDate)}</span>
                            </div>
                          )}
                          <div className="mt-2 text-xs leading-relaxed text-white/80">
                            <strong className="text-white">Scope:</strong> {gig.scope}
                          </div>
                          <div className="text-xs leading-relaxed text-vsm-gold">
                            <strong className="text-white">Deliverables:</strong> {gig.deliverables}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between text-xs">
                        <span className="text-white/40">
                          Published {formatDate(gig.createdAt)}
                        </span>
                        <Link
                          href="/opportunities"
                          className="text-vsm-gold hover:underline font-bold tracking-wide uppercase inline-flex items-center gap-1"
                        >
                          <span>View Public Listing</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: B2B Target Outreach CRM */}
          {activeTab === 'outreach' && (
            <div className="space-y-6">
              {outreach === null ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/50">
                  <Loader2 size={32} className="animate-spin text-vsm-gold mb-3" />
                  <p className="text-sm">Loading outreach pipeline...</p>
                </div>
              ) : outreach.length === 0 ? (
                <div className="p-16 rounded-3xl bg-deep-navy/20 border border-dashed border-white/10 text-center">
                  <Target size={36} className="text-white/30 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">No Active Outreach Targets</h3>
                  <p className="text-xs text-white/50 max-w-sm mx-auto mb-6">
                    Add target organizations, hyperscalers, and university innovation hubs to track outreach.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowProspectModal(true)}
                    className="btn-gold px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  >
                    Add First Target
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {outreach.map((target) => (
                    <div
                      key={target.id}
                      className="p-6 rounded-3xl bg-deep-navy/40 border border-white/10 hover:border-vsm-gold/30 transition-all shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-3 py-0.5 rounded-full bg-deep-navy border border-vsm-gold/25 text-vsm-gold text-[10px] font-bold uppercase tracking-wider">
                            {target.sector}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
                            {target.stage}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white">{target.organisation}</h3>
                        <p className="text-xs text-white/60 mt-0.5">
                          {target.contactName} • {target.contactEmail}
                        </p>
                        {target.notes && (
                          <p className="text-xs text-white/80 mt-2 bg-near-black/50 p-2.5 rounded-xl border border-white/5">
                            {target.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-start md:self-auto">
                        <select
                          value={target.stage}
                          onChange={async (e) => {
                            const newStage = e.target.value as OutreachStage;
                            try {
                              await saveOutreach({ ...target, stage: newStage });
                              setOutreach((prev) =>
                                prev?.map((item) =>
                                  item.id === target.id ? { ...item, stage: newStage } : item
                                ) || []
                              );
                              toast.success(`Target stage updated to ${newStage}.`);
                            } catch {
                              toast.error('Could not update outreach stage.');
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-corporate-navy border border-vsm-gold/30 text-vsm-gold text-xs font-bold uppercase tracking-wider outline-none"
                        >
                          {OUTREACH_STAGES.map((s) => (
                            <option key={s} value={s} className="bg-deep-navy text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal: Post New Creator Gig */}
          {showGigModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-near-black/85 backdrop-blur-md">
              <div className="relative max-w-xl w-full bg-deep-navy border border-vsm-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
                <button
                  type="button"
                  onClick={() => setShowGigModal(false)}
                  className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-vsm-gold hover:text-near-black text-white flex items-center justify-center transition-all"
                >
                  ✕
                </button>

                <h3 className="text-2xl font-bold text-white mb-1">Post Creator Gig</h3>
                <p className="text-xs text-white/60 mb-6">
                  Publish an accredited role for visual creatives to apply and join VSM production teams.
                </p>

                <form onSubmit={saveNewOpportunity} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                      Gig Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={opportunity.title}
                      onChange={(e) => setOpportunity({ ...opportunity, title: e.target.value })}
                      placeholder="e.g. Lead Portrait Photographer · TUT Spring Graduation"
                      className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white outline-none focus:border-vsm-gold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                        Organisation *
                      </label>
                      <input
                        type="text"
                        required
                        value={opportunity.organisation}
                        onChange={(e) =>
                          setOpportunity({ ...opportunity, organisation: e.target.value })
                        }
                        placeholder="e.g. Tshwane University of Technology"
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white outline-none focus:border-vsm-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                        Role *
                      </label>
                      <input
                        type="text"
                        required
                        value={opportunity.role}
                        onChange={(e) => setOpportunity({ ...opportunity, role: e.target.value })}
                        placeholder="e.g. Cinematographer, Lead Photographer"
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white outline-none focus:border-vsm-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                        Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={opportunity.location}
                        onChange={(e) =>
                          setOpportunity({ ...opportunity, location: e.target.value })
                        }
                        placeholder="e.g. Pretoria Campus"
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white outline-none focus:border-vsm-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                        Event Date
                      </label>
                      <input
                        type="date"
                        value={opportunity.eventDate}
                        onChange={(e) =>
                          setOpportunity({ ...opportunity, eventDate: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white outline-none focus:border-vsm-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                      Scope of Work *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={opportunity.scope}
                      onChange={(e) => setOpportunity({ ...opportunity, scope: e.target.value })}
                      placeholder="On-site graduate portraits, stage walk crossing, and candid family moments..."
                      className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white outline-none focus:border-vsm-gold resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                      Deliverables & Turnaround *
                    </label>
                    <input
                      type="text"
                      required
                      value={opportunity.deliverables}
                      onChange={(e) =>
                        setOpportunity({ ...opportunity, deliverables: e.target.value })
                      }
                      placeholder="150 color-graded photos delivered in 48 hours"
                      className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white outline-none focus:border-vsm-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                      Day Rate / Compensation (ZAR)
                    </label>
                    <input
                      type="number"
                      value={opportunity.compensation}
                      onChange={(e) =>
                        setOpportunity({ ...opportunity, compensation: Number(e.target.value) })
                      }
                      placeholder="3500"
                      className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white outline-none focus:border-vsm-gold"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowGigModal(false)}
                      className="px-5 py-2.5 rounded-full border border-white/20 text-white/80 hover:text-white font-bold uppercase tracking-wider text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-gold px-6 py-2.5 rounded-full font-bold uppercase tracking-wider text-xs flex items-center gap-1.5"
                    >
                      {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                      <span>Publish Gig</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Add Target Organisation */}
          {showProspectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-near-black/85 backdrop-blur-md">
              <div className="relative max-w-xl w-full bg-deep-navy border border-vsm-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
                <button
                  type="button"
                  onClick={() => setShowProspectModal(false)}
                  className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-vsm-gold hover:text-near-black text-white flex items-center justify-center transition-all"
                >
                  ✕
                </button>

                <h3 className="text-2xl font-bold text-white mb-1">Add Target Organisation</h3>
                <p className="text-xs text-white/60 mb-6">
                  Add an enterprise account to the B2B prospecting and relationship pipeline.
                </p>

                <form onSubmit={saveNewOutreach} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                      Organisation Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={prospect.organisation}
                      onChange={(e) => setProspect({ ...prospect, organisation: e.target.value })}
                      placeholder="e.g. Microsoft South Africa"
                      className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white outline-none focus:border-vsm-gold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                        Sector *
                      </label>
                      <input
                        type="text"
                        required
                        value={prospect.sector}
                        onChange={(e) => setProspect({ ...prospect, sector: e.target.value })}
                        placeholder="e.g. Cloud, Banking, University"
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white outline-none focus:border-vsm-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                        Pipeline Stage
                      </label>
                      <select
                        value={prospect.stage}
                        onChange={(e) =>
                          setProspect({ ...prospect, stage: e.target.value as OutreachStage })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white outline-none focus:border-vsm-gold"
                      >
                        {OUTREACH_STAGES.map((st) => (
                          <option key={st} value={st} className="bg-deep-navy text-white">
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={prospect.contactName}
                        onChange={(e) => setProspect({ ...prospect, contactName: e.target.value })}
                        placeholder="e.g. Head of Developer Relations"
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white outline-none focus:border-vsm-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={prospect.contactEmail}
                        onChange={(e) =>
                          setProspect({ ...prospect, contactEmail: e.target.value })
                        }
                        placeholder="contact@org.co.za"
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white outline-none focus:border-vsm-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                      Discovery & Strategy Notes
                    </label>
                    <textarea
                      rows={3}
                      value={prospect.notes}
                      onChange={(e) => setProspect({ ...prospect, notes: e.target.value })}
                      placeholder="Annual conference held every October. Interested in same-day reels and live multicam coverage..."
                      className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white outline-none focus:border-vsm-gold resize-none"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowProspectModal(false)}
                      className="px-5 py-2.5 rounded-full border border-white/20 text-white/80 hover:text-white font-bold uppercase tracking-wider text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-gold px-6 py-2.5 rounded-full font-bold uppercase tracking-wider text-xs flex items-center gap-1.5"
                    >
                      {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      <span>Save Target</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
