import { useState } from 'react';
import type { RecurringBillDto, UpdateRecurringBillInput } from '@/entities/recurring-bill';
import { formatAmountInputOnBlur, parseAmountInput } from '@/shared/lib';
import {
  Button,
  CurrencyAmountInput,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';

export function RecurringEditorDialog(props: {
  bill: RecurringBillDto | null;
  open: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: UpdateRecurringBillInput) => Promise<void>;
}) {
  const [name, setName] = useState(props.bill?.displayName || '');
  const [amount, setAmount] = useState(formatAmountInputOnBlur(props.bill?.expectedAmount));
  const [date, setDate] = useState(props.bill?.nextExpectedDate || '');
  const [cadence, setCadence] = useState<RecurringBillDto['cadence']>(props.bill?.cadence || 'MONTHLY');
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar cobro recurrente</DialogTitle>
          <DialogDescription>Corrige la predicción para que tus reservas sean confiables.</DialogDescription>
        </DialogHeader>
        <label className="grid gap-1 text-sm font-medium">Nombre<Input value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="grid gap-1 text-sm font-medium">Monto esperado<CurrencyAmountInput value={amount} onValueChange={setAmount} placeholder="0.00" /></label>
        <label className="grid gap-1 text-sm font-medium">Próxima fecha<Input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <div className="grid gap-1">
          <label className="text-sm font-medium">Frecuencia</label>
          <Select value={cadence} onValueChange={(event) => setCadence(event as RecurringBillDto['cadence'])}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecciona frecuencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BIWEEKLY">Quincenal</SelectItem>
              <SelectItem value="MONTHLY">Mensual</SelectItem>
              <SelectItem value="ANNUAL">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>Cancelar</Button>
          <Button disabled={props.saving || !name.trim() || Number(parseAmountInput(amount)) <= 0 || !date} onClick={() => void props.onSave({
            displayName: name.trim(), expectedAmount: Number(parseAmountInput(amount)), nextExpectedDate: date, cadence,
          })}>{props.saving ? 'Guardando…' : 'Guardar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
