import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, Copy, ExternalLink, Link2, LockKeyhole, Plus, Trash2, Users } from 'lucide-react';
import { coroKeys, coroService } from '@/entities/coro';
import { ApiClientError } from '@/shared/api';
import { formatCurrency, formatRelativeDate } from '@/shared/lib';
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, toast } from '@/shared/ui';
import { CoroOwnerPaymentForm } from './CoroOwnerPaymentForm';

interface Props { open: boolean; onOpenChange: (open: boolean) => void }

export function CoroHubModal({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient(); const [selectedId, setSelectedId] = useState<string>();
  const [creating, setCreating] = useState(false); const [name, setName] = useState('');
  const [currency, setCurrency] = useState<'DOP' | 'USD'>('DOP'); const [names, setNames] = useState('');
  const [participantName, setParticipantName] = useState('');
  const list = useQuery({ queryKey: coroKeys.list(), queryFn: () => coroService.list(), enabled: open });
  const detail = useQuery({ queryKey: coroKeys.detail(selectedId ?? ''), queryFn: () => coroService.detail(selectedId!), enabled: open && Boolean(selectedId) });
  const candidates = useQuery({ queryKey: ['coro', 'candidates', selectedId], queryFn: () => coroService.candidates(selectedId!), enabled: open && Boolean(selectedId) && detail.data?.status === 'ACTIVE' });
  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: coroKeys.all }); };
  const action = useMutation({ mutationFn: async (kind: 'lock' | 'archive') => kind === 'lock' ? coroService.lock(selectedId!) : coroService.archive(selectedId!),
    onSuccess: async (_, kind) => { toast.success(kind === 'lock' ? 'Coro cuadrado y bloqueado.' : 'Coro archivado.'); await refresh(); },
    onError: (error: Error) => toast.error(error.message),
  });
  const create = async () => {
    try {
      const result = await coroService.create({ name: name.trim(), currency, participantNames: names.split(',').map((item) => item.trim()).filter(Boolean) });
      setCreating(false); setName(''); setNames(''); setSelectedId(result.id); await refresh(); toast.success('Coro creado.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'No pudimos crear el coro.'); }
  };
  const link = async (transactionId: string) => {
    if (!detail.data) return;
    try { await coroService.linkTransaction(detail.data.id, { transactionId, splitParticipantIds: detail.data.participants.map((item) => item.id), allowPossibleDuplicate: false }); await refresh(); toast.success('Movimiento vinculado.'); }
    catch (error) {
      if (error instanceof ApiClientError && error.code === 'POSSIBLE_DUPLICATE'
        && window.confirm('Encontramos un gasto parecido. ¿Vincular este movimiento de todos modos?')) {
        await coroService.linkTransaction(detail.data.id, { transactionId, splitParticipantIds: detail.data.participants.map((item) => item.id), allowPossibleDuplicate: true }); await refresh();
      } else toast.error(error instanceof Error ? error.message : 'No pudimos vincular el movimiento.');
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
    <DialogHeader><DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Modo Coro</DialogTitle><DialogDescription>Organiza viajes, cenas y salidas; Cuadre calcula quién le paga a quién.</DialogDescription></DialogHeader>
    {!selectedId ? <div className="space-y-4">
      <Button onClick={() => setCreating((value) => !value)}><Plus className="mr-2 h-4 w-4" />Nuevo coro</Button>
      {creating && <div className="grid gap-3 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Fin de semana en Las Terrenas" />
        <select className="h-9 rounded-md border bg-background px-3" value={currency} onChange={(e) => setCurrency(e.target.value as 'DOP' | 'USD')}><option value="DOP">Pesos dominicanos</option><option value="USD">Dólares</option></select>
        <Input className="sm:col-span-2" value={names} onChange={(e) => setNames(e.target.value)} placeholder="Participantes separados por coma: Ana, Pedro, Luis" />
        <Button disabled={!name.trim()} onClick={() => void create()}>Crear y compartir</Button>
      </div>}
      {list.isLoading && <p className="text-sm text-muted-foreground">Cargando coros…</p>}
      <div className="grid gap-3 sm:grid-cols-2">{list.data?.map((item) => <button type="button" key={item.id} onClick={() => setSelectedId(item.id)} className="rounded-2xl border bg-card p-4 text-left transition hover:border-primary/50">
        <div className="flex items-center justify-between"><strong>{item.name}</strong><span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold">{item.status}</span></div>
        <p className="mt-3 text-2xl font-black">{formatCurrency(item.totalAmount, item.currency)}</p><p className="mt-1 text-xs text-muted-foreground">{item.participantCount} personas · {item.expenseCount} gastos</p>
      </button>)}</div>
      {!list.isLoading && !list.data?.length && <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Todavía no has creado un coro.</p>}
    </div> : <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={() => setSelectedId(undefined)}>← Volver a mis coros</Button>
      {!detail.data ? <p>Cargando…</p> : <><div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border p-4"><div><h3 className="text-xl font-black">{detail.data.name}</h3><p className="text-sm text-muted-foreground">{detail.data.participants.length} participantes · {formatCurrency(detail.data.totalAmount, detail.data.currency)}</p></div><div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => window.open(`/coro/${detail.data!.slug}`, '_blank', 'noopener,noreferrer')}><ExternalLink className="mr-2 h-4 w-4" />Abrir</Button><Button size="sm" variant="outline" onClick={async () => { await navigator.clipboard.writeText(`${window.location.origin}/coro/${detail.data!.slug}`); toast.success('Enlace copiado.'); }}><Copy className="mr-2 h-4 w-4" />Compartir</Button>
        {detail.data.status === 'ACTIVE' && <Button size="sm" onClick={() => action.mutate('lock')}><LockKeyhole className="mr-2 h-4 w-4" />Cerrar y cuadrar</Button>}
        {detail.data.status !== 'ARCHIVED' && <Button size="sm" variant="outline" onClick={() => action.mutate('archive')}><Archive className="mr-2 h-4 w-4" />Archivar</Button>}
      </div></div>
      {detail.data.status === 'ACTIVE' && <section><h4 className="mb-2 font-bold">Vincular movimiento reciente</h4><div className="max-h-52 space-y-2 overflow-y-auto">{candidates.data?.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl border p-3"><div className="min-w-0 flex-1"><p className="truncate font-semibold">{item.merchant}</p><p className="text-xs text-muted-foreground">{formatRelativeDate(item.transactionDate)} · {item.institutionCode}</p></div><strong>{formatCurrency(item.amount, item.currency)}</strong><Button size="icon" variant="outline" aria-label="Vincular movimiento" onClick={() => void link(item.id)}><Link2 className="h-4 w-4" /></Button></div>)}</div></section>}
      <section><h4 className="mb-2 font-bold">Participantes</h4><div className="flex flex-wrap gap-2">{detail.data.participants.map((item) => <span key={item.id} className="inline-flex items-center rounded-full border px-3 py-1 text-sm">{item.name}{item.isOwner ? ' · anfitrión' : ''}{item.isClaimed && !item.isOwner && detail.data?.status === 'ACTIVE' && <button className="ml-2 text-xs text-muted-foreground hover:text-destructive" onClick={async () => { await coroService.releaseClaim(detail.data!.id, item.id); await refresh(); }}>liberar</button>}</span>)}</div>
        {detail.data.status === 'ACTIVE' && <div className="mt-3 flex max-w-sm gap-2"><Input value={participantName} onChange={(e) => setParticipantName(e.target.value)} placeholder="Añadir participante" /><Button size="sm" disabled={!participantName.trim()} onClick={async () => { await coroService.addParticipant(detail.data!.id, participantName.trim()); setParticipantName(''); await refresh(); }}>Añadir</Button></div>}</section>
      <CoroOwnerPaymentForm current={detail.data.participants.find((item) => item.isOwner)?.paymentDestination} onSave={async (payment) => { await coroService.updateOwnerPayment(detail.data!.id, payment); await refresh(); toast.success('Cuenta de cobro guardada.'); }} />
      <section><h4 className="mb-2 font-bold">Gastos</h4>{detail.data.expenses.map((item) => <div key={item.id} className="flex items-center gap-3 border-b py-2"><span className="min-w-0 flex-1 truncate text-sm">{item.title} · {item.paidByName}</span><strong>{formatCurrency(item.amount, detail.data!.currency)}</strong>{detail.data?.status === 'ACTIVE' && <Button size="icon" variant="ghost" onClick={async () => { await coroService.removeOwnerExpense(detail.data!.id, item.id); await refresh(); }}><Trash2 className="h-4 w-4" /></Button>}</div>)}</section>
      <section><h4 className="mb-2 font-bold">Pagos</h4>{detail.data.settlements.map((item, index) => <div key={item.id ?? index} className="flex items-center gap-3 border-b py-3"><span className="flex-1 text-sm">{item.fromName} → {item.toName}</span><strong>{formatCurrency(item.amount, detail.data!.currency)}</strong>{item.id && item.canMarkPaid && <Button size="sm" onClick={async () => { await coroService.markOwnerSettlementPaid(detail.data!.id, item.id!); await refresh(); }}>Marcar enviado</Button>}{item.id && item.status === 'MARKED_PAID' && <Button size="sm" onClick={async () => { await coroService.confirmOwnerSettlement(detail.data!.id, item.id!); await refresh(); }}>Confirmar</Button>}</div>)}</section>
      </>}
    </div>}
  </DialogContent></Dialog>;
}
