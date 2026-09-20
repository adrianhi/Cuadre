import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import type { CoroPublicDetail } from '@/entities/coro';
import { coroService } from '@/entities/coro';
import { formatCurrency } from '@/shared/lib';
import { Button, toast } from '@/shared/ui';
import { buildSettlementsWhatsAppText, copyToClipboard } from '../model/coro-share';
import { CoroPaymentDestinationBadge } from './CoroPaymentDestinationBadge';

export function CoroSettlementsTab({ detail, onRefresh }: { detail: CoroPublicDetail; onRefresh: () => Promise<void> }) {
  const [copied, setCopied] = useState(false);

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

  const handleCopySummary = async () => {
    const text = buildSettlementsWhatsAppText(detail.name, detail.totalAmount, detail.currency, detail.settlements);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      toast.success('Resumen copiado para pegar en WhatsApp.');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('No pudimos copiar el resumen.');
    }
  };

  const handleWhatsAppShare = () => {
    const text = buildSettlementsWhatsAppText(detail.name, detail.totalAmount, detail.currency, detail.settlements);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-foreground">El Cuadre</h3>
          <p className="text-xs text-muted-foreground">
            {detail.status === 'ACTIVE'
              ? 'Vista previa dinámica de las transferencias mínimas necesarias.'
              : 'Obligaciones del cuadre cerrado.'}
          </p>
        </div>

        {detail.settlements.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleWhatsAppShare}
              className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-500/10 rounded-xl"
            >
              <Share2 className="h-3.5 w-3.5 shrink-0" />
              <span>Enviar a WhatsApp</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void handleCopySummary()}
              className="gap-1.5 text-xs rounded-xl"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <Copy className="h-3.5 w-3.5 shrink-0" />}
              <span>{copied ? 'Copiado' : 'Copiar resumen'}</span>
            </Button>
          </div>
        )}
      </div>

      {detail.settlements.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-sm text-muted-foreground">
          Todo está cuadrado; no hay transferencias pendientes.
        </p>
      )}

      <div className="space-y-3">
        {detail.settlements.map((item, index) => (
          <div
            key={item.id ?? `${item.fromId}-${item.toId}-${index}`}
            className="rounded-2xl border border-border/60 bg-card p-4 space-y-2.5 transition hover:border-border"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-foreground">
                  <strong className="font-bold">{item.fromName}</strong> le paga a{' '}
                  <strong className="font-bold">{item.toName}</strong>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.status === 'PENDING'
                    ? 'Pendiente'
                    : item.status === 'MARKED_PAID'
                    ? 'Marcado como enviado'
                    : 'Confirmado'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <strong className="mr-auto text-base text-primary sm:mr-0 font-black">
                  {formatCurrency(item.amount, detail.currency)}
                </strong>
                {item.id && item.canMarkPaid && (
                  <Button size="sm" onClick={() => void update(item.id!, 'mark')}>
                    Marcar enviado
                  </Button>
                )}
                {item.id && (item.canConfirm || item.status === 'MARKED_PAID') && (
                  <Button size="sm" onClick={() => void update(item.id!, 'confirm')}>
                    Confirmar
                  </Button>
                )}
              </div>
            </div>

            {item.toPaymentDestination && (
              <CoroPaymentDestinationBadge destination={item.toPaymentDestination} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
