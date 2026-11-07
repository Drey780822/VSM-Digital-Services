'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calendar, Check, CheckCircle2, Clock3, CreditCard, Landmark, Loader2, MapPin, ShieldCheck, UserRound, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import PublicShell from '@/components/public/PublicShell';
import { useAuth } from '@/contexts/AuthContext';
import { createBooking } from '@/lib/bookings/service';
import { fetchActivePackages, type PackageRecord } from '@/lib/services/packages.service';
import { fetchProductConfig, formatZAR, type ProductConfig } from '@/lib/services/product-config.service';
import { uploadPaymentProof } from '@/lib/services/payment-proofs.service';

type Model = 'flexible' | 'production' | 'quote';
type PaymentChoice = 'full' | 'deposit' | 'eft' | 'cash' | 'finance';

const paymentLabels: Record<PaymentChoice, { title: string; body: string }> = {
  full: { title: 'Pay in full', body: 'Payment status remains pending until verified.' },
  deposit: { title: 'Pay a deposit', body: 'The remaining balance is shown after the required deposit is verified.' },
  eft: { title: 'EFT', body: 'Upload proof of payment for administrator verification.' },
  cash: { title: 'Cash', body: 'An administrator must confirm the payment.' },
  finance: { title: 'Apply for finance', body: 'Eligibility, verification and approval are required.' },
};

const cleanEventType = (value: string) => value === 'Corporate event' ? 'Corporate Event' : value;

export default function BookExperience() {
  const router = useRouter();
  const { user } = useAuth();
  const [config, setConfig] = useState<ProductConfig | null>(null);
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [step, setStep] = useState(1);
  const [eventName, setEventName] = useState('');
  const [hours, setHours] = useState(2);
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [packageId, setPackageId] = useState('');
  const [addons, setAddons] = useState<string[]>([]);
  const [payment, setPayment] = useState<PaymentChoice>('deposit');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', idNumber: '', date: '', time: '', venue: '', address: '', guests: '50', notes: '' });

  useEffect(() => {
    Promise.all([fetchProductConfig(), fetchActivePackages()])
      .then(([nextConfig, nextPackages]) => { setConfig(nextConfig); setPackages(nextPackages); })
      .catch(() => setLoadError(true));
  }, []);

  const selectedEvent = config?.eventRules.find((event) => event.name === eventName);
  const model = selectedEvent?.model;
  const selectedPackage = packages.find((item) => item.id === packageId);
  const selectedDeliverables = config?.deliverables.filter((item) => deliverables.includes(item.id)) || [];
  const selectedAddons = config?.addons.filter((item) => addons.includes(item.id)) || [];
  const coverage = model === 'flexible' && config ? hours * config.hourlyRate : selectedPackage?.price || 0;
  const total = coverage + selectedDeliverables.reduce((sum, item) => sum + item.price, 0) + selectedAddons.reduce((sum, item) => sum + item.price, 0);
  const financeEligible = Boolean(config && total >= config.financeThreshold && model !== 'flexible');
  const availablePaymentChoices = useMemo<PaymentChoice[]>(() => {
    if (!config) return [];
    const choices: PaymentChoice[] = ['full', 'deposit'];
    if (config.paymentMethods.eft) choices.push('eft');
    if (config.paymentMethods.cash) choices.push('cash');
    if (financeEligible) choices.push('finance');
    return choices;
  }, [config, financeEligible]);

  useEffect(() => {
    if (config && !availablePaymentChoices.includes(payment)) setPayment(availablePaymentChoices[0] || 'deposit');
  }, [config, availablePaymentChoices, payment]);

  const canContinue = step === 1 ? Boolean(eventName) : step === 2 ? (model === 'flexible' ? hours >= (config?.minimumHours || 1) : Boolean(packageId)) : step === 3 ? Boolean(form.fullName && form.email && form.phone && form.date && form.time && form.venue && form.address) : true;

  const continueFlow = () => {
    if (!canContinue) return;
    if (step === 1 && model === 'quote') { router.push(`/business?event=${encodeURIComponent(eventName)}`); return; }
    setStep((current) => Math.min(4, current + 1));
  };

  const submit = async () => {
    if (!user) { router.push('/auth/login?redirect=/book'); return; }
    setSubmitting(true);
    try {
      const name = model === 'flexible' ? `${hours} hour ${eventName} coverage` : selectedPackage?.name || 'VSM production';
      const base = model === 'flexible' ? coverage : selectedPackage?.price || 0;
      const result = await createBooking({
        fullName: form.fullName, email: form.email, phone: form.phone, idNumber: form.idNumber || 'Not provided',
        eventType: cleanEventType(eventName) as never, eventDate: form.date, eventTime: form.time, venueName: form.venue, venueAddress: form.address,
        guestCount: Number(form.guests) || 1, packageId: packageId || `flex-${hours}`, packageName: name, packagePrice: base,
        addons: [...selectedDeliverables, ...selectedAddons].map((item) => ({ id: item.id, name: item.name, price: item.price })),
        notes: `${form.notes}${form.notes ? '\n' : ''}Payment preference: ${payment}. Booking is pending payment verification.`,
        financed: payment === 'finance', paymentPreference: payment === 'finance' ? 'finance' : 'direct', financeTerm: payment === 'finance' ? 6 : undefined,
      });
      if (typeof window !== 'undefined') sessionStorage.setItem('vsm-track-session', JSON.stringify({ email: form.email, reference: result.referenceNumber, bookingId: result.id }));
      setBookingId(result.id);
      setSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'We could not submit your booking. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (!config) {
    return <PublicShell compact><main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4"><div className="rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm"><Loader2 className="mx-auto animate-spin text-[#A98214]" /><p className="mt-3 text-sm font-medium text-[#122B4A]">Loading booking options…</p>{loadError && <p className="mt-2 text-xs text-slate-500">We could not load booking configuration. Please refresh or contact VSM.</p>}</div></main></PublicShell>;
  }

  return (
    <PublicShell compact>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div><Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0B1F3A]"><ArrowLeft size={14} /> Back to VSM</Link><p className="mt-4 text-sm font-semibold text-[#A98214]">VSM BOOK</p><h1 className="mt-1 text-3xl font-bold tracking-[-.035em] text-[#0B1F3A]">Plan your coverage</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Select an event first. VSM will show the commercial model that fits it.</p></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><ShieldCheck size={15} className="text-[#16805C]" /> Booking confirmation follows verified payment.</div>
        </div>

        <div className="mb-8 grid grid-cols-4 gap-2" aria-label="Booking progress">
          {['Event', 'Coverage', 'Details', 'Payment'].map((label, index) => <div key={label} className={`border-t-2 pt-2 text-xs font-semibold ${step >= index + 1 ? 'border-[#D4AF37] text-[#0B1F3A]' : 'border-slate-200 text-slate-400'}`}><span className="mr-1 text-slate-400">0{index + 1}</span>{label}</div>)}
        </div>

        {submitted ? (
          <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10"><CheckCircle2 size={38} className="mx-auto text-[#16805C]" /><h2 className="mt-4 text-2xl font-bold text-[#0B1F3A]">Booking submitted</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">Your booking is recorded as pending. It is not confirmed until the required payment or deposit has been verified.</p>{payment === 'eft' && bookingId && <ProofUpload bookingId={bookingId} />}<div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/portal" className="btn-gold px-5 py-3 text-sm">Open my account</Link><Link href="/track" className="btn-silver px-5 py-3 text-sm">Track booking</Link></div></section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              {step === 1 && <EventStep events={config.eventRules} selected={eventName} onSelect={setEventName} />}
              {step === 2 && model === 'flexible' && <FlexibleStep config={config} hours={hours} setHours={setHours} deliverables={deliverables} setDeliverables={setDeliverables} addons={addons} setAddons={setAddons} />}
              {step === 2 && model === 'production' && <ProductionStep packages={packages} selected={packageId} setSelected={setPackageId} config={config} addons={addons} setAddons={setAddons} />}
              {step === 3 && <DetailsStep value={form} setValue={(value) => setForm(value as typeof form)} />}
              {step === 4 && <PaymentStep choices={availablePaymentChoices} value={payment} setValue={setPayment} financeEligible={financeEligible} configuredOnline={config.paymentMethods.yoco || config.paymentMethods.payfast} />}
              <div className="mt-8 flex gap-3 border-t border-slate-200 pt-5">
                {step > 1 && <button type="button" onClick={() => setStep((current) => current - 1)} className="btn-silver flex-1 px-4 py-3 text-sm"><ArrowLeft size={16} className="mr-2" /> Back</button>}
                {step < 4 ? <button type="button" disabled={!canContinue} onClick={continueFlow} className="btn-gold flex-1 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40">{step === 1 && model === 'quote' ? 'Request a custom quote' : <>Continue <ArrowRight size={16} className="ml-2" /></>}</button> : <button type="button" onClick={submit} disabled={submitting} className="btn-gold flex-1 px-4 py-3 text-sm disabled:opacity-50">{submitting ? <><Loader2 size={16} className="mr-2 animate-spin" /> Submitting</> : user ? 'Submit booking' : 'Sign in to submit'}</button>}
              </div>
            </section>
            <Estimate model={model} event={eventName} coverage={coverage} packageName={selectedPackage?.name} deliverables={selectedDeliverables} addons={selectedAddons} total={total} financeEligible={financeEligible} config={config} />
          </div>
        )}
      </main>
    </PublicShell>
  );
}

function EventStep({ events, selected, onSelect }: { events: { name: string; detail: string }[]; selected: string; onSelect: (value: string) => void }) {
  return <><h2 className="text-xl font-bold text-[#0B1F3A]">What are you planning?</h2><p className="mt-2 text-sm text-slate-600">Your event type determines how VSM builds your estimate.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{events.map((event) => <button type="button" key={event.name} onClick={() => onSelect(event.name)} className={`rounded-lg border p-4 text-left transition ${selected === event.name ? 'border-[#D4AF37] bg-[#FFFBEF] ring-1 ring-[#D4AF37]' : 'border-slate-200 hover:border-slate-300'}`}><span className="block text-sm font-bold text-[#0B1F3A]">{event.name}</span><span className="mt-1 block text-xs text-slate-500">{event.detail}</span></button>)}</div></>;
}

function FlexibleStep({ config, hours, setHours, deliverables, setDeliverables, addons, setAddons }: { config: ProductConfig; hours: number; setHours: (value: number) => void; deliverables: string[]; setDeliverables: (value: string[]) => void; addons: string[]; setAddons: (value: string[]) => void }) {
  const toggle = (value: string, state: string[], setState: (next: string[]) => void) => setState(state.includes(value) ? state.filter((item) => item !== value) : [...state, value]);
  return <><h2 className="text-xl font-bold text-[#0B1F3A]">Build flexible coverage</h2><p className="mt-2 text-sm text-slate-600">Choose the time and deliverables that match your event. Rates are controlled by VSM administration.</p><div className="mt-6"><p className="text-sm font-semibold text-[#0B1F3A]">Coverage time</p><div className="mt-3 grid grid-cols-4 gap-2">{[1, 2, 3, 4].map((option) => <button type="button" key={option} onClick={() => setHours(option)} className={`rounded-md border px-3 py-3 text-sm font-semibold ${hours === option ? 'border-[#D4AF37] bg-[#FFFBEF] text-[#0B1F3A]' : 'border-slate-200 text-slate-600'}`}>{option === 4 ? '4+ hrs' : `${option} hr`}</button>)}</div></div><OptionList title="Deliverables" values={config.deliverables} selected={deliverables} toggle={(id) => toggle(id, deliverables, setDeliverables)} /><OptionList title="Optional add-ons" values={config.addons.filter((item) => item.models.includes('flexible'))} selected={addons} toggle={(id) => toggle(id, addons, setAddons)} /></>;
}

function ProductionStep({ packages, selected, setSelected, config, addons, setAddons }: { packages: PackageRecord[]; selected: string; setSelected: (value: string) => void; config: ProductConfig; addons: string[]; setAddons: (value: string[]) => void }) {
  return <><h2 className="text-xl font-bold text-[#0B1F3A]">Choose a production package</h2><p className="mt-2 text-sm text-slate-600">Wedding and funeral coverage uses production packages. Inclusion and prices are configured by VSM.</p><div className="mt-6 space-y-3">{packages.map((item) => <button type="button" key={item.id} onClick={() => setSelected(item.id)} className={`w-full rounded-lg border p-4 text-left ${selected === item.id ? 'border-[#D4AF37] bg-[#FFFBEF] ring-1 ring-[#D4AF37]' : 'border-slate-200 hover:border-slate-300'}`}><div className="flex justify-between gap-4"><span><span className="block text-sm font-bold text-[#0B1F3A]">{item.name}</span><span className="mt-1 block text-xs text-slate-500">{item.durationHours} hours · {item.category}</span></span><span className="text-sm font-bold text-[#0B1F3A]">{formatZAR(item.price)}</span></div></button>)}</div><OptionList title="Optional add-ons" values={config.addons.filter((item) => item.models.includes('production'))} selected={addons} toggle={(id) => setAddons(addons.includes(id) ? addons.filter((item) => item !== id) : [...addons, id])} /></>;
}

function OptionList({ title, values, selected, toggle }: { title: string; values: { id: string; name: string; price: number }[]; selected: string[]; toggle: (id: string) => void }) {
  return <div className="mt-7"><p className="text-sm font-semibold text-[#0B1F3A]">{title}</p><div className="mt-3 grid gap-2">{values.map((item) => <button type="button" key={item.id} onClick={() => toggle(item.id)} className={`flex items-center justify-between rounded-md border px-3 py-3 text-left ${selected.includes(item.id) ? 'border-[#D4AF37] bg-[#FFFBEF]' : 'border-slate-200'}`}><span className="flex items-center gap-2 text-sm font-medium text-[#122B4A]"><span className={`flex h-4 w-4 items-center justify-center rounded border ${selected.includes(item.id) ? 'border-[#D4AF37] bg-[#D4AF37] text-[#0B1F3A]' : 'border-slate-300'}`}>{selected.includes(item.id) && <Check size={12} strokeWidth={3} />}</span>{item.name}</span><span className="text-xs font-semibold text-slate-600">+ {formatZAR(item.price)}</span></button>)}</div></div>;
}

function DetailsStep({ value, setValue }: { value: Record<string, string>; setValue: (value: Record<string, string>) => void }) {
  const change = (key: string, next: string) => setValue({ ...value, [key]: next });
  const field = (key: string, label: string, type = 'text', placeholder = '') => <label className="block text-sm font-semibold text-[#122B4A]">{label}<input value={value[key]} onChange={(event) => change(key, event.target.value)} type={type} min={type === 'date' ? new Date().toISOString().slice(0, 10) : undefined} placeholder={placeholder} className="input-luxury mt-1.5 w-full px-3 py-2.5 text-sm font-normal" required /></label>;
  return <><h2 className="text-xl font-bold text-[#0B1F3A]">Event and contact details</h2><p className="mt-2 text-sm text-slate-600">We use these details to prepare and manage the booking.</p><div className="mt-6 grid gap-4 sm:grid-cols-2">{field('fullName', 'Full name', 'text', 'Name and surname')}{field('email', 'Email address', 'email', 'you@example.com')}{field('phone', 'Mobile number', 'tel', 'e.g. 082 000 0000')}{field('idNumber', 'ID number (optional)', 'text')}{field('date', 'Event date', 'date')}{field('time', 'Start time', 'time')}{field('venue', 'Venue name', 'text', 'Venue or location')}{field('guests', 'Estimated guests', 'number')}</div><label className="mt-4 block text-sm font-semibold text-[#122B4A]">Venue address<textarea value={value.address} onChange={(event) => change('address', event.target.value)} placeholder="Street, city and province" className="input-luxury mt-1.5 w-full px-3 py-2.5 text-sm font-normal" rows={2} /></label><label className="mt-4 block text-sm font-semibold text-[#122B4A]">Notes (optional)<textarea value={value.notes} onChange={(event) => change('notes', event.target.value)} placeholder="Anything useful for your booking request" className="input-luxury mt-1.5 w-full px-3 py-2.5 text-sm font-normal" rows={3} /></label></>;
}

function PaymentStep({ choices, value, setValue, financeEligible, configuredOnline }: { choices: PaymentChoice[]; value: PaymentChoice; setValue: (value: PaymentChoice) => void; financeEligible: boolean; configuredOnline: boolean }) {
  return <><h2 className="text-xl font-bold text-[#0B1F3A]">Choose a payment path</h2><p className="mt-2 text-sm text-slate-600">A booking is only confirmed when the required payment or deposit is verified.</p><div className="mt-6 space-y-2">{choices.map((choice) => <button key={choice} type="button" onClick={() => setValue(choice)} className={`w-full rounded-lg border p-4 text-left ${value === choice ? 'border-[#D4AF37] bg-[#FFFBEF] ring-1 ring-[#D4AF37]' : 'border-slate-200'}`}><div className="flex items-start justify-between gap-4"><span><span className="block text-sm font-bold text-[#0B1F3A]">{paymentLabels[choice].title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{paymentLabels[choice].body}</span></span>{value === choice && <CheckCircle2 size={19} className="shrink-0 text-[#A98214]" />}</div></button>)}</div>{!financeEligible && <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">Event-service finance becomes available only when your configured booking threshold is met. Personal loans remain available under Finance.</div>}{!configuredOnline && <div className="mt-3 flex gap-2 rounded-lg border border-slate-200 p-3 text-xs leading-5 text-slate-600"><CreditCard size={16} className="shrink-0 text-slate-400" />Online card payment is not currently shown because no online payment provider is configured.</div>}</>;
}

function Estimate({ model, event, coverage, packageName, deliverables, addons, total, financeEligible, config }: { model?: Model; event: string; coverage: number; packageName?: string; deliverables: { name: string; price: number }[]; addons: { name: string; price: number }[]; total: number; financeEligible: boolean; config: ProductConfig }) {
  const rows = [...deliverables, ...addons];
  return <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24"><p className="text-xs font-bold tracking-[.12em] text-[#A98214]">YOUR ESTIMATE</p><h2 className="mt-2 text-lg font-bold text-[#0B1F3A]">{event || 'Select an event'}</h2>{model === 'quote' ? <p className="mt-4 text-sm leading-6 text-slate-600">This event needs a tailored quote. VSM for Business will collect your brief before a proposal is prepared.</p> : <><div className="mt-5 space-y-3 border-y border-slate-200 py-4 text-sm"><div className="flex justify-between gap-3"><span className="text-slate-500">{packageName || (event ? 'Coverage' : 'Base service')}</span><span className="font-semibold text-[#122B4A]">{coverage ? formatZAR(coverage) : '—'}</span></div>{rows.map((row) => <div key={row.name} className="flex justify-between gap-3"><span className="text-slate-500">{row.name}</span><span className="font-semibold text-[#122B4A]">{formatZAR(row.price)}</span></div>)}</div><div className="mt-4 flex items-end justify-between"><span className="text-sm font-semibold text-[#0B1F3A]">Estimated total</span><span className="text-xl font-bold text-[#0B1F3A]">{formatZAR(total)}</span></div>{financeEligible && <p className="mt-4 rounded-md bg-[#FFFBEF] p-3 text-xs leading-5 text-[#6F5510]"><Landmark size={14} className="mr-1 inline" />Finance may be available for this estimate. Approval depends on eligibility, verification and approval.</p>}<p className="mt-4 text-xs leading-5 text-slate-500">Displayed amounts are based on the current VSM configuration and are reviewed before confirmation.</p></>}</aside>;
}

function ProofUpload({ bookingId }: { bookingId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'complete' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const upload = async () => { if (!file) return; setStatus('uploading'); try { await uploadPaymentProof(bookingId, file); setStatus('complete'); setMessage('Proof uploaded for administrator verification.'); } catch (error) { setStatus('error'); setMessage(error instanceof Error ? error.message : 'Unable to upload proof.'); } };
  return <div className="mx-auto mt-6 max-w-lg rounded-lg border border-slate-200 bg-slate-50 p-4 text-left"><p className="text-sm font-bold text-[#0B1F3A]">Upload EFT proof of payment</p><p className="mt-1 text-xs leading-5 text-slate-600">Your booking remains pending while VSM reviews the uploaded proof.</p>{status === 'complete' ? <p className="mt-3 text-xs font-semibold text-[#16805C]">{message}</p> : <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input type="file" accept="image/*,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} className="block w-full text-xs text-slate-600" /><button type="button" onClick={upload} disabled={!file || status === 'uploading'} className="btn-silver whitespace-nowrap px-3 py-2 text-xs disabled:opacity-50">{status === 'uploading' ? 'Uploading…' : 'Upload proof'}</button></div>}{status === 'error' && <p className="mt-2 text-xs text-[#C2413B]">{message}</p>}</div>;
}
