import { AlertCircle, Loader2, Plus } from "lucide-react";
import type { CategoryCatalogItem } from "@bills/contracts";
import { cn } from "@/shared/lib";
import { Combobox, type ComboboxOption } from "@/shared/ui";
import { categoryDotClass } from "./category-visuals";

const EMPTY_VALUE = "__all_categories__";

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
  const items =
    current && !hasCurrent
      ? [
          {
            id: null,
            key: `current:${current}`,
            label: current,
            kind: "LEGACY" as const,
            colorKey: "slate" as const,
            icon: null,
            isArchived: true,
          },
          ...props.items,
        ]
      : props.items;

  const options: ComboboxOption[] = [];
  if (props.emptyLabel) {
    options.push({
      value: EMPTY_VALUE,
      label: props.emptyLabel,
    });
  }

  for (const item of items) {
    options.push({
      value: item.label,
      label: item.label,
      icon: item.icon ? (
        <span aria-hidden="true" className="w-4 text-center">
          {item.icon}
        </span>
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            categoryDotClass(item.colorKey),
          )}
        />
      ),
      badge: item.isArchived ? (
        <span className="text-[9px] uppercase text-muted-foreground">
          histórica
        </span>
      ) : undefined,
    });
  }

  const handleChange = (next: string) => {
    if (!next || next === EMPTY_VALUE) {
      props.onValueChange("");
      return;
    }
    props.onValueChange(next);
  };

  return (
    <div className="space-y-1">
      {props.loading ? (
        <div
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-muted-foreground shadow-2xs",
            props.className,
          )}
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Cargando categorías…</span>
        </div>
      ) : (
        <Combobox
          options={options}
          value={current || (props.emptyLabel ? EMPTY_VALUE : "")}
          onValueChange={handleChange}
          placeholder={props.placeholder || "Selecciona una categoría"}
          searchPlaceholder="Buscar categoría…"
          emptyText="No se encontraron categorías"
          disabled={props.disabled}
          className={props.className}
          ariaLabel={props.ariaLabel}
        />
      )}

      {props.onCreateRequest && (
        <button
          type="button"
          onClick={props.onCreateRequest}
          className="flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold text-primary hover:bg-primary/10"
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva categoría…
        </button>
      )}

      {props.error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive">
          <AlertCircle className="h-3 w-3" />
          {props.error}
        </p>
      )}
    </div>
  );
}
