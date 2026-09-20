import { useState } from 'react';
import type { CoroPaymentDestination } from '@/entities/coro';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';

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
    <Select value={kind} onValueChange={(value) => setKind(value as typeof kind)}>
      <SelectTrigger aria-label="Tipo de cuenta para recibir pagos"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="BANK">Cuenta bancaria</SelectItem><SelectItem value="QIK">Qik</SelectItem></SelectContent>
    </Select>
    {kind === 'BANK' && <Select value={bank} onValueChange={(value) => setBank(value as typeof bank)}>
      <SelectTrigger aria-label="Banco"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="POPULAR">Popular</SelectItem><SelectItem value="BHD">BHD</SelectItem><SelectItem value="BANRESERVAS">Banreservas</SelectItem></SelectContent>
    </Select>}
    {kind === 'BANK' && <Select value={accountType} onValueChange={(value) => setAccountType(value as typeof accountType)}>
      <SelectTrigger aria-label="Tipo de cuenta bancaria"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="SAVINGS">Ahorros</SelectItem><SelectItem value="CHECKING">Corriente</SelectItem></SelectContent>
    </Select>}
    <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={kind === 'QIK' ? 'Teléfono Qik' : 'Número de cuenta'} />
    <Input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Nombre del titular" />
    <Button size="sm" disabled={saving || !identifier.trim() || !holder.trim()} onClick={async () => {
      setSaving(true); try { await onSave(kind === 'QIK' ? { kind, phoneNumber: identifier, accountHolder: holder }
        : { kind, bankCode: bank, accountType, accountNumber: identifier, accountHolder: holder }); } finally { setSaving(false); }
    }}>{saving ? 'Guardando…' : 'Guardar cuenta'}</Button>
  </div>;
}
