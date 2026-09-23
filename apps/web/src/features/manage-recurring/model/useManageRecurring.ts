import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateRecurringBillInput,
  UpdateRecurringBillInput,
} from "@bills/contracts";
import { fromDateValue, toDateValue } from "@/shared/lib";
import { recurringKeys, recurringService } from "@/entities/recurring-bill";
import { budgetKeys } from "@/entities/budget";

export interface CreateFromTransactionInput {
  merchant: string;
  amount: number;
  currency: "DOP" | "USD";
  transactionDate: string;
  transactionId: string;
}

export function computeNextExpectedDate(transactionDate: string): string {
  const datePart = transactionDate.slice(0, 10);
  const parsed = fromDateValue(datePart) ?? new Date(transactionDate);
  const base = Number.isFinite(parsed.getTime()) ? parsed : new Date();
  const year = base.getFullYear();
  const month = base.getMonth();
  const day = base.getDate();
  const target = new Date(year, month + 1, day);
  if (target.getMonth() !== (month + 1) % 12) {
    target.setDate(0);
  }
  return toDateValue(target);
}

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
  const createFromTransaction = useMutation({
    mutationFn: async (input: CreateFromTransactionInput) => {
      const nextExpectedDate = computeNextExpectedDate(input.transactionDate);
      const newBill = await recurringService.create({
        displayName: input.merchant,
        expectedAmount: input.amount,
        currency: input.currency,
        cadence: "MONTHLY",
        nextExpectedDate,
      });
      await recurringService.linkTransaction(newBill.id, input.transactionId);
      return newBill;
    },
    onSuccess: invalidateLinked,
  });
  return {
    create,
    update,
    acknowledge,
    linkTransaction,
    unlinkTransaction,
    deleteBill,
    createFromTransaction,
  };
}
