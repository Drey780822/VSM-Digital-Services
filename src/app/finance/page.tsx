import Link from 'next/link';
import { ArrowRight, CalendarDays, CheckCircle2, Landmark, ShieldCheck, WalletCards } from 'lucide-react';
import PublicShell from '@/components/public/PublicShell';

export default function FinancePage() {
  return (
    <PublicShell>
      <main>
        <section className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"><p className="text-sm font-semibold text-[#A98214]">VSM FINANCE</p><div className="mt-3 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end"><div><h1 className="max-w-3xl text-4xl font-bold tracking-[-.04em] text-[#0B1F3A] sm:text-5xl">Personal finance with a clear purpose.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">Personal loans are a distinct VSM product. Event-service finance is available separately when an eligible booking meets the current threshold.</p></div><div className="rounded-xl border border-[#E7C766] bg-[#FFFBEF] p-5 text-sm leading-6 text-[#624B0C]"><ShieldCheck size={20} className="mb-2 text-[#A98214]" />Any application is subject to eligibility, verification and approval. Terms and repayment information are shown only where configured.</div></div></div></section>
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="grid gap-5 lg:grid-cols-2"><article className="rounded-xl bg-[#0B1F3A] p-7 text-white sm:p-9"><Landmark size={26} className="text-[#E7C766]" /><p className="mt-7 text-sm font-semibold text-[#E7C766]">PERSONAL LOANS</p><h2 className="mt-2 text-3xl font-bold tracking-[-.03em]">Apply for a personal loan.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">Start a secure application for personal financial needs. This application is not tied to an event booking.</p><Link href="/loan-application-flow" className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-semibold text-[#0B1F3A]">Start personal-loan application <ArrowRight size={15} /></Link></article>
          <article className="rounded-xl border border-slate-200 bg-white p-7 sm:p-9"><WalletCards size={26} className="text-[#A98214]" /><p className="mt-7 text-sm font-semibold text-[#A98214]">EVENT-SERVICE FINANCE</p><h2 className="mt-2 text-3xl font-bold tracking-[-.03em] text-[#0B1F3A]">Finance an eligible event service.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">Available within booking when the configured value threshold is met. It is not promoted for low-ticket mini events.</p><Link href="/book" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A]">Build an event estimate <ArrowRight size={15} /></Link></article></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3"><Info icon={CheckCircle2} title="Start with the right product" text="Choose a personal loan or build an event estimate first." /><Info icon={CalendarDays} title="Review before submitting" text="Your application flow shows the information required for the selected product." /><Info icon={ShieldCheck} title="Know the application status" text="Approval is not implied until VSM completes the necessary review." /></div>
        </section>
      </main>
    </PublicShell>
  );
}

function Info({ icon: Icon, title, text }: { icon: typeof CheckCircle2; title: string; text: string }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-5"><Icon size={19} className="text-[#A98214]" /><h3 className="mt-4 text-sm font-bold text-[#0B1F3A]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>;
}
