import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Plus, Settings, SlidersHorizontal, Users } from 'lucide-react';
import { APP_SECTIONS, type AppSection } from '@/widgets/bottom-nav';
import { Button } from '@/shared/ui';
import { ConnectionStatusBadge, type InboxConnection } from '@/entities/connection';

interface DashboardSidebarProps {
  activeSection: AppSection | null;
  coroActive?: boolean;
  onSelectSection: (section: AppSection) => void;
  onQuickAdd: () => void;
  activeFiltersCount?: number;
  onOpenRules?: () => void;
  onOpenExport: () => void;
  onOpenCoro: () => void;
  onOpenSettings: () => void;
  userEmail?: string | null;
  connection?: InboxConnection;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeSection,
  coroActive = false,
  onSelectSection,
  onQuickAdd,
  activeFiltersCount = 0,
  onOpenRules,
  onOpenExport,
  onOpenCoro,
  onOpenSettings,
  userEmail,
  connection,
}) => {
  const navigate = useNavigate();
  const accountLabel = userEmail || connection?.email || 'Tu cuenta';
  const initial = accountLabel.charAt(0).toUpperCase();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-card lg:flex">
      <div className="flex h-20 items-center gap-3 border-b px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-lg font-black text-white shadow-md">
          C.
        </div>
        <div>
          <p className="text-xl font-black tracking-tight">
            Cuadre<span className="text-primary">.</span>
          </p>
          <p className="text-xs text-muted-foreground">Tu dinero al día</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4" aria-label="Navegación principal">
        {APP_SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectSection(id)}
            aria-current={id === activeSection ? 'page' : undefined}
            className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
              id === activeSection
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
            {id === 'transactions' && activeFiltersCount > 0 && (
              <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </button>
        ))}
        <div className="mt-5 border-t pt-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Herramientas</p>
          <button
            type="button"
            onClick={() => {
              navigate('/app/control?view=categories');
              onSelectSection('control');
              onOpenRules?.();
            }}
            className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Reglas de categorías
          </button>
          <Button
            type="button"
            variant="ghost"
            onClick={onOpenCoro}
            aria-current={coroActive ? 'page' : undefined}
            className={`min-h-10 w-full justify-start gap-3 rounded-xl px-3 text-sm font-semibold ${
              coroActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
            }`}
          >
            <Users className="h-4 w-4" />Modo Coro
          </Button>
          <button type="button" onClick={onOpenExport} className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"><Download className="h-4 w-4" />Exportar</button>
        </div>
      </nav>
      <div className="space-y-3 border-t p-4">
        <Button
          onClick={onQuickAdd}
          data-product-tour="new-movement"
          className="h-11 w-full gap-2 rounded-xl"
        >
          <Plus className="h-4 w-4" />
          Nuevo movimiento
        </Button>
        <button type="button" onClick={onOpenSettings} className="flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition hover:bg-muted">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{initial}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{accountLabel}</span><ConnectionStatusBadge connection={connection} /></span>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </aside>
  );
};
