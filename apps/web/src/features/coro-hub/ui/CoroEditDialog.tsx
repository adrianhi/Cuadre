import React from 'react';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input } from '@/shared/ui';
import { useCoroEditForm } from '../model/useCoroEditForm';

interface CoroEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coroId: string;
  initialName: string;
  initialDescription?: string | null;
  onSuccess: () => Promise<void>;
}

export function CoroEditDialog({
  open,
  onOpenChange,
  coroId,
  initialName,
  initialDescription,
  onSuccess,
}: CoroEditDialogProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    pending,
    handleSubmit,
    handleKeyDown,
  } = useCoroEditForm({
    coroId,
    initialName,
    initialDescription,
    onSuccess,
    onClose: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar información del coro</DialogTitle>
          <DialogDescription>
            Modifica el nombre o la descripción del grupo para mantener al corillo claro.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="space-y-4 py-2"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nombre del coro <span className="text-primary">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej. Fin de semana en Las Terrenas"
              className="text-xs sm:text-sm"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Descripción o notas (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Ej. Gastos de villa, comida, gasolina y peajes"
              className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs sm:text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[70px] resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:space-x-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || pending}
            >
              {pending ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
