import React from 'react';
import { Trash2 } from 'lucide-react';
import type { TransactionFinancialRole } from '@bills/contracts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Checkbox,
  Input,
} from '@/shared/ui';
import type { Transaction } from '@/entities/transaction';
import { CategoryPicker } from '@/entities/category';
import { InternalTransferControl } from './InternalTransferControl';
import { TransactionEditSummary } from './TransactionEditSummary';
import { useEditTransactionForm } from '../model/useEditTransactionForm';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    merchant: string,
    category: string,
    notes: string,
    financialRole?: TransactionFinancialRole,
  ) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onRequestDelete?: (transaction: Transaction) => void;
  onSuggestRule?: (transactionId: string, category: string) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onRequestDelete,
  onSuggestRule,
}) => {
  const form = useEditTransactionForm({
    transaction,
    onClose,
    onSave,
    onDelete,
    onRequestDelete,
    onSuggestRule,
  });

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar movimiento</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSave} className="space-y-4 py-2">
          {form.generalError && (
            <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">
              {form.generalError}
            </div>
          )}

          <TransactionEditSummary transaction={transaction} />

          {/* Merchant Name */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold">
                Nombre del Comercio / Beneficiario
              </label>
              <span className="text-[10px] text-muted-foreground">
                {form.merchant.length}/100
              </span>
            </div>
            <Input
              value={form.merchant}
              maxLength={100}
              onChange={(e) => {
                form.setMerchant(e.target.value);
                if (form.fieldErrors.merchant) {
                  form.setFieldErrors((prev) => ({ ...prev, merchant: '' }));
                }
              }}
              placeholder="Ej: Supermercados Bravo o Billy Noel"
              className={
                form.fieldErrors.merchant
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
            />
            {form.fieldErrors.merchant && (
              <p className="text-[11px] font-medium text-destructive">
                {form.fieldErrors.merchant}
              </p>
            )}
          </div>

          {/* Category Selector with guidance */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Categoría</label>
            <CategoryPicker
              value={form.category}
              onValueChange={form.setCategory}
              ariaLabel="Categoría del movimiento"
            />
            <p className="text-[11px] text-muted-foreground">
              💡 Al categorizar este gasto, se reflejará automáticamente en su límite de Presupuesto y en tu Margen Seguro Diario.
            </p>
          </div>

          <InternalTransferControl
            checked={form.financialRole === 'INTERNAL_TRANSFER'}
            suggestionPending={
              transaction.suggestedFinancialRole === 'INTERNAL_TRANSFER' &&
              !form.roleReviewed
            }
            onConfirmSuggestion={form.handleConfirmRoleSuggestion}
            onDismissSuggestion={form.handleDismissRoleSuggestion}
            onCheckedChange={form.handleRoleToggle}
          />

          {/* Rule suggestion & Notes */}
          {onSuggestRule && form.category !== transaction.category && (
            <label className="flex items-start gap-2 text-xs cursor-pointer">
              <Checkbox
                checked={form.suggestRule}
                onCheckedChange={form.setSuggestRule}
                className="mt-0.5"
              />
              <span>
                Crear una regla para futuros movimientos de este comercio en {form.category}. La revisarás después de guardar.
              </span>
            </label>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold">Notas / Comentarios (Opcional)</label>
              <span className="text-[10px] text-muted-foreground">{form.notes.length}/250</span>
            </div>
            <Input
              value={form.notes}
              maxLength={250}
              onChange={(e) => {
                form.setNotes(e.target.value);
                if (form.fieldErrors.notes) {
                  form.setFieldErrors((prev) => ({ ...prev, notes: '' }));
                }
              }}
              placeholder="Ej: Compra de despensa o pago de cena"
              className={
                form.fieldErrors.notes
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
            />
            {form.fieldErrors.notes && (
              <p className="text-[11px] font-medium text-destructive">
                {form.fieldErrors.notes}
              </p>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
            {onDelete || onRequestDelete ? (
              <Button
                type="button"
                variant={form.confirmDelete ? 'destructive' : 'ghost'}
                size="sm"
                onClick={form.handleDelete}
                disabled={form.saving || form.deleting}
                className={
                  form.confirmDelete
                    ? 'w-full sm:w-auto gap-1.5 text-xs text-white bg-destructive hover:bg-destructive/90'
                    : 'w-full sm:w-auto gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                }
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                <span>
                  {form.deleting
                    ? 'Eliminando...'
                    : form.confirmDelete
                      ? '¿Confirmar eliminación?'
                      : 'Eliminar movimiento'}
                </span>
              </Button>
            ) : (
              <div />
            )}
            <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={form.saving || form.deleting}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={form.saving || form.deleting}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {form.saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
