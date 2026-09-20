import { AlertCircle, Loader2, Plus } from 'lucide-react';
import type { CategoryCatalogItem } from '@bills/contracts';
import { cn } from '@/shared/lib';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui';
import { categoryDotClass } from './category-visuals';

const EMPTY_VALUE = '__all_categories__';

export function CategorySelect(props: {
  items: CategoryCatalogItem[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  onCreateRequest?: () => void;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const current = props.value.trim();
  const hasCurrent = props.items.some((item) => item.label === current);
  const items = current && !hasCurrent
    ? [{ id: null, key: `current:${current}`, label: current, kind: 'LEGACY' as const,
      colorKey: 'slate' as const, icon: null, isArchived: true }, ...props.items]
    : props.items;
  const selected = items.find((item) => item.label === current);

  return <div className="space-y-1">
    <Select
      value={current || EMPTY_VALUE}
      disabled={props.disabled || props.loading}
      onValueChange={(next) => {
        if (!next || next === EMPTY_VALUE) {
          if (props.emptyLabel) {
            props.onValueChange('');
          }
          return;
        }
        props.onValueChange(next);
      }}
    >
      <SelectTrigger className={cn('h-10 border-border/80 bg-background shadow-sm', props.className)} aria-label={props.ariaLabel} data-category-value={current}>
        {props.loading ? <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Cargando…</span>
          : <SelectValue placeholder={props.placeholder || 'Selecciona una categoría'}>
            {selected && <span className="flex min-w-0 items-center gap-2">
              {selected.icon ? <span aria-hidden="true">{selected.icon}</span>
                : <span aria-hidden="true" className={cn('h-2.5 w-2.5 rounded-full', categoryDotClass(selected.colorKey))} />}
              <span className="truncate">{selected.label}</span>
            </span>}
          </SelectValue>}
      </SelectTrigger>
      <SelectContent className="border-border/80 bg-popover/95 backdrop-blur-xl">
        {props.emptyLabel && <SelectItem value={EMPTY_VALUE}>{props.emptyLabel}</SelectItem>}
        {items.map((item) => <SelectItem key={item.label} value={item.label}>
          <span className={cn('flex min-w-0 items-center gap-2', item.isArchived && 'opacity-60')}>
            {item.icon ? <span aria-hidden="true" className="w-4 text-center">{item.icon}</span>
              : <span aria-hidden="true" className={cn('h-2.5 w-2.5 rounded-full', categoryDotClass(item.colorKey))} />}
            <span className="truncate">{item.label}</span>
            {item.isArchived && <span className="text-[9px] uppercase text-muted-foreground">histórica</span>}
          </span>
        </SelectItem>)}
      </SelectContent>
    </Select>
    {props.onCreateRequest && <button type="button" onClick={props.onCreateRequest}
      className="flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold text-primary hover:bg-primary/10">
      <Plus className="h-3.5 w-3.5" />Nueva categoría…
    </button>}
    {props.error && <p className="flex items-center gap-1 text-[11px] text-destructive"><AlertCircle className="h-3 w-3" />{props.error}</p>}
  </div>;
}
