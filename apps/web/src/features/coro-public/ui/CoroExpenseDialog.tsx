import { useState } from 'react';
import type { CreateCoroExpenseInput } from '@bills/contracts';
import type { CoroExpense, CoroParticipant } from '@/entities/coro';
import { ApiClientError } from '@/shared/api';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input } from '@/shared/ui';

interface Props {
  open: boolean; onOpenChange: (open: boolean) => void;
  participants: CoroParticipant[]; viewerId: string; currency: 'DOP' | 'USD';
  initial?: CoroExpense | null;
  onSubmit: (input: CreateCoroExpenseInput) => Promise<void>;
}

export function CoroExpenseDialog({ open, onOpenChange, participants, viewerId, currency, initial, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? ''); const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [paidById, setPaidById] = useState(initial?.paidById ?? viewerId);
  const [selected, setSelected] = useState<string[]>(initial?.splitParticipantIds ?? participants.map((item) => item.id));
  const [date, setDate] = useState((initial?.expenseDate ?? new Date().toISOString()).slice(0, 16)); const [saving, setSaving] = useState(false);
  const [error, setError] = useState(''); const [duplicates, setDuplicates] = useState<Array<{ id: string; title: string; amount: number }>>([]);
  const submit = async (allowPossibleDuplicate = false) => {
    setSaving(true); setError('');
    try {
      await onSubmit({ title: title.trim(), amount: Number(amount), paidById, category: 'Varios',
        expenseDate: new Date(date).toISOString(), notes: null, splitParticipantIds: selected, allowPossibleDuplicate });
      setTitle(''); setAmount(''); onOpenChange(false);
    } catch (reason) {
      if (reason instanceof ApiClientError && reason.code === 'POSSIBLE_DUPLICATE') {
        const details = reason.details as { candidates?: Array<{ id: string; title: string; amount: number }> };
        setDuplicates(details?.candidates ?? []);
      } else setError(reason instanceof Error ? reason.message : 'No pudimos guardar el gasto.');
    } finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>{initial ? 'Editar gasto' : 'Agregar gasto'}</DialogTitle><DialogDescription>Se dividirá en partes iguales entre las personas seleccionadas.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {duplicates.length > 0 && <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
            <p className="font-bold">Posible gasto duplicado</p>
            {duplicates.map((item) => <p key={item.id} className="mt-1 text-muted-foreground">{item.title} · {currency} {item.amount.toFixed(2)}</p>)}
            <div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Usar el existente</Button>
              <Button size="sm" onClick={() => void submit(true)}>Guardar de todos modos</Button></div>
          </div>}
          <label className="block text-sm font-semibold">Concepto<Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cena, gasolina, alojamiento…" /></label>
          <label className="block text-sm font-semibold">Monto ({currency})<Input className="mt-1" type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
          <label className="block text-sm font-semibold">Quién pagó<select className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={paidById} onChange={(e) => setPaidById(e.target.value)}>
            {participants.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="block text-sm font-semibold">Fecha<Input className="mt-1" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <fieldset><legend className="text-sm font-semibold">Dividir entre</legend><div className="mt-2 grid grid-cols-2 gap-2">
            {participants.map((item) => <label key={item.id} className="flex items-center gap-2 rounded-xl border p-2 text-sm"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => setSelected((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} />{item.name}</label>)}
          </div></fieldset>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button disabled={saving || !title.trim() || Number(amount) <= 0 || !selected.length} onClick={() => void submit()}>{saving ? 'Guardando…' : initial ? 'Guardar cambios' : 'Guardar gasto'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
