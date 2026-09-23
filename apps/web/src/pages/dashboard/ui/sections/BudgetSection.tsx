import { useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { Layers, Repeat } from "lucide-react";
import { currentBudgetMonth, useBudgetSummary } from "@/entities/budget";
import {
  useRecurringRadar,
  type RecurringBillDto,
} from "@/entities/recurring-bill";
import { useManageRecurring } from "@/features/manage-recurring";
import { RecurringExpensesHub } from "@/widgets/recurring-radar";
import { LoadingScreen, toast } from "@/shared/ui";
import type { PeriodSelection } from "@/entities/period";
import { BudgetCategoriesTab } from "./BudgetCategoriesTab";
import { BudgetSectionModals } from "./BudgetSectionModals";

const getMonthFromSelection = (s?: PeriodSelection) =>
  s?.month || s?.startDate?.slice(0, 7) || currentBudgetMonth();

export function BudgetSection(props: {
  periodToolbar: ReactNode;
  currentPeriod?: PeriodSelection;
  currency: string;
  hideBalances: boolean;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab =
    searchParams.get("tab") === "recurring" ? "recurring" : "categories";

  const [managerOpen, setManagerOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] =
    useState<RecurringBillDto | null>(null);
  const [linkingBill, setLinkingBill] = useState<RecurringBillDto | null>(null);
  const [deletingBill, setDeletingBill] = useState<RecurringBillDto | null>(
    null,
  );
  const [unlinkingBillId, setUnlinkingBillId] = useState<string | null>(null);

  const month = getMonthFromSelection(props.currentPeriod);
  const currency = props.currency === "USD" ? "USD" : "DOP";

  const query = useBudgetSummary(month, currency);
  const summary = query.data ?? null;

  const recurringQuery = useRecurringRadar(currency);
  const recurringActions = useManageRecurring(currency);

  const setTab = (tab: "categories" | "recurring") => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (tab === "recurring") next.set("tab", "recurring");
        else next.delete("tab");
        return next;
      },
      { replace: true },
    );
  };

  const handleLink = async (recurringBillId: string, transactionId: string) => {
    try {
      await recurringActions.linkTransaction.mutateAsync({
        recurringBillId,
        transactionId,
      });
      toast.success("Movimiento vinculado exitosamente.");
      setLinkingBill(null);
    } catch {
      toast.error("No se pudo vincular el movimiento.");
    }
  };

  const handleUnlink = async (bill: RecurringBillDto) => {
    setUnlinkingBillId(bill.id);
    try {
      await recurringActions.unlinkTransaction.mutateAsync({
        recurringBillId: bill.id,
      });
      toast.success("Movimiento desvinculado.");
    } catch {
      toast.error("No se pudo desvincular el movimiento.");
    } finally {
      setUnlinkingBillId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingBill) return;
    try {
      await recurringActions.deleteBill.mutateAsync(deletingBill.id);
      toast.success("Gasto fijo eliminado.");
      setDeletingBill(null);
    } catch {
      toast.error("No se pudo eliminar el gasto fijo.");
    }
  };

  if (query.isLoading && !summary && currentTab === "categories") {
    return (
      <LoadingScreen
        message="Cargando presupuesto…"
        description="Calculando tus límites y consumos del mes."
        fullPage
      />
    );
  }

  if (
    recurringQuery.isLoading &&
    !recurringQuery.data &&
    currentTab === "recurring"
  ) {
    return (
      <LoadingScreen
        message="Cargando gastos fijos…"
        description="Calculando tus compromisos y suscripciones del mes."
        fullPage
      />
    );
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {currentTab === "recurring"
              ? "Gastos Fijos y Suscripciones"
              : "Planifica tus gastos"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentTab === "recurring"
              ? "Conoce tu compromiso ineludible y cuánto dinero libre tienes para el mes."
              : "Define tus límites por categoría y revisa cuánto margen te queda."}
          </p>
        </div>
        {props.periodToolbar}
      </div>

      <div className="flex gap-2 border-b border-border/70 pb-1">
        <button
          type="button"
          onClick={() => setTab("categories")}
          className={`flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-bold transition-all ${
            currentTab === "categories"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Límites por Categoría</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("recurring")}
          className={`flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-bold transition-all ${
            currentTab === "recurring"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Repeat className="h-4 w-4" />
          <span>Gastos Fijos y Suscripciones</span>
          {recurringQuery.data?.allConfirmed &&
            recurringQuery.data.allConfirmed.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-black text-primary">
                {recurringQuery.data.allConfirmed.length}
              </span>
            )}
        </button>
      </div>

      {currentTab === "categories" && (
        <BudgetCategoriesTab
          summary={summary}
          loading={query.isLoading}
          isError={query.isError}
          error={query.error}
          currency={currency}
          hideBalances={props.hideBalances}
          onRefetch={() => void query.refetch()}
          onManage={() => setManagerOpen(true)}
        />
      )}

      {currentTab === "recurring" && (
        <RecurringExpensesHub
          radar={recurringQuery.data ?? null}
          loading={recurringQuery.isLoading}
          currency={currency}
          hideBalances={props.hideBalances}
          onOpenAddModal={() => setCreatorOpen(true)}
          onOpenIncomeModal={() => setIncomeModalOpen(true)}
          onEdit={setEditingRecurring}
          onStatus={(bill, status) =>
            recurringActions.update.mutate({ id: bill.id, input: { status } })
          }
          onAcknowledgeAlert={(alertId) =>
            recurringActions.acknowledge.mutate(alertId)
          }
          onLink={(bill) => setLinkingBill(bill)}
          onUnlink={handleUnlink}
          onDelete={setDeletingBill}
          unlinkingBillId={unlinkingBillId}
          deletingBillId={deletingBill?.id}
        />
      )}

      <BudgetSectionModals
        month={month}
        currency={currency}
        summary={summary}
        managerOpen={managerOpen}
        setManagerOpen={setManagerOpen}
        creatorOpen={creatorOpen}
        setCreatorOpen={setCreatorOpen}
        incomeModalOpen={incomeModalOpen}
        setIncomeModalOpen={setIncomeModalOpen}
        editingRecurring={editingRecurring}
        setEditingRecurring={setEditingRecurring}
        linkingBill={linkingBill}
        setLinkingBill={setLinkingBill}
        deletingBill={deletingBill}
        setDeletingBill={setDeletingBill}
        handleLink={handleLink}
        handleDelete={handleDelete}
        recurringActions={recurringActions}
      />
    </>
  );
}
