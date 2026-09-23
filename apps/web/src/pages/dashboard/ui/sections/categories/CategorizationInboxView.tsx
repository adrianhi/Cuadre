import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCheck, Loader2 } from 'lucide-react';
import { INTERNAL_TRANSFER_CATEGORY, type TransactionDto, type TransactionFinancialRole } from '@bills/contracts';
import { categoryDotClass, useCategoryCatalog } from '@/entities/category';
import { transactionKeys, transactionService } from '@/entities/transaction';
import { useRecurringRadar } from '@/entities/recurring-bill';
import { useManageRecurring } from '@/features/manage-recurring';
import type { PeriodSelection } from '@/entities/period';
import { cn } from '@/shared/lib';
import { Card, CardContent, type ComboboxOption, toast } from '@/shared/ui';
import { CategorizationInboxCard } from './CategorizationInboxCard';

interface CategorizationInboxViewProps {
  currentPeriod?: PeriodSelection;
  currency?: string;
  onSaveTransaction?: (
    id: string,
    merchant: string,
    category: string,
    notes: string,
    financialRole?: TransactionFinancialRole,
  ) => Promise<void>;
}

const isUnclassified = (cat?: string | null) =>
  !cat || ['otros', 'sin clasificar', 'sin categoria', 'uncategorized'].includes(cat.trim().toLowerCase());

export function CategorizationInboxView({
  currentPeriod,
  currency = 'DOP',
  onSaveTransaction,
}: CategorizationInboxViewProps) {
  const queryClient = useQueryClient();
  const activeCurrency = currency === 'USD' ? 'USD' : 'DOP';
  const [filterMode, setFilterMode] = useState<'unclassified' | 'all'>('unclassified');

  const catalogQuery = useCategoryCatalog(true, false);
  const radarQuery = useRecurringRadar(activeCurrency);
  const recurringActions = useManageRecurring(activeCurrency);

  const txFilters = useMemo(() => ({
    page: 1,
    limit: 60,
    currency: activeCurrency,
    month: currentPeriod?.startDate ? undefined : (currentPeriod?.month || new Date().toISOString().slice(0, 7)),
    startDate: currentPeriod?.startDate,
    endDate: currentPeriod?.endDate,
  }), [activeCurrency, currentPeriod]);

  const { data: txResponse, isLoading: isLoadingTx } = useQuery({
    queryKey: transactionKeys.list(txFilters),
    queryFn: ({ signal }) => transactionService.list(txFilters, signal),
  });

  const transactions = useMemo(() => txResponse?.data || [], [txResponse?.data]);
  const linkedMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of radarQuery.data?.allConfirmed || []) {
      if (b.linkedTransactionId) map.set(b.linkedTransactionId, b.id);
    }
    return map;
  }, [radarQuery.data?.allConfirmed]);

  const categoryOptions = useMemo<ComboboxOption[]>(() => {
    return (catalogQuery.data || []).map((cat) => ({
      value: cat.label,
      label: cat.label,
      icon: cat.icon ? (
        <span className="w-4 text-center text-xs">{cat.icon}</span>
      ) : (
        <span className={cn('h-2 w-2 rounded-full', categoryDotClass(cat.colorKey))} />
      ),
    }));
  }, [catalogQuery.data]);

  const unclassifiedCount = useMemo(() => transactions.filter((t) => isUnclassified(t.category)).length, [transactions]);
  const displayedTx = useMemo(() => {
    if (filterMode === 'unclassified') return transactions.filter((t) => isUnclassified(t.category));
    return transactions;
  }, [filterMode, transactions]);

  const updateTx = async (tx: TransactionDto, nextCat: string, nextRole?: TransactionFinancialRole) => {
    const role = nextRole ?? (nextCat === INTERNAL_TRANSFER_CATEGORY ? 'INTERNAL_TRANSFER' : tx.financialRole);
    if (onSaveTransaction) {
      await onSaveTransaction(tx.id, tx.merchant || tx.rawMerchant, nextCat, tx.notes || '', role);
    } else {
      await transactionService.update({
        id: tx.id,
        merchant: tx.merchant || tx.rawMerchant,
        category: nextCat,
        notes: tx.notes || '',
        financialRole: role,
      });
      await queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    }
  };

  const handleCategorySelect = async (tx: TransactionDto, nextCategory: string) => {
    if (!nextCategory || nextCategory === tx.category) return;
    try {
      await updateTx(tx, nextCategory);
      toast.success(`Categorizado como "${nextCategory}"`);
    } catch {
      toast.error('No se pudo actualizar la categoría');
    }
  };

  const handleToggleTransfer = async (tx: TransactionDto) => {
    const isTransfer = tx.financialRole === 'INTERNAL_TRANSFER' || tx.category === INTERNAL_TRANSFER_CATEGORY;
    const nextRole = isTransfer ? 'EXPENSE' : 'INTERNAL_TRANSFER';
    const nextCat = isTransfer ? (tx.category === INTERNAL_TRANSFER_CATEGORY ? 'Otros' : tx.category) : INTERNAL_TRANSFER_CATEGORY;
    try {
      await updateTx(tx, nextCat, nextRole);
      toast.success(isTransfer ? 'Movimiento marcado como Gasto' : 'Marcado como Transferencia Propia');
    } catch {
      toast.error('Error al actualizar tipo');
    }
  };

  const handleToggleFixed = async (tx: TransactionDto, billId?: string) => {
    try {
      if (billId) {
        await recurringActions.unlinkTransaction.mutateAsync({ recurringBillId: billId, transactionId: tx.id });
        toast.success('Desvinculado de gasto fijo');
      } else {
        const norm = (tx.merchant || tx.rawMerchant).toLowerCase().trim();
        const match = (radarQuery.data?.allConfirmed || []).find((b) => b.displayName.toLowerCase().trim() === norm);
        if (match) {
          await recurringActions.linkTransaction.mutateAsync({ recurringBillId: match.id, transactionId: tx.id });
          toast.success(`Vinculado a "${match.displayName}"`);
        } else {
          const created = await recurringActions.createFromTransaction.mutateAsync({
            merchant: tx.merchant || tx.rawMerchant,
            amount: tx.amount,
            currency: activeCurrency,
            transactionDate: tx.transactionDate || new Date().toISOString(),
            transactionId: tx.id,
          });
          toast.success(`Gasto fijo "${created.displayName}" creado y vinculado`);
        }
      }
    } catch {
      toast.error('Error al actualizar gasto fijo');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Bandeja de Categorización</h3>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Clasifica tus gastos recientes, márcalos como fijos o transfiere entre cuentas.
          </p>
        </div>
        <div className="flex rounded-xl bg-muted/80 p-1 text-xs font-semibold text-muted-foreground shadow-2xs">
          <button
            type="button"
            onClick={() => setFilterMode('unclassified')}
            className={cn('rounded-lg px-3 py-1.5 transition-all', filterMode === 'unclassified' ? 'bg-card font-bold text-foreground shadow-xs' : 'hover:text-foreground')}
          >
            Sin clasificar / Otros ({unclassifiedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={cn('rounded-lg px-3 py-1.5 transition-all', filterMode === 'all' ? 'bg-card font-bold text-foreground shadow-xs' : 'hover:text-foreground')}
          >
            Todos ({transactions.length})
          </button>
        </div>
      </div>

      {isLoadingTx && (
        <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Consultando movimientos recientes…</span>
        </div>
      )}

      {!isLoadingTx && displayedTx.length === 0 && (
        <Card className="border-dashed py-12 text-center">
          <CardContent className="flex flex-col items-center gap-3">
            <CheckCheck className="h-10 w-10 text-emerald-500/80" />
            <p className="text-sm font-semibold text-foreground">¡Todo al día!</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              {filterMode === 'unclassified'
                ? 'No tienes movimientos pendientes por clasificar en este período.'
                : 'No se encontraron movimientos registrados para este período.'}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoadingTx && displayedTx.length > 0 && (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedTx.map((tx) => (
            <CategorizationInboxCard
              key={tx.id}
              tx={tx}
              categoryOptions={categoryOptions}
              isFixed={Boolean(linkedMap.get(tx.id))}
              billId={linkedMap.get(tx.id)}
              onCategorySelect={handleCategorySelect}
              onToggleTransfer={handleToggleTransfer}
              onToggleFixed={handleToggleFixed}
            />
          ))}
        </div>
      )}
    </div>
  );
}
