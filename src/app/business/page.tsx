import React, { Suspense } from 'react';
import {
  Camera,
  Film,
  Building2,
  ScrollText,
  FileText,
  ReceiptText,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Video,
  Award,
  Zap,
  Users
} from 'lucide-react';
import PublicShell from '@/components/public/PublicShell';
import BusinessBrief from './BusinessBrief';

const ENTERPRISE_CAPABILITIES = [
  {
    icon: Film,
    title: 'Multi-Camera Stage & Drone Deployments',
    description: 'Complete cinema teams capturing plenary stages, breakout session tracks, expo floor activations, and venue aerials simultaneously.',
  },
  {
    icon: Zap,
    title: '4-Hour Same-Day Social Media Reels',
    description: 'Dedicated post-production editors stationed on-site cutting 9:16 vertical reels and soundbites within 4 hours of keynotes for viral brand reach.',
  },
  {
    icon: Users,
    title: 'Executive Portrait Pop-Up Studio',
    description: 'On-site studio lighting setup for C-suite executive portraits, speaker headshots, and delegate LinkedIn portraits during networking breaks.',
  },
  {
    icon: Video,
    title: 'Keynote Multitrack Master Archive',
    description: 'Isolated audio feeds, synchronized multicam cuts, and uncompressed 4K video masters delivered to your cloud vault for perpetual training archives.',
  },
  {
    icon: ShieldCheck,
    title: 'Corporate Governance & Tax Billing',
    description: 'Compliant vendor onboarding, B-BBEE documentation, valid tax invoices, and flexible corporate terms (50% deposit / 30-day settlement).',
  },
  {
    icon: Award,
    title: 'Dedicated Lead Executive Producer',
    description: 'A single point of contact coordinating all run-of-show cues, crew call sheets, safety protocols, and post-production delivery schedules.',
  },
];

const WORKFLOW_STEPS = [
  { step: '01', title: 'Brief Ingestion', desc: 'Submit scope, date, headcount & required crew footprint.' },
  { step: '02', title: 'Formal Proposal', desc: 'Tailored creative treatment, crew matrix & delivery timeline.' },
  { step: '03', title: 'SLA Contract & Quote', desc: 'Transparent rate breakdown, corporate terms & deliverables sign-off.' },
  { step: '04', title: 'Crew Dispatch', desc: 'Briefed, accredited professional creatives deployed on-site.' },
  { step: '05', title: 'Rapid Delivery', desc: 'Same-day social clips followed by full high-resolution vault delivery.' },
];

export default function BusinessPage() {
  return (
    <PublicShell>
      <main className="min-h-screen bg-near-black text-clear-white pb-24 font-sans selection:bg-vsm-gold/20 selection:text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-28 border-b border-white/5 bg-gradient-to-b from-deep-navy/35 via-transparent to-transparent">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-deep-navy/40 blur-[130px] pointer-events-none rounded-full" />

          <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-navy border border-vsm-gold/30 text-vsm-gold text-xs font-semibold uppercase tracking-widest mb-5">
              <Building2 size={13} className="text-vsm-gold" />
              <span>VSM for Business · Enterprise Production</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Visual Media Production for <span className="text-vsm-gold">High-Stakes Events.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/65 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
              Tech summits, university hackathons, brand activations, and executive conferences.
              VSM deploys accredited multi-camera crews with same-day social clips and formal corporate SLAs.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-vsm-gold" /> Official Vendor Onboarding
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-vsm-gold" /> Corporate Tax Invoices
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-vsm-gold" /> 4-Hour Same-Day Social Clips
              </span>
            </div>
          </div>
        </section>

        {/* Main Grid: Capabilities & Brief Form */}
        <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Capabilities & Workflow (5 Cols) */}
            <div className="lg:col-span-5 space-y-10">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-vsm-gold mb-2 block">
                  Enterprise Capabilities
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                  Engineered for Organizations.
                </h2>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  We don&apos;t treat an enterprise summit like a consumer photoshoot. Our production teams operate with broadcast-grade redundancy and strict timelines.
                </p>
              </div>

              {/* Capabilities Stack */}
              <div className="space-y-4">
                {ENTERPRISE_CAPABILITIES.map((cap) => {
                  const Icon = cap.icon;
                  return (
                    <div
                      key={cap.title}
                      className="p-5 rounded-2xl bg-deep-navy/40 border border-white/5 hover:border-vsm-gold/25 transition-all flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-deep-navy border border-vsm-gold/30 flex items-center justify-center text-vsm-gold flex-shrink-0 mt-0.5">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1">{cap.title}</h3>
                        <p className="text-xs text-white/60 leading-relaxed">{cap.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Production Workflow */}
              <div className="p-6 rounded-3xl bg-corporate-navy/40 border border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-vsm-gold block mb-4">
                  The Enterprise Deal Lifecycle
                </span>
                <div className="space-y-3.5">
                  {WORKFLOW_STEPS.map((step) => (
                    <div key={step.step} className="flex items-start gap-3 text-xs">
                      <span className="font-mono text-vsm-gold font-bold">{step.step}</span>
                      <div>
                        <strong className="text-white block">{step.title}</strong>
                        <span className="text-white/50">{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Brief Intake Form (7 Cols) */}
            <div className="lg:col-span-7">
              <Suspense
                fallback={
                  <div className="rounded-3xl border border-white/10 bg-deep-navy/40 p-12 text-center text-white/50">
                    Loading Enterprise Brief...
                  </div>
                }
              >
                <BusinessBrief />
              </Suspense>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
