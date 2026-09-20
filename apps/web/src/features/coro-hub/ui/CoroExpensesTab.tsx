import { useState } from 'react';
import { ChevronDown, Link2, Pencil, Plus, Trash2 } from 'lucide-react';
import type { CoroExpense, CoroPublicDetail } from '@/entities/coro';
import { coroService } from '@/entities/coro';
import { formatCurrency } from '@/shared/lib';
import { Button, toast } from '@/shared/ui';
import { CoroCandidatesDialog } from './CoroCandidatesDialog';
import { CoroConfirmDialog } from './CoroConfirmDialog';
import { CoroEditExpenseDialog } from './CoroEditExpenseDialog';
import { CoroManualExpenseDialog } from './CoroManualExpenseDialog';

export function CoroExpensesTab({ detail, onRefresh }: { detail: CoroPublicDetail; onRefresh: () => Promise<void> }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [editingExpense, setEditingExpense] = useState<CoroExpense | null>(null);
  const [deletingId, setDeletingId] = useState<string>();
  const [pending, setPending] = useState(false);
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);
  const active = detail.status === 'ACTIVE';

  const remove = async () => {
    if (!deletingId) return;
    setPending(true);
    try {
      await coroService.removeOwnerExpense(detail.id, deletingId);
      setDeletingId(undefined);
      await onRefresh();
      toast.success('Gasto eliminado.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos eliminar el gasto.');
    } finally {
      setPending(false);
    }
  };

  const handleOpenManual = (suggestedTitle?: string) => {
    setManualTitle(suggestedTitle ?? '');
    setManualOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-foreground">Gastos del coro</h3>
          <p className="text-xs text-muted-foreground">{detail.expenses.length} gastos registrados · Toca un gasto para ver el detalle</p>
        </div>
        {active && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleOpenManual('')} className="gap-2 font-bold rounded-xl text-xs sm:text-sm">
              <Plus className="h-4 w-4" /><span>Registrar gasto</span>
            </Button>
            <Button onClick={() => setLinkOpen(true)} variant="outline" className="gap-2 rounded-xl text-xs sm:text-sm">
              <Link2 className="h-4 w-4" /><span>Vincular tarjeta</span>
            </Button>
          </div>
        )}
      </div>

      {detail.expenses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center space-y-3">
          <p className="text-sm font-bold text-foreground">Aún no hay gastos registrados</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Registra lo que pagaste en efectivo o vincula compras directas de tus tarjetas dominicanas.
          </p>
          {active && (
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <Button size="sm" onClick={() => handleOpenManual('')} className="gap-2 font-bold rounded-xl text-xs">
                <Plus className="h-4 w-4" /><span>Registrar gasto manual</span>
              </Button>
              <Button size="sm" variant="outline" onClick={() => setLinkOpen(true)} className="gap-2 rounded-xl text-xs">
                <Link2 className="h-4 w-4" /><span>Vincular tarjeta</span>
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {detail.expenses.map((item) => {
          const isExpanded = expandedExpenseId === item.id;
          const splitMembers = detail.participants.filter((p) => item.splitParticipantIds.includes(p.id));
          const perPerson = item.splitParticipantIds.length > 0 ? item.amount / item.splitParticipantIds.length : item.amount;
          return (
            <div
              key={item.id}
              onClick={() => setExpandedExpenseId((prev) => (prev === item.id ? null : item.id))}
              className={`cursor-pointer rounded-xl border p-3 shadow-xs transition ${
                isExpanded ? 'border-primary/50 bg-primary/[0.03]' : 'border-border/60 bg-card hover:border-primary/30'
              }`}
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">Pagó {item.paidByName} · {item.category}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <strong className="text-sm font-black text-foreground">{formatCurrency(item.amount, detail.currency)}</strong>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                  {active && item.canEdit && (
                    <Button
                      size="icon" variant="ghost"
                      onClick={(e) => { e.stopPropagation(); setEditingExpense(item); }}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                      aria-label={`Editar ${item.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {active && item.canEdit && (
                    <Button
                      size="icon" variant="ghost"
                      onClick={(e) => { e.stopPropagation(); setDeletingId(item.id); }}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      aria-label={`Eliminar ${item.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-2.5 border-t border-border/50 space-y-2 text-xs cursor-default" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block">Fecha y hora</span>
                      <span className="font-semibold text-foreground">
                        {new Date(item.expenseDate).toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Origen</span>
                      <span className="font-semibold text-foreground">
                        {item.transactionId ? '💳 Tarjeta vinculada' : '📝 Gasto manual'}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2 text-[11px] space-y-1">
                    <span className="font-semibold text-foreground block">
                      Dividido entre {item.splitParticipantIds.length} {item.splitParticipantIds.length === 1 ? 'persona' : 'personas'} ({formatCurrency(perPerson, detail.currency)} c/u):
                    </span>
                    <p className="text-muted-foreground">
                      {splitMembers.map((m) => m.name).join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CoroCandidatesDialog
        open={linkOpen} onOpenChange={setLinkOpen} coroId={detail.id}
        participantIds={detail.participants.map((item) => item.id)}
        onRefresh={onRefresh} onOpenManual={handleOpenManual}
      />

      {manualOpen && <CoroManualExpenseDialog
        open onOpenChange={setManualOpen} coroId={detail.id}
        currency={detail.currency} participants={detail.participants}
        initialTitle={manualTitle} onRefresh={onRefresh}
      />}

      <CoroConfirmDialog
        open={Boolean(deletingId)} onOpenChange={(open) => { if (!open) setDeletingId(undefined); }}
        title="Eliminar gasto" description="El gasto dejará de formar parte del cuadre. Esta acción no modifica la transacción bancaria original."
        confirmLabel="Eliminar gasto" destructive pending={pending} onConfirm={remove}
      />

      {editingExpense && (
        <CoroEditExpenseDialog
          open={Boolean(editingExpense)}
          onOpenChange={(open) => { if (!open) setEditingExpense(null); }}
          coroId={detail.id}
          currency={detail.currency}
          expense={editingExpense}
          participants={detail.participants}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
