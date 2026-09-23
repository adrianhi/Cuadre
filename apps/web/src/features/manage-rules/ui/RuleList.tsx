import { useState } from 'react';
import { ArrowRight, CheckCircle2, History, PauseCircle, PlayCircle, SlidersHorizontal, Trash2, Edit3 } from 'lucide-react';
import type { CategoryRuleDto } from '@/entities/category-rule';
import { Badge, Button, Card, CardContent } from '@/shared/ui';

interface RuleListProps {
  rules: CategoryRuleDto[];
  disabled: boolean;
  onEdit: (rule: CategoryRuleDto) => void;
  onToggle: (rule: CategoryRuleDto) => void;
  onRemove: (rule: CategoryRuleDto) => void;
  onPreview: (id: string) => void;
}

export function RuleList({
  rules,
  disabled,
  onEdit,
  onToggle,
  onRemove,
  onPreview,
}: RuleListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  return (
    <section className="space-y-3.5 pt-2" aria-label="Listado de reglas">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-foreground sm:text-base flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Tus reglas configuradas ({rules.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Se aplican automáticamente cuando ingresan nuevas transacciones desde tus bancos.
          </p>
        </div>
      </div>

      {!rules.length && (
        <Card className="border-dashed border-border/60 text-center py-6">
          <CardContent className="space-y-2 p-4">
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              Aún no tienes reglas personalizadas
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              La clasificación inteligente base de Cuadre sigue funcionando. Puedes crear tu primera regla arriba para comercios recurrentes (ej. PedidosYa, Netflix, tu barbero) para que nunca tengas que clasificarlos a mano.
            </p>
          </CardContent>
        </Card>
      )}

      {rules.length > 0 && (
        <div className="space-y-2.5">
          {rules.map((rule) => (
            <Card key={rule.id} className="border border-border/60 bg-card shadow-2xs">
              <CardContent className="p-3.5 sm:p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground">
                        {rule.matchType === 'MERCHANT' ? 'Comercio exacto' : 'Contiene'}
                      </Badge>
                      <span className="font-bold text-sm text-foreground break-all">
                        {rule.pattern}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Asigna categoría:</span>
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge className="bg-primary/10 text-primary text-xs font-bold">
                          {rule.category}
                        </Badge>
                      </div>
                      {rule.normalizedMerchant && (
                        <span className="text-[11px] text-muted-foreground">
                          · Alias: {rule.normalizedMerchant}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {rule.isActive ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 text-[11px]">
                        <CheckCircle2 className="h-3 w-3" /> Activa
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground gap-1 text-[11px]">
                        <PauseCircle className="h-3 w-3" /> Pausada
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    onClick={() => onEdit(rule)}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Editar
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    onClick={() => onToggle(rule)}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {rule.isActive ? <PauseCircle className="h-3.5 w-3.5" /> : <PlayCircle className="h-3.5 w-3.5" />}
                    {rule.isActive ? 'Pausar' : 'Activar'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={disabled || !rule.isActive}
                    onClick={() => onPreview(rule.id)}
                    className="h-8 gap-1.5 text-xs text-primary hover:text-primary"
                  >
                    <History className="h-3.5 w-3.5" />
                    Aplicar al histórico
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={disabled}
                    onClick={() => setRemovingId(rule.id)}
                    className="h-8 text-xs text-muted-foreground hover:text-destructive ml-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {removingId === rule.id && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs space-y-2">
                    <p className="text-foreground font-semibold">
                      ¿Seguro que deseas eliminar esta regla?
                    </p>
                    <p className="text-muted-foreground">
                      Los movimientos clasificados previamente en el pasado no se verán afectados.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={disabled}
                        onClick={() => {
                          onRemove(rule);
                          setRemovingId(null);
                        }}
                      >
                        Eliminar regla
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRemovingId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
