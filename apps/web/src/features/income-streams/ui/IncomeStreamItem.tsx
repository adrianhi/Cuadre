import { Trash2, PiggyBank, Calendar } from 'lucide-react';
import type { IncomeStreamDto } from '@bills/contracts';
import { formatCurrency } from '@/shared/lib';
import { Button } from '@/shared/ui';

interface IncomeStreamItemProps {
  stream: IncomeStreamDto;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function IncomeStreamItem({ stream, onDelete, isDeleting }: IncomeStreamItemProps) {
  const getFrequencyLabel = () => {
    if (stream.frequency === 'BIWEEKLY_15_30') {
      const d1 = stream.dayOfMonth ?? 15;
      const d2 = stream.secondDayOfMonth ?? 30;
      return `Quincenal (días ${d1} y ${d2})`;
    }
    if (stream.frequency === 'MONTHLY') {
      return stream.dayOfMonth ? `Mensual (día ${stream.dayOfMonth})` : 'Mensual';
    }
    if (stream.frequency === 'WEEKLY') {
      return 'Semanal';
    }
    return 'Personalizado';
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-3 text-xs shadow-2xs">
      <div className="space-y-1 min-w-0 flex-1 pr-2">
        <div className="flex items-center gap-2">
          <p className="font-bold text-foreground truncate">{stream.name}</p>
          {!stream.isActive && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Inactiva</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{getFrequencyLabel()}</span>
          </span>
          {stream.savingsTarget && stream.savingsTarget > 0 ? (
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <PiggyBank className="h-3 w-3" />
              <span>Ahorro: {formatCurrency(Number(stream.savingsTarget), stream.currency)}</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
          {formatCurrency(Number(stream.amount), stream.currency)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDelete(stream.id)}
          disabled={isDeleting}
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
