import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateCreditCardInput, CreditCard, UpdateCreditCardInput } from '@bills/contracts';
import { toast } from '@/shared/ui';
import { creditCardKeys, creditCardsService } from '../api/credit-cards.service';

export function useCreditCardsSummary() {
  return useQuery({
    queryKey: creditCardKeys.summary(),
    queryFn: creditCardsService.getSummary,
  });
}

export function useCreditCardsList() {
  return useQuery({
    queryKey: creditCardKeys.list(),
    queryFn: creditCardsService.list,
  });
}

export function useCreditCardsDetected() {
  return useQuery({
    queryKey: creditCardKeys.detected(),
    queryFn: creditCardsService.getDetected,
  });
}

export function useCreditCards() {
  const queryClient = useQueryClient();
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const cardsQuery = useCreditCardsList();
  const summaryQuery = useCreditCardsSummary();
  const detectedQuery = useCreditCardsDetected();

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: creditCardKeys.all });
  };

  const createCard = useMutation({
    mutationFn: (payload: CreateCreditCardInput) => creditCardsService.create(payload),
    onSuccess: () => {
      invalidateAll();
      toast.success('Tarjeta registrada exitosamente');
      setIsFormOpen(false);
      setSelectedCard(null);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'No se pudo registrar la tarjeta.';
      toast.error(message);
    },
  });

  const updateCard = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCreditCardInput }) =>
      creditCardsService.update(id, payload),
    onSuccess: () => {
      invalidateAll();
      toast.success('Tarjeta actualizada exitosamente');
      setIsFormOpen(false);
      setSelectedCard(null);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar la tarjeta.';
      toast.error(message);
    },
  });

  const deleteCard = useMutation({
    mutationFn: (id: string) => creditCardsService.delete(id),
    onSuccess: () => {
      invalidateAll();
      toast.success('Tarjeta eliminada correctamente');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar la tarjeta.';
      toast.error(message);
    },
  });

  const startCreating = () => {
    setSelectedCard(null);
    setIsFormOpen(true);
  };

  const startEditing = (card: CreditCard) => {
    setSelectedCard(card);
    setIsFormOpen(true);
  };

  const cancelForm = () => {
    setSelectedCard(null);
    setIsFormOpen(false);
  };

  return {
    cardsQuery,
    summaryQuery,
    detectedQuery,
    createCard,
    updateCard,
    deleteCard,
    selectedCard,
    isFormOpen,
    startCreating,
    startEditing,
    cancelForm,
    setIsFormOpen,
  };
}
