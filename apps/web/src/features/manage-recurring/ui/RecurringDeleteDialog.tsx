import { Loader2 } from "lucide-react";
import type { RecurringBillDto } from "@/entities/recurring-bill";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";

export interface RecurringDeleteDialogProps {
  bill: RecurringBillDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  deleting?: boolean;
}

export function RecurringDeleteDialog({
  bill,
  open,
  onOpenChange,
  onConfirm,
  deleting = false,
}: RecurringDeleteDialogProps) {
  if (!bill) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!deleting) onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Eliminar gasto fijo?</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar &ldquo;{bill.displayName}
            &rdquo;? Dejará de proyectarse en tu presupuesto y sus ocurrencias
            vinculadas se eliminarán.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            disabled={deleting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={deleting}
            onClick={() => void onConfirm()}
            className="gap-1.5"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Eliminando…</span>
              </>
            ) : (
              <span>Eliminar gasto fijo</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
