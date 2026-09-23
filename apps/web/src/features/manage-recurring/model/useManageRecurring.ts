import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateRecurringBillInput,
  UpdateRecurringBillInput,
} from "@bills/contracts";
import { recurringKeys, recurringService } from "@/entities/recurring-bill";
import { budgetKeys } from "@/entities/budget";

export function useManageRecurring(currency: string) {
  const queryClient = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: recurringKeys.all }),
      queryClient.invalidateQueries({
        queryKey: budgetKeys.safeToSpend(currency),
      }),
    ]);
  };
  const create = useMutation({
    mutationFn: (input: CreateRecurringBillInput) =>
      recurringService.create(input),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateRecurringBillInput;
    }) => recurringService.update(id, input),
    onSuccess: refresh,
  });
  const acknowledge = useMutation({
    mutationFn: recurringService.acknowledgeAlert,
    onSuccess: refresh,
  });
  const invalidateLinked = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: recurringKeys.all }),
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] }),
      queryClient.invalidateQueries({ queryKey: ["payday-ritual"] }),
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] }),
    ]);
  };
  const linkTransaction = useMutation({
    mutationFn: (input: { recurringBillId: string; transactionId: string }) =>
      recurringService.linkTransaction(
        input.recurringBillId,
        input.transactionId,
      ),
    onSuccess: invalidateLinked,
  });
  const unlinkTransaction = useMutation({
    mutationFn: (input: { recurringBillId: string; transactionId?: string }) =>
      recurringService.unlinkTransaction(
        input.recurringBillId,
        input.transactionId,
      ),
    onSuccess: invalidateLinked,
  });
  const deleteBill = useMutation({
    mutationFn: (id: string) => recurringService.delete(id),
    onSuccess: invalidateLinked,
  });
  return {
    create,
    update,
    acknowledge,
    linkTransaction,
    unlinkTransaction,
    deleteBill,
  };
}
