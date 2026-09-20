import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ProductGuideState } from '@bills/contracts';
import type { Transaction } from '@/entities/transaction';
import { Navbar } from '@/widgets/navbar';
import { BottomNav } from '@/widgets/bottom-nav';
import { useDashboardController } from '../model/useDashboardController';
import { DASHBOARD_SECTION_TITLES, useDashboardShell } from '../model/useDashboardShell';
import { DashboardSidebar } from './DashboardSidebar';
import { PeriodToolbar } from './PeriodToolbar';
import { DashboardModals } from './DashboardModals';
import { HomeSection } from './sections/HomeSection';
import { TransactionsSection } from './sections/TransactionsSection';
import { ControlSection } from './sections/ControlSection';
import { HubSection } from './sections/HubSection';
import { CoroHubPage } from '@/features/coro-hub';

interface DashboardPageProps {
  authToken: string; userEmail?: string | null;
  productGuide: ProductGuideState; onProductGuideChange: (state: ProductGuideState) => void;
  onLock: () => void; onAccountDeleted: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  authToken,
  userEmail,
  productGuide,
  onProductGuideChange,
  onLock: lockSession,
  onAccountDeleted,
}) => {
  const shell = useDashboardShell(productGuide);
  const {
    activeSection, isCoroRoute, selectSection, navigateForTour,
    connectionsQuery, primaryConnection, requiresBankSelection,
    isSettingsOpen, setIsSettingsOpen, isTourInviteOpen, setIsTourInviteOpen,
    isTourOpen, setIsTourOpen, isExportModalOpen, setIsExportModalOpen,
    handleSyncConnection, isSyncingConnection,
  } = shell;
  const model = useDashboardController(authToken, lockSession, activeSection);
  const {
    darkMode, setDarkMode, hideBalances, setHideBalances,
    currentPeriod, onApplyPeriod, currency, setCurrency,
    stats, statsError, loadingStats, refreshingStats,
    transactions, totalTransactions, loading, refreshing, error,
    page, setPage, limit, search, setSearch,
    categoryFilter, setCategoryFilter, statusFilter, setStatusFilter,
    organizationFilter, setOrganizationFilter, typeFilter, setTypeFilter,
    onResetFilters, onRefresh, onLock,
    editingTransaction, setEditingTransaction, onSaveTransaction, onDeleteTransaction,
    isRulesModalOpen, setIsRulesModalOpen, isQuickAddOpen, setIsQuickAddOpen,
  } = model;
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const navigate = useNavigate();
  const handleOpenCoro = (coroId?: string) => {
    navigate(coroId ? `/app/coro/${encodeURIComponent(coroId)}` : '/app/coro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [, setSearchParams] = useSearchParams();
  const openBudgetTab = (tab?: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('view', 'budget');
      if (tab) next.set('tab', tab); else next.delete('tab');
      return next;
    });
    selectSection('control');
  };
  const activeFiltersCount = [categoryFilter, statusFilter, organizationFilter, typeFilter].filter(Boolean).length;
  const periodToolbarNode = (
    <PeriodToolbar
      currentPeriod={currentPeriod}
      onApplyPeriod={onApplyPeriod}
      currency={currency}
      setCurrency={setCurrency}
    />
  );
  const currentFilters = useMemo(
    () => ({
      category: categoryFilter,
      status: statusFilter,
      organization: organizationFilter,
      transactionType: typeFilter,
      search,
    }),
    [categoryFilter, statusFilter, organizationFilter, typeFilter, search]
  );
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <DashboardSidebar
        activeSection={isCoroRoute ? null : activeSection}
        coroActive={isCoroRoute}
        onSelectSection={selectSection}
        onQuickAdd={() => setIsQuickAddOpen(true)}
        activeFiltersCount={activeFiltersCount}
        onOpenRules={() => setIsRulesModalOpen(true)} onOpenCoro={() => handleOpenCoro()} onOpenExport={() => setIsExportModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)} userEmail={userEmail} connection={primaryConnection}
      />
      <Navbar
        title={isCoroRoute ? 'Modo Coro' : DASHBOARD_SECTION_TITLES[activeSection]}
        hideBalances={hideBalances}
        setHideBalances={setHideBalances}
        onRefresh={onRefresh}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCoro={() => handleOpenCoro()}
        coroActive={isCoroRoute}
        refreshing={refreshing || refreshingStats}
        connection={primaryConnection}
      />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-5 pb-[calc(9rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8 lg:ml-64 lg:pb-10">
        {isCoroRoute && <CoroHubPage />}
        {!isCoroRoute && activeSection === 'home' && (
          <HomeSection
            periodToolbar={periodToolbarNode}
            primaryConnection={primaryConnection}
            connectionsLoading={connectionsQuery.isLoading}
            connectionsFailed={connectionsQuery.isError}
            onOpenConnections={() => setIsSettingsOpen(true)}
            stats={stats}
            currency={currency}
            hideBalances={hideBalances}
            onRefresh={onRefresh}
            transactions={transactions}
            loadingTransactions={loading}
            onViewAllTransactions={() => selectSection('transactions')}
            onSelectTransaction={setEditingTransaction}
            onAddManual={() => setIsQuickAddOpen(true)}
            onSyncConnection={primaryConnection ? () => handleSyncConnection(primaryConnection.id) : undefined}
            syncingConnection={isSyncingConnection}
            onOpenBudget={() => openBudgetTab()}
            onOpenRecurring={() => openBudgetTab('recurring')}
            onOpenCoro={handleOpenCoro}
          />
        )}
        {!isCoroRoute && activeSection === 'transactions' && (
          <TransactionsSection
            periodToolbar={periodToolbarNode}
            transactions={transactions} totalTransactions={totalTransactions}
            page={page} setPage={setPage} limit={limit} search={search} setSearch={setSearch}
            categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            organizationFilter={organizationFilter} setOrganizationFilter={setOrganizationFilter}
            typeFilter={typeFilter} setTypeFilter={setTypeFilter}
            onResetFilters={onResetFilters} onEdit={setEditingTransaction} onDelete={setDeletingTransaction}
            onExport={() => setIsExportModalOpen(true)} loading={loading} refreshing={refreshing}
            error={error instanceof Error ? error : null} onRetry={onRefresh} hideBalances={hideBalances}
            onOpenConnections={() => setIsSettingsOpen(true)} onAddManual={() => setIsQuickAddOpen(true)}
          />
        )}
        {!isCoroRoute && activeSection === 'control' && (
          <ControlSection
            periodToolbar={periodToolbarNode}
            currentPeriod={currentPeriod}
            currency={currency}
            hideBalances={hideBalances}
            stats={stats}
            statsError={statsError}
            loadingStats={loadingStats}
            onRefresh={onRefresh}
            onOpenExport={() => setIsExportModalOpen(true)}
          />
        )}
        {!isCoroRoute && activeSection === 'hub' && (
          <HubSection
            onOpenCoro={handleOpenCoro}
            onOpenRules={() => setIsRulesModalOpen(true)}
            onOpenConnections={() => setIsSettingsOpen(true)}
            onOpenExport={() => setIsExportModalOpen(true)}
            stats={stats}
            currency={currency}
          />
        )}
      </main>
      <BottomNav
        activeSection={isCoroRoute ? null : activeSection}
        onSelectSection={selectSection}
        onQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenCoro={() => handleOpenCoro()}
        activeFiltersCount={activeFiltersCount}
      />

      <DashboardModals
        authToken={authToken} activeSection={activeSection} onNavigate={navigateForTour}
        isQuickAddOpen={isQuickAddOpen} setIsQuickAddOpen={setIsQuickAddOpen} onRefresh={onRefresh}
        editingTransaction={editingTransaction} setEditingTransaction={setEditingTransaction}
        deletingTransaction={deletingTransaction} setDeletingTransaction={setDeletingTransaction}
        onSaveTransaction={onSaveTransaction} onDeleteTransaction={onDeleteTransaction}
        isRulesModalOpen={isRulesModalOpen} setIsRulesModalOpen={setIsRulesModalOpen}
        isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen}
        requiresBankSelection={requiresBankSelection} onAccountDeleted={onAccountDeleted}
        darkMode={darkMode} setDarkMode={setDarkMode} onLock={onLock}
        isTourInviteOpen={isTourInviteOpen} setIsTourInviteOpen={setIsTourInviteOpen}
        isTourOpen={isTourOpen} setIsTourOpen={setIsTourOpen} onProductGuideChange={onProductGuideChange}
        isExportModalOpen={isExportModalOpen} setIsExportModalOpen={setIsExportModalOpen}
        currentPeriod={currentPeriod} currency={currency}
        filters={activeSection === 'transactions' ? currentFilters : {}}
        onOpenCoro={() => handleOpenCoro()}
      />
    </div>
  );
};
