import React from 'react';
import LandingNav from './components/LandingNav';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import PackagesSection from './components/PackagesSection';
import GallerySection from './components/GallerySection';
import CorporateBriefSection from './components/CorporateBriefSection';
import FinancingSection from './components/FinancingSection';
import CommunitySection from './components/CommunitySection';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-near-black text-clear-white overflow-x-hidden selection:bg-vsm-gold/20 selection:text-white">
      <LandingNav />
      <HeroSection />
      <ServicesSection />
      <PackagesSection />
      <GallerySection />
      <CorporateBriefSection />
      <FinancingSection />
      <CommunitySection />
      <LandingFooter />
    </main>
  );
}
