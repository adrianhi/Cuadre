import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Link2, Plus, Search, X } from 'lucide-react';
import { coroService } from '@/entities/coro';
import { ApiClientError } from '@/shared/api';
import { formatCurrency, formatRelativeDate } from '@/shared/lib';
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, toast } from '@/shared/ui';
import { bankMeta } from '../model/bank-style';
import { CoroConfirmDialog } from './CoroConfirmDialog';

interface CoroCandidatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coroId: string;
  participantIds: string[];
  onRefresh: () => Promise<void>;
  onOpenManual?: (suggestedTitle?: string) => void;
}

export function CoroCandidatesDialog(props: CoroCandidatesDialogProps) {
  const [duplicateId, setDuplicateId] = useState<string>();
  const [linkingId, setLinkingId] = useState<string>();
  const [search, setSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const candidates = useQuery({
    queryKey: ['coro', 'candidates', props.coroId],
    queryFn: () => coroService.candidates(props.coroId),
    enabled: props.open,
  });

  const rawList = candidates.data;
  const banks = useMemo(() => Array.from(new Set((rawList ?? []).map((i) => i.institutionCode))).sort(), [rawList]);
  const filtered = useMemo(() => {
    const list = rawList ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((item) => {
      if (selectedBank !== 'ALL' && item.institutionCode !== selectedBank) return false;
      if (!q) return true;
      return item.merchant.toLowerCase().includes(q) || item.institutionCode.toLowerCase().includes(q) || item.amount.toString().includes(q);
    });
  }, [rawList, search, selectedBank]);

  const link = async (transactionId: string, allowPossibleDuplicate = false) => {
    setLinkingId(transactionId);
    try {
      await coroService.linkTransaction(props.coroId, {
        transactionId, splitParticipantIds: props.participantIds, allowPossibleDuplicate,
      });
      setDuplicateId(undefined);
      await Promise.all([props.onRefresh(), candidates.refetch()]);
      toast.success('Movimiento vinculado.');
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'POSSIBLE_DUPLICATE' && !allowPossibleDuplicate) {
        setDuplicateId(transactionId);
      } else {
        toast.error(error instanceof Error ? error.message : 'No pudimos vincular el movimiento.');
      }
    } finally {
      setLinkingId(undefined);
    }
  };

  const totalCount = rawList?.length ?? 0;
  const splitMembers = Math.max(1, props.participantIds.length);

  return (
    <>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="max-h-[88vh] w-[calc(100vw-1.5rem)] max-w-xl overflow-y-auto rounded-2xl p-4 sm:p-6">
          <DialogHeader className="pr-6 text-left">
            <DialogTitle>Vincular movimiento de tu tarjeta</DialogTitle>
            <DialogDescription>
              Compras recientes sincronizadas. Toca cualquier compra para ver su detalle rápido.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 pt-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por comercio o monto (ej. Uber, 500)..." className="h-9 pl-9 pr-8 text-xs rounded-xl"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {banks.length > 1 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <button
                  type="button" onClick={() => setSelectedBank('ALL')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    selectedBank === 'ALL' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Todos ({totalCount})
                </button>
                {banks.map((b) => (
                  <button
                    key={b} type="button" onClick={() => setSelectedBank(b)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      selectedBank === b ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {b} ({(rawList ?? []).filter((i) => i.institutionCode === b).length})
                  </button>
                ))}
              </div>
            )}
          </div>

          {candidates.isLoading && <p className="py-8 text-center text-xs text-muted-foreground">Buscando movimientos…</p>}
          {candidates.isError && (
            <div className="py-6 text-center space-y-2">
              <p className="text-xs text-destructive">No pudimos cargar los movimientos.</p>
              <Button size="sm" variant="outline" onClick={() => void candidates.refetch()}>Reintentar</Button>
            </div>
          )}

          {!candidates.isLoading && !candidates.isError && totalCount === 0 && (
            <div className="rounded-2xl border border-dashed p-6 text-center space-y-2">
              <p className="text-xs text-muted-foreground">No encontramos movimientos recientes para vincular.</p>
              {props.onOpenManual && (
                <Button size="sm" onClick={() => { props.onOpenChange(false); props.onOpenManual?.(); }} className="gap-1.5 text-xs font-bold rounded-xl">
                  <Plus className="h-3.5 w-3.5" /><span>Registrar gasto manual</span>
                </Button>
              )}
            </div>
          )}

          {!candidates.isLoading && totalCount > 0 && filtered.length === 0 && (
            <div className="rounded-xl border border-dashed p-5 text-center space-y-2">
              <p className="text-xs text-muted-foreground">No encontramos compras que coincidan con &ldquo;{search}&rdquo;.</p>
              {props.onOpenManual && (
                <Button size="sm" variant="outline" onClick={() => { props.onOpenChange(false); props.onOpenManual?.(search); }} className="gap-1.5 text-xs font-bold rounded-xl">
                  <Plus className="h-3.5 w-3.5" /><span>Registrar &ldquo;{search}&rdquo; como manual</span>
                </Button>
              )}
            </div>
          )}

          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-0.5">
            {filtered.map((item) => {
              const meta = bankMeta(item.institutionCode);
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
                  className={`cursor-pointer rounded-xl border p-2.5 sm:p-3 transition ${
                    isExpanded ? 'border-primary/50 bg-primary/[0.03] shadow-xs' : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[10px] font-black ${meta.badge}`}>
                        {meta.abbr}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs sm:text-sm font-bold text-foreground" title={item.merchant}>{item.merchant}</p>
                        <p className="truncate text-[10px] sm:text-[11px] text-muted-foreground">{formatRelativeDate(item.transactionDate)} · {item.institutionCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <strong className="text-xs sm:text-sm font-black text-foreground">{formatCurrency(item.amount, item.currency)}</strong>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                      <Button
                        size="sm" variant="outline" disabled={linkingId === item.id}
                        onClick={(e) => { e.stopPropagation(); void link(item.id); }}
                        className="h-7 sm:h-8 px-2.5 text-xs font-bold gap-1 rounded-lg border-primary/20 bg-primary/5 hover:bg-primary hover:text-primary-foreground text-primary transition-all shrink-0"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        <span>{linkingId === item.id ? '…' : 'Vincular'}</span>
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-2.5 border-t border-border/50 space-y-2 text-xs cursor-default" onClick={(e) => e.stopPropagation()}>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div><span className="text-muted-foreground block">Fecha y hora</span><span className="font-semibold text-foreground">{new Date(item.transactionDate).toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
                        <div><span className="text-muted-foreground block">Categoría</span><span className="font-semibold text-foreground">{item.category} {item.transactionType ? `(${item.transactionType})` : ''}</span></div>
                        {item.cardLast4 && <div className="col-span-2"><span className="text-muted-foreground block">Tarjeta</span><span className="font-semibold text-foreground">•••• {item.cardLast4} ({item.institutionCode})</span></div>}
                      </div>
                      <div className="rounded-lg bg-primary/10 p-2 text-[11px] text-primary font-medium">
                        Se dividirá entre {splitMembers} personas ({formatCurrency(item.amount / splitMembers, item.currency)} c/u).
                      </div>
                      <Button
                        size="sm" disabled={linkingId === item.id} onClick={() => void link(item.id)}
                        className="w-full h-8 text-xs font-bold gap-1.5 rounded-xl mt-1"
                      >
                        <Link2 className="h-3.5 w-3.5" /><span>{linkingId === item.id ? 'Vinculando…' : 'Confirmar y vincular al coro'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {props.onOpenManual && totalCount > 0 && (
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">¿Pagaste en efectivo o con otro medio?</span>
              <button type="button" onClick={() => { props.onOpenChange(false); props.onOpenManual?.(); }} className="font-bold text-primary hover:underline">
                + Registrar gasto manual
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <CoroConfirmDialog
        open={Boolean(duplicateId)} onOpenChange={(open) => { if (!open) setDuplicateId(undefined); }}
        title="Posible gasto duplicado" description="Encontramos un gasto parecido. Puedes volver a la lista o vincular este movimiento de todos modos."
        confirmLabel="Vincular de todos modos" pending={Boolean(linkingId)}
        onConfirm={() => { if (duplicateId) return link(duplicateId, true); }}
      />
    </>
  );
}
