import { useState } from 'react';
import { Check, Copy, Pencil, Trash2, Users } from 'lucide-react';
import type { CoroPaymentDestination, CoroPublicDetail } from '@/entities/coro';
import { formatCurrency, formatRelativeDate } from '@/shared/lib';
import {
  Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Tabs, TabsContent, TabsList, TabsTrigger, toast,
} from '@/shared/ui';
import { copyPaymentDestination } from '../model/coro-payment';

interface Props {
  detail: CoroPublicDetail;
  onDeleteExpense: (id: string) => Promise<void>;
  onEditExpense: (id: string) => void;
  onSettlement: (id: string, action: 'mark-paid' | 'confirm', input?: { paymentNote?: string }) => Promise<void>;
  onSavePayment: (value: CoroPaymentDestination | null) => Promise<void>;
}

function PaymentEditor({ current, onSave }: { current?: CoroPaymentDestination | null; onSave: Props['onSavePayment'] }) {
  const [kind, setKind] = useState<'BANK' | 'QIK'>(current?.kind ?? 'BANK');
  const [holder, setHolder] = useState(current?.accountHolder ?? '');
  const [identifier, setIdentifier] = useState(current?.kind === 'QIK' ? current.phoneNumber : current?.accountNumber ?? '');
  const [bank, setBank] = useState<'POPULAR' | 'BHD' | 'BANRESERVAS'>(current?.kind === 'BANK' ? current.bankCode : 'POPULAR');
  const [accountType, setAccountType] = useState<'SAVINGS' | 'CHECKING'>(current?.kind === 'BANK' ? current.accountType : 'SAVINGS');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      await onSave(kind === 'QIK' ? { kind, phoneNumber: identifier, accountHolder: holder }
        : { kind, bankCode: bank, accountType, accountNumber: identifier, accountHolder: holder });
      toast.success('Datos de cobro guardados.');
    } finally { setSaving(false); }
  };
  return <div className="mt-5 space-y-3 rounded-2xl border p-4">
    <p className="font-bold">Mis datos para cobrar</p>
    <Select value={kind} onValueChange={(value) => setKind(value as 'BANK' | 'QIK')}>
      <SelectTrigger className="h-10" aria-label="Tipo de cuenta para cobrar"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="BANK">Cuenta bancaria</SelectItem><SelectItem value="QIK">Qik</SelectItem></SelectContent>
    </Select>
    {kind === 'BANK' && <Select value={bank} onValueChange={(value) => setBank(value as typeof bank)}>
      <SelectTrigger className="h-10" aria-label="Banco"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="POPULAR">Popular</SelectItem><SelectItem value="BHD">BHD</SelectItem><SelectItem value="BANRESERVAS">Banreservas</SelectItem></SelectContent>
    </Select>}
    {kind === 'BANK' && <Select value={accountType} onValueChange={(value) => setAccountType(value as typeof accountType)}>
      <SelectTrigger className="h-10" aria-label="Tipo de cuenta bancaria"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="SAVINGS">Ahorros</SelectItem><SelectItem value="CHECKING">Corriente</SelectItem></SelectContent>
    </Select>}
    <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={kind === 'QIK' ? '8095551234' : 'Número de cuenta'} />
    <Input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Nombre del titular" />
    <Button size="sm" disabled={saving || !identifier.trim() || !holder.trim()} onClick={() => void save()}>{saving ? 'Guardando…' : 'Guardar datos'}</Button>
  </div>;
}

export function CoroTabs({ detail, onDeleteExpense, onEditExpense, onSettlement, onSavePayment }: Props) {
  const viewer = detail.participants.find((item) => item.id === detail.viewerParticipantId);
  return <Tabs defaultValue="expenses" className="mt-6">
    <TabsList className="grid grid-cols-3 rounded-2xl bg-muted p-1">
      <TabsTrigger value="expenses" className="justify-center">Gastos</TabsTrigger>
      <TabsTrigger value="settlements" className="justify-center">El Cuadre</TabsTrigger>
      <TabsTrigger value="participants" className="justify-center">Personas</TabsTrigger>
    </TabsList>
    <TabsContent value="expenses" className="mt-4 space-y-3">
      {detail.expenses.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Todavía no hay gastos.</div>}
      {detail.expenses.map((expense) => {
        const payerText = expense.payers && expense.payers.length > 1
          ? `Pagaron ${expense.payers.map((p) => `${p.participantName} (${formatCurrency(p.amount, detail.currency)})`).join(' + ')}`
          : `Pagó ${expense.paidByName}`;
        return (
          <article key={expense.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-lg">🧾</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{expense.title}</p>
              <p className="text-xs text-muted-foreground">{payerText} · {formatRelativeDate(expense.expenseDate)} · entre {expense.splitParticipantIds.length}</p>
            </div>
            <p className="font-black">{formatCurrency(expense.amount, detail.currency)}</p>
            {expense.canEdit && detail.status === 'ACTIVE' && (
              <>
                <Button size="icon" variant="ghost" aria-label={`Editar ${expense.title}`} onClick={() => onEditExpense(expense.id)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" aria-label={`Eliminar ${expense.title}`} onClick={() => void onDeleteExpense(expense.id)}><Trash2 className="h-4 w-4" /></Button>
              </>
            )}
          </article>
        );
      })}
    </TabsContent>
    <TabsContent value="settlements" className="mt-4 space-y-3">
      {detail.status === 'ACTIVE' && <p className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">Vista previa: los pagos quedarán fijos cuando el anfitrión cierre el coro.</p>}
      {detail.settlements.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Todo está cuadrado.</div>}
      {detail.settlements.length > 0 && detail.settlements.every((s) => s.status === 'CONFIRMED') && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
          <p className="text-xl">🎉🥂</p>
          <p className="font-bold text-emerald-700 dark:text-emerald-300">¡Todas las transferencias confirmadas!</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">El coro está 100% saldado. Nadie le debe a nadie.</p>
        </div>
      )}
      {detail.settlements.map((item, index) => <article key={item.id ?? `${item.fromId}-${item.toId}-${index}`} className="rounded-2xl border bg-card p-4">
        <p><strong>{item.fromName}</strong> le paga a <strong>{item.toName}</strong></p>
        <p className="mt-1 text-2xl font-black text-primary">{formatCurrency(item.amount, detail.currency)}</p>
        {item.paymentNote && <p className="mt-1 text-xs text-muted-foreground italic">&ldquo;{item.paymentNote}&rdquo;</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {item.toPaymentDestination && <Button size="sm" variant="outline" onClick={() => void copyPaymentDestination(item.toPaymentDestination!)}><Copy className="mr-2 h-4 w-4" />Copiar cuenta</Button>}
          {item.id && item.canMarkPaid && <Button size="sm" onClick={() => void onSettlement(item.id!, 'mark-paid')}><Check className="mr-2 h-4 w-4" />Marcar enviado</Button>}
          {item.id && item.canConfirm && <Button size="sm" onClick={() => void onSettlement(item.id!, 'confirm')}>Confirmar recibido</Button>}
          {item.status === 'CONFIRMED' && <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">Pagado</span>}
          {item.status === 'MARKED_PAID' && <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600">Por confirmar</span>}
        </div>
      </article>)}
    </TabsContent>
    <TabsContent value="participants" className="mt-4">
      <div className="space-y-2">{detail.participants.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-2xl border p-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-muted"><Users className="h-4 w-4" /></span><span className="flex-1 font-semibold">{item.name}{item.isOwner ? ' · anfitrión' : ''}</span>
        <span className={item.netBalance >= 0 ? 'text-emerald-600' : 'text-destructive'}>{formatCurrency(item.netBalance, detail.currency)}</span>
      </div>)}</div>
      {viewer && detail.status !== 'ARCHIVED' && <PaymentEditor current={viewer.paymentDestination} onSave={onSavePayment} />}
    </TabsContent>
  </Tabs>;
}
