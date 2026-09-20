import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import type { CategoryColorKey, CategoryCatalogItem } from '@bills/contracts';
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input } from '@/shared/ui';
import { cn } from '@/shared/lib';
import { CATEGORY_COLOR_OPTIONS } from './category-visuals';

export function CreateCategoryDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving: boolean;
  error?: string;
  onCreate: (input: { name: string; colorKey: CategoryColorKey; icon: string | null }) => Promise<CategoryCatalogItem>;
  onCreated?: (item: CategoryCatalogItem) => void;
}) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [colorKey, setColorKey] = useState<CategoryColorKey>('emerald');

  const reset = () => {
    setName('');
    setIcon('');
    setColorKey('emerald');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }
    props.onOpenChange(nextOpen);
  };

  const submit = async () => {
    if (!name.trim()) return;
    const item = await props.onCreate({ name: name.trim(), colorKey, icon: icon.trim() || null });
    reset();
    props.onCreated?.(item);
    props.onOpenChange(false);
  };

  return <Dialog open={props.open} onOpenChange={handleOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>Nueva categoría</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <label className="block space-y-1.5 text-xs font-semibold">Nombre
          <Input value={name} maxLength={100} autoFocus placeholder="Ej. Gimnasio" onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="block space-y-1.5 text-xs font-semibold">Emoji opcional
          <Input value={icon} maxLength={16} placeholder="🏋️" onChange={(event) => setIcon(event.target.value)} />
        </label>
        <fieldset className="space-y-2"><legend className="text-xs font-semibold">Color</legend>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORY_COLOR_OPTIONS.map((color) => <button key={color.key} type="button" title={color.label}
              aria-label={color.label} aria-pressed={colorKey === color.key} onClick={() => setColorKey(color.key)}
              className={cn('flex h-10 items-center justify-center rounded-xl border transition', colorKey === color.key ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:bg-muted')}>
              <span className={cn('h-4 w-4 rounded-full', color.dot)} />
            </button>)}
          </div>
        </fieldset>
        {props.error && <p role="alert" className="text-xs text-destructive">{props.error}</p>}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => props.onOpenChange(false)} disabled={props.saving}>Cancelar</Button>
        <Button onClick={() => void submit()} disabled={props.saving || !name.trim()} className="gap-2">
          {props.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Crear
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}

