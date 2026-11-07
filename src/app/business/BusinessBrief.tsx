'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { submitCorporateEnquiry } from '@/lib/services/business.service';

export default function BusinessBrief() {
  const search = useSearchParams();
  const [form, setForm] = useState({ organisation: '', contactName: '', email: '', phone: '', eventName: search.get('event') || '', eventDate: '', location: '', coverageNeeds: '', crewNeeds: '', deliverables: '' });
  const [sending, setSending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');
  const update = (key: string, value: string) => setForm({ ...form, [key]: value });
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSending(true); setError('');
    try { await submitCorporateEnquiry(form); setComplete(true); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Your brief could not be sent. Please try again.'); }
    finally { setSending(false); }
  };
  if (complete) return <div className="rounded-xl border border-[#A7DEC4] bg-[#F2FBF6] p-7 text-center"><CheckCircle2 size={32} className="mx-auto text-[#16805C]" /><h2 className="mt-3 text-xl font-bold text-[#0B1F3A]">Brief received</h2><p className="mt-2 text-sm leading-6 text-slate-600">Your enquiry has entered the proposal stage. VSM will move it through proposal, quote, contract, invoice and booking as applicable.</p></div>;
  const input = 'input-luxury mt-1.5 w-full px-3 py-2.5 text-sm font-normal';
  return <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold text-[#0B1F3A]">Tell us about the work</h2><p className="mt-2 text-sm text-slate-600">A concise brief helps VSM prepare an appropriate proposal.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Organisation" value={form.organisation} onChange={(value) => update('organisation', value)} required className={input} /><Field label="Contact name" value={form.contactName} onChange={(value) => update('contactName', value)} required className={input} /><Field label="Work email" type="email" value={form.email} onChange={(value) => update('email', value)} required className={input} /><Field label="Phone" type="tel" value={form.phone} onChange={(value) => update('phone', value)} required className={input} /><Field label="Event or project" value={form.eventName} onChange={(value) => update('eventName', value)} required className={input} /><Field label="Date" type="date" value={form.eventDate} onChange={(value) => update('eventDate', value)} className={input} /><Field label="Location" value={form.location} onChange={(value) => update('location', value)} required className={input} /></div><Text label="Coverage needs" value={form.coverageNeeds} onChange={(value) => update('coverageNeeds', value)} required /><Text label="Crew needs (optional)" value={form.crewNeeds} onChange={(value) => update('crewNeeds', value)} /><Text label="Deliverables (optional)" value={form.deliverables} onChange={(value) => update('deliverables', value)} />{error && <p role="alert" className="mt-4 rounded-md border border-[#F2B8B5] bg-[#FFF0EF] p-3 text-xs leading-5 text-[#C2413B]">{error}</p>}<button disabled={sending} className="btn-gold mt-6 w-full px-4 py-3 text-sm disabled:opacity-50">{sending ? <><Loader2 size={16} className="mr-2 animate-spin" />Sending brief</> : <>Send business brief <ArrowRight size={16} className="ml-2" /></>}</button></form>;
}

function Field({ label, value, onChange, className, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; className: string; type?: string; required?: boolean }) { return <label className="block text-sm font-semibold text-[#122B4A]">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={className} required={required} /></label>; }
function Text({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="mt-4 block text-sm font-semibold text-[#122B4A]">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} required={required} rows={3} className="input-luxury mt-1.5 w-full px-3 py-2.5 text-sm font-normal" /></label>; }
