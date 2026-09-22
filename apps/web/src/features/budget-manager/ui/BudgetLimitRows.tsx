import { useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { BudgetCategoryDto } from '@/entities/budget';
import {
  Button,
  CurrencyAmountInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';

function CategorySelect(props: {
  selectedKey: string;
  categories: BudgetCategoryDto[];
  unusedCategories: BudgetCategoryDto[];
  onChange: (newKey: string) => void;
}) {
  const currentCategory = props.categories.find((c) => c.key === props.selectedKey);
  const options = [
    ...(currentCategory ? [currentCategory] : []),
    ...props.unusedCategories.filter((c) => c.key !== props.selectedKey),
  ];

  return (
    <div className="min-w-0 flex-1">
      <Select value={props.selectedKey} onValueChange={props.onChange}>
        <SelectTrigger className="h-10 w-full text-xs font-semibold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.key} value={item.key}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function BudgetLimitRows(props: {
  categories: BudgetCategoryDto[];
  limits: Record<string, string>;
  setLimit: (key: string, value: string) => void;
  removeLimit: (key: string) => void;
}) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const unused = props.categories.filter((item) => !(item.key in props.limits));

  const addFirst = () => {
    if (unused[0]) {
      const nextKey = unused[0].key;
      props.setLimit(nextKey, '');
      setTimeout(() => {
        inputRefs.current[nextKey]?.focus();
      }, 50);
      return nextKey;
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold">Límites por categoría</p>
          <p className="text-xs text-muted-foreground">Añade solo las categorías que quieras controlar.</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addFirst}
          disabled={!unused.length}
          className="gap-1 rounded-xl text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          Añadir
        </Button>
      </div>

      {Object.entries(props.limits).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <CategorySelect
            selectedKey={key}
            categories={props.categories}
            unusedCategories={unused}
            onChange={(newKey) => {
              props.removeLimit(key);
              props.setLimit(newKey, value);
            }}
          />
          <div className="w-32 shrink-0 sm:w-36">
            <CurrencyAmountInput
              ref={(el) => {
                inputRefs.current[key] = el;
              }}
              value={value}
              onValueChange={(formatted) => props.setLimit(key, formatted)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addFirst();
                }
              }}
              placeholder="0.00"
              className="h-10 text-right font-mono text-xs font-semibold"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => props.removeLimit(key)}
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Quitar categoría"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {!Object.keys(props.limits).length && (
        <p className="rounded-2xl border border-dashed p-4 text-center text-xs text-muted-foreground">
          Aún no has agregado límites por categoría.
        </p>
      )}
    </div>
  );
}
