import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui';
import { ONBOARDING_HOOK_SLIDES } from '../model/onboarding-hook-slides';
import { useOnboardingHook } from '../model/useOnboardingHook';
import { OnboardingHookSlide } from './OnboardingHookSlide';
import { MonthComparisonModal } from './MonthComparisonModal';

interface OnboardingHookCarouselProps {
  onStartSetup: () => void;
  onSkip: () => void;
  onLogout?: () => void;
}

export const OnboardingHookCarousel: React.FC<OnboardingHookCarouselProps> = ({
  onStartSetup,
  onSkip,
}) => {
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const {
    currentSlide,
    isLastSlide,
    nextSlide,
    goToSlide,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useOnboardingHook(ONBOARDING_HOOK_SLIDES.length);

  const activeSlide = ONBOARDING_HOOK_SLIDES[currentSlide];


  return (
    <div className="flex min-h-screen flex-col justify-between bg-background px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6">
      <header className="mx-auto flex w-full max-w-xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-black text-white shadow-lg shadow-emerald-500/20">
            C.
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Cuadre</p>
            <p className="text-xs text-muted-foreground">Tu dinero en piloto automático</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-11 px-3 text-xs text-muted-foreground hover:text-foreground"
          onClick={onSkip}
        >
          Saltar
        </Button>
      </header>

      <main
        className="mx-auto my-auto flex w-full max-w-xl flex-1 flex-col justify-center py-6 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="transition-all duration-300 ease-out">
          {activeSlide && (
            <OnboardingHookSlide
              slide={activeSlide}
              onOpenComparison={() => setIsComparisonOpen(true)}
            />
          )}
        </div>

        <nav
          className="mt-6 sm:mt-8 flex items-center justify-center gap-2"
          aria-label="Progreso de introducción"
        >
          {ONBOARDING_HOOK_SLIDES.map((slideItem, index) => {
            const isActive = index === currentSlide;
            return (
              <button
                key={slideItem.id}
                type="button"
                onClick={() => goToSlide(index)}
                className="group flex min-h-11 min-w-8 items-center justify-center focus-visible:outline-none"
                aria-label={`Ir al slide ${index + 1}: ${slideItem.badge}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-7 bg-primary'
                      : 'w-2 bg-muted-foreground/30 group-hover:bg-muted-foreground/60'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </main>

      <footer className="mx-auto w-full max-w-xl space-y-3 pt-2">
        {!isLastSlide ? (
          <>
            <Button
              className="min-h-12 w-full gap-2 text-base font-bold shadow-md shadow-emerald-500/20"
              onClick={nextSlide}
            >
              <span>Siguiente</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="min-h-11 w-full text-xs font-semibold text-muted-foreground hover:text-foreground"
              onClick={onStartSetup}
            >
              Configurar con mis cuartos
            </Button>
          </>
        ) : (
          <Button
            className="min-h-12 w-full gap-2 text-base font-bold shadow-lg shadow-emerald-500/25"
            onClick={onStartSetup}
          >
            <Sparkles className="h-4 w-4" />
            <span>Calcular con mis propios números</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </footer>

      <MonthComparisonModal
        open={isComparisonOpen}
        onOpenChange={setIsComparisonOpen}
        onContinue={onStartSetup}
      />
    </div>
  );
};

