import { LandingHeader } from './sections/LandingHeader';
import { LandingHeroSection } from './sections/LandingHeroSection';
import { LandingAppPurposeSection } from './sections/LandingAppPurposeSection';
import { LandingHowItWorksSection } from './sections/LandingHowItWorksSection';
import { LandingComparisonSection } from './sections/LandingComparisonSection';
import { LandingBankCoverageSection } from './sections/LandingBankCoverageSection';
import { LandingSecuritySection } from './sections/LandingSecuritySection';
import { LandingFaqSection } from './sections/LandingFaqSection';
import { LandingFooter } from './sections/LandingFooter';

interface LandingPageProps {
  hasSession?: boolean;
}

export function LandingPage({ hasSession = false }: LandingPageProps) {
  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white overflow-x-clip w-full">
      <LandingHeader hasSession={hasSession} />
      <main className="overflow-x-hidden w-full">
        <LandingHeroSection />
        <LandingAppPurposeSection />
        <LandingHowItWorksSection />
        <LandingComparisonSection />
        <LandingBankCoverageSection />
        <LandingSecuritySection />
        <LandingFaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
