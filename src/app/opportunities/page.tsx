import React from 'react';
import Link from 'next/link';
import {
  BriefcaseBusiness,
  ShieldCheck,
  Sparkles,
  Camera,
  Coins,
  Award,
  ArrowRight,
  Clock,
  Layers,
  Building2,
  CheckCircle2
} from 'lucide-react';
import PublicShell from '@/components/public/PublicShell';
import OpportunityList from './OpportunityList';

export const metadata = {
  title: 'Creator Dispatch & Production Opportunities | VSM Visual Studio',
  description:
    'Verified event commissions, multi-camera corporate summit assignments, and graduation photography contracts for vetted South African visual creators.',
};

export default function OpportunitiesPage() {
  return (
    <PublicShell>
      <main className="min-h-screen bg-[#070B12] text-white selection:bg-vsm-gold/20 selection:text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-deep-navy via-[#0A1627] to-[#070B12] py-20 lg:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(212,175,55,0.15),transparent)]" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-vsm-gold/[0.03] to-transparent pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-vsm-gold/30 bg-vsm-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-vsm-gold backdrop-blur-sm">
                <Sparkles size={13} />
                VSM Creator Network & Dispatch
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl font-sans">
                Professional event work for{' '}
                <span className="bg-gradient-to-r from-vsm-gold via-[#F3E5AB] to-vsm-gold bg-clip-text text-transparent">
                  visual storytellers.
                </span>
              </h1>

              <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
                VSM matches vetted photographers, cinematographers, and drone pilots with premier South African corporate summits, university graduations, and landmark events. Transparent rates, verified scopes, and seamless post-production handoff.
              </p>
            </div>

            {/* Value Pillars */}
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <PillarCard
                icon={BriefcaseBusiness}
                title="Verified Event Briefs"
                description="Exact shot lists, crew composition, venue logistics, and client SLAs declared prior to gig acceptance."
              />
              <PillarCard
                icon={Coins}
                title="Guaranteed Professional Pay"
                description="Clear day-rates and per-deliverable honorariums deposited directly into your South African bank account upon delivery."
              />
              <PillarCard
                icon={Award}
                title="Prestige Portfolio Access"
                description="Shoot for top institutions like TUT, AWS developer groups, high-growth startups, and gala dinners."
              />
            </div>
          </div>
        </section>

        {/* Live Opportunities Feed Section */}
        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <OpportunityList />
        </section>

        {/* Creator Standards Banner */}
        <section className="border-t border-white/10 bg-corporate-navy/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-deep-navy to-corporate-navy p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-vsm-gold/5 blur-3xl pointer-events-none" />

              <div className="max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-widest text-vsm-gold">
                  VSM Production Standards
                </div>
                <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  Are you a freelance creator looking for recurring corporate work?
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  We look for creators with dual-card slot professional mirrorless bodies (Sony, Canon, Nikon), high-speed lenses (f/2.8 or f/1.4 primes), and consistent color grading workflows. Join our talent bench to receive direct SMS/WhatsApp gig alerts.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-vsm-gold" /> Dual-slot RAW capture
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-vsm-gold" /> Clean 4K 10-bit video capability
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-vsm-gold" /> 24-48h turnaround commitment
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/portal"
                    className="inline-flex items-center gap-2 rounded-xl bg-vsm-gold px-6 py-3 text-xs font-bold text-deep-navy shadow-lg shadow-vsm-gold/25 hover:bg-[#E7C766] transition-all"
                  >
                    Open Creator Profile <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/business"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold text-white hover:bg-white/10 transition-all"
                  >
                    Explore Enterprise Production <Building2 size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

function PillarCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-all hover:border-vsm-gold/30 hover:bg-white/[0.05]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vsm-gold/15 text-vsm-gold border border-vsm-gold/30">
        <Icon size={20} />
      </div>
      <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
