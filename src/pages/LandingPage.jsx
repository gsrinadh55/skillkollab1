import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { WhySkillKollabSection } from '../components/landing/WhySkillKollabSection';
import { MarketplacePreviewSection } from '../components/landing/MarketplacePreviewSection';
import { PlatformPreviewSection } from '../components/landing/PlatformPreviewSection';
import { AdvantagesSection } from '../components/landing/AdvantagesSection';
import { FaqSection } from '../components/landing/FaqSection';
import { FinalCtaSection } from '../components/landing/FinalCtaSection';
import { LandingFooter } from '../components/landing/LandingFooter';
import { LiveChatWidget } from '../components/chat/LiveChatWidget';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] relative overflow-x-hidden transition-colors">
      {/* Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Navbar />
      </div>

      {/* Main SaaS Sections */}
      <main>
        <HeroSection />
        <HowItWorksSection />
        <WhySkillKollabSection />
        <MarketplacePreviewSection />
        <PlatformPreviewSection />
        <AdvantagesSection />
        <FaqSection />
        <FinalCtaSection />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Floating Live Chat */}
      <LiveChatWidget />
    </div>
  );
}

export default LandingPage;
