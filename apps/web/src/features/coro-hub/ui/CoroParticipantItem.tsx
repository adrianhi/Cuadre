import { useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import type { CoroParticipant } from '@bills/contracts';
import { Button, Input } from '@/shared/ui';

interface CoroParticipantItemProps {
  item: CoroParticipant;
  isActive: boolean;
  onEdit: (id: string, newName: string) => Promise<void>;
  onDelete: (item: CoroParticipant) => void;
  onReleaseClaim: (id: string) => Promise<void>;
}

export function CoroParticipantItem({
  item,
  isActive,
  onEdit,
  onDelete,
  onReleaseClaim,
}: CoroParticipantItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === item.name) {
      setIsEditing(false);
      return;
    }
    try {
      setSaving(true);
      await onEdit(item.id, trimmed);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(item.name);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-xs">
      {isEditing ? (
        <div className="flex flex-1 items-center gap-1.5 min-w-0">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleSave();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
              }
            }}
            autoFocus
            disabled={saving}
            className="h-7 text-xs flex-1 rounded-lg"
            aria-label="Editar nombre del participante"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
            disabled={!editName.trim() || saving}
            onClick={() => void handleSave()}
            aria-label="Guardar nombre"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            disabled={saving}
            onClick={handleCancel}
            aria-label="Cancelar edición"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 min-w-0">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary text-[10px] font-bold">
              {item.name.charAt(0).toUpperCase()}
            </span>
            <span className="truncate font-semibold text-foreground">
              {item.name}
            </span>
            {item.isOwner && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                Anfitrión
              </span>
            )}
            {item.isClaimed && !item.isOwner && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] text-muted-foreground">
                Vinculado
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {item.isClaimed && !item.isOwner && isActive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive"
                onClick={() => void onReleaseClaim(item.id)}
              >
                Liberar
              </Button>
            )}

            {isActive && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setEditName(item.name);
                  setIsEditing(true);
                }}
                aria-label={`Editar ${item.name}`}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}

            {isActive && !item.isOwner && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(item)}
                aria-label={`Eliminar ${item.name}`}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
