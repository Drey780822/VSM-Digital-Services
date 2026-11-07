import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Globe, MessageCircle, Share2 } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="relative bg-near-black border-t border-white/10 text-white/70">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3.5 mb-5 group">
              <div className="relative w-10 h-10 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/assets/images/logos/vsm-symbol-gold-transparent-1024.png"
                  alt="VSM Symbol"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-white text-lg leading-tight">
                  VSM
                </span>
                <span className="text-[10px] tracking-widest uppercase text-vsm-gold font-semibold">
                  Digital Services
                </span>
              </div>
            </Link>
            <p className="text-xs text-white/60 leading-relaxed max-w-sm mb-6 font-normal">
              The premier platform that helps South African individuals and organizations capture,
              finance, manage, and preserve important moments — while empowering creative professionals.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Globe, href: '#', label: 'Website' },
                { icon: MessageCircle, href: '#', label: 'WhatsApp' },
                { icon: Share2, href: '#', label: 'Social' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={`social-${label}`}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-deep-navy border border-white/10 flex items-center justify-center text-white/70 hover:text-vsm-gold hover:border-vsm-gold/40 transition-all"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Commercial Lanes
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/book" className="hover:text-vsm-gold transition-colors">
                  Mini Events (Hourly)
                </Link>
              </li>
              <li>
                <Link href="#packages" className="hover:text-vsm-gold transition-colors">
                  Major Productions (Packages)
                </Link>
              </li>
              <li>
                <a href="#business-brief" className="hover:text-vsm-gold transition-colors">
                  VSM for Business
                </a>
              </li>
              <li>
                <Link href="/book" className="hover:text-vsm-gold transition-colors">
                  Add-Ons &amp; Upgrades
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions & Storage */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Platform &amp; Vault
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#gallery" className="hover:text-vsm-gold transition-colors">
                  Memory Vault (Gallery)
                </a>
              </li>
              <li>
                <Link href="#financing" className="hover:text-vsm-gold transition-colors">
                  Smart Event Financing
                </Link>
              </li>
              <li>
                <Link href="/loan-application-flow" className="hover:text-vsm-gold transition-colors">
                  Personal Loans Portal
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-vsm-gold transition-colors">
                  Client &amp; Creator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Presence
            </h4>
            <div className="space-y-3 text-xs text-white/60">
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-vsm-gold flex-shrink-0 mt-0.5" />
                <span>Pretoria &amp; Johannesburg, Gauteng, South Africa</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-vsm-gold flex-shrink-0" />
                <span>+27 000 000 0000</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-vsm-gold flex-shrink-0" />
                <span>info@vsmdigital.co.za</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-4">
          <p>© {new Date().getFullYear()} VSM Digital Services. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white/70 transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="#" className="hover:text-white/70 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white/70 transition-colors">
              NCR Disclosures
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
