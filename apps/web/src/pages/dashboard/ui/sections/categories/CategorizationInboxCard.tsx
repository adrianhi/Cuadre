import { ArrowLeftRight, Repeat } from 'lucide-react';
import { INTERNAL_TRANSFER_CATEGORY, type TransactionDto } from '@bills/contracts';
import { cn, formatCurrency, formatDate } from '@/shared/lib';
import { Button, Card, CardContent, Combobox, type ComboboxOption } from '@/shared/ui';

interface CategorizationInboxCardProps {
  tx: TransactionDto;
  categoryOptions: ComboboxOption[];
  isFixed: boolean;
  billId?: string;
  onCategorySelect: (tx: TransactionDto, category: string) => void;
  onToggleTransfer: (tx: TransactionDto) => void;
  onToggleFixed: (tx: TransactionDto, billId?: string) => void;
}

export function CategorizationInboxCard({
  tx,
  categoryOptions,
  isFixed,
  billId,
  onCategorySelect,
  onToggleTransfer,
  onToggleFixed,
}: CategorizationInboxCardProps) {
  const isTransfer = tx.financialRole === 'INTERNAL_TRANSFER' || tx.category === INTERNAL_TRANSFER_CATEGORY;

  return (
    <Card className="border-border/70 bg-card transition hover:border-primary/40">
      <CardContent className="space-y-3 p-4">
        {/* Top row: merchant name, date, notes */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{tx.merchant || tx.rawMerchant}</p>
            <p className="text-[11px] text-muted-foreground">{formatDate(tx.transactionDate)}</p>
            {tx.notes && <p className="mt-0.5 truncate text-[11px] italic text-muted-foreground">{tx.notes}</p>}
          </div>
        </div>

        {/* Middle row: live-search combobox */}
        <div>
          <Combobox
            options={categoryOptions}
            value={tx.category || ''}
            onValueChange={(cat) => onCategorySelect(tx, cat)}
            placeholder="Seleccionar categoría…"
            searchPlaceholder="Buscar categoría…"
            className="h-9 text-xs"
          />
        </div>

        {/* Bottom row: Formatted amount + quick toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2.5">
          <span className="text-sm font-bold text-foreground">
            {formatCurrency(tx.amount, tx.currency)}
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant={isFixed ? 'default' : 'outline'}
              onClick={() => onToggleFixed(tx, billId)}
              className={cn('h-7 gap-1 px-2 text-[11px]', isFixed && 'bg-primary text-primary-foreground')}
              title={isFixed ? 'Desvincular de gasto fijo' : 'Marcar como gasto fijo recurrente'}
            >
              <Repeat className="h-3 w-3" />
              <span>Fijo</span>
            </Button>

            <Button
              type="button"
              size="sm"
              variant={isTransfer ? 'default' : 'outline'}
              onClick={() => onToggleTransfer(tx)}
              className={cn('h-7 gap-1 px-2 text-[11px]', isTransfer && 'bg-primary text-primary-foreground')}
              title={isTransfer ? 'Marcar como gasto ordinario' : 'Marcar como transferencia interna'}
            >
              <ArrowLeftRight className="h-3 w-3" />
              <span>Transferencia</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
