import { useState } from 'react';
import { Search, X } from 'lucide-react';
import type { CoroParticipant } from '@bills/contracts';
import { coroService } from '@/entities/coro';
import { Button, Input, toast } from '@/shared/ui';
import { CoroConfirmDialog } from './CoroConfirmDialog';
import { CoroParticipantItem } from './CoroParticipantItem';

interface CoroParticipantsSectionProps {
  coroId: string;
  participants: CoroParticipant[];
  isActive: boolean;
  onRefresh: () => Promise<void>;
}

export function CoroParticipantsSection({
  coroId,
  participants,
  isActive,
  onRefresh,
}: CoroParticipantsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [targetToDelete, setTargetToDelete] = useState<CoroParticipant | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAddParticipant = async () => {
    const trimmed = participantName.trim();
    if (!trimmed) return;
    try {
      await coroService.addParticipant(coroId, trimmed);
      setParticipantName('');
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos añadir al participante.');
    }
  };

  const handleEdit = async (id: string, newName: string) => {
    try {
      await coroService.updateParticipant(coroId, id, newName);
      toast.success('Nombre actualizado.');
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos actualizar el nombre.');
      throw error;
    }
  };

  const handleReleaseClaim = async (participantId: string) => {
    try {
      await coroService.releaseClaim(coroId, participantId);
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos liberar al participante.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!targetToDelete) return;
    try {
      setDeleting(true);
      await coroService.removeParticipant(coroId, targetToDelete.id);
      toast.success(`${targetToDelete.name} fue eliminado del coro.`);
      setTargetToDelete(null);
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos eliminar al participante.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = participants.filter((p) => {
    if (!searchQuery.trim()) return true;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  return (
    <section className="space-y-3 rounded-2xl border p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-bold text-sm text-foreground">
          Participantes ({participants.length})
        </h4>
        {participants.length >= 4 && (
          <div className="relative w-full sm:w-52">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar amigo..."
              className="h-8 pl-8 pr-7 text-xs rounded-xl"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-0.5 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        {filtered.map((item) => (
          <CoroParticipantItem
            key={item.id}
            item={item}
            isActive={isActive}
            onEdit={handleEdit}
            onDelete={(target) => setTargetToDelete(target)}
            onReleaseClaim={handleReleaseClaim}
          />
        ))}
      </div>

      {isActive && (
        <div className="pt-2 border-t border-border/40">
          <div className="flex gap-2">
            <Input
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleAddParticipant();
                }
              }}
              placeholder="Añadir otro amigo (presiona Enter para guardar)"
              className="h-9 text-xs flex-1"
            />
            <Button
              size="sm"
              disabled={!participantName.trim()}
              onClick={() => void handleAddParticipant()}
              className="h-9 px-3 text-xs font-semibold"
            >
              Añadir
            </Button>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Escribe el nombre y presiona Enter para sumar a la persona a este coro.
          </p>
        </div>
      )}

      <CoroConfirmDialog
        open={Boolean(targetToDelete)}
        onOpenChange={(open) => { if (!open) setTargetToDelete(null); }}
        title={`¿Eliminar a ${targetToDelete?.name}?`}
        description="Se removerá a este participante del coro. Solo es posible si no tiene gastos ni divisiones activas."
        confirmLabel="Eliminar participante"
        destructive
        pending={deleting}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
