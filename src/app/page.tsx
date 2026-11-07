import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, CalendarCheck, Camera, ChevronRight, Landmark, LockKeyhole, WalletCards } from 'lucide-react';
import PublicShell from '@/components/public/PublicShell';

const products = [
  { title: 'Book', description: 'Plan event photography or videography around the coverage you need.', href: '/book', icon: Camera, action: 'Plan an event' },
  { title: 'Finance', description: 'Explore personal-loan applications separately from event-service finance.', href: '/finance', icon: Landmark, action: 'Explore finance' },
  { title: 'Opportunities', description: 'Find professional event opportunities for photographers and videographers.', href: '/opportunities', icon: BriefcaseBusiness, action: 'View opportunities' },
  { title: 'Memory Vault', description: 'Access event photos, video and downloads in one organised place.', href: '/vault', icon: LockKeyhole, action: 'Open a vault' },
];

export default function LandingPage() {
  return (
    <PublicShell>
      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.04fr_.96fr] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
            <div>
              <p className="mb-5 text-sm font-semibold text-[#A98214]">VSM DIGITAL SERVICES</p>
              <h1 className="max-w-2xl text-4xl font-bold leading-[1.1] tracking-[-.04em] text-[#0B1F3A] sm:text-5xl">The trusted place for the moments that matter.</h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">Capture an event, choose a payment path, follow the work, and return to it in your Memory Vault. VSM keeps each step clear.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/book" className="btn-gold gap-2 px-5 py-3 text-sm">Start an event plan <ArrowRight size={16} /></Link>
                <Link href="/finance" className="btn-silver gap-2 px-5 py-3 text-sm">Explore personal finance <ChevronRight size={16} /></Link>
              </div>
              <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-slate-200 pt-5 text-xs text-slate-500">
                <span className="flex items-center gap-2"><CalendarCheck size={15} className="text-[#A98214]" /> Guided booking</span>
                <span className="flex items-center gap-2"><WalletCards size={15} className="text-[#A98214]" /> Clear payment status</span>
                <span className="flex items-center gap-2"><LockKeyhole size={15} className="text-[#A98214]" /> Event access</span>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl bg-[#0B1F3A] p-2 shadow-xl shadow-slate-900/10">
              <div className="relative min-h-[340px] overflow-hidden rounded-lg sm:min-h-[450px]">
                <img src="/assets/images/vsm_snaps/brideandgroom.jpg" alt="A VSM event photograph" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/85 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white"><span className="text-xs font-semibold tracking-[.14em] text-[#E7C766]">VSM BOOK</span><p className="mt-2 text-xl font-semibold">Photography and videography shaped around your occasion.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-sm font-semibold text-[#A98214]">ONE ECOSYSTEM, FOUR PRODUCTS</p><h2 className="mt-2 text-3xl font-bold tracking-[-.03em] text-[#0B1F3A]">Choose the next step, not a generic package.</h2></div>
            <p className="max-w-sm text-sm leading-6 text-slate-600">Every product has a distinct purpose, while your booking, finance and event access stay connected.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <Link key={product.title} href={product.href} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                <product.icon size={22} className="text-[#A98214]" />
                <h3 className="mt-7 text-lg font-bold text-[#0B1F3A]">{product.title}</h3>
                <p className="mt-2 min-h-14 text-sm leading-6 text-slate-600">{product.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A]">{product.action} <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
            <div className="rounded-xl bg-[#0B1F3A] p-7 text-white sm:p-9">
              <p className="text-sm font-semibold text-[#E7C766]">VSM FOR BUSINESS</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-.03em]">Professional visual production for organisations and brands.</h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">For conferences, summits, hackathons, brand activations, product launches and more. Share a focused brief and receive a custom proposal—not consumer package pricing.</p>
              <Link href="/business" className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1F3A]">Start a business brief <ArrowRight size={15} /></Link>
            </div>
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-7 sm:p-9">
              <p className="text-sm font-semibold text-[#A98214]">FOR CREATIVES</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-.03em] text-[#0B1F3A]">Find event work with a professional brief.</h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">Browse current opportunities, understand the scope before you apply, and keep your professional profile ready for future work.</p>
              <Link href="/opportunities" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A]">Browse opportunities <ArrowRight size={15} /></Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div><p className="text-sm font-semibold text-[#A98214]">AFTER THE EVENT</p><h2 className="mt-2 text-3xl font-bold tracking-[-.03em] text-[#0B1F3A]">Your work, organised around the event.</h2><p className="mt-4 text-sm leading-6 text-slate-600">The Memory Vault gives customers a clear place to find an event&apos;s photos, videos, highlights and available downloads. Vault access and upgrades are explained before purchase.</p><Link href="/vault" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A]">Access Memory Vault <ArrowRight size={15} /></Link></div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm"><img src="/assets/images/vsm_snaps/Graduate.jpg" alt="A graduation captured by VSM" className="h-64 w-full rounded-lg object-cover sm:h-80" /></div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
