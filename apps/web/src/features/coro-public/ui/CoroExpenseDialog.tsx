import { useState } from 'react';
import type { CreateCoroExpenseInput } from '@bills/contracts';
import { CategoryPicker } from '@/entities/category';
import type { CoroExpense, CoroParticipant } from '@/entities/coro';
import { ApiClientError } from '@/shared/api';
import { currentLocalDateTime, isFutureLocalDateTime, parseAmountInput, toDateValue } from '@/shared/lib';
import {
  Button, Checkbox, CurrencyAmountInput, DateTimePickerField, Dialog, DialogContent,
  DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input,
} from '@/shared/ui';
import { CoroMultiPayerSection, type PayerShare } from '@/entities/coro';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: CoroParticipant[];
  viewerId: string;
  currency: 'DOP' | 'USD';
  initial?: CoroExpense | null;
  onSubmit: (input: CreateCoroExpenseInput) => Promise<void>;
}

export function CoroExpenseDialog({
  open,
  onOpenChange,
  participants,
  viewerId,
  currency,
  initial,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [category, setCategory] = useState(initial?.category ?? 'Varios');
  const [paidById, setPaidById] = useState(initial?.paidById ?? viewerId);
  const initialIsMulti = Boolean(initial?.payers && initial.payers.length > 1);
  const [isMultiPayer, setIsMultiPayer] = useState(initialIsMulti);
  const [payers, setPayers] = useState<PayerShare[]>(() => {
    if (initial?.payers && initial.payers.length > 0) {
      return initial.payers.map((p) => ({ participantId: p.participantId, amount: p.amount }));
    }
    return [{ participantId: initial?.paidById ?? viewerId, amount: initial?.amount ?? 0 }];
  });
  const [selected, setSelected] = useState<string[]>(
    initial?.splitParticipantIds ?? participants.map((item) => item.id)
  );
  const [date, setDate] = useState(() => {
    try {
      return initial ? toDateValue(new Date(initial.expenseDate)) : currentLocalDateTime();
    } catch {
      return currentLocalDateTime();
    }
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [duplicates, setDuplicates] = useState<Array<{ id: string; title: string; amount: number }>>([]);

  const numericAmount = Number(parseAmountInput(amount)) || 0;

  const submit = async (allowPossibleDuplicate = false) => {
    if (!title.trim()) return setError('Escribe el concepto del gasto.');
    if (numericAmount <= 0) return setError('Ingresa un monto válido mayor a cero.');
    if (isMultiPayer) {
      if (!payers.length) return setError('Selecciona al menos un pagador.');
      const totalPaid = payers.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(numericAmount - totalPaid) > 0.01) {
        return setError('La suma de los pagos debe ser igual al total del gasto.');
      }
    } else {
      if (!paidById || !participants.some((item) => item.id === paidById)) return setError('Selecciona quién pagó.');
    }
    if (!selected.length) return setError('Selecciona al menos una persona para dividir.');
    if (!date || isFutureLocalDateTime(date)) return setError('Selecciona una fecha válida no futura.');

    setSaving(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        amount: numericAmount,
        paidById: isMultiPayer ? payers[0]?.participantId : paidById,
        payers: isMultiPayer ? payers : undefined,
        category,
        expenseDate: new Date(date).toISOString(),
        notes: null,
        splitParticipantIds: selected,
        allowPossibleDuplicate,
      });
      setTitle('');
      setAmount('');
      onOpenChange(false);
    } catch (reason) {
      if (reason instanceof ApiClientError && reason.code === 'POSSIBLE_DUPLICATE') {
        const details = reason.details as { candidates?: Array<{ id: string; title: string; amount: number }> };
        setDuplicates(details?.candidates ?? []);
      } else {
        setError(reason instanceof Error ? reason.message : 'No pudimos guardar el gasto.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl p-4 sm:max-w-lg sm:p-6">
        <DialogHeader className="pr-6 text-left">
          <DialogTitle>{initial ? 'Editar gasto' : 'Agregar gasto'}</DialogTitle>
          <DialogDescription>
            Registra una compra o consumo para que el coro se mantenga al día.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {error && <p className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive font-medium">{error}</p>}

          {duplicates.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
              <p className="font-bold text-amber-600 dark:text-amber-400">Posible gasto duplicado</p>
              {duplicates.map((item) => (
                <p key={item.id} className="mt-1 text-muted-foreground">
                  {item.title} · {currency === 'DOP' ? 'RD$' : '$'} {item.amount.toFixed(2)}
                </p>
              ))}
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={() => void submit(true)}>
                  Guardar de todos modos
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Concepto del gasto <span className="text-primary">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cena, gasolina, alojamiento…"
              className="h-10 text-xs sm:text-sm"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Monto ({currency}) <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold text-muted-foreground">
                  {currency === 'DOP' ? 'RD$' : '$'}
                </span>
                <CurrencyAmountInput
                  value={amount}
                  onValueChange={setAmount}
                  placeholder="0.00"
                  className="pl-11 font-bold h-10 text-xs sm:text-sm"
                  aria-label={`Monto (${currency})`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Categoría</label>
              <CategoryPicker
                value={category}
                onValueChange={setCategory}
                ariaLabel="Categoría del gasto"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Fecha y hora</label>
            <DateTimePickerField value={date} onChange={setDate} />
          </div>

          <CoroMultiPayerSection
            participants={participants} currency={currency} totalAmount={numericAmount}
            singlePaidById={paidById} onSinglePaidByIdChange={setPaidById}
            isMultiPayer={isMultiPayer} onIsMultiPayerChange={setIsMultiPayer}
            payers={payers} onPayersChange={setPayers}
          />

          <fieldset className="space-y-2 rounded-xl border border-border/70 bg-card p-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <legend>Se divide entre ({selected.length} de {participants.length})</legend>
              <div className="flex gap-1">
                <Button type="button" size="sm" variant="ghost" onClick={() => setSelected(participants.map((p) => p.id))} className="h-6 px-2 text-[11px]">Todos</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setSelected([])} className="h-6 px-2 text-[11px]">Limpiar</Button>
              </div>
            </div>
            <div className="grid max-h-36 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
              {participants.map((item) => (
                <label key={item.id} className="flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-border/60 p-2 text-xs hover:bg-muted/30 transition">
                  <Checkbox checked={selected.includes(item.id)} onChange={() => setSelected((cur) => cur.includes(item.id) ? cur.filter((id) => id !== item.id) : [...cur, item.id])} />
                  <span className="truncate font-medium">{item.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <DialogFooter className="gap-2 sm:space-x-0 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" disabled={saving || !title.trim() || numericAmount <= 0 || !selected.length} onClick={() => void submit()}>
            {saving ? 'Guardando…' : initial ? 'Guardar cambios' : 'Guardar gasto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
