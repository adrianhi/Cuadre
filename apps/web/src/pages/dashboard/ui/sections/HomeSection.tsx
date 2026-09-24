import React, { useState, type ReactNode } from "react";
import type { InboxConnection } from "@/entities/connection";
import type { StatsSummary } from "@/entities/stat";
import type { Transaction } from "@/entities/transaction";
import { useSafeToSpend } from "@/entities/budget";
import { SafeToSpendDial } from "@/widgets/safe-to-spend";
import { useTrackProductView } from "@/features/track-engagement";
import {
  useProactiveFeed,
  useWeeklyCheckin,
  useCompleteWeeklyCheckin,
  useDismissProactiveAction,
} from "@/entities/proactive";
import { ProactiveFeedCard } from "@/widgets/proactive-feed";
import { QuickTriageDialog, type QuickTriageItem } from "@/features/quick-triage";
import { WeeklyCheckinDialog } from "@/features/weekly-checkin";
import { ExpenseSimulatorDialog } from "@/features/expense-simulator";
import { WeeklyDigestPreviewDialog } from "@/features/weekly-digest";
import { ConnectionHealthCard } from "../ConnectionHealthCard";
import { RecentTransactionsCard } from "./RecentTransactionsCard";
import { QuickActionRail } from "./QuickActionRail";
import { CardTrafficLightModal } from "@/features/credit-cards";
import { CuadreDelMesModal } from "@/features/cuadre-del-mes";
import {
  FirstRunGuideCard,
  StarterHeroBanner,
  type FirstRunGuideOptions,
} from "@/features/first-run-guide";

interface HomeSectionProps {
  periodToolbar: ReactNode;
  primaryConnection?: InboxConnection;
  connectionsLoading: boolean;
  connectionsFailed: boolean;
  onOpenConnections: () => void;
  stats: StatsSummary | null;
  currency: string;
  hideBalances: boolean;
  onRefresh: () => void;
  transactions: Transaction[];
  loadingTransactions: boolean;
  onViewAllTransactions: () => void;
  onSelectTransaction: (transaction: Transaction) => void;
  onAddManual: () => void;
  onSyncConnection?: () => void;
  syncingConnection?: boolean;
  onOpenBudget: () => void;
  onOpenRecurring?: () => void;
  onOpenCoro?: (coroId?: string) => void;
  onStartTour?: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  periodToolbar,
  primaryConnection,
  connectionsLoading,
  connectionsFailed,
  onOpenConnections,
  stats,
  currency,
  hideBalances,
  transactions,
  loadingTransactions,
  onViewAllTransactions,
  onSelectTransaction,
  onAddManual,
  onSyncConnection,
  syncingConnection,
  onOpenBudget,
  onOpenRecurring,
  onOpenCoro,
  onStartTour,
}) => {
  const activeCurrency = currency === 'USD' ? 'USD' : 'DOP';
  const safeToSpend = useSafeToSpend(activeCurrency);
  const proactiveFeed = useProactiveFeed(activeCurrency);
  const dismissProactiveAction = useDismissProactiveAction(activeCurrency);
  const weeklyCheckin = useWeeklyCheckin(activeCurrency);
  const completeWeeklyCheckin = useCompleteWeeklyCheckin(activeCurrency);

  const [triageItems, setTriageItems] = useState<QuickTriageItem[]>([]);
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [isWeeklyCheckinOpen, setIsWeeklyCheckinOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isDigestOpen, setIsDigestOpen] = useState(false);
  const [isTrafficLightOpen, setIsTrafficLightOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);

  useTrackProductView(safeToSpend.data ? {
    name: 'SAFE_TO_SPEND_VIEWED',
    contextKey: safeToSpend.data.date,
    properties: { currency: activeCurrency, status: safeToSpend.data.status },
  } : null);

  const guideOptions: FirstRunGuideOptions = {
    hasTransactions: transactions.length > 0,
    hasConnection: Boolean(primaryConnection && primaryConnection.status === 'ACTIVE'),
    hasBudget: Boolean(
      safeToSpend.data &&
        safeToSpend.data.status !== 'UNSET' &&
        safeToSpend.data.globalLimit !== null &&
        safeToSpend.data.globalLimit > 0
    ),
    onOpenConnections,
    onAddManual,
    onOpenTrafficLight: () => setIsTrafficLightOpen(true),
    onOpenBudget,
    onOpenCoro: () => onOpenCoro?.(),
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Tu panorama</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">Lo importante de hoy, ágil y sin sobrecargas.</p>
        </div>
        {periodToolbar}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7 2xl:col-span-8">
          <StarterHeroBanner {...guideOptions} onStartTour={onStartTour} />

          <SafeToSpendDial
            value={safeToSpend.data || null}
            loading={safeToSpend.isLoading}
            hideBalances={hideBalances}
            onManageBudget={onOpenBudget}
          />

          <FirstRunGuideCard {...guideOptions} onStartTour={onStartTour} />

          <QuickActionRail
            onOpenTrafficLight={() => setIsTrafficLightOpen(true)}
            onOpenCoro={() => onOpenCoro?.()}
            onOpenWrapped={() => setIsWrappedOpen(true)}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />

          <RecentTransactionsCard
            transactions={transactions}
            loading={loadingTransactions}
            hideBalances={hideBalances}
            onViewAll={onViewAllTransactions}
            onSelectTransaction={onSelectTransaction}
            onOpenConnections={onOpenConnections}
            onAddManual={onAddManual}
          />
        </div>

        <div className="space-y-6 xl:col-span-5 2xl:col-span-4">
          <ProactiveFeedCard
            feed={proactiveFeed.data || null}
            loading={proactiveFeed.isLoading}
            onDismiss={(actionId) => dismissProactiveAction.mutate(actionId)}
            onNavigateBudget={onOpenBudget}
            onNavigateRecurring={onOpenRecurring || onOpenBudget}
            onQuickCategorize={(items) => { setTriageItems(items); setIsTriageOpen(true); }}
            onOpenWeeklyCheckin={() => setIsWeeklyCheckinOpen(true)}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />

          <ConnectionHealthCard
            connection={primaryConnection}
            loading={connectionsLoading}
            failed={connectionsFailed}
            onOpenConnections={onOpenConnections}
            onSync={onSyncConnection}
            syncing={syncingConnection}
          />
        </div>
      </div>

      {/* Dialogs */}
      <QuickTriageDialog
        open={isTriageOpen}
        onOpenChange={setIsTriageOpen}
        items={triageItems}
        currency={activeCurrency}
      />

      <WeeklyCheckinDialog
        open={isWeeklyCheckinOpen}
        onOpenChange={setIsWeeklyCheckinOpen}
        checkin={weeklyCheckin.data || null}
        isCompleting={completeWeeklyCheckin.isPending}
        onOpenDigestPreview={() => setIsDigestOpen(true)}
        onComplete={async (weekKey) => {
          await completeWeeklyCheckin.mutateAsync(weekKey);
          setIsWeeklyCheckinOpen(false);
        }}
      />

      <ExpenseSimulatorDialog
        open={isSimulatorOpen}
        onOpenChange={setIsSimulatorOpen}
        currency={activeCurrency}
        onProceedToRecord={onAddManual}
      />

      <WeeklyDigestPreviewDialog
        open={isDigestOpen}
        onOpenChange={setIsDigestOpen}
        currency={activeCurrency}
      />

      <CardTrafficLightModal
        open={isTrafficLightOpen}
        onOpenChange={setIsTrafficLightOpen}
      />

      <CuadreDelMesModal
        open={isWrappedOpen}
        onOpenChange={setIsWrappedOpen}
        initialStats={stats}
        currency={currency}
      />
    </>
  );
};
