import { ArrowLeftRight } from 'lucide-react';
import { Button, Checkbox } from '@/shared/ui';

interface InternalTransferControlProps {
  checked: boolean;
  suggestionPending: boolean;
  onConfirmSuggestion: () => void;
  onDismissSuggestion: () => void;
  onCheckedChange: (checked: boolean) => void;
}

export function InternalTransferControl({ checked, suggestionPending, onConfirmSuggestion,
  onDismissSuggestion, onCheckedChange }: InternalTransferControlProps) {
  return <div className="space-y-3">
    {suggestionPending && <div className="space-y-3 rounded-xl border border-violet-500/30 bg-violet-500/10 p-3" role="status">
      <div className="flex gap-2"><ArrowLeftRight className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" /><div>
        <p className="text-sm font-semibold">¿Este movimiento fue entre tus cuentas?</p>
        <p className="text-xs text-muted-foreground">Confírmalo para que no altere tu presupuesto ni tu Margen Seguro Diario.</p>
      </div></div>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" size="sm" onClick={onConfirmSuggestion}>Sí, entre mis cuentas</Button>
        <Button type="button" size="sm" variant="outline" onClick={onDismissSuggestion}>No, es gasto/ingreso</Button>
      </div>
    </div>}
    <label className="flex min-h-11 items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
      <span><span className="block font-semibold">Movimiento entre mis cuentas</span>
        <span className="block text-xs text-muted-foreground">Se mantiene visible, pero no cuenta como gasto ni ingreso.</span></span>
    </label>
  </div>;
}
