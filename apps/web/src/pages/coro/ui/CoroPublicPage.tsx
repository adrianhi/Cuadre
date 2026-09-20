import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LockKeyhole, Plus, Share2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { CoroExpense, CoroPaymentDestination, CoroPublicDetail } from '@/entities/coro';
import { clearCoroToken, coroKeys, coroService, getCoroToken, saveCoroToken } from '@/entities/coro';
import { CoroClaimCard, CoroExpenseDialog, CoroTabs } from '@/features/coro-public';
import { ApiClientError } from '@/shared/api';
import { formatCurrency } from '@/shared/lib';
import { Button, LoadingScreen, toast } from '@/shared/ui';

export function CoroPublicPage() {
  const { slug = '' } = useParams(); const queryClient = useQueryClient();
  const [token, setToken] = useState<string>();
  const [expenseOpen, setExpenseOpen] = useState(false); const [editing, setEditing] = useState<CoroExpense | null>(null);
  const anonymous = useQuery({ queryKey: coroKeys.public(slug), queryFn: ({ signal }) => coroService.publicDetail(slug, undefined, signal), retry: false });
  const participantToken = token ?? getCoroToken(anonymous.data?.id);
  const participant = useQuery({ queryKey: ['coro', 'participant', slug], enabled: Boolean(participantToken), retry: false,
    queryFn: async ({ signal }) => { try { return await coroService.publicDetail(slug, participantToken, signal); }
      catch (error) { if (error instanceof ApiClientError && error.status === 401 && anonymous.data?.id) { clearCoroToken(anonymous.data.id); setToken(undefined); } throw error; } },
  });
  const detail = participantToken && participant.data ? participant.data : anonymous.data;
  const update = (next: CoroPublicDetail) => queryClient.setQueryData(['coro', 'participant', slug], next);
  const claim = useMutation({ mutationFn: (input: { participantId?: string; name: string }) => coroService.claim(slug, input),
    onSuccess: (result) => { saveCoroToken(result.detail.id, result.token); setToken(result.token); queryClient.setQueryData(['coro', 'participant', slug], result.detail); toast.success(`Hola, ${result.detail.participants.find((p) => p.id === result.participantId)?.name ?? ''}.`); },
    onError: (error: Error) => toast.error(error.message),
  });
  const share = async () => {
    const text = `Únete a “${detail?.name}” en Cuadre: ${window.location.href}`;
    try {
      if (navigator.share) await navigator.share({ title: detail?.name, text, url: window.location.href });
      else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) toast.error('No pudimos abrir el menú para compartir.'); }
  };
  if (anonymous.isLoading) return <LoadingScreen message="Abriendo el coro…" description="Calculando los gastos compartidos." />;
  if (!detail) return <main className="grid min-h-screen place-items-center bg-background p-6"><div className="max-w-sm text-center"><p className="text-5xl">🪇</p><h1 className="mt-4 text-2xl font-black">No encontramos este coro</h1><p className="mt-2 text-muted-foreground">El enlace puede ser incorrecto o ya no estar disponible.</p></div></main>;
  const mutable = detail.status === 'ACTIVE' && Boolean(detail.viewerParticipantId);
  return <main className="min-h-screen bg-muted/30 px-4 py-6 text-foreground sm:py-10">
    <div className="mx-auto max-w-3xl">
      <header className="rounded-[2rem] border bg-card p-5 shadow-sm sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Modo Coro</p><h1 className="mt-2 text-3xl font-black tracking-tight">{detail.name}</h1><p className="mt-1 text-sm text-muted-foreground">{detail.description || 'Gastos compartidos, cuentas claras.'}</p></div>
          <Button size="icon" variant="outline" onClick={() => void share()} aria-label="Compartir coro"><Share2 className="h-4 w-4" /></Button></div>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">Gasto acumulado</p><p className="text-3xl font-black">{formatCurrency(detail.totalAmount, detail.currency)}</p></div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${detail.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>{detail.status === 'ACTIVE' ? 'Activo' : <><LockKeyhole className="mr-1 inline h-3 w-3" />{detail.status === 'LOCKED' ? 'Cuadrado' : 'Archivado'}</>}</span></div>
      </header>
      {!detail.viewerParticipantId && detail.status !== 'ARCHIVED' && <div className="mt-5"><CoroClaimCard participants={detail.participants} pending={claim.isPending} onClaim={(input) => claim.mutate(input)} /></div>}
      <CoroTabs detail={detail}
        onDeleteExpense={async (id) => { if (!participantToken) return; update(await coroService.removeExpense(slug, participantToken, id)); }}
        onEditExpense={(id) => { setEditing(detail.expenses.find((item) => item.id === id) ?? null); setExpenseOpen(true); }}
        onSettlement={async (id, action) => { if (!participantToken) return; update(await coroService.settlement(slug, participantToken, id, action)); }}
        onSavePayment={async (value: CoroPaymentDestination | null) => { if (!participantToken) return; update(await coroService.updatePayment(slug, participantToken, value)); }} />
      {mutable && <Button className="fixed bottom-5 left-1/2 h-12 -translate-x-1/2 rounded-full px-6 shadow-xl sm:bottom-8" onClick={() => { setEditing(null); setExpenseOpen(true); }}><Plus className="mr-2 h-5 w-5" />Agregar gasto</Button>}
      {detail.viewerParticipantId && expenseOpen && <CoroExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} participants={detail.participants}
        viewerId={detail.viewerParticipantId} currency={detail.currency} initial={editing} onSubmit={async (input) => { if (!participantToken) return;
          update(editing ? await coroService.updateExpense(slug, participantToken, editing.id, input) : await coroService.createExpense(slug, participantToken, input)); }} />}
    </div>
  </main>;
}
