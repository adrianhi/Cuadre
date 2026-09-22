import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { CoroParticipant, CreateCoroExpenseInput } from '@/entities/coro';
import { coroKeys, coroService } from '@/entities/coro';
import { CategoryPicker } from '@/entities/category';
import { ApiClientError } from '@/shared/api';
import { currentLocalDateTime, formatCurrency, isFutureLocalDateTime, parseAmountInput, toDateValue } from '@/shared/lib';
import {
  Button, Checkbox, CurrencyAmountInput, DateTimePickerField, Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, Input, Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue, toast,
} from '@/shared/ui';
import { CoroConfirmDialog } from './CoroConfirmDialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coroId: string;
  currency: 'DOP' | 'USD';
  participants: CoroParticipant[];
  initialTitle?: string;
  onRefresh: () => Promise<void>;
}

type DuplicateCandidate = { id: string; title: string; amount: number };

export function CoroManualExpenseDialog(props: Props) {
  const client = useQueryClient();
  const ownerId = props.participants.find((item) => item.isOwner)?.id ?? props.participants[0]?.id ?? '';
  const [title, setTitle] = useState(props.initialTitle ?? '');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Varios');
  const [paidById, setPaidById] = useState(ownerId);
  const [expenseDate, setExpenseDate] = useState(currentLocalDateTime());
  const [splitIds, setSplitIds] = useState<string[]>(props.participants.map((item) => item.id));
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (allowPossibleDuplicate = false) => {
    const numericAmount = Number(parseAmountInput(amount));
    if (!title.trim()) return setError('Escribe el concepto del gasto.');
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return setError('Ingresa un monto mayor que cero.');
    if (!paidById || !props.participants.some((item) => item.id === paidById)) return setError('Selecciona quién pagó.');
    if (!splitIds.length) return setError('Selecciona al menos un participante.');
    if (!expenseDate || isFutureLocalDateTime(expenseDate)) return setError('Selecciona una fecha válida que no esté en el futuro.');
    setSaving(true);
    setError('');
    try {
      const input: CreateCoroExpenseInput = {
        title: title.trim(), amount: numericAmount, paidById, category,
        expenseDate: new Date(expenseDate).toISOString(), notes: null,
        splitParticipantIds: splitIds, allowPossibleDuplicate,
      };
      const detail = await coroService.createOwnerExpense(props.coroId, input);
      client.setQueryData(coroKeys.detail(props.coroId), detail);
      setDuplicates([]);
      props.onOpenChange(false);
      toast.success('Gasto registrado.');
      await Promise.all([
        client.invalidateQueries({ queryKey: coroKeys.list() }),
        client.invalidateQueries({ queryKey: coroKeys.detail(props.coroId) }),
      ]);
      await props.onRefresh();
    } catch (caught) {
      if (caught instanceof ApiClientError && caught.code === 'POSSIBLE_DUPLICATE') {
        const details = caught.details as { candidates?: DuplicateCandidate[] } | undefined;
        setDuplicates(details?.candidates ?? []);
      } else {
        setError(caught instanceof Error ? caught.message : 'No pudimos registrar el gasto.');
      }
    } finally {
      setSaving(false);
    }
  };

  const closeUsingExisting = () => {
    setDuplicates([]);
    props.onOpenChange(false);
  };
  const toggleSplit = (id: string) => setSplitIds((current) => current.includes(id)
    ? current.filter((item) => item !== id) : [...current, id]);

  return <>
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-[calc(100vw-1rem)] overflow-x-hidden overflow-y-auto rounded-2xl p-4 sm:max-w-lg sm:p-6">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle>Registrar gasto manual</DialogTitle>
          <DialogDescription>Añade un pago en efectivo o transferencia y define entre quiénes se divide.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}
          <label className="grid gap-1.5 text-xs font-semibold">Concepto
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Picapollo, peaje, gasolina…" autoFocus />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold">Monto ({props.currency})
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold text-muted-foreground">{props.currency === 'DOP' ? 'RD$' : '$'}</span>
              <CurrencyAmountInput aria-label={`Monto (${props.currency})`} value={amount} onValueChange={setAmount} placeholder="0.00" className="pl-11 font-bold" />
            </div>
          </label>
          <label className="grid gap-1.5 text-xs font-semibold">Quién pagó
            <Select value={paidById} onValueChange={setPaidById}>
              <SelectTrigger aria-label="Quién pagó"><SelectValue /></SelectTrigger>
              <SelectContent>{props.participants.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}{item.isOwner ? ' (Anfitrión)' : ''}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <div className="grid gap-1.5 text-xs font-semibold">Categoría
            <CategoryPicker value={category} onValueChange={setCategory} ariaLabel="Categoría del gasto" />
          </div>
          <DateTimePickerField value={expenseDate} onChange={setExpenseDate} label="Fecha y hora" maxDate={toDateValue(new Date())} />
          <fieldset className="space-y-3 rounded-xl border p-3">
            <div className="flex items-center justify-between gap-2">
              <legend className="text-xs font-bold">Dividir entre ({splitIds.length})</legend>
              <div className="flex gap-1">
                <Button type="button" size="sm" variant="ghost" onClick={() => setSplitIds(props.participants.map((item) => item.id))}>Todos</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setSplitIds([])}>Limpiar</Button>
              </div>
            </div>
            <div className="grid max-h-36 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
              {props.participants.map((item) => <label key={item.id} className="flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border p-2 text-xs">
                <Checkbox checked={splitIds.includes(item.id)} onChange={() => toggleSplit(item.id)} />
                <span className="truncate">{item.name}</span>
              </label>)}
            </div>
          </fieldset>
        </div>
        <DialogFooter className="mt-4 gap-2">
          <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button type="button" onClick={() => void submit()} disabled={saving}>{saving ? 'Guardando…' : 'Registrar gasto'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <CoroConfirmDialog open={duplicates.length > 0} onOpenChange={(open) => { if (!open) closeUsingExisting(); }}
      title="Posible gasto duplicado"
      description={duplicates.length ? `Encontramos ${duplicates.map((item) => `${item.title} (${formatCurrency(item.amount, props.currency)})`).join(', ')}. ¿Deseas guardarlo de todos modos?` : ''}
      cancelLabel="Usar el existente" confirmLabel="Guardar de todos modos" pending={saving}
      onConfirm={() => void submit(true)} />
  </>;
}
