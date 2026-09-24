import { useCallback, useMemo, useState } from 'react';
import type { FirstRunGuideOptions, GuideStep, GuideStepId } from './first-run-types';
import {
  calculateGuideProgress,
  COLLAPSED_KEY,
  COMPLETED_STEPS_KEY,
  computeGuideSteps,
  DISMISSED_KEY,
  readStoredSet,
  writeStoredSet,
} from './first-run-helpers';

export function useFirstRunGuide({
  hasTransactions,
  hasConnection,
  hasBudget,
  onOpenConnections,
  onAddManual,
  onOpenTrafficLight,
  onOpenBudget,
  onOpenCoro,
}: FirstRunGuideOptions) {
  const [interactedSteps, setInteractedSteps] = useState<Set<string>>(() =>
    readStoredSet(COMPLETED_STEPS_KEY)
  );

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  const markStepDone = useCallback((stepId: GuideStepId) => {
    setInteractedSteps((prev) => {
      const next = new Set(prev);
      next.add(stepId);
      writeStoredSet(COMPLETED_STEPS_KEY, next);
      return next;
    });
  }, []);

  const handleStepAction = useCallback(
    (stepId: GuideStepId) => {
      markStepDone(stepId);
      switch (stepId) {
        case 'connect_or_transact':
          if (hasConnection) onAddManual();
          else onOpenConnections();
          break;
        case 'traffic_light':
          onOpenTrafficLight();
          break;
        case 'budget_limit':
          onOpenBudget();
          break;
        case 'coro':
          onOpenCoro();
          break;
      }
    },
    [
      markStepDone,
      hasConnection,
      onAddManual,
      onOpenConnections,
      onOpenTrafficLight,
      onOpenBudget,
      onOpenCoro,
    ]
  );

  const steps: GuideStep[] = useMemo(
    () =>
      computeGuideSteps({
        hasTransactions,
        hasConnection,
        hasBudget,
        interactedSteps,
      }),
    [hasTransactions, hasConnection, hasBudget, interactedSteps]
  );

  const { completedCount, totalSteps, progressPercent, allCompleted } = useMemo(
    () => calculateGuideProgress(steps),
    [steps]
  );

  const setDismissedState = useCallback((dismissed: boolean) => {
    setIsDismissed(dismissed);
    try {
      localStorage.setItem(DISMISSED_KEY, String(dismissed));
    } catch {
      // ignore
    }
  }, []);

  const setCollapsedState = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem(COLLAPSED_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, []);

  return {
    steps,
    completedCount,
    totalSteps,
    progressPercent,
    allCompleted,
    isDismissed,
    isCollapsed,
    isExplainerOpen,
    setIsExplainerOpen,
    handleStepAction,
    dismiss: () => setDismissedState(true),
    restore: () => setDismissedState(false),
    toggleCollapse: () => setCollapsedState(!isCollapsed),
  };
}
