import { Button, Checkbox, Input } from '@/shared/ui';
import { History, Sparkles } from 'lucide-react';
import type { useRuleHistory } from '../model/useRuleHistory';
import { RuleHistoryItem } from './RuleHistoryItem';

export function RuleHistoryPanel({ model }: { model: ReturnType<typeof useRuleHistory> }) {
  const hasJobs = model.jobs.length > 0;

  return (
    <section className="space-y-4 pt-4 border-t border-border/40" aria-label="Aplicación histórica">
      <div>
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm text-foreground sm:text-base">
            Historial de aplicaciones retroactivas
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Revisa cómo tus reglas han reclasificado compras anteriores y actualizado tus presupuestos pasados.
        </p>
      </div>

      {model.ruleId && (
        <div className="space-y-3.5 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="font-bold text-xs sm:text-sm text-foreground">
              Preparar aplicación al historial
            </h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Revisaremos tus movimientos pasados para identificar cuáles coinciden con esta regla y mostrarte los cambios antes de aplicarlos.
          </p>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <label className="text-xs font-semibold text-foreground space-y-1 block">
              <span>Desde (Opcional)</span>
              <Input
                type="date"
                aria-label="Desde"
                value={model.startDate}
                onChange={(event) => model.setStartDate(event.target.value)}
                className="h-9 text-xs"
              />
            </label>
            <label className="text-xs font-semibold text-foreground space-y-1 block">
              <span>Hasta (Opcional)</span>
              <Input
                type="date"
                aria-label="Hasta"
                value={model.endDate}
                onChange={(event) => model.setEndDate(event.target.value)}
                className="h-9 text-xs"
              />
            </label>
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground pt-1">
            <Checkbox
              checked={model.includeUnknown}
              onChange={(event) => model.setIncludeUnknown(event.target.checked)}
              className="mt-0.5"
            />
            <span>Incluir también transacciones anteriores sin origen conocido</span>
          </label>

          <p className="text-[11px] text-muted-foreground">
            🔒 <strong>Seguridad:</strong> Los movimientos que hayas clasificado manualmente a mano nunca serán modificados.
          </p>

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              disabled={model.pending || model.active}
              onClick={() => model.run('preview')}
              className="gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generar vista previa
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => model.setRuleId('')}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {model.error && (
        <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          {model.error}
        </p>
      )}

      {hasJobs ? (
        <div className="space-y-3">
          {model.jobs.map((job) => (
            <RuleHistoryItem
              key={job.id}
              job={job}
              disabled={model.pending || model.active}
              onConfirm={(id) => model.run('confirm', id)}
              onRetry={(id) => model.run('retry', id)}
            />
          ))}
        </div>
      ) : (
        !model.ruleId && (
          <p className="rounded-xl border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
            Aún no has aplicado reglas a meses pasados. Cuando presiones "Aplicar al histórico" en una regla, verás el registro y confirmación aquí.
          </p>
        )
      )}
    </section>
  );
}
