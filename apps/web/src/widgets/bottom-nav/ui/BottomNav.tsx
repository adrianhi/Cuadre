import { useState, useEffect } from 'react';
import { Plus, Receipt, Sparkles, Users, X } from 'lucide-react';
import { APP_SECTIONS, type AppSection } from '../model/navigation';

interface BottomNavProps {
  activeSection: AppSection | null;
  onSelectSection: (section: AppSection) => void;
  onQuickAdd: () => void;
  onSimulateExpense?: () => void;
  onOpenCoro?: () => void;
  activeFiltersCount?: number;
}

type NavigationItem = (typeof APP_SECTIONS)[number];

function NavItem({
  item,
  active,
  activeFiltersCount,
  onSelect,
}: {
  item: NavigationItem;
  active: boolean;
  activeFiltersCount: number;
  onSelect: (section: AppSection) => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={`group relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-full px-0.5 text-[10px] font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 motion-reduce:transition-none ${
          active
            ? 'bg-primary/[0.12] shadow-[0_0_18px_hsl(var(--primary)/0.2)] ring-1 ring-primary/20'
            : 'group-hover:bg-muted'
        }`}
      >
        <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
        {item.id === 'transactions' && activeFiltersCount > 0 && (
          <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground ring-2 ring-card">
            {activeFiltersCount > 9 ? '9+' : activeFiltersCount}
          </span>
        )}
      </span>
      <span className="max-w-full truncate leading-tight">{item.label}</span>
    </button>
  );
}

export function BottomNav({
  activeSection,
  onSelectSection,
  onQuickAdd,
  onSimulateExpense,
  onOpenCoro,
  activeFiltersCount = 0,
}: BottomNavProps) {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const leadingItems = APP_SECTIONS.slice(0, 2);
  const trailingItems = APP_SECTIONS.slice(2);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActionSheetOpen) {
        setIsActionSheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActionSheetOpen]);

  const handleAction = (callback?: () => void) => {
    setIsActionSheetOpen(false);
    if (callback) callback();
    else onQuickAdd();
  };

  return (
    <>
      {isActionSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Acciones rápidas"
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 pb-24 backdrop-blur-sm lg:hidden animate-in fade-in-0 duration-200"
          onClick={() => setIsActionSheetOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-4 shadow-2xl space-y-2 animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Acción rápida</p>
              <button
                type="button"
                onClick={() => setIsActionSheetOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleAction(onQuickAdd)}
              className="flex w-full items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-3 text-left transition hover:bg-primary/15"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Receipt className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">Nuevo movimiento</p>
                <p className="text-xs text-muted-foreground">Gasto o ingreso manual al instante</p>
              </div>
            </button>

            {onSimulateExpense && (
              <button
                type="button"
                onClick={() => handleAction(onSimulateExpense)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3 text-left transition hover:bg-muted/70"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">Simular gasto</p>
                  <p className="text-xs text-muted-foreground">Revisa el impacto en tu margen libre</p>
                </div>
              </button>
            )}

            {onOpenCoro && (
              <button
                type="button"
                onClick={() => handleAction(onOpenCoro)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3 text-left transition hover:bg-muted/70"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Users className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">Modo Coro</p>
                  <p className="text-xs text-muted-foreground">Dividir gastos y salidas con amigos</p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-1/2 z-40 isolate w-[calc(100%-1.5rem)] max-w-[430px] -translate-x-1/2 lg:hidden"
        aria-label="Navegación principal"
        data-product-tour-occluder="bottom-navigation"
      >
        <div className="grid h-[4.5rem] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_4rem_minmax(0,1fr)_minmax(0,1fr)] items-center rounded-full border border-border/80 bg-card/85 px-2 shadow-[0_16px_44px_rgba(15,23,42,0.18)] backdrop-blur-2xl backdrop-saturate-150 dark:border-border/40 dark:bg-card/75 dark:shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
          {leadingItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={item.id === activeSection}
              activeFiltersCount={activeFiltersCount}
              onSelect={onSelectSection}
            />
          ))}

          <button
            type="button"
            onClick={() => {
              if (onSimulateExpense || onOpenCoro) {
                setIsActionSheetOpen(true);
              } else {
                onQuickAdd();
              }
            }}
            data-product-tour="new-movement"
            className="relative -top-2 flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-bold text-primary transition-transform active:scale-95 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Registrar un nuevo movimiento o acción rápida"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-[0_10px_24px_rgba(16,185,129,0.38)] ring-4 ring-card">
              <Plus className="h-6 w-6 stroke-[2.5]" aria-hidden="true" />
            </span>
            <span className="leading-tight">Nuevo</span>
          </button>

          {trailingItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={item.id === activeSection}
              activeFiltersCount={activeFiltersCount}
              onSelect={onSelectSection}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
