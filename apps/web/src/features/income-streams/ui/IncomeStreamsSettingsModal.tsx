import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Wallet } from 'lucide-react';
import type { CreateIncomeStreamInput } from '@bills/contracts';
import { incomeKeys, incomeService } from '@/entities/income';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui';
import { IncomeStreamForm } from './IncomeStreamForm';
import { IncomeStreamItem } from './IncomeStreamItem';

interface IncomeStreamsSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
}

export function IncomeStreamsSettingsModal({
  open,
  onOpenChange,
  currency,
}: IncomeStreamsSettingsModalProps) {
  const queryClient = useQueryClient();

  const { data: streams = [], isLoading } = useQuery({
    queryKey: incomeKeys.streams(),
    queryFn: ({ signal }) => incomeService.listStreams(signal),
    enabled: open,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: incomeKeys.all });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    queryClient.invalidateQueries({ queryKey: ['payday-ritual'] });
  };

  const createMutation = useMutation({
    mutationFn: (input: CreateIncomeStreamInput) => incomeService.createStream(input),
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => incomeService.deleteStream(id),
    onSuccess: () => invalidate(),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-emerald-500" />
            <span>Perfil de Ingresos y Ahorro</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Declara tus fuentes de ingreso regulares, tus fechas de cobro personalizadas y cuánto deseas ahorrar por quincena.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <IncomeStreamForm
            currency={currency}
            isPending={createMutation.isPending}
            onSubmit={(input) => createMutation.mutate(input)}
          />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Tus fuentes activas</p>
            {isLoading ? (
              <div className="h-16 animate-pulse rounded-xl bg-muted" />
            ) : streams.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No tienes fuentes de ingreso declaradas aún.
              </p>
            ) : (
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {streams.map((stream) => (
                  <IncomeStreamItem
                    key={stream.id}
                    stream={stream}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="w-full">
            Listo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
