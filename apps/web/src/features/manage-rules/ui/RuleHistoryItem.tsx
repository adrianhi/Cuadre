import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  RotateCw,
  Shield,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import type { RuleApplicationDto } from '@bills/contracts';
import { Badge, Button, Card, CardContent } from '@/shared/ui';

interface RuleHistoryItemProps {
  job: RuleApplicationDto;
  disabled: boolean;
  onConfirm: (id: string) => void;
  onRetry: (id: string) => void;
}

export function RuleHistoryItem({ job, disabled, onConfirm, onRetry }: RuleHistoryItemProps) {
  const [showSample, setShowSample] = useState(false);

  const isCompleted = job.phase === 'APPLY' && job.status === 'COMPLETED';
  const isReady = job.status === 'READY';
  const isProcessing = ['QUEUED', 'PROCESSING'].includes(job.status);
  const isFailed = job.status === 'FAILED';

  return (
    <Card className="border border-border/60 bg-card shadow-2xs">
      <CardContent className="p-4 space-y-3.5">
        {/* Header row: Status and rule mapping */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 text-[11px]">
                <CheckCircle2 className="h-3 w-3" /> Aplicada con éxito
              </Badge>
            )}
            {isReady && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1 text-[11px]">
                <Clock className="h-3 w-3" /> Vista previa lista
              </Badge>
            )}
            {isProcessing && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1 text-[11px] animate-pulse">
                <RotateCw className="h-3 w-3 animate-spin" /> Procesando…
              </Badge>
            )}
            {isFailed && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1 text-[11px]">
                <AlertCircle className="h-3 w-3" /> Requiere reintento
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {job.startDate || 'Todo el historial'} {job.endDate ? `hasta ${job.endDate}` : ''}
            </span>
          </div>

          {job.ruleCategory && (
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-foreground max-w-[140px] truncate sm:max-w-xs">{job.ruleLabel}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <Badge className="bg-primary/10 text-primary text-xs font-bold">{job.ruleCategory}</Badge>
            </div>
          )}
        </div>

        {/* Human-readable metrics pills */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/40 p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              {job.phase === 'APPLY' ? 'Actualizados' : 'Por reclasificar'}
            </span>
            <span className="text-base font-extrabold text-foreground">
              {job.phase === 'APPLY' ? job.applied : job.changes} movimientos
            </span>
          </div>

          <div className="rounded-xl bg-muted/40 p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Revisados</span>
            <span className="text-base font-extrabold text-foreground">{job.scanned} historial</span>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl bg-muted/40 p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Protegidos</span>
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-1">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              {job.protectedManual} ediciones manuales
            </span>
          </div>
        </div>

        {/* Friendly explanation */}
        {isReady && (
          <div className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200 space-y-2">
            <p className="leading-relaxed">
              💡 <strong>¿Qué sucederá ahora?</strong> Al confirmar, Cuadre actualizará la categoría de estos {job.changes} movimientos en tus meses anteriores y recalculará tus presupuestos y estadísticas. Los montos de dinero nunca se alteran.
            </p>
            <Button
              size="sm"
              disabled={disabled || !job.changes}
              onClick={() => onConfirm(job.id)}
              className="gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Confirmar {job.changes} {job.changes === 1 ? 'cambio' : 'cambios'}
            </Button>
          </div>
        )}

        {isCompleted && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            ✓ Tu historial fue actualizado. Tus consumos pasados de presupuesto y márgenes ya reflejan la categoría <strong className="text-foreground">{job.ruleCategory}</strong>.
          </p>
        )}

        {isFailed && (
          <Button size="sm" variant="outline" disabled={disabled} onClick={() => onRetry(job.id)}>
            Reintentar aplicación pendiente
          </Button>
        )}

        {/* Before and After Sample */}
        {job.sample.length > 0 && (
          <div className="border-t border-border/40 pt-2">
            <button
              type="button"
              onClick={() => setShowSample(!showSample)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              {showSample ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span>{showSample ? 'Ocultar muestra' : `Ver muestra del antes y después (${job.sample.length})`}</span>
            </button>

            {showSample && (
              <div className="mt-2.5 space-y-2">
                {job.sample.map((item) => (
                  <div key={item.transactionId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-lg border border-border/40 bg-muted/20 p-2 text-xs">
                    <span className="font-semibold text-foreground truncate max-w-xs">{item.merchant}</span>
                    <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">{item.category}</Badge>
                      <ArrowRight className="h-3 w-3" />
                      <Badge className="bg-primary/10 text-primary text-[10px] font-bold">{item.nextCategory}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
