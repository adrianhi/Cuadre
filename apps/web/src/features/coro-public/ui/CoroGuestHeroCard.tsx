import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Check, CheckCircle2, Clock, Copy, Sparkles } from 'lucide-react';
import type { CoroPublicDetail, CoroTransferSuggestion } from '@/entities/coro';
import { formatCurrency } from '@/shared/lib';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/shared/ui';
import { copyPaymentDestination } from '../model/coro-payment';

interface CoroGuestHeroCardProps {
  detail: CoroPublicDetail;
  onSettlement: (id: string, action: 'mark-paid' | 'confirm', input?: { paymentNote?: string }) => Promise<void>;
}

export function CoroGuestHeroCard({ detail, onSettlement }: CoroGuestHeroCardProps) {
  const viewer = detail.participants.find((p) => p.id === detail.viewerParticipantId);
  const [markingItem, setMarkingItem] = useState<CoroTransferSuggestion | null>(null);
  const [paymentNote, setPaymentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!viewer) return null;

  const myDebts = detail.settlements.filter((s) => s.fromId === viewer.id);
  const myCredits = detail.settlements.filter((s) => s.toId === viewer.id);
  const isAllClear = myDebts.length === 0 && myCredits.length === 0 && Math.abs(viewer.netBalance) < 0.01;

  const handleConfirmSend = async () => {
    if (!markingItem?.id) return;
    setIsSubmitting(true);
    try {
      await onSettlement(markingItem.id, 'mark-paid', {
        paymentNote: paymentNote.trim() || undefined,
      });
      setMarkingItem(null);
      setPaymentNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-5 rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.04] p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Tu estado en este coro</h2>
            <p className="text-xs text-muted-foreground">Hola, <span className="font-semibold text-foreground">{viewer.name}</span></p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">Balance neto</span>
          <span className={`text-base font-black ${viewer.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
            {viewer.netBalance > 0 ? `+${formatCurrency(viewer.netBalance, detail.currency)}` : formatCurrency(viewer.netBalance, detail.currency)}
          </span>
        </div>
      </div>

      {isAllClear && (
        <div className="mt-4 rounded-2xl bg-emerald-500/10 p-4 text-center">
          <p className="text-lg">🎉</p>
          <p className="mt-1 font-bold text-emerald-700 dark:text-emerald-300">¡Estás al día con el coro!</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">No tienes transferencias pendientes por hacer ni recibir.</p>
        </div>
      )}

      {myDebts.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-destructive">
            <ArrowUpRight className="h-4 w-4" />
            <span>Te toca transferir:</span>
          </div>
          <div className="grid gap-2.5">
            {myDebts.map((debt, idx) => (
              <div key={debt.id ?? `debt-${idx}`} className="rounded-2xl border border-border/60 bg-background/80 p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Pagar a:</p>
                    <p className="text-sm font-bold text-foreground">{debt.toName}</p>
                  </div>
                  <strong className="text-base font-black text-foreground">
                    {formatCurrency(debt.amount, detail.currency)}
                  </strong>
                </div>

                {debt.toPaymentDestination ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/60 p-2.5 text-xs">
                    <div className="min-w-0 flex-1 truncate">
                      <span className="font-semibold text-foreground">
                        {debt.toPaymentDestination.kind === 'QIK' ? 'Qik' : debt.toPaymentDestination.bankCode}
                      </span>
                      <span className="text-muted-foreground ml-1.5 truncate">
                        {debt.toPaymentDestination.kind === 'QIK' ? debt.toPaymentDestination.phoneNumber : debt.toPaymentDestination.accountNumber}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs font-bold gap-1 text-primary hover:bg-primary/10 shrink-0"
                      onClick={() => void copyPaymentDestination(debt.toPaymentDestination!)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar</span>
                    </Button>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">
                    {debt.toName} aún no ha registrado cuenta bancaria o Qik.
                  </p>
                )}

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                  {debt.status === 'CONFIRMED' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" /> Transferencia confirmada
                    </span>
                  )}
                  {debt.status === 'MARKED_PAID' && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <Clock className="h-4 w-4" /> Pago enviado · Pendiente de confirmación
                    </span>
                  )}
                  {debt.status === 'PENDING' && (
                    <>
                      <span className="text-xs text-muted-foreground">Pendiente</span>
                      {debt.id && debt.canMarkPaid && (
                        <Button
                          size="sm"
                          onClick={() => { setMarkingItem(debt); setPaymentNote(''); }}
                          className="h-8 text-xs font-bold gap-1 rounded-xl shadow-xs"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Marcar enviado</span>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {myCredits.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="h-4 w-4" />
            <span>Te deben en este coro:</span>
          </div>
          <div className="grid gap-2.5">
            {myCredits.map((credit, idx) => (
              <div key={credit.id ?? `credit-${idx}`} className="rounded-2xl border border-border/60 bg-background/80 p-3.5 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">De: <span className="font-semibold text-foreground">{credit.fromName}</span></p>
                  <p className="text-sm font-black text-foreground">{formatCurrency(credit.amount, detail.currency)}</p>
                  {credit.paymentNote && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">&ldquo;{credit.paymentNote}&rdquo;</p>
                  )}
                </div>
                <div>
                  {credit.status === 'CONFIRMED' && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">✅ Recibido</span>
                  )}
                  {credit.status === 'MARKED_PAID' && credit.id && credit.canConfirm && (
                    <Button
                      size="sm"
                      onClick={() => void onSettlement(credit.id!, 'confirm')}
                      className="h-8 text-xs font-bold gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Confirmar recibido</span>
                    </Button>
                  )}
                  {credit.status === 'PENDING' && (
                    <span className="text-xs text-muted-foreground">⏳ Por pagar</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={Boolean(markingItem)} onOpenChange={(open) => { if (!open) setMarkingItem(null); }}>
        <DialogContent className="max-w-md rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle>Confirmar pago a {markingItem?.toName}</DialogTitle>
            <DialogDescription>
              Monto a enviar: <strong className="text-foreground">{formatCurrency(markingItem?.amount ?? 0, detail.currency)}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-xs font-semibold text-foreground">
              Comentario o referencia (opcional):
            </label>
            <Input
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="Ej. Transferido por Popular ref #12345"
              className="text-xs rounded-xl"
              maxLength={120}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setMarkingItem(null)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button size="sm" onClick={() => void handleConfirmSend()} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : 'Marcar como enviado'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
