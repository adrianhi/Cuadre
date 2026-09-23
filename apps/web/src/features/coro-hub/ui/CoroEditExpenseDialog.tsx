import type { CoroExpense, CoroParticipant } from '@/entities/coro';
import { CategoryPicker } from '@/entities/category';
import { formatCurrency } from '@/shared/lib';
import { CoroMultiPayerSection } from '@/entities/coro';
import {
  Button, CurrencyAmountInput, DateTimePickerField, Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, Input,
} from '@/shared/ui';
import { useCoroExpenseEditForm } from '../model/useCoroExpenseEditForm';
import { CoroConfirmDialog } from './CoroConfirmDialog';

interface CoroEditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coroId: string;
  currency: 'DOP' | 'USD';
  expense: CoroExpense;
  participants: CoroParticipant[];
  onSuccess: () => Promise<void>;
}

export function CoroEditExpenseDialog({
  open,
  onOpenChange,
  coroId,
  currency,
  expense,
  participants,
  onSuccess,
}: CoroEditExpenseDialogProps) {
  const {
    title, setTitle, amount, setAmount, category, setCategory,
    paidById, setPaidById, isMultiPayer, setIsMultiPayer, payers, setPayers,
    expenseDate, setExpenseDate, notes, setNotes,
    splitIds, toggleSplit, selectAllSplits, duplicates, setDuplicates,
    saving, error, perPerson, submit,
  } = useCoroExpenseEditForm({
    coroId,
    expense,
    participants,
    onSuccess,
    onClose: () => onOpenChange(false),
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] w-full max-w-[calc(100vw-1rem)] overflow-x-hidden overflow-y-auto rounded-2xl p-4 sm:max-w-lg sm:p-6">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle>Editar gasto</DialogTitle>
            <DialogDescription>
              Modifica los detalles, quién pagó o los participantes asignados a este gasto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive font-medium">
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Concepto o descripción <span className="text-primary">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Picapollo, compra en supermercado…"
                className="text-xs sm:text-sm"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Monto ({currency}) <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold text-muted-foreground">{currency === 'DOP' ? 'RD$' : '$'}</span>
                  <CurrencyAmountInput
                    value={amount}
                    onValueChange={setAmount}
                    placeholder="0.00"
                    className="pl-11 font-bold text-xs sm:text-sm"
                    aria-label={`Monto (${currency})`}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Categoría</label>
                <CategoryPicker
                  value={category}
                  onValueChange={setCategory}
                  ariaLabel="Categoría del gasto"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Fecha del gasto</label>
              <DateTimePickerField value={expenseDate} onChange={setExpenseDate} />
            </div>

            <CoroMultiPayerSection
              participants={participants}
              currency={currency}
              totalAmount={Number(amount) || 0}
              singlePaidById={paidById}
              onSinglePaidByIdChange={setPaidById}
              isMultiPayer={isMultiPayer}
              onIsMultiPayerChange={setIsMultiPayer}
              payers={payers}
              onPayersChange={setPayers}
            />

            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Se divide entre ({splitIds.length} de {participants.length}):
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllSplits}
                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Todos
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {participants.map((p) => {
                  const selected = splitIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleSplit(p.id)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition ${
                        selected
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border/60 bg-background text-muted-foreground hover:border-foreground/30'
                      }`}
                    >
                      <span>{selected ? '✓' : '+'}</span>
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>

              {splitIds.length > 0 && perPerson > 0 && (
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  Le toca pagar <strong className="text-foreground">{formatCurrency(perPerson, currency)}</strong> a cada uno.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Notas (opcional)</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones sobre este gasto…"
                className="text-xs sm:text-sm"
              />
            </div>

            <DialogFooter className="gap-2 sm:space-x-0 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => void submit(false)} disabled={saving || !title.trim()}>
                {saving ? 'Guardando…' : 'Actualizar gasto'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <CoroConfirmDialog
        open={duplicates.length > 0}
        onOpenChange={(next) => { if (!next) setDuplicates([]); }}
        title="Posible gasto duplicado"
        description="Encontramos gastos similares en fecha y monto. ¿Deseas actualizar de todos modos?"
        confirmLabel="Guardar de todos modos"
        cancelLabel="Cancelar"
        pending={saving}
        onConfirm={() => void submit(true)}
      />
    </>
  );
}
