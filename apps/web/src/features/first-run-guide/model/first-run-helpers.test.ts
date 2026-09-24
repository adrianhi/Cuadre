import { describe, it, expect } from 'vitest';
import {
  computeGuideSteps,
  calculateGuideProgress,
} from './first-run-helpers';

describe('first-run-helpers', () => {
  it('computes 0 completed steps when user has no transactions, connection, budget, or interactions', () => {
    const steps = computeGuideSteps({
      hasTransactions: false,
      hasConnection: false,
      hasBudget: false,
      interactedSteps: new Set(),
    });

    expect(steps).toHaveLength(4);
    expect(steps.every((s) => !s.isCompleted)).toBe(true);

    const progress = calculateGuideProgress(steps);
    expect(progress.completedCount).toBe(0);
    expect(progress.totalSteps).toBe(4);
    expect(progress.progressPercent).toBe(0);
    expect(progress.allCompleted).toBe(false);
  });

  it('automatically marks step 1 as completed if user has transactions or connections', () => {
    const steps = computeGuideSteps({
      hasTransactions: true,
      hasConnection: false,
      hasBudget: false,
      interactedSteps: new Set(),
    });

    expect(steps[0].id).toBe('connect_or_transact');
    expect(steps[0].isCompleted).toBe(true);

    const progress = calculateGuideProgress(steps);
    expect(progress.completedCount).toBe(1);
    expect(progress.progressPercent).toBe(25);
  });

  it('marks step 1 action label as "Registrar gasto" if user already has connection', () => {
    const steps = computeGuideSteps({
      hasTransactions: false,
      hasConnection: true,
      hasBudget: false,
      interactedSteps: new Set(),
    });

    expect(steps[0].actionLabel).toBe('Registrar gasto');
    expect(steps[0].isCompleted).toBe(true);
  });

  it('marks step 3 as completed if user has budget configured', () => {
    const steps = computeGuideSteps({
      hasTransactions: false,
      hasConnection: false,
      hasBudget: true,
      interactedSteps: new Set(),
    });

    expect(steps[2].id).toBe('budget_limit');
    expect(steps[2].isCompleted).toBe(true);

    const progress = calculateGuideProgress(steps);
    expect(progress.completedCount).toBe(1);
    expect(progress.progressPercent).toBe(25);
  });

  it('marks steps as completed when user has interacted with them', () => {
    const steps = computeGuideSteps({
      hasTransactions: false,
      hasConnection: false,
      hasBudget: false,
      interactedSteps: new Set(['traffic_light', 'coro']),
    });

    expect(steps[1].id).toBe('traffic_light');
    expect(steps[1].isCompleted).toBe(true);
    expect(steps[3].id).toBe('coro');
    expect(steps[3].isCompleted).toBe(true);

    const progress = calculateGuideProgress(steps);
    expect(progress.completedCount).toBe(2);
    expect(progress.progressPercent).toBe(50);
  });

  it('returns allCompleted true when all 4 steps are finished', () => {
    const steps = computeGuideSteps({
      hasTransactions: true,
      hasConnection: true,
      hasBudget: true,
      interactedSteps: new Set(['traffic_light', 'coro']),
    });

    expect(steps.every((s) => s.isCompleted)).toBe(true);

    const progress = calculateGuideProgress(steps);
    expect(progress.completedCount).toBe(4);
    expect(progress.progressPercent).toBe(100);
    expect(progress.allCompleted).toBe(true);
  });
});
