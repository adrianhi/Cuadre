import React, { useId, useMemo, useRef, useState } from 'react';
import { Plus, Search, Users, X } from 'lucide-react';
import { Button, Input, toast } from '@/shared/ui';

interface CoroParticipantInputListProps {
  participants: string[];
  onChange: (participants: string[]) => void;
  maxHeight?: string;
  placeholder?: string;
}

const AVATAR_COLORS = [
  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20',
  'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
  'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20',
];

function getAvatarStyle(name: string, index: number) {
  let hash = index;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function CoroParticipantInputList({
  participants,
  onChange,
  maxHeight = 'max-h-48',
  placeholder = 'Nombre del amigo (ej. Carlos, Laura)',
}: CoroParticipantInputListProps) {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputId = useId();

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const exists = participants.some(
      (p) => p.localeCompare(trimmed, undefined, { sensitivity: 'accent' }) === 0
    );

    if (exists) {
      toast.error(`"${trimmed}" ya está en la lista.`);
      return;
    }

    onChange([...participants, trimmed]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(participants.filter((_, idx) => idx !== indexToRemove));
  };

  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) {
      return participants.map((name, index) => ({ name, originalIndex: index }));
    }
    const q = searchQuery.toLowerCase().trim();
    return participants
      .map((name, index) => ({ name, originalIndex: index }))
      .filter(({ name }) => name.toLowerCase().includes(q));
  }, [participants, searchQuery]);

  return (
    <div className="space-y-3">
      {/* Input row: Type name and press Enter */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-foreground">
          Añadir personas al coro
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="h-10 pr-9 text-xs sm:text-sm"
              aria-label="Nombre del participante"
            />
            {inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setInputValue('')}
                className="absolute right-0.5 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpiar campo"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            className="h-10 shrink-0 gap-1.5 rounded-xl px-3 font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Añadir</span>
          </Button>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Tip: Escribe un nombre y presiona <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">Enter ↵</kbd> para agregarlo rápido.
        </p>
      </div>

      {/* Participants List & Search */}
      <div className="rounded-2xl border border-border/70 bg-card/60 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>
              {participants.length} {participants.length === 1 ? 'persona' : 'personas'} en el coro
            </span>
          </div>

          {participants.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
              className="h-7 px-2 text-[11px] font-medium text-muted-foreground hover:text-destructive"
            >
              Quitar todos
            </Button>
          )}
        </div>

        {/* Small Search Bar when >= 3 participants */}
        {participants.length >= 3 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id={searchInputId}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar entre los participantes…"
              className="h-8 pl-8 pr-7 text-xs rounded-xl bg-muted/30 border-border/50"
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

        {/* Scrollable list */}
        {participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-center">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-muted/60 text-muted-foreground">
              <Users className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-foreground">Aún no hay amigos en la lista</p>
            <p className="text-[11px] text-muted-foreground max-w-[260px]">
              Escribe el nombre de tus amigos arriba para saber quiénes participan en este coro.
            </p>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No se encontró a nadie con &quot;{searchQuery}&quot;.
          </p>
        ) : (
          <div className={`${maxHeight} overflow-y-auto space-y-1.5 pr-1 overscroll-contain`}>
            {filteredParticipants.map(({ name, originalIndex }) => (
              <div
                key={`${name}-${originalIndex}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2 transition hover:bg-muted/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${getAvatarStyle(
                      name,
                      originalIndex
                    )}`}
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate text-xs font-semibold text-foreground">
                    {name}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemove(originalIndex)}
                  aria-label={`Quitar a ${name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
