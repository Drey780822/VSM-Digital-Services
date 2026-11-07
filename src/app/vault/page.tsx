import PublicShell from '@/components/public/PublicShell';
import VaultAccess from './VaultAccess';

export default function VaultPage() { return <PublicShell><main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"><div className="max-w-2xl"><p className="text-sm font-semibold text-[#A98214]">VSM MEMORY VAULT</p><h1 className="mt-3 text-4xl font-bold tracking-[-.04em] text-[#0B1F3A] sm:text-5xl">Come back to what matters.</h1><p className="mt-5 text-base leading-7 text-slate-600">Your post-event destination for photos, videos, highlights and downloads—organised around the event.</p></div><div className="mt-10"><VaultAccess /></div></main></PublicShell>; }
