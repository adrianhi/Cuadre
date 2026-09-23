import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link2, Loader2, Search } from "lucide-react";
import type { RecurringBillDto } from "@/entities/recurring-bill";
import { transactionKeys, transactionService } from "@/entities/transaction";
import { formatCurrency, formatDate } from "@/shared/lib";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
} from "@/shared/ui";

export interface LinkRecurringTransactionDialogProps {
  bill: RecurringBillDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLink: (
    recurringBillId: string,
    transactionId: string,
  ) => Promise<void> | void;
  linking?: boolean;
}

export function LinkRecurringTransactionDialog({
  bill,
  open,
  onOpenChange,
  onLink,
  linking = false,
}: LinkRecurringTransactionDialogProps) {
  const [search, setSearch] = useState("");
  const [linkingTxId, setLinkingTxId] = useState<string | null>(null);
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const currency = bill?.currency ?? "DOP";
  const isBusy = linking || Boolean(linkingTxId);

  const filters = useMemo(
    () => ({
      page: 1,
      limit: 50,
      currency,
      month: currentMonthPrefix,
    }),
    [currency, currentMonthPrefix],
  );

  const query = useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: ({ signal }) =>
      transactionService.listTransactions(filters, signal),
    enabled: open && Boolean(bill),
  });

  const transactions = useMemo(() => {
    const list = query.data?.data ?? [];
    if (!search.trim()) return list;
    const term = search.toLowerCase().trim();
    return list.filter((tx) => {
      const merchant = (tx.merchant || tx.rawMerchant || "").toLowerCase();
      const notes = (tx.notes || "").toLowerCase();
      const category = (tx.category || "").toLowerCase();
      return (
        merchant.includes(term) ||
        notes.includes(term) ||
        category.includes(term)
      );
    });
  }, [query.data?.data, search]);

  const handleLink = async (txId: string) => {
    if (!bill || isBusy) return;
    setLinkingTxId(txId);
    try {
      await onLink(bill.id, txId);
    } finally {
      setLinkingTxId(null);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isBusy) onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Vincular movimiento</DialogTitle>
          <DialogDescription>
            {bill
              ? `Asocia un movimiento de tu cuenta a ${bill.displayName} para marcarlo como pagado este mes.`
              : "Asocia un movimiento a tu cobro recurrente."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por comercio o nota…"
            value={search}
            disabled={isBusy}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>

        <div className="mt-3">
          {query.isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="mt-2 text-xs">Cargando movimientos recientes…</p>
            </div>
          ) : query.isError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm font-semibold text-destructive">
                Error al cargar movimientos
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void query.refetch()}
                className="mt-2 text-xs"
              >
                Reintentar
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center text-muted-foreground">
              <p className="text-sm font-medium">
                No se encontraron movimientos
              </p>
              <p className="mt-1 text-xs">
                {search
                  ? "Intenta con otro término de búsqueda."
                  : "No hay movimientos registrados para este período."}
              </p>
            </div>
          ) : (
            <div className="max-h-[360px] space-y-2 overflow-y-auto overflow-x-hidden pr-1">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card p-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3 w-full min-w-0"
                >
                  <div className="min-w-0 flex-1 overflow-hidden space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {tx.merchant || tx.rawMerchant}
                      </p>
                      {tx.category && (
                        <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {tx.category}
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      <span>{formatDate(tx.transactionDate)}</span>
                      {tx.notes && <span title={tx.notes}> · {tx.notes}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/30 sm:border-0 sm:pt-0 sm:justify-end sm:shrink-0">
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {formatCurrency(tx.amount, tx.currency)}
                    </span>
                    <Button
                      size="sm"
                      disabled={isBusy}
                      onClick={() => void handleLink(tx.id)}
                      className="h-8 min-w-[88px] gap-1.5 text-xs shrink-0"
                    >
                      {linkingTxId === tx.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Vinculando…</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="h-3.5 w-3.5" />
                          <span>Vincular</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
