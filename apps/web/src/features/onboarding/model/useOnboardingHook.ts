import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ONBOARDING_HOOK_SLIDES,
  clampSlideIndex,
  detectSwipeDirection,
} from './onboarding-hook-slides';

export function useOnboardingHook(totalSlides = ONBOARDING_HOOK_SLIDES.length) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(clampSlideIndex(index, totalSlides));
    },
    [totalSlides],
  );

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => clampSlideIndex(prev + 1, totalSlides));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => clampSlideIndex(prev - 1, totalSlides));
  }, [totalSlides]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const x = e.targetTouches[0]?.clientX ?? null;
    touchStartX.current = x;
    touchEndX.current = x;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    const direction = detectSwipeDirection(
      touchStartX.current,
      touchEndX.current,
      50,
    );

    if (direction === 'next') {
      nextSlide();
    } else if (direction === 'prev') {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return {
    currentSlide,
    isLastSlide: currentSlide === totalSlides - 1,
    isFirstSlide: currentSlide === 0,
    totalSlides,
    nextSlide,
    prevSlide,
    goToSlide,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
