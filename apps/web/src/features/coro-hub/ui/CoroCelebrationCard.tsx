import { useState } from 'react';
import { Check, CheckCircle2, PartyPopper, Share2 } from 'lucide-react';
import type { CoroPublicDetail } from '@/entities/coro';
import { formatCurrency } from '@/shared/lib';
import { Button, toast } from '@/shared/ui';
import { copyToClipboard } from '../model/coro-share';

interface CoroCelebrationCardProps {
  detail: CoroPublicDetail;
}

export function CoroCelebrationCard({ detail }: CoroCelebrationCardProps) {
  const [copied, setCopied] = useState(false);

  const isComplete =
    detail.settlements.length > 0 &&
    detail.settlements.every((s) => s.status === 'CONFIRMED');

  if (!isComplete) return null;

  const buildCelebrationText = () => {
    return [
      `🎉 *¡EL CORO ESTÁ 100% SALDADO!* 🥂`,
      `*${detail.name}*`,
      ``,
      `💰 *Total acumulado:* ${formatCurrency(detail.totalAmount, detail.currency)}`,
      `👥 *Participantes:* ${detail.participants.length}`,
      `🧾 *Gastos:* ${detail.expenses.length}`,
      ``,
      `✅ *Todas las transferencias fueron confirmadas.* ¡Nadie le debe a nadie!`,
      ``,
      `_Cuadrado con Cuadre · cuadre.app_`,
    ].join('\n');
  };

  const handleShare = () => {
    const text = buildCelebrationText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    const text = buildCelebrationText();
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      toast.success('Mensaje copiado para pegar en WhatsApp.');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('No pudimos copiar el mensaje.');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.03] to-primary/10 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            <span>100% Saldado y al día</span>
          </div>
          <h4 className="text-lg font-black text-foreground flex items-center gap-2">
            <span>¡Cuentas claras, amistades intactas!</span>
            <PartyPopper className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </h4>
          <p className="text-xs text-muted-foreground max-w-md">
            Todas las transferencias de este coro han sido pagadas y confirmadas.
            Nadie le debe a nadie.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleShare}
            className="gap-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Celebrar en WhatsApp</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void handleCopy()}
            className="gap-1.5 text-xs rounded-xl border-emerald-500/30 hover:bg-emerald-500/10"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : null}
            <span>{copied ? 'Copiado' : 'Copiar mensaje final'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
