import { Power, PowerOff, Trash2, Wand2 } from 'lucide-react';
import type { CategoryRuleDto } from '@bills/contracts';
import { categoryDotClass } from '@/entities/category';
import { Badge, Button, Card, CardContent } from '@/shared/ui';
import { cn } from '@/shared/lib';

interface CategoryRuleCardProps {
  rule: CategoryRuleDto;
  categoryInfo?: { icon: string | null; colorKey: string };
  isToggling?: boolean;
  onToggle: (rule: CategoryRuleDto) => void;
  onDeleteRequest: (rule: CategoryRuleDto) => void;
}

export function CategoryRuleCard({
  rule,
  categoryInfo,
  isToggling = false,
  onToggle,
  onDeleteRequest,
}: CategoryRuleCardProps) {
  return (
    <Card
      className={cn(
        'border-border/70 bg-card transition hover:border-primary/40',
        !rule.isActive && 'opacity-65',
      )}
    >
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Wand2 className="h-4 w-4" />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {rule.matchType === 'MERCHANT' ? 'Comercio:' : 'Contiene:'}
              </span>
              <span className="truncate text-sm font-bold text-foreground">
                "{rule.pattern}"
              </span>
              {rule.normalizedMerchant && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Alias: {rule.normalizedMerchant}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Asigna a:</span>
              <div className="inline-flex items-center gap-1.5 font-medium text-foreground">
                {categoryInfo?.icon ? (
                  <span>{categoryInfo.icon}</span>
                ) : (
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      categoryDotClass((categoryInfo?.colorKey as any) || 'slate'),
                    )}
                  />
                )}
                <span>{rule.category}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Badge variant={rule.isActive ? 'default' : 'secondary'} className="text-[11px]">
            {rule.isActive ? 'Activa' : 'Inactiva'}
          </Badge>

          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-xs"
            disabled={isToggling}
            onClick={() => onToggle(rule)}
          >
            {rule.isActive ? (
              <>
                <PowerOff className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">Desactivar</span>
              </>
            ) : (
              <>
                <Power className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Activar</span>
              </>
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDeleteRequest(rule)}
            title="Eliminar regla"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
