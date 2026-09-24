export type GuideStepId = 'connect_or_transact' | 'traffic_light' | 'budget_limit' | 'coro';

export interface GuideStep {
  id: GuideStepId;
  title: string;
  description: string;
  actionLabel: string;
  isCompleted: boolean;
}

export interface FirstRunGuideOptions {
  hasTransactions: boolean;
  hasConnection: boolean;
  hasBudget: boolean;
  onOpenConnections: () => void;
  onAddManual: () => void;
  onOpenTrafficLight: () => void;
  onOpenBudget: () => void;
  onOpenCoro: () => void;
}
