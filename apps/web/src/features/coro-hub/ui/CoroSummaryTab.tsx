import { CircleDollarSign, ReceiptText, Users } from 'lucide-react';
import type { CoroPublicDetail } from '@/entities/coro';
import { formatCurrency } from '@/shared/lib';
import { Card, CardContent } from '@/shared/ui';

export function CoroSummaryTab({ detail }: { detail: CoroPublicDetail }) {
  const cards = [
    { label: 'Total compartido', value: formatCurrency(detail.totalAmount, detail.currency), icon: CircleDollarSign },
    { label: 'Participantes', value: String(detail.participants.length), icon: Users },
    { label: 'Gastos', value: String(detail.expenses.length), icon: ReceiptText },
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}><CardContent className="flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
            <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate text-lg font-black">{value}</p></div>
          </CardContent></Card>
        ))}
      </div>
      <Card><CardContent className="p-5">
        <h3 className="font-bold">Estado general</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {detail.status === 'ACTIVE' && 'El coro sigue activo. Los saldos son provisionales y se actualizan cuando cambia un gasto.'}
          {detail.status === 'LOCKED' && 'El coro está cuadrado. Los gastos están congelados y las obligaciones ya son estables.'}
          {detail.status === 'ARCHIVED' && 'Este coro está archivado y se conserva como historial de solo lectura.'}
        </p>
        {detail.description && <p className="mt-3 rounded-xl bg-muted/40 p-3 text-sm">{detail.description}</p>}
      </CardContent></Card>
    </div>
  );
}
