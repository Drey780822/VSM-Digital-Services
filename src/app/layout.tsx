import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import '../styles/tailwind.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'VSM — Visuals & Digital Services',
  description:
    'VSM is the premier platform to capture, finance, manage, and preserve important moments — creating professional opportunities for creatives.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', sizes: 'any' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className={`${manrope.className} bg-near-black text-clear-white antialiased selection:bg-vsm-gold/20 selection:text-white`}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0B1F3A',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-manrope)',
            },
          }}
        />
      </body>
    </html>
  );
}
