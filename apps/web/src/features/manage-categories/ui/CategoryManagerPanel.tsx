import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Archive, Loader2, Palette, Plus, RotateCcw } from 'lucide-react';
import type { CategoryCatalogItem, CategoryColorKey, CreateCategoryInput } from '@bills/contracts';
import { categoryDotClass, categoryKeys, categoryService, CreateCategoryDialog, useCategoryCatalog } from '@/entities/category';
import { Button, Input } from '@/shared/ui';

export function CategoryManagerPanel({ enabled }: { enabled: boolean }) {
  const query = useCategoryCatalog(enabled, true);
  const client = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryCatalogItem | null>(null);
  const [icon, setIcon] = useState('');
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: categoryKeys.all }),
      client.invalidateQueries({ queryKey: ['category-rules'] }),
      client.invalidateQueries({ queryKey: ['budgets'] }),
    ]);
  };
  const create = useMutation({ mutationFn: (input: CreateCategoryInput) => categoryService.create(input), onSuccess: refresh });
  const update = useMutation({
    mutationFn: (input: { id: string; colorKey?: CategoryColorKey; icon?: string | null; isArchived?: boolean }) => {
      const { id, ...changes } = input;
      return categoryService.update(id, changes);
    }, onSuccess: async () => { setEditing(null); await refresh(); },
  });
  const archive = useMutation({ mutationFn: categoryService.archive, onSuccess: refresh });
  const custom = (query.data || []).filter((item) => item.kind === 'CUSTOM');

  if (query.isLoading) return <div className="flex min-h-28 items-center justify-center text-xs text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando categorías…</div>;
  return <section className="space-y-3 rounded-2xl border p-4" aria-labelledby="custom-categories-title">
    <div className="flex items-start justify-between gap-3">
      <div><p id="custom-categories-title" className="font-bold">Tus categorías</p>
        <p className="text-xs text-muted-foreground">Personaliza categorías sin alterar tus movimientos históricos.</p></div>
      <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}><Plus className="h-3.5 w-3.5" />Nueva</Button>
    </div>
    {query.error && <p role="alert" className="text-xs text-destructive">{query.error.message}</p>}
    {!custom.length ? <p className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">Todavía no has creado categorías personalizadas.</p>
      : <div className="space-y-2">{custom.map((item) => <div key={item.id} className={`rounded-xl border p-3 ${item.isArchived ? 'opacity-60' : ''}`}>
        <div className="flex items-center gap-2">
          {item.icon ? <span className="w-5 text-center">{item.icon}</span> : <span className={`h-3 w-3 rounded-full ${categoryDotClass(item.colorKey)}`} />}
          <span className={`min-w-0 flex-1 truncate text-sm font-semibold ${item.isArchived ? 'line-through' : ''}`}>{item.label}</span>
          {item.isArchived ? <Button size="sm" variant="ghost" className="gap-1" disabled={update.isPending}
            onClick={() => item.id && update.mutate({ id: item.id, isArchived: false })}><RotateCcw className="h-3.5 w-3.5" />Restaurar</Button>
            : <><Button size="sm" variant="ghost" className="gap-1" onClick={() => { setEditing(item); setIcon(item.icon || ''); }}><Palette className="h-3.5 w-3.5" />Editar</Button>
              <Button size="icon" variant="ghost" aria-label={`Archivar ${item.label}`} disabled={archive.isPending}
                onClick={() => item.id && archive.mutate(item.id)}><Archive className="h-3.5 w-3.5" /></Button></>}
        </div>
        {editing?.id === item.id && <div className="mt-3 flex items-end gap-2 border-t pt-3">
          <label className="flex-1 space-y-1 text-[11px] font-semibold">Emoji<Input value={icon} maxLength={16} onChange={(event) => setIcon(event.target.value)} /></label>
          <div className="flex flex-wrap gap-1">{(['emerald','blue','amber','violet','pink','cyan','slate','red'] as CategoryColorKey[]).map((color) => <button key={color} type="button" aria-label={`Usar ${color}`}
            className={`h-7 w-7 rounded-lg border ${item.colorKey === color ? 'ring-2 ring-primary' : ''}`}
            onClick={() => item.id && update.mutate({ id: item.id, colorKey: color, icon: icon.trim() || null })}><span className={`mx-auto block h-3 w-3 rounded-full ${categoryDotClass(color)}`} /></button>)}</div>
          <Button size="sm" disabled={update.isPending} onClick={() => item.id && update.mutate({ id: item.id, icon: icon.trim() || null })}>Guardar</Button>
        </div>}
      </div>)}</div>}
    {(archive.error || update.error) && <p role="alert" className="text-xs text-destructive">{archive.error?.message || update.error?.message}</p>}
    <CreateCategoryDialog open={createOpen} onOpenChange={setCreateOpen} saving={create.isPending}
      error={create.error?.message} onCreate={create.mutateAsync} />
  </section>;
}
