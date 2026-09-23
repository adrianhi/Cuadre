import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Link2,
  Loader2,
  Pencil,
  Play,
  Trash2,
  Unlink2,
} from 'lucide-react';
import type { RecurringBillDto } from '@/entities/recurring-bill';
import { formatCurrency } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { CADENCE_LABELS, getServiceIcon } from '../lib/recurring-display';

interface RecurringBillRowProps {
  bill: RecurringBillDto;
  hideBalances: boolean;
  onEdit: (bill: RecurringBillDto) => void;
  onStatus: (bill: RecurringBillDto, status: 'CONFIRMED' | 'PAUSED' | 'DISMISSED') => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onLink?: (bill: RecurringBillDto) => void;
  onUnlink?: (bill: RecurringBillDto) => void;
  onDelete?: (bill: RecurringBillDto) => void;
  isUnlinking?: boolean;
  isDeleting?: boolean;
}


export function RecurringBillRow({
  bill,
  hideBalances,
  onEdit,
  onStatus,
  onAcknowledgeAlert,
  onLink,
  onUnlink,
  onDelete,
  isUnlinking = false,
  isDeleting = false,
}: RecurringBillRowProps) {
  const isPaid = bill.monthStatus === 'PAID';
  const isOverdue = bill.monthStatus === 'OVERDUE';
  const isPaused = bill.status === 'PAUSED';
  const isBusy = isUnlinking || isDeleting;

  return (
    <div className="group py-3.5 transition-colors hover:bg-muted/20">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        {/* Left: Icon & Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted/40 shadow-2xs">
            {getServiceIcon(bill.displayName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground">
                {bill.displayName}
              </p>
              {isPaid ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="h-3 w-3" />
                  Pagado este mes
                </span>
              ) : isOverdue ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                  <Clock className="h-3 w-3" />
                  Vencido ({Math.abs(bill.daysRemaining)}d atrás)
                </span>
              ) : isPaused ? (
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                  Pausado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  <Clock className="h-3 w-3" />
                  {bill.daysRemaining === 0 ? 'Hoy' : `En ${bill.daysRemaining} días`}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {CADENCE_LABELS[bill.cadence]} · Próximo cobro: {bill.nextExpectedDate}
              {isPaid && bill.lastPaidAmount && (
                <span className="text-emerald-600 dark:text-emerald-400">
                  {' '}· Cobrado: {formatCurrency(bill.lastPaidAmount, bill.currency)}
                </span>
              )}
              {isPaid && bill.linkedTransactionName && (
                <span className="text-muted-foreground">
                  {' '}· Pagado con: {bill.linkedTransactionName}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Amount & Actions */}
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-left sm:text-right">
            <p className="text-base font-black text-foreground sm:text-lg">
              {hideBalances ? '••••••' : formatCurrency(bill.expectedAmount, bill.currency)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              monto estimado
            </p>
          </div>

          <div className="flex items-center gap-1">
            {!isPaid && onLink && (
              <Button
                variant="outline"
                size="sm"
                disabled={isBusy}
                onClick={() => onLink(bill)}
                className="h-8 gap-1.5 text-xs"
              >
                <Link2 className="h-3.5 w-3.5" />
                Vincular pago
              </Button>
            )}

            {isPaid && onUnlink && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isBusy}
                onClick={() => onUnlink(bill)}
                className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Desvincular movimiento"
              >
                {isUnlinking ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                ) : (
                  <Unlink2 className="h-3.5 w-3.5" />
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={() => onEdit(bill)}
              className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:text-foreground"
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>

            {isPaused ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={isBusy}
                onClick={() => onStatus(bill, 'CONFIRMED')}
                className="h-8 rounded-lg px-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <Play className="mr-1 h-3 w-3" />
                Reactivar
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                disabled={isBusy}
                onClick={() => onStatus(bill, 'PAUSED')}
                className="h-8 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Pausar
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isBusy}
                onClick={() => onDelete(bill)}
                className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Eliminar gasto fijo"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>


      {/* Alerts (Price hike or missing) */}
      {bill.alerts.map((alert) => (
        <div
          key={alert.id}
          className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs text-amber-800 dark:text-amber-200"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              {alert.kind === 'PRICE_HIKE'
                ? `Variación detectada: Este cobro subió a ${
                    alert.observedAmount ? formatCurrency(alert.observedAmount, bill.currency) : 'un monto mayor'
                  }.`
                : 'No vimos este cobro en la fecha esperada.'}
            </span>
          </div>
          <button
            type="button"
            className="font-bold underline hover:opacity-80"
            onClick={() => onAcknowledgeAlert(alert.id)}
          >
            Entendido
          </button>
        </div>
      ))}
    </div>
  );
}
