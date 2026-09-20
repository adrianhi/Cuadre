import { useState } from 'react';
import { Plus } from 'lucide-react';
import { coroService } from '@/entities/coro';
import {
  Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast,
} from '@/shared/ui';
import { CoroParticipantInputList } from './CoroParticipantInputList';

interface CoroCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => Promise<void> | void;
}

export function CoroCreateDialog({ open, onOpenChange, onCreated }: CoroCreateDialogProps) {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<'DOP' | 'USD'>('DOP');
  const [participants, setParticipants] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName('');
    setCurrency('DOP');
    setParticipants([]);
  };
  const setOpen = (next: boolean) => {
    onOpenChange(next);
    if (!next) reset();
  };
  const create = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const result = await coroService.create({ name: name.trim(), currency, participantNames: participants });
      toast.success('Coro creado con éxito.');
      setOpen(false);
      await onCreated(result.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos crear el coro.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nuevo coro</DialogTitle>
          <DialogDescription>Crea el grupo y añade los nombres que ya conoces.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
          <div>
            <label className="mb-1 block text-xs font-semibold" htmlFor="coro-name">Nombre</label>
            <Input id="coro-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Fin de semana en Las Terrenas" autoFocus />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">Moneda</label>
            <Select value={currency} onValueChange={(value) => setCurrency(value as 'DOP' | 'USD')}>
              <SelectTrigger aria-label="Moneda del coro"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DOP">DOP — Pesos</SelectItem>
                <SelectItem value="USD">USD — Dólares</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CoroParticipantInputList participants={participants} onChange={setParticipants} maxHeight="max-h-40" />
        <DialogFooter className="gap-2 sm:space-x-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={() => void create()} disabled={saving || !name.trim()} className="gap-2">
            <Plus className="h-4 w-4" />{saving ? 'Creando…' : 'Crear coro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
