import React from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/shared/ui';
import type { OnboardingHookSlide as OnboardingHookSlideData } from '../model/onboarding-hook-slides';
import { OnboardingSlideVisuals } from './OnboardingSlideVisuals';

interface OnboardingHookSlideProps {
  slide: OnboardingHookSlideData;
  onOpenComparison?: () => void;
}

export const OnboardingHookSlide: React.FC<OnboardingHookSlideProps> = ({
  slide,
  onOpenComparison,
}) => {
  return (
    <div className="flex flex-col items-center text-center space-y-4 sm:space-y-5 max-w-lg mx-auto w-full select-none animate-in fade-in-50 duration-300">
      <Badge
        variant="secondary"
        className="rounded-full px-3.5 py-1 text-xs font-semibold border border-primary/20 bg-primary/10 text-primary shadow-xs"
      >
        <Sparkles className="mr-1.5 h-3 w-3" />
        {slide.badge}
      </Badge>

      <div className="space-y-2 px-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
          {slide.title}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          {slide.explanation}
        </p>
      </div>

      <div className="w-full pt-1">
        <OnboardingSlideVisuals
          visualType={slide.visualType}
          onOpenComparison={onOpenComparison}
        />
      </div>
    </div>
  );
};
