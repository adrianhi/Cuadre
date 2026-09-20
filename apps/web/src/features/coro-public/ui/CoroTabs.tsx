import { useState } from 'react';
import { Check, Copy, Pencil, Trash2, Users } from 'lucide-react';
import type { CoroPaymentDestination, CoroPublicDetail } from '@/entities/coro';
import { formatCurrency, formatRelativeDate } from '@/shared/lib';
import { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger, toast } from '@/shared/ui';

interface Props {
  detail: CoroPublicDetail;
  onDeleteExpense: (id: string) => Promise<void>;
  onEditExpense: (id: string) => void;
  onSettlement: (id: string, action: 'mark-paid' | 'confirm') => Promise<void>;
  onSavePayment: (value: CoroPaymentDestination | null) => Promise<void>;
}

async function copyPayment(destination: CoroPaymentDestination) {
  const text = destination.kind === 'QIK'
    ? `Qik: ${destination.phoneNumber} | ${destination.accountHolder}`
    : `${destination.bankCode} ${destination.accountType === 'SAVINGS' ? 'Ahorros' : 'Corriente'}: ${destination.accountNumber} | ${destination.accountHolder}`;
  if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
  else {
    const area = document.createElement('textarea'); area.value = text; document.body.appendChild(area);
    area.select(); document.execCommand('copy'); area.remove();
  }
  toast.success('Cuenta copiada al portapapeles.');
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
    <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={kind} onChange={(e) => setKind(e.target.value as 'BANK' | 'QIK')}>
      <option value="BANK">Cuenta bancaria</option><option value="QIK">Qik</option>
    </select>
    {kind === 'BANK' && <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={bank} onChange={(e) => setBank(e.target.value as typeof bank)}>
      <option value="POPULAR">Popular</option><option value="BHD">BHD</option><option value="BANRESERVAS">Banreservas</option>
    </select>}
    {kind === 'BANK' && <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={accountType} onChange={(e) => setAccountType(e.target.value as typeof accountType)}><option value="SAVINGS">Ahorros</option><option value="CHECKING">Corriente</option></select>}
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
      {detail.expenses.map((expense) => <article key={expense.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-lg">🧾</div>
        <div className="min-w-0 flex-1"><p className="truncate font-bold">{expense.title}</p><p className="text-xs text-muted-foreground">Pagó {expense.paidByName} · {formatRelativeDate(expense.expenseDate)} · entre {expense.splitParticipantIds.length}</p></div>
        <p className="font-black">{formatCurrency(expense.amount, detail.currency)}</p>
        {expense.canEdit && detail.status === 'ACTIVE' && <><Button size="icon" variant="ghost" aria-label={`Editar ${expense.title}`} onClick={() => onEditExpense(expense.id)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label={`Eliminar ${expense.title}`} onClick={() => void onDeleteExpense(expense.id)}><Trash2 className="h-4 w-4" /></Button></>}
      </article>)}
    </TabsContent>
    <TabsContent value="settlements" className="mt-4 space-y-3">
      {detail.status === 'ACTIVE' && <p className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">Vista previa: los pagos quedarán fijos cuando el anfitrión cierre el coro.</p>}
      {detail.settlements.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Todo está cuadrado.</div>}
      {detail.settlements.map((item, index) => <article key={item.id ?? `${item.fromId}-${item.toId}-${index}`} className="rounded-2xl border bg-card p-4">
        <p><strong>{item.fromName}</strong> le paga a <strong>{item.toName}</strong></p>
        <p className="mt-1 text-2xl font-black text-primary">{formatCurrency(item.amount, detail.currency)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.toPaymentDestination && <Button size="sm" variant="outline" onClick={() => void copyPayment(item.toPaymentDestination!)}><Copy className="mr-2 h-4 w-4" />Copiar cuenta</Button>}
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
