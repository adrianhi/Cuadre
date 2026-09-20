import { Eye, EyeOff, PartyPopper, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/shared/ui';
import { ConnectionStatusBadge, type InboxConnection } from '@/entities/connection';

interface NavbarProps {
  title: string;
  hideBalances: boolean;
  setHideBalances: (value: boolean) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onOpenCoro: () => void;
  refreshing: boolean;
  connection?: InboxConnection;
}

export function Navbar({ title, hideBalances, setHideBalances, onRefresh, onOpenSettings, onOpenCoro, refreshing, connection }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl pt-[env(safe-area-inset-top)] transition-colors lg:pl-64" data-product-tour-occluder="top-navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-base font-black text-white shadow-sm lg:hidden">C.</div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary sm:text-[11px]">Tu dinero al día</p>
            <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onOpenSettings} className="mr-1 grid h-11 w-7 place-items-center rounded-xl hover:bg-muted lg:hidden"><ConnectionStatusBadge connection={connection} showLabel={false} /></button>
          <Button variant="ghost" size="icon" onClick={onOpenCoro} className="h-11 w-11 rounded-xl lg:hidden" aria-label="Abrir Modo Coro"><PartyPopper className="h-4 w-4 text-primary" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setHideBalances(!hideBalances)} className="h-11 w-11 rounded-xl" aria-label={hideBalances ? 'Mostrar montos' : 'Ocultar montos'}>
            {hideBalances ? <EyeOff className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onRefresh} disabled={refreshing} className="h-11 w-11 rounded-xl" aria-label="Actualizar datos">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onOpenSettings} className="h-11 w-11 rounded-xl" aria-label="Abrir conexiones y privacidad">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
