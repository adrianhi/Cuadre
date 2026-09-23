import { useState } from 'react';
import type { TransactionFinancialRole } from '@bills/contracts';
import type { Transaction } from '@/entities/transaction';

interface UseEditTransactionFormParams {
  transaction: Transaction | null;
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

export function useEditTransactionForm({
  transaction,
  onClose,
  onSave,
  onDelete,
  onRequestDelete,
  onSuggestRule,
}: UseEditTransactionFormParams) {
  const [merchant, setMerchant] = useState(
    () => transaction?.merchant || transaction?.rawMerchant || '',
  );
  const [category, setCategory] = useState(
    () => transaction?.category || 'Otros',
  );
  const [notes, setNotes] = useState(() => transaction?.notes || '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [suggestRule, setSuggestRule] = useState(false);
  const [financialRole, setFinancialRole] = useState<TransactionFinancialRole>(
    transaction?.financialRole || 'EXPENSE',
  );
  const [roleReviewed, setRoleReviewed] = useState(false);

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
    if (!transaction || !validate()) return;
    setGeneralError('');
    setSaving(true);
    try {
      await onSave(
        transaction.id,
        merchant.trim(),
        category,
        notes.trim(),
        roleReviewed ? financialRole : undefined,
      );
      onClose();
      if (suggestRule && category !== transaction.category) {
        onSuggestRule?.(transaction.id, category);
      }
    } catch (err) {
      setGeneralError(
        err instanceof Error ? err.message : 'Error al actualizar la transacción',
      );
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
      setGeneralError(
        err instanceof Error ? err.message : 'Error al eliminar la transacción',
      );
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleRoleToggle = (checked: boolean) => {
    if (!transaction) return;
    setFinancialRole(
      checked
        ? 'INTERNAL_TRANSFER'
        : transaction.financialRole === 'INCOME'
          ? 'INCOME'
          : 'EXPENSE',
    );
    if (checked) {
      setCategory('Transferencias Propias');
    } else if (category === 'Transferencias Propias') {
      setCategory('Transferencias');
    }
    setRoleReviewed(true);
  };

  const handleConfirmRoleSuggestion = () => {
    setFinancialRole('INTERNAL_TRANSFER');
    setCategory('Transferencias Propias');
    setRoleReviewed(true);
  };

  const handleDismissRoleSuggestion = () => {
    if (!transaction) return;
    setFinancialRole(transaction.financialRole);
    setRoleReviewed(true);
  };

  return {
    merchant,
    setMerchant,
    category,
    setCategory,
    notes,
    setNotes,
    fieldErrors,
    setFieldErrors,
    generalError,
    saving,
    deleting,
    confirmDelete,
    suggestRule,
    setSuggestRule,
    financialRole,
    roleReviewed,
    handleSave,
    handleDelete,
    handleRoleToggle,
    handleConfirmRoleSuggestion,
    handleDismissRoleSuggestion,
  };
}
