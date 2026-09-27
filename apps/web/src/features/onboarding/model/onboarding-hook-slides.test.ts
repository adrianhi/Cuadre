import { describe, expect, it } from 'vitest';
import {
  ONBOARDING_HOOK_SLIDES,
  clampSlideIndex,
  detectSwipeDirection,
} from './onboarding-hook-slides';

describe('onboarding-hook-slides', () => {
  it('defines exactly 4 slides with non-empty copy in Spanish', () => {
    expect(ONBOARDING_HOOK_SLIDES).toHaveLength(4);

    for (const slide of ONBOARDING_HOOK_SLIDES) {
      expect(slide.id).toBeTruthy();
      expect(slide.badge).toBeTruthy();
      expect(slide.title).toBeTruthy();
      expect(slide.explanation).toBeTruthy();
      expect(slide.visualType).toBeTruthy();
    }
  });

  it('clamps slide index within bounds', () => {
    expect(clampSlideIndex(-1, 4)).toBe(0);
    expect(clampSlideIndex(0, 4)).toBe(0);
    expect(clampSlideIndex(2, 4)).toBe(2);
    expect(clampSlideIndex(3, 4)).toBe(3);
    expect(clampSlideIndex(4, 4)).toBe(3);
    expect(clampSlideIndex(99, 4)).toBe(3);
  });

  it('detects swipe directions with 50px threshold', () => {
    // Null inputs
    expect(detectSwipeDirection(null, 100)).toBeNull();
    expect(detectSwipeDirection(100, null)).toBeNull();

    // Less than threshold (diff = 40)
    expect(detectSwipeDirection(100, 60, 50)).toBeNull();
    expect(detectSwipeDirection(60, 100, 50)).toBeNull();

    // Swipe left (start > end, diff > 50) -> next
    expect(detectSwipeDirection(200, 120, 50)).toBe('next');

    // Swipe right (start < end, diff < -50) -> prev
    expect(detectSwipeDirection(100, 180, 50)).toBe('prev');
  });
});
