import React, { type ReactNode } from 'react';
import type { Transaction } from '@/entities/transaction';
import { TransactionTable } from '@/widgets/transactions-table';
import { Button, LoadingScreen } from '@/shared/ui';

interface TransactionsSectionProps {
  periodToolbar: ReactNode;
  transactions: Transaction[];
  totalTransactions: number;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  search: string;
  setSearch: (search: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  organizationFilter: string;
  setOrganizationFilter: (org: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  onResetFilters: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onExport: () => void;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  onRetry: () => void;
  hideBalances: boolean;
  onOpenConnections: () => void;
  onAddManual: () => void;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  periodToolbar,
  transactions,
  totalTransactions,
  page,
  setPage,
  limit,
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  organizationFilter,
  setOrganizationFilter,
  typeFilter,
  setTypeFilter,
  onResetFilters,
  onEdit,
  onDelete,
  onExport,
  loading,
  refreshing,
  error,
  onRetry,
  hideBalances,
  onOpenConnections,
  onAddManual,
}) => {
  if (loading && transactions.length === 0 && totalTransactions === 0) {
    return (
      <LoadingScreen
        message="Cargando movimientos…"
        description="Consultando tu historial de transacciones."
        fullPage
      />
    );
  }

  const unclassifiedCount = transactions.filter(
    (tx) => !tx.category || tx.category === 'Otros'
  ).length;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl 2xl:text-3xl">
            Todos tus movimientos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground 2xl:text-base">
            Busca, filtra y corrige desde un solo lugar.
          </p>
        </div>
        {periodToolbar}
      </div>

      {unclassifiedCount > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground animate-in fade-in-0 duration-200">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="text-base shrink-0" role="img" aria-label="Aviso">💡</span>
            <p className="text-xs sm:text-sm text-muted-foreground">
              ¿Tienes movimientos sin clasificar? Categorízalos para que tus límites de presupuesto y margen diario cuadren a la perfección.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0 self-start sm:self-auto text-xs"
            onClick={() => setCategoryFilter('Otros')}
          >
            Ver sin clasificar
          </Button>
        </div>
      )}

      <div className="w-full">
        <TransactionTable
          transactions={transactions}
          total={totalTransactions}
          page={page}
          setPage={setPage}
          limit={limit}
          search={search}
          setSearch={setSearch}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          organizationFilter={organizationFilter}
          setOrganizationFilter={setOrganizationFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          onResetFilters={onResetFilters}
          onEdit={onEdit}
          onDelete={onDelete}
          onExport={onExport}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={onRetry}
          hideBalances={hideBalances}
          onOpenConnections={onOpenConnections}
          onAddManual={onAddManual}
        />
      </div>
    </div>
  );
};
