import LandingNav from "./components/LandingNav";
import HeroSection from "./components/HeroSection";
import TrustSection from "./components/TrustSection";
import ServicesSection from "./components/ServicesSection";
import PackagesSection from "./components/PackagesSection";
import GallerySection from "./components/GallerySection";
import FinancingSection from "./components/FinancingSection";
import CommunitySection from "./components/CommunitySection";
import LandingFooter from "./components/LandingFooter";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <TrustSection />
      <ServicesSection />
      <PackagesSection />
      <GallerySection />
      <FinancingSection />
      <CommunitySection />
      <LandingFooter />
    </main>
  );
}
