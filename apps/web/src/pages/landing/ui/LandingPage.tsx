import { LandingHeader } from './sections/LandingHeader';
import { LandingHeroSection } from './sections/LandingHeroSection';
import { LandingHowItWorksSection } from './sections/LandingHowItWorksSection';
import { LandingComparisonSection } from './sections/LandingComparisonSection';
import { LandingBankCoverageSection } from './sections/LandingBankCoverageSection';
import { LandingSecuritySection } from './sections/LandingSecuritySection';
// import { LandingPricingSection } from './sections/LandingPricingSection';
import { LandingFaqSection } from './sections/LandingFaqSection';
import { LandingFooter } from './sections/LandingFooter';

interface LandingPageProps {
  hasSession?: boolean;
}

export function LandingPage({ hasSession = false }: LandingPageProps) {
  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      <LandingHeader hasSession={hasSession} />
      <main>
        <LandingHeroSection />
        <LandingHowItWorksSection />
        <LandingComparisonSection />
        <LandingBankCoverageSection />
        <LandingSecuritySection />
        {/* Sección de planes oculta temporalmente durante la beta privada */}
        {/* <LandingPricingSection /> */}
        <LandingFaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
