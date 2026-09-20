import { useState } from 'react';
import type { CoroPaymentDestination } from '@/entities/coro';
import { Button, Input } from '@/shared/ui';

export function CoroOwnerPaymentForm({ current, onSave }: {
  current?: CoroPaymentDestination | null;
  onSave: (value: CoroPaymentDestination) => Promise<void>;
}) {
  const [kind, setKind] = useState<'BANK' | 'QIK'>(current?.kind ?? 'BANK');
  const [holder, setHolder] = useState(current?.accountHolder ?? '');
  const [identifier, setIdentifier] = useState(current?.kind === 'QIK' ? current.phoneNumber : current?.accountNumber ?? '');
  const [bank, setBank] = useState<'POPULAR' | 'BHD' | 'BANRESERVAS'>(current?.kind === 'BANK' ? current.bankCode : 'POPULAR');
  const [accountType, setAccountType] = useState<'SAVINGS' | 'CHECKING'>(current?.kind === 'BANK' ? current.accountType : 'SAVINGS');
  const [saving, setSaving] = useState(false);
  return <div className="grid gap-2 rounded-2xl border p-3 sm:grid-cols-2">
    <p className="font-bold sm:col-span-2">Mi cuenta para recibir pagos</p>
    <select className="h-9 rounded-md border bg-background px-3 text-sm" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}><option value="BANK">Cuenta bancaria</option><option value="QIK">Qik</option></select>
    {kind === 'BANK' && <select className="h-9 rounded-md border bg-background px-3 text-sm" value={bank} onChange={(e) => setBank(e.target.value as typeof bank)}><option value="POPULAR">Popular</option><option value="BHD">BHD</option><option value="BANRESERVAS">Banreservas</option></select>}
    {kind === 'BANK' && <select className="h-9 rounded-md border bg-background px-3 text-sm" value={accountType} onChange={(e) => setAccountType(e.target.value as typeof accountType)}><option value="SAVINGS">Ahorros</option><option value="CHECKING">Corriente</option></select>}
    <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={kind === 'QIK' ? 'Teléfono Qik' : 'Número de cuenta'} />
    <Input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Nombre del titular" />
    <Button size="sm" disabled={saving || !identifier.trim() || !holder.trim()} onClick={async () => {
      setSaving(true); try { await onSave(kind === 'QIK' ? { kind, phoneNumber: identifier, accountHolder: holder }
        : { kind, bankCode: bank, accountType, accountNumber: identifier, accountHolder: holder }); } finally { setSaving(false); }
    }}>{saving ? 'Guardando…' : 'Guardar cuenta'}</Button>
  </div>;
}
