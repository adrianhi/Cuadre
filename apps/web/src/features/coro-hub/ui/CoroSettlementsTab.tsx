import type { CoroPublicDetail } from '@/entities/coro';
import { coroService } from '@/entities/coro';
import { formatCurrency } from '@/shared/lib';
import { Button, toast } from '@/shared/ui';

export function CoroSettlementsTab({ detail, onRefresh }: { detail: CoroPublicDetail; onRefresh: () => Promise<void> }) {
  const update = async (id: string, action: 'mark' | 'confirm') => {
    try {
      if (action === 'mark') await coroService.markOwnerSettlementPaid(detail.id, id);
      else await coroService.confirmOwnerSettlement(detail.id, id);
      await onRefresh();
      toast.success(action === 'mark' ? 'Pago marcado como enviado.' : 'Pago confirmado.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos actualizar el pago.');
    }
  };
  return (
    <div className="space-y-4">
      <div><h3 className="font-bold">El Cuadre</h3><p className="text-xs text-muted-foreground">{detail.status === 'ACTIVE' ? 'Vista previa dinámica de las transferencias mínimas.' : 'Obligaciones del cuadre cerrado.'}</p></div>
      {detail.settlements.length === 0 && <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Todo está cuadrado; no hay transferencias pendientes.</p>}
      <div className="space-y-2">
        {detail.settlements.map((item, index) => (
          <div key={item.id ?? `${item.fromId}-${item.toId}-${index}`} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm"><strong>{item.fromName}</strong> le paga a <strong>{item.toName}</strong></p><p className="mt-1 text-xs text-muted-foreground">{item.status === 'PENDING' ? 'Pendiente' : item.status === 'MARKED_PAID' ? 'Marcado como enviado' : 'Confirmado'}</p></div>
            <div className="flex flex-wrap items-center gap-2"><strong className="mr-auto text-base text-primary sm:mr-0">{formatCurrency(item.amount, detail.currency)}</strong>
              {item.id && item.canMarkPaid && <Button size="sm" onClick={() => void update(item.id!, 'mark')}>Marcar enviado</Button>}
              {item.id && (item.canConfirm || item.status === 'MARKED_PAID') && <Button size="sm" onClick={() => void update(item.id!, 'confirm')}>Confirmar</Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
