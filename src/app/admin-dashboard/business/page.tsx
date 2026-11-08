'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Loader2,
  RefreshCw,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Briefcase,
  FileText,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  X,
  Phone,
  Mail,
  ShieldCheck,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  fetchCorporateEnquiries,
  updateCorporateEnquiryStage,
  submitCorporateEnquiry,
  type CorporateEnquiry,
  type EnquiryStage,
} from '@/lib/services/business.service';
import { formatCurrency, formatDate } from '@/lib/services/supabase-helpers';

const STAGES: EnquiryStage[] = ['Proposal', 'Quote', 'Contract', 'Invoice', 'Booking'];

export default function BusinessEnquiriesPage() {
  const [items, setItems] = useState<CorporateEnquiry[] | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [quoteModalLead, setQuoteModalLead] = useState<CorporateEnquiry | null>(null);

  // New Brief Form State
  const [newOrg, setNewOrg] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEvent, setNewEvent] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newScope, setNewScope] = useState('');
  const [newBudget, setNewBudget] = useState('35000');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setItems(null);
    fetchCorporateEnquiries()
      .then((data) => setItems(data))
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Could not load corporate enquiries.');
        setItems([]);
      });
  };

  useEffect(load, []);

  const handleStageUpdate = async (id: string, stage: EnquiryStage) => {
    try {
      await updateCorporateEnquiryStage(id, stage);
      setItems((prev) =>
        prev?.map((item) => (item.id === id ? { ...item, stage } : item)) || []
      );
      toast.success(`Deal moved to ${stage} stage.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update deal stage.');
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await submitCorporateEnquiry({
        organisation: newOrg,
        contactName: newContact,
        email: newEmail,
        phone: newPhone,
        eventName: newEvent,
        eventDate: newDate,
        location: newLocation,
        coverageNeeds: newScope,
        estimatedBudget: Number(newBudget) || 0,
      });

      setItems((prev) => [created, ...(prev || [])]);
      setModalOpen(false);
      // Reset form
      setNewOrg('');
      setNewContact('');
      setNewEmail('');
      setNewPhone('');
      setNewEvent('');
      setNewDate('');
      setNewLocation('');
      setNewScope('');
      toast.success('Corporate lead successfully created!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create corporate lead.');
    } finally {
      setSaving(false);
    }
  };

  // Filter calculations
  const filteredItems = (items || []).filter((item) => {
    const matchesStage = selectedStage === 'All' || item.stage === selectedStage;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.organisation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const totalPipelineValue = (items || []).reduce((acc, curr) => acc + (curr.estimatedBudget || 0), 0);
  const activeDealsCount = (items || []).length;
  const wonDealsCount = (items || []).filter((i) => i.stage === 'Booking').length;
  const avgDealSize = activeDealsCount > 0 ? Math.round(totalPipelineValue / activeDealsCount) : 0;

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mx-auto max-w-7xl space-y-8 font-sans selection:bg-vsm-gold/20 selection:text-white">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-navy border border-vsm-gold/25 text-vsm-gold text-xs font-semibold uppercase tracking-widest mb-2">
                <Building2 size={13} className="text-vsm-gold" />
                <span>Enterprise Opportunities CRM</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Corporate Sales & Summit Pipeline
              </h1>
              <p className="text-sm text-white/60 mt-1 max-w-xl">
                Manage high-ticket organization proposals from initial brief ingestion to SLA contract, tax invoicing, and creator crew dispatch.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={load}
                className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw size={14} className={items === null ? 'animate-spin' : ''} />
                <span>Refresh Pipeline</span>
              </button>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-gold px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-gold"
              >
                <Plus size={15} />
                <span>+ Ingest Corporate Lead</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-deep-navy/40 border border-white/10">
              <div className="flex items-center justify-between text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Total Pipeline Value</span>
                <DollarSign size={16} className="text-vsm-gold" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {formatCurrency(totalPipelineValue)}
              </div>
              <span className="text-[11px] text-vsm-gold font-medium mt-1 block">
                Across {activeDealsCount} enterprise proposals
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-deep-navy/40 border border-white/10">
              <div className="flex items-center justify-between text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Active Deals</span>
                <Briefcase size={16} className="text-vsm-gold" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {activeDealsCount}
              </div>
              <span className="text-[11px] text-white/50 font-medium mt-1 block">
                In proposal, quote & contract stages
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-deep-navy/40 border border-white/10">
              <div className="flex items-center justify-between text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Average Deal Size</span>
                <TrendingUp size={16} className="text-vsm-gold" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {formatCurrency(avgDealSize)}
              </div>
              <span className="text-[11px] text-green-400 font-medium mt-1 block">
                Enterprise & Tech Summit average
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-deep-navy/40 border border-white/10">
              <div className="flex items-center justify-between text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Confirmed Bookings (Won)</span>
                <CheckCircle2 size={16} className="text-green-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {wonDealsCount}
              </div>
              <span className="text-[11px] text-white/50 font-medium mt-1 block">
                Contract signed & creator dispatched
              </span>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="p-4 rounded-3xl bg-deep-navy/30 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedStage('All')}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedStage === 'All'
                    ? 'bg-vsm-gold text-near-black shadow-md'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                All Stages ({items?.length || 0})
              </button>

              {STAGES.map((stg) => {
                const count = (items || []).filter((i) => i.stage === stg).length;
                return (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => setSelectedStage(stg)}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedStage === stg
                        ? 'bg-vsm-gold text-near-black shadow-md'
                        : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {stg} ({count})
                  </button>
                );
              })}
            </div>

            <div className="relative min-w-[260px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organisation or event..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-near-black/70 border border-white/10 text-white placeholder-white/40 text-xs outline-none focus:border-vsm-gold transition-colors"
              />
            </div>
          </div>

          {/* Deal Cards Pipeline List */}
          {items === null ? (
            <div className="flex flex-col items-center justify-center py-24 text-white/50">
              <Loader2 size={32} className="animate-spin text-vsm-gold mb-3" />
              <p className="text-sm">Loading corporate sales pipeline...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-16 rounded-3xl bg-deep-navy/20 border border-dashed border-white/10 text-center">
              <Building2 size={36} className="text-white/30 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Deals in This Stage</h3>
              <p className="text-xs text-white/50 max-w-sm mx-auto mb-6">
                There are no corporate enquiries matching the current filter criteria.
              </p>
              <button
                type="button"
                onClick={() => setSelectedStage('All')}
                className="btn-gold px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
              >
                Reset Stage Filter
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="p-6 sm:p-7 rounded-3xl bg-deep-navy/40 border border-white/10 hover:border-vsm-gold/30 transition-all shadow-xl"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-vsm-gold/20 border border-vsm-gold/30 text-vsm-gold text-xs font-bold uppercase tracking-wider">
                          {item.organisation}
                        </span>
                        <span className="text-white/40 text-xs font-mono">
                          Submitted {formatDate(item.createdAt)}
                        </span>
                        {item.estimatedBudget && (
                          <span className="px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-bold">
                            Est. {formatCurrency(item.estimatedBudget)}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {item.eventName}
                      </h2>
                    </div>

                    {/* Stage Switcher */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
                          Stage:
                        </span>
                        <select
                          value={item.stage}
                          onChange={(e) => handleStageUpdate(item.id, e.target.value as EnquiryStage)}
                          className="px-3.5 py-2 rounded-xl bg-corporate-navy border border-vsm-gold/30 text-vsm-gold text-xs font-bold uppercase tracking-wider outline-none"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s} className="bg-deep-navy text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => setQuoteModalLead(item)}
                        className="btn-gold px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                      >
                        <FileText size={13} />
                        <span>Build Proposal</span>
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-white/10 text-xs">
                    <div>
                      <span className="text-white/40 font-semibold uppercase tracking-wider block mb-1">
                        Client Contact
                      </span>
                      <p className="text-white font-bold text-sm mb-0.5">{item.contactName}</p>
                      <p className="text-white/60 flex items-center gap-1.5">
                        <Mail size={12} className="text-vsm-gold" /> {item.email}
                      </p>
                      <p className="text-white/60 flex items-center gap-1.5 mt-0.5">
                        <Phone size={12} className="text-vsm-gold" /> {item.phone}
                      </p>
                    </div>

                    <div>
                      <span className="text-white/40 font-semibold uppercase tracking-wider block mb-1">
                        Date & Venue
                      </span>
                      <p className="text-white font-bold text-sm mb-0.5 flex items-center gap-1.5">
                        <Calendar size={13} className="text-vsm-gold" />
                        <span>{item.eventDate ? formatDate(item.eventDate) : 'Date TBC'}</span>
                      </p>
                      <p className="text-white/60 flex items-center gap-1.5 mt-0.5">
                        <MapPin size={13} className="text-vsm-gold" />
                        <span>{item.location}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-white/40 font-semibold uppercase tracking-wider block mb-1">
                        Requested Crew Deployment
                      </span>
                      <p className="text-white font-medium leading-relaxed">
                        {item.crewNeeds || 'Standard Event Production Team'}
                      </p>
                      {item.deliverables && (
                        <p className="text-vsm-gold mt-1 font-medium">
                          Deliverables: {item.deliverables}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Scope & Notes */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="text-white/60">
                      <strong className="text-white">Coverage Directives:</strong> {item.coverageNeeds}
                    </div>

                    {item.notes && (
                      <span className="text-vsm-gold/80 italic font-mono text-[11px] self-start sm:self-auto">
                        Notes: {item.notes}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Modal: Ingest New Corporate Lead */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-near-black/85 backdrop-blur-md">
              <div className="relative max-w-2xl w-full bg-deep-navy border border-vsm-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-vsm-gold hover:text-near-black text-white flex items-center justify-center transition-all"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-deep-navy border border-vsm-gold/30 text-vsm-gold text-xs font-semibold uppercase tracking-wider mb-2">
                    <Building2 size={12} />
                    <span>Inbound Enterprise Brief</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Record Corporate Opportunity
                  </h3>
                  <p className="text-xs text-white/60 mt-1">
                    Directly ingest an enterprise summit, brand activation, or hackathon lead.
                  </p>
                </div>

                <form onSubmit={handleCreateLead} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                        Organisation Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newOrg}
                        onChange={(e) => setNewOrg(e.target.value)}
                        placeholder="e.g. AWS User Group or TUT"
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white text-xs outline-none focus:border-vsm-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        required
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                        placeholder="e.g. Kagiso Ndlovu"
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white text-xs outline-none focus:border-vsm-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="k.ndlovu@org.co.za"
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white text-xs outline-none focus:border-vsm-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="+27 82 000 0000"
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white text-xs outline-none focus:border-vsm-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                        Event / Summit Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newEvent}
                        onChange={(e) => setNewEvent(e.target.value)}
                        placeholder="e.g. AWS Summit 2026"
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white text-xs outline-none focus:border-vsm-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                        Date
                      </label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white text-xs outline-none focus:border-vsm-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                        Target Budget (ZAR)
                      </label>
                      <input
                        type="number"
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white text-xs outline-none focus:border-vsm-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                      Venue & Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. CSIR International Convention Centre, Pretoria"
                      className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white text-xs outline-none focus:border-vsm-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                      Scope & Directives *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newScope}
                      onChange={(e) => setNewScope(e.target.value)}
                      placeholder="Keynotes, breakout workshops, executive portraits, same-day reels..."
                      className="w-full px-4 py-2.5 rounded-xl bg-near-black border border-white/15 text-white text-xs outline-none focus:border-vsm-gold resize-none"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-5 py-2.5 rounded-full border border-white/20 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-gold px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      <span>Save Deal to Pipeline</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Quick Proposal & Margin Breakdown */}
          {quoteModalLead && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-near-black/85 backdrop-blur-md">
              <div className="relative max-w-xl w-full bg-deep-navy border border-vsm-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
                <button
                  type="button"
                  onClick={() => setQuoteModalLead(null)}
                  className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-vsm-gold hover:text-near-black text-white flex items-center justify-center transition-all"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

                <div className="mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-vsm-gold block mb-1">
                    Enterprise Quotation Engine
                  </span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {quoteModalLead.organisation}
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">{quoteModalLead.eventName}</p>
                </div>

                <div className="p-5 rounded-2xl bg-corporate-navy/40 border border-white/10 space-y-3 text-xs mb-6">
                  <div className="flex justify-between items-center text-white/70">
                    <span>Proposed Corporate Package Price:</span>
                    <strong className="text-white text-sm">
                      {formatCurrency(quoteModalLead.estimatedBudget || 35000)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-white/70">
                    <span>Estimated Creative Crew Compensation:</span>
                    <span className="text-white font-mono">
                      - {formatCurrency(Math.round((quoteModalLead.estimatedBudget || 35000) * 0.45))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-white/70">
                    <span>Equipment & Travel Logistics:</span>
                    <span className="text-white font-mono">
                      - {formatCurrency(Math.round((quoteModalLead.estimatedBudget || 35000) * 0.1))}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center font-bold">
                    <span className="text-vsm-gold">Projected VSM Gross Margin (45%):</span>
                    <span className="text-vsm-gold text-base">
                      {formatCurrency(Math.round((quoteModalLead.estimatedBudget || 35000) * 0.45))}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleStageUpdate(quoteModalLead.id, 'Quote');
                      setQuoteModalLead(null);
                      toast.success('Official quotation generated & sent to client!');
                    }}
                    className="btn-gold w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <FileText size={14} />
                    <span>Generate & Advance to Quote Stage</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleStageUpdate(quoteModalLead.id, 'Contract');
                      setQuoteModalLead(null);
                      toast.success('Moved to SLA contract negotiation.');
                    }}
                    className="w-full py-3 rounded-xl bg-white/10 text-white hover:bg-white/15 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={14} />
                    <span>Issue Enterprise SLA Contract</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
