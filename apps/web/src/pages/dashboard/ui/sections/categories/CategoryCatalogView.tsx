import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Archive, FolderTree, Loader2, Plus, Search } from 'lucide-react';
import type { CategoryCatalogItem, CreateCategoryInput } from '@bills/contracts';
import {
  categoryDotClass,
  categoryKeys,
  categoryService,
  CreateCategoryDialog,
  useCategoryCatalog,
} from '@/entities/category';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  toast,
} from '@/shared/ui';
import { cn } from '@/shared/lib';

export function CategoryCatalogView() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading, error } = useCategoryCatalog(true, false);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [categoryToArchive, setCategoryToArchive] = useState<CategoryCatalogItem | null>(null);

  const createMutation = useMutation({
    mutationFn: (input: CreateCategoryInput) => categoryService.create(input),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      await queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success(`Categoría "${created.label}" creada correctamente`);
      setIsCreateOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error al crear categoría');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => categoryService.archive(id),
    onSuccess: async (_, id) => {
      const target = categories.find((c) => c.id === id);
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      await queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success(`Categoría "${target?.label || ''}" archivada`);
      setCategoryToArchive(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error al archivar la categoría');
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((cat) => cat.label.toLowerCase().includes(term));
  }, [categories, search]);

  const customCount = categories.filter((c) => c.kind === 'CUSTOM').length;
  const systemCount = categories.filter((c) => c.kind === 'SYSTEM').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Catálogo de Categorías
          </h3>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {categories.length} categorías disponibles ({systemCount} del sistema, {customCount} personalizadas).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Categoría</span>
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar en el catálogo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setSearch('')}
          className="pl-9 text-xs sm:text-sm"
        />
      </div>

      {isLoading && (
        <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Cargando catálogo…</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive">
          Error al cargar las categorías. Por favor intenta recargar la página.
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <Card className="border-dashed py-12 text-center">
          <CardContent className="flex flex-col items-center gap-3">
            <FolderTree className="h-10 w-10 text-muted-foreground/60" />
            <p className="text-sm font-semibold text-foreground">No se encontraron categorías</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              {search ? 'Intenta con otro término de búsqueda.' : 'Crea tu primera categoría personalizada para empezar.'}
            </p>
            {search && (
              <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                Limpiar búsqueda
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <Card
              key={item.key}
              className="group relative border-border/70 bg-card transition-all hover:border-primary/40 hover:shadow-xs"
            >
              <CardContent className="flex items-center justify-between p-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  {item.icon ? (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-lg shadow-2xs">
                      {item.icon}
                    </span>
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/70 shadow-2xs">
                      <span className={cn('h-3.5 w-3.5 rounded-full', categoryDotClass(item.colorKey))} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.label}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {item.kind === 'CUSTOM' ? (
                        <Badge variant="outline" className="border-primary/30 px-1.5 py-0 text-[10px] text-primary">
                          Personalizada
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] text-muted-foreground">
                          Sistema
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {item.kind === 'CUSTOM' && item.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-70 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    title={`Archivar ${item.label}`}
                    onClick={() => setCategoryToArchive(item)}
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog to Archive */}
      <Dialog
        open={Boolean(categoryToArchive)}
        onOpenChange={(open) => !open && setCategoryToArchive(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Archivar categoría?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              La categoría <strong className="text-foreground">{categoryToArchive?.label}</strong> no
              aparecerá en nuevas selecciones, pero los movimientos históricos que la utilicen se mantendrán intactos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryToArchive(null)}
              disabled={archiveMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={archiveMutation.isPending}
              onClick={() => categoryToArchive?.id && archiveMutation.mutate(categoryToArchive.id)}
              className="gap-1.5"
            >
              {archiveMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Archivar Categoría</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <CreateCategoryDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        saving={createMutation.isPending}
        error={createMutation.error?.message}
        onCreate={createMutation.mutateAsync}
      />
    </div>
  );
}
