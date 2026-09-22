import { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import type { CreditCard } from '@bills/contracts';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui';
import { formatCardLast4, getBankTheme } from '../model/bank-theme';

interface CardManagementListProps {
  cards: CreditCard[];
  onStartCreate: () => void;
  onStartEdit: (card: CreditCard) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function CardManagementList({
  cards,
  onStartCreate,
  onStartEdit,
  onDelete,
  isDeleting,
}: CardManagementListProps) {
  const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);

  const confirmDelete = () => {
    if (cardToDelete) {
      onDelete(cardToDelete.id);
      setCardToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Tarjetas Activas ({cards.length})
        </p>

        <Button
          type="button"
          size="sm"
          onClick={onStartCreate}
          className="rounded-xl text-xs font-bold gap-1.5 h-8"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Agregar tarjeta</span>
        </Button>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">No tienes tarjetas registradas</p>
          <p className="text-xs text-muted-foreground">
            Agrega tus tarjetas de crédito con su día de corte para calcular el semáforo inteligente.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onStartCreate}
            className="mt-2 rounded-xl text-xs font-bold"
          >
            Registrar mi primera tarjeta
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {cards.map((card) => {
            const bank = getBankTheme(card.institutionCode);

            return (
              <div
                key={card.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-3.5 shadow-sm transition hover:border-border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${bank.chipBg} font-bold text-xs`}>
                    {bank.shortName.slice(0, 2).toUpperCase()}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground truncate">
                        {card.alias}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {formatCardLast4(card.cardLast4)}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                      Corte: día {card.closingDay} · Gracia: {card.graceDays} días
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={() => onStartEdit(card)}
                    aria-label={`Editar ${card.alias}`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive"
                    onClick={() => setCardToDelete(card)}
                    aria-label={`Eliminar ${card.alias}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={Boolean(cardToDelete)} onOpenChange={(open) => !open && setCardToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">¿Eliminar tarjeta de crédito?</DialogTitle>
            <DialogDescription className="text-xs">
              Estás a punto de eliminar <strong>{cardToDelete?.alias}</strong> ({formatCardLast4(cardToDelete?.cardLast4)}).
              Ya no se calculará en las recomendaciones del semáforo.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCardToDelete(null)}
              disabled={isDeleting}
              className="rounded-xl text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="rounded-xl text-xs font-bold"
            >
              {isDeleting ? 'Eliminando…' : 'Sí, eliminar tarjeta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
