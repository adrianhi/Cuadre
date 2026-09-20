import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { TransactionFinancialRole } from '@bills/contracts';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  Button,
  Input
} from '@/shared/ui';
import type { Transaction } from '@/entities/transaction';
import { CategoryPicker } from '@/entities/category';
import { InternalTransferControl } from './InternalTransferControl';
import { TransactionEditSummary } from './TransactionEditSummary';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, merchant: string, category: string, notes: string, financialRole?: TransactionFinancialRole) => Promise<void>;
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
  const [merchant, setMerchant] = useState(() => transaction?.merchant || transaction?.rawMerchant || '');
  const [category, setCategory] = useState(() => transaction?.category || 'Otros');
  const [notes, setNotes] = useState(() => transaction?.notes || '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [suggestRule, setSuggestRule] = useState(false);
  const [financialRole, setFinancialRole] = useState<TransactionFinancialRole>(transaction?.financialRole || 'EXPENSE');
  const [roleReviewed, setRoleReviewed] = useState(false);

  if (!transaction) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!merchant.trim()) {
      errors.merchant = 'El nombre del comercio es requerido';
    } else if (merchant.trim().length > 100) {
      errors.merchant = 'El nombre no puede superar 100 caracteres';
    }
    if (notes.trim().length > 250) {
      errors.notes = 'Las notas no pueden superar 250 caracteres';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setGeneralError('');
    setSaving(true);
    try {
      await onSave(transaction.id, merchant.trim(), category, notes.trim(), roleReviewed ? financialRole : undefined);
      onClose();
      if (suggestRule && category !== transaction.category) onSuggestRule?.(transaction.id, category);
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Error al actualizar la transacción');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    if (onRequestDelete) {
      onRequestDelete(transaction);
      return;
    }
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (!onDelete) return;
    setGeneralError('');
    setDeleting(true);
    try {
      await onDelete(transaction.id);
      onClose();
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Error al eliminar la transacción');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar movimiento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          {generalError && (
            <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">
              {generalError}
            </div>
          )}

          <TransactionEditSummary transaction={transaction} />

          {/* Merchant Name */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold">Nombre del Comercio / Beneficiario</label>
              <span className="text-[10px] text-muted-foreground">{merchant.length}/100</span>
            </div>
            <Input
              value={merchant}
              maxLength={100}
              onChange={(e) => {
                setMerchant(e.target.value);
                if (fieldErrors.merchant) setFieldErrors((prev) => ({ ...prev, merchant: '' }));
              }}
              placeholder="Ej: Supermercados Bravo o Billy Noel"
              className={fieldErrors.merchant ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {fieldErrors.merchant && (
              <p className="text-[11px] font-medium text-destructive">{fieldErrors.merchant}</p>
            )}
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Categoría</label>
            <CategoryPicker value={category} onValueChange={setCategory} ariaLabel="Categoría del movimiento" />
          </div>

          <InternalTransferControl
            checked={financialRole === 'INTERNAL_TRANSFER'}
            suggestionPending={transaction.suggestedFinancialRole === 'INTERNAL_TRANSFER' && !roleReviewed}
            onConfirmSuggestion={() => {
              setFinancialRole('INTERNAL_TRANSFER'); setCategory('Transferencias Propias'); setRoleReviewed(true);
            }}
            onDismissSuggestion={() => { setFinancialRole(transaction.financialRole); setRoleReviewed(true); }}
            onCheckedChange={(checked) => {
              setFinancialRole(checked ? 'INTERNAL_TRANSFER' : transaction.financialRole === 'INCOME' ? 'INCOME' : 'EXPENSE');
              if (checked) setCategory('Transferencias Propias');
              else if (category === 'Transferencias Propias') setCategory('Transferencias');
              setRoleReviewed(true);
            }}
          />

          {/* Notes */}
          {onSuggestRule && category !== transaction.category && <label className="flex items-start gap-2 text-xs">
            <input type="checkbox" checked={suggestRule} onChange={(event) => setSuggestRule(event.target.checked)} />
            Crear una regla para futuros movimientos de este comercio en {category}. La revisarás después de guardar.
          </label>}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold">Notas / Comentarios (Opcional)</label>
              <span className="text-[10px] text-muted-foreground">{notes.length}/250</span>
            </div>
            <Input
              value={notes}
              maxLength={250}
              onChange={(e) => {
                setNotes(e.target.value);
                if (fieldErrors.notes) setFieldErrors((prev) => ({ ...prev, notes: '' }));
              }}
              placeholder="Ej: Compra de despensa o pago de cena"
              className={fieldErrors.notes ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {fieldErrors.notes && (
              <p className="text-[11px] font-medium text-destructive">{fieldErrors.notes}</p>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
            {onDelete || onRequestDelete ? (
              <Button
                type="button"
                variant={confirmDelete ? 'destructive' : 'ghost'}
                size="sm"
                onClick={handleDelete}
                disabled={saving || deleting}
                className={
                  confirmDelete
                    ? 'w-full sm:w-auto gap-1.5 text-xs text-white bg-destructive hover:bg-destructive/90'
                    : 'w-full sm:w-auto gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                }
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                <span>{deleting ? 'Eliminando...' : confirmDelete ? '¿Confirmar eliminación?' : 'Eliminar movimiento'}</span>
              </Button>
            ) : <div />}
            <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving || deleting} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={saving || deleting} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
