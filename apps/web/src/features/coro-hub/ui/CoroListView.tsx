import { useState } from 'react';
import { ArrowRight, Plus, Users } from 'lucide-react';
import type { CoroGroupSummary } from '@/entities/coro';
import { formatCurrency } from '@/shared/lib';
import { AsyncErrorState, Button, Card, CardContent } from '@/shared/ui';
import { CoroCreateDialog } from './CoroCreateDialog';

interface CoroListViewProps {
  coros: CoroGroupSummary[];
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  onOpen: (id: string) => void;
  onCreated: (id: string) => Promise<void> | void;
}

const statusLabel = { ACTIVE: 'Activo', LOCKED: 'Cuadrado', ARCHIVED: 'Archivado' } as const;

function CoroCard({ coro, onOpen }: { coro: CoroGroupSummary; onOpen: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onOpen}
      className="h-auto min-w-0 flex-col items-stretch justify-start whitespace-normal rounded-2xl bg-card p-4 text-left hover:border-primary/50 hover:bg-card"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <strong className="min-w-0 truncate text-base">{coro.name}</strong>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
          coro.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
        }`}>{statusLabel[coro.status]}</span>
      </div>
      <p className="mt-4 text-2xl font-black">{formatCurrency(coro.totalAmount, coro.currency)}</p>
      <div className="mt-1 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{coro.participantCount} personas · {coro.expenseCount} gastos</span>
        <span className="flex shrink-0 items-center gap-1 font-semibold text-primary">Administrar <ArrowRight className="h-3.5 w-3.5" /></span>
      </div>
    </Button>
  );
}

function CoroGroup({ title, items, onOpen }: { title: string; items: CoroGroupSummary[]; onOpen: (id: string) => void }) {
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((coro) => <CoroCard key={coro.id} coro={coro} onOpen={() => onOpen(coro.id)} />)}
      </div>
    </section>
  );
}

export function CoroListView(props: CoroListViewProps) {
  const [creating, setCreating] = useState(false);
  const active = props.coros.filter((coro) => coro.status === 'ACTIVE');
  const completed = props.coros.filter((coro) => coro.status !== 'ACTIVE');
  return (
    <div className="min-w-0 space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Herramienta de Cuadre</p>
          <h2 className="mt-1 text-3xl font-black tracking-tight">Modo Coro</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Organiza viajes, cenas y salidas. Cuadre divide los gastos y calcula las transferencias mínimas.</p>
          <p className="mt-2 text-xs font-semibold text-muted-foreground">{props.coros.length} {props.coros.length === 1 ? 'coro' : 'coros'} en total</p>
        </div>
        <Button onClick={() => setCreating(true)} className="w-full gap-2 sm:w-auto"><Plus className="h-4 w-4" />Nuevo coro</Button>
      </header>

      {props.loading && <p className="py-12 text-center text-sm text-muted-foreground">Cargando tus coros…</p>}
      {Boolean(props.error) && <AsyncErrorState title="No pudimos cargar tus coros" description="Inténtalo otra vez; tus grupos no se han modificado." onRetry={props.onRetry} error={props.error} area="modo coro" />}
      {!props.loading && !props.error && props.coros.length === 0 && (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Users className="h-6 w-6" /></span>
          <div><p className="font-bold">Aún no tienes coros</p><p className="mt-1 text-sm text-muted-foreground">Crea uno para tu próximo viaje, cena o salida.</p></div>
          <Button onClick={() => setCreating(true)} className="gap-2"><Plus className="h-4 w-4" />Crear mi primer coro</Button>
        </CardContent></Card>
      )}
      <CoroGroup title="En curso" items={active} onOpen={props.onOpen} />
      <CoroGroup title="Cuadrados y archivados" items={completed} onOpen={props.onOpen} />
      <CoroCreateDialog open={creating} onOpenChange={setCreating} onCreated={props.onCreated} />
    </div>
  );
}
