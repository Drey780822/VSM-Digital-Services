import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';

export default function LandingFooter() {
  return (
    <footer className="relative bg-background-secondary border-t border-border">
      <div className="section-divider absolute top-0 left-0 right-0" />
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <AppLogo size={36} />
              <span className="font-display text-xl font-semibold text-gradient-gold">VSM</span>
            </div>
            <p className="text-sm text-foreground-muted leading-relaxed mb-5">
              African luxury photography and smart financing. Preserving moments. Empowering
              communities.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: MessageCircle, href: '#', label: 'Instagram' },
                { icon: MessageCircle, href: '#', label: 'Facebook' },
                { icon: MessageCircle, href: '#', label: 'Twitter' },
              ]?.map(({ icon: Icon, href, label }) => (
                <a
                  key={`social-${label}`}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground-muted hover:text-primary hover:bg-primary/10 transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-foreground mb-4">
              Services
            </h4>
            <ul className="space-y-2.5">
              {[
                'Wedding Photography',
                'Event Videography',
                'Drone Coverage',
                'Memory Vault',
                'Event Loans',
                'Personal Loans',
              ]?.map((item) => (
                <li key={`footer-svc-${item}`}>
                  <a
                    href="#"
                    className="text-sm text-foreground-muted hover:text-primary transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-foreground mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Book an Event', href: '#packages' },
                { label: 'Apply for Loan', href: '/loan-application-flow' },
                { label: 'Track Booking', href: '#' },
                { label: 'Access Memory Vault', href: '#' },
                { label: 'Admin Login', href: '/admin-dashboard' },
              ]?.map((item) => (
                <li key={`footer-link-${item?.label}`}>
                  <Link
                    href={item?.href}
                    className="text-sm text-foreground-muted hover:text-primary transition-colors duration-200"
                  >
                    {item?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-foreground mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground-muted">
                  Sandton, Johannesburg, South Africa
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-primary flex-shrink-0" />
                <a
                  href="tel:+27000000000"
                  className="text-sm text-foreground-muted hover:text-primary transition-colors"
                >
                  +27 000 000 0000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-primary flex-shrink-0" />
                <a
                  href="mailto:info@VSM.co.za"
                  className="text-sm text-foreground-muted hover:text-primary transition-colors"
                >
                  info@VSM.co.za
                </a>
              </li>
            </ul>
            <a
              href="https://wa.me/27000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 mt-5 px-5 py-2.5 rounded-md bg-success/10 border border-success/30 text-success text-sm font-medium hover:bg-success/20 transition-all duration-200"
            >
              <MessageCircle size={15} />
              WhatsApp Us
            </a>
          </div>
        </div>

        <div className="section-divider mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground-muted">
            © 2026 VSM. All rights reserved. Proudly South African.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy Policy', 'Terms of Service', 'POPIA Compliance']?.map((item) => (
              <a
                key={`legal-${item}`}
                href="#"
                className="text-xs text-foreground-muted hover:text-primary transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
