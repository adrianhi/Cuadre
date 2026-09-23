import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Search, Sparkles } from 'lucide-react';
import type { CategoryRuleDto } from '@bills/contracts';
import { categoryRuleKeys, categoryRuleService, useCategoryRules } from '@/entities/category-rule';
import { useCategoryCatalog } from '@/entities/category';
import {
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
import { CategoryRuleCard } from './CategoryRuleCard';

export function CategoryRulesView() {
  const queryClient = useQueryClient();
  const { data: rules = [], isLoading, error } = useCategoryRules(true);
  const { data: categories = [] } = useCategoryCatalog(true, false);
  const [search, setSearch] = useState('');
  const [ruleToDelete, setRuleToDelete] = useState<CategoryRuleDto | null>(null);

  const categoryMap = useMemo(() => {
    const map = new Map<string, { icon: string | null; colorKey: string }>();
    for (const cat of categories) {
      map.set(cat.label.toLowerCase(), { icon: cat.icon, colorKey: cat.colorKey });
    }
    return map;
  }, [categories]);

  const toggleMutation = useMutation({
    mutationFn: (rule: CategoryRuleDto) =>
      categoryRuleService.update(rule.id, { version: rule.version, isActive: !rule.isActive }),
    onSuccess: async (_, rule) => {
      await queryClient.invalidateQueries({ queryKey: categoryRuleKeys.all });
      toast.success(rule.isActive ? 'Regla desactivada' : 'Regla activada');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error al actualizar regla');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ruleId: string) => categoryRuleService.remove(ruleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryRuleKeys.all });
      toast.success('Regla eliminada exitosamente');
      setRuleToDelete(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error al eliminar regla');
    },
  });

  const filteredRules = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rules;
    return rules.filter(
      (r) =>
        r.pattern.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term) ||
        (r.normalizedMerchant && r.normalizedMerchant.toLowerCase().includes(term)),
    );
  }, [rules, search]);

  const activeCount = rules.filter((r) => r.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Reglas de Automatización
          </h3>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {rules.length} reglas configuradas ({activeCount} activas). Clasifican tus transacciones automáticamente.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por patrón o categoría…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setSearch('')}
          className="pl-9 text-xs sm:text-sm"
        />
      </div>

      {isLoading && (
        <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Cargando reglas de categorización…</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive">
          Error al cargar las reglas. Por favor intenta recargar.
        </div>
      )}

      {!isLoading && !error && filteredRules.length === 0 && (
        <Card className="border-dashed py-12 text-center">
          <CardContent className="flex flex-col items-center gap-3">
            <Sparkles className="h-10 w-10 text-muted-foreground/60" />
            <p className="text-sm font-semibold text-foreground">No hay reglas registradas</p>
            <p className="max-w-md text-xs text-muted-foreground">
              {search
                ? 'No encontramos reglas que coincidan con tu búsqueda.'
                : 'Al editar un movimiento puedes activar la opción para recordar la categoría para futuros movimientos similares.'}
            </p>
            {search && (
              <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                Limpiar filtro
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filteredRules.length > 0 && (
        <div className="space-y-3">
          {filteredRules.map((rule) => (
            <CategoryRuleCard
              key={rule.id}
              rule={rule}
              categoryInfo={categoryMap.get(rule.category.toLowerCase())}
              isToggling={toggleMutation.isPending}
              onToggle={(r) => toggleMutation.mutate(r)}
              onDeleteRequest={(r) => setRuleToDelete(r)}
            />
          ))}
        </div>
      )}

      {/* Delete Rule Confirmation Dialog */}
      <Dialog open={Boolean(ruleToDelete)} onOpenChange={(open) => !open && setRuleToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar regla de categorización?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Se eliminará la regla para <strong className="text-foreground">"{ruleToDelete?.pattern}"</strong>.
              Esto no afectará los movimientos ya clasificados previamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRuleToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => ruleToDelete && deleteMutation.mutate(ruleToDelete.id)}
              className="gap-1.5"
            >
              {deleteMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Eliminar Regla</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
