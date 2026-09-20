import { Eye, EyeOff, RefreshCw, Settings, Users } from 'lucide-react';
import { Button } from '@/shared/ui';
import { getConnectionStatus, type InboxConnection } from '@/entities/connection';

interface NavbarProps {
  title: string;
  hideBalances: boolean;
  setHideBalances: (value: boolean) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onOpenCoro?: () => void;
  coroActive?: boolean;
  refreshing: boolean;
  connection?: InboxConnection;
}

export function Navbar({
  title,
  hideBalances,
  setHideBalances,
  onRefresh,
  onOpenSettings,
  onOpenCoro,
  coroActive = false,
  refreshing,
  connection,
}: NavbarProps) {
  const connectionStatus = getConnectionStatus(connection);

  return (
    <header
      className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl pt-[env(safe-area-inset-top)] transition-colors lg:pl-64"
      data-product-tour-occluder="top-navigation"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-base font-black text-white shadow-sm lg:hidden">
            C.
          </div>
          <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {onOpenCoro && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenCoro}
              className={`h-10 w-10 rounded-xl lg:hidden ${coroActive ? 'bg-primary/10 text-primary' : ''}`}
              aria-label="Abrir Modo Coro"
              aria-current={coroActive ? 'page' : undefined}
              title="Modo Coro"
            >
              <Users className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setHideBalances(!hideBalances)}
            className="h-10 w-10 rounded-xl sm:h-11 sm:w-11"
            aria-label={hideBalances ? 'Mostrar montos' : 'Ocultar montos'}
            title={hideBalances ? 'Mostrar montos' : 'Ocultar montos'}
          >
            {hideBalances ? <EyeOff className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={refreshing}
            className="h-10 w-10 rounded-xl sm:h-11 sm:w-11"
            aria-label="Actualizar datos"
            title="Actualizar datos"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="relative h-10 w-10 rounded-xl sm:h-11 sm:w-11"
            aria-label={`Abrir conexiones y privacidad (${connectionStatus.label})`}
            title={`Configuración (${connectionStatus.label})`}
          >
            <Settings className="h-4 w-4" />
            {connection && (
              <span
                className={`absolute right-2.5 top-2.5 h-2 w-2 rounded-full ${connectionStatus.dot} ring-2 ring-background`}
                aria-hidden="true"
              />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
