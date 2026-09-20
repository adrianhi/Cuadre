import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { CoroExpense, CoroParticipant, UpdateCoroExpenseInput } from '@/entities/coro';
import { coroKeys, coroService } from '@/entities/coro';
import { ApiClientError } from '@/shared/api';
import { isFutureLocalDateTime, parseAmountInput, toDateValue } from '@/shared/lib';
import { toast } from '@/shared/ui';

interface UseCoroExpenseEditFormOptions {
  coroId: string;
  expense: CoroExpense;
  participants: CoroParticipant[];
  onSuccess: () => Promise<void>;
  onClose: () => void;
}

type DuplicateCandidate = { id: string; title: string; amount: number };

export function useCoroExpenseEditForm({
  coroId,
  expense,
  participants,
  onSuccess,
  onClose,
}: UseCoroExpenseEditFormOptions) {
  const client = useQueryClient();
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState(expense.category);
  const [paidById, setPaidById] = useState(expense.paidById);
  const [expenseDate, setExpenseDate] = useState(() => {
    try {
      return toDateValue(new Date(expense.expenseDate));
    } catch {
      return toDateValue(new Date());
    }
  });
  const [notes, setNotes] = useState(expense.notes ?? '');
  const [splitIds, setSplitIds] = useState<string[]>(expense.splitParticipantIds);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleSplit = (id: string) => {
    setSplitIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const selectAllSplits = () => {
    setSplitIds(participants.map((p) => p.id));
  };

  const submit = async (allowPossibleDuplicate = false) => {
    const numericAmount = Number(parseAmountInput(amount));
    if (!title.trim()) return setError('Escribe el concepto del gasto.');
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return setError('Ingresa un monto mayor que cero.');
    if (!paidById || !participants.some((item) => item.id === paidById)) return setError('Selecciona quién pagó.');
    if (!splitIds.length) return setError('Selecciona al menos un participante para dividir.');
    if (!expenseDate || isFutureLocalDateTime(expenseDate)) return setError('Selecciona una fecha válida que no esté en el futuro.');

    setSaving(true);
    setError('');
    try {
      const input: UpdateCoroExpenseInput = {
        title: title.trim(),
        amount: numericAmount,
        paidById,
        category,
        expenseDate: new Date(expenseDate).toISOString(),
        notes: notes.trim() ? notes.trim() : null,
        splitParticipantIds: splitIds,
        allowPossibleDuplicate,
      };

      await coroService.updateOwnerExpense(coroId, expense.id, input);
      setDuplicates([]);
      toast.success('Gasto actualizado.');
      await Promise.all([
        client.invalidateQueries({ queryKey: coroKeys.list() }),
        client.invalidateQueries({ queryKey: coroKeys.detail(coroId) }),
      ]);
      await onSuccess();
      onClose();
    } catch (caught) {
      if (caught instanceof ApiClientError && caught.code === 'POSSIBLE_DUPLICATE') {
        const details = caught.details as { candidates?: DuplicateCandidate[] } | undefined;
        setDuplicates(details?.candidates ?? []);
      } else {
        setError(caught instanceof Error ? caught.message : 'No pudimos actualizar el gasto.');
      }
    } finally {
      setSaving(false);
    }
  };

  const numericAmount = Number(parseAmountInput(amount));
  const validAmount = Number.isFinite(numericAmount) && numericAmount > 0 ? numericAmount : 0;
  const perPerson = splitIds.length > 0 ? validAmount / splitIds.length : 0;

  return {
    title,
    setTitle,
    amount,
    setAmount,
    category,
    setCategory,
    paidById,
    setPaidById,
    expenseDate,
    setExpenseDate,
    notes,
    setNotes,
    splitIds,
    toggleSplit,
    selectAllSplits,
    duplicates,
    setDuplicates,
    saving,
    error,
    perPerson,
    submit,
  };
}
