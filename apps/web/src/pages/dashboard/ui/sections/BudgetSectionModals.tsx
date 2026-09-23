import type { RecurringBillDto } from "@/entities/recurring-bill";
import type { BudgetSummaryDto } from "@/entities/budget";
import { BudgetManagerDialog } from "@/features/budget-manager";
import {
  LinkRecurringTransactionDialog,
  RecurringCreatorDialog,
  RecurringDeleteDialog,
  RecurringEditorDialog,
} from "@/features/manage-recurring";
import { IncomeStreamsSettingsModal } from "@/features/income-streams";

interface BudgetSectionModalsProps {
  month: string;
  currency: "DOP" | "USD";
  summary: BudgetSummaryDto | null;
  managerOpen: boolean;
  setManagerOpen: (open: boolean) => void;
  creatorOpen: boolean;
  setCreatorOpen: (open: boolean) => void;
  incomeModalOpen: boolean;
  setIncomeModalOpen: (open: boolean) => void;
  editingRecurring: RecurringBillDto | null;
  setEditingRecurring: (bill: RecurringBillDto | null) => void;
  linkingBill: RecurringBillDto | null;
  setLinkingBill: (bill: RecurringBillDto | null) => void;
  deletingBill: RecurringBillDto | null;
  setDeletingBill: (bill: RecurringBillDto | null) => void;
  handleLink: (recurringBillId: string, transactionId: string) => Promise<void>;
  handleDelete: () => Promise<void>;
  recurringActions: {
    create: { isPending: boolean; mutateAsync: (input: any) => Promise<any> };
    update: {
      isPending: boolean;
      mutateAsync: (params: { id: string; input: any }) => Promise<any>;
    };
    linkTransaction: { isPending: boolean };
    deleteBill: { isPending: boolean };
  };
}

export function BudgetSectionModals({
  month,
  currency,
  summary,
  managerOpen,
  setManagerOpen,
  creatorOpen,
  setCreatorOpen,
  incomeModalOpen,
  setIncomeModalOpen,
  editingRecurring,
  setEditingRecurring,
  linkingBill,
  setLinkingBill,
  deletingBill,
  setDeletingBill,
  handleLink,
  handleDelete,
  recurringActions,
}: BudgetSectionModalsProps) {
  return (
    <>
      <BudgetManagerDialog
        open={managerOpen}
        onOpenChange={setManagerOpen}
        month={month}
        currency={currency}
        summary={summary}
      />

      <RecurringCreatorDialog
        open={creatorOpen}
        currency={currency}
        saving={recurringActions.create.isPending}
        onOpenChange={setCreatorOpen}
        onSave={async (input) => {
          await recurringActions.create.mutateAsync(input);
          setCreatorOpen(false);
        }}
      />

      <RecurringEditorDialog
        key={editingRecurring?.id || "closed-recurring-editor"}
        bill={editingRecurring}
        open={Boolean(editingRecurring)}
        saving={recurringActions.update.isPending}
        onOpenChange={(open) => {
          if (!open) setEditingRecurring(null);
        }}
        onSave={async (input) => {
          if (!editingRecurring) return;
          await recurringActions.update.mutateAsync({
            id: editingRecurring.id,
            input,
          });
          setEditingRecurring(null);
        }}
      />

      <LinkRecurringTransactionDialog
        bill={linkingBill}
        open={Boolean(linkingBill)}
        onOpenChange={(open) => {
          if (!open) setLinkingBill(null);
        }}
        onLink={handleLink}
        linking={recurringActions.linkTransaction.isPending}
      />

      <RecurringDeleteDialog
        bill={deletingBill}
        open={Boolean(deletingBill)}
        onOpenChange={(open) => {
          if (!open) setDeletingBill(null);
        }}
        onConfirm={handleDelete}
        deleting={recurringActions.deleteBill.isPending}
      />

      <IncomeStreamsSettingsModal
        open={incomeModalOpen}
        onOpenChange={setIncomeModalOpen}
        currency={currency}
      />
    </>
  );
}
