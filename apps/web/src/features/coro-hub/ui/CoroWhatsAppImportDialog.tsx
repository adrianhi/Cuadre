import { useMemo, useState } from 'react';
import { MessageSquare, Plus, Users, X } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Textarea, toast } from '@/shared/ui';
import { parseWhatsAppParticipantsList } from '../model/coro-share';

interface CoroWhatsAppImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingNames: string[];
  onImport: (newNames: string[]) => void;
}

export function CoroWhatsAppImportDialog({
  open,
  onOpenChange,
  existingNames,
  onImport,
}: CoroWhatsAppImportDialogProps) {
  const [text, setText] = useState('');

  const parsedNames = useMemo(() => {
    return parseWhatsAppParticipantsList(text);
  }, [text]);

  const existingSet = useMemo(() => {
    return new Set(
      existingNames.map((n) =>
        n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
      )
    );
  }, [existingNames]);

  const { toAdd, alreadyInCoro } = useMemo(() => {
    const toAddList: string[] = [];
    const alreadyList: string[] = [];
    for (const name of parsedNames) {
      const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      if (existingSet.has(normalized)) {
        alreadyList.push(name);
      } else {
        toAddList.push(name);
      }
    }
    return { toAdd: toAddList, alreadyInCoro: alreadyList };
  }, [parsedNames, existingSet]);

  const handleConfirm = () => {
    if (toAdd.length === 0) {
      toast.error('No hay nombres nuevos válidos para agregar.');
      return;
    }
    onImport(toAdd);
    toast.success(`Se agregaron ${toAdd.length} personas al coro.`);
    setText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl p-4 sm:max-w-lg sm:p-6">
        <DialogHeader className="pr-6 text-left">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="h-4 w-4" />
            </span>
            <DialogTitle>Pegar lista de WhatsApp</DialogTitle>
          </div>
          <DialogDescription>
            Pega el mensaje con la lista de tus amigos (con números, viñetas o guiones). Cuadre limpiará los nombres automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="whatsapp-list-input">
              Mensaje o lista de WhatsApp
            </label>
            <Textarea
              id="whatsapp-list-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="1. Carlos&#10;2. Pedro Perez&#10;3. Pamela&#10;4. Jean..."
              className="h-28 text-xs font-mono leading-relaxed"
              autoFocus
            />
          </div>

          {parsedNames.length > 0 && (
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span>{toAdd.length} nombres nuevos detectados</span>
                </span>
                {text && (
                  <button
                    type="button"
                    onClick={() => setText('')}
                    className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                  >
                    <X className="h-3 w-3" /> Limpiar
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {toAdd.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    ✓ {name}
                  </span>
                ))}
                {alreadyInCoro.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted px-2 py-0.5 text-xs text-muted-foreground line-through"
                    title="Ya está en el coro"
                  >
                    {name}
                  </span>
                ))}
              </div>

              {alreadyInCoro.length > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  {alreadyInCoro.length} {alreadyInCoro.length === 1 ? 'persona ya estaba' : 'personas ya estaban'} en el coro y se omitirán.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:space-x-0 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={toAdd.length === 0}
            className="gap-1.5 font-bold"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar {toAdd.length > 0 ? `(${toAdd.length})` : ''}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
