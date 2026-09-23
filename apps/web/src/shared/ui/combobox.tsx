import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/shared/lib";

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  renderOption?: (option: ComboboxOption) => ReactNode;
  renderTrigger?: (selected: ComboboxOption | undefined) => ReactNode;
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecciona una opción",
  searchPlaceholder = "Buscar…",
  emptyText = "No hay opciones",
  disabled = false,
  className,
  ariaLabel,
  renderOption,
  renderTrigger,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected = options.find((opt) => opt.value === value);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const norm = normalize(search);
    return options.filter((opt) => normalize(opt.label).includes(norm));
  }, [options, search]);

  const handleClose = () => {
    setOpen(false);
    setSearch("");
    setHighlighted(0);
  };
  const handleOpen = () => {
    setOpen(true);
    setHighlighted(0);
  };
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setHighlighted(0);
  };

  useEffect(() => {
    if (open) searchInputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      )
        handleClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const handleSelect = (val: string) => {
    onValueChange(val);
    handleClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleClose();
      return;
    }
    if (!open) {
      if (
        event.key === "ArrowDown" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        handleOpen();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((prev) =>
        prev - 1 >= 0 ? prev - 1 : filtered.length - 1,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = filtered[highlighted];
      if (target && !target.disabled) handleSelect(target.value);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? handleClose() : handleOpen())}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground shadow-2xs transition-colors",
          "hover:bg-muted/30 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
          {renderTrigger ? (
            renderTrigger(selected)
          ) : selected ? (
            <>
              {selected.icon}
              <span className="truncate">{selected.label}</span>
              {selected.badge}
            </>
          ) : (
            <span className="truncate text-muted-foreground">
              {placeholder}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-hidden rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-lg backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
        >
          <div className="flex items-center border-b border-border/60 px-2.5 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="ml-2 w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-hidden"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              filtered.map((opt, index) => {
                const isSelected = opt.value === value;
                const isFocused = index === highlighted;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlighted(index)}
                    className={cn(
                      "flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors",
                      isFocused && "bg-muted/80",
                      isSelected && "font-semibold text-primary",
                      opt.disabled && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
                      {renderOption ? (
                        renderOption(opt)
                      ) : (
                        <>
                          {opt.icon}
                          <span className="truncate">{opt.label}</span>
                          {opt.badge}
                        </>
                      )}
                    </span>
                    {isSelected && (
                      <Check className="ml-2 h-3.5 w-3.5 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
