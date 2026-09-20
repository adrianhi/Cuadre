import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Archive, ArrowLeft, Copy, ExternalLink, LockKeyhole, Pencil, ReceiptText, Scale, Share2, Users } from 'lucide-react';
import type { CoroPublicDetail } from '@/entities/coro';
import { coroService } from '@/entities/coro';
import { formatCurrency } from '@/shared/lib';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, toast } from '@/shared/ui';
import { buildCoroWhatsAppShareUrl } from '../model/coro-share';
import { CoroConfirmDialog } from './CoroConfirmDialog';
import { CoroEditDialog } from './CoroEditDialog';
import { CoroExpensesTab } from './CoroExpensesTab';
import { CoroOwnerPaymentForm } from './CoroOwnerPaymentForm';
import { CoroParticipantsSection } from './CoroParticipantsSection';
import { CoroSettlementsTab } from './CoroSettlementsTab';
import { CoroSummaryTab } from './CoroSummaryTab';

interface CoroDetailViewProps {
  detail: CoroPublicDetail;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

const statusLabel = { ACTIVE: 'Activo', LOCKED: 'Cuadrado', ARCHIVED: 'Archivado' } as const;

export function CoroDetailView({ detail, onBack, onRefresh }: CoroDetailViewProps) {
  const [confirmation, setConfirmation] = useState<'lock' | 'archive'>();
  const [editOpen, setEditOpen] = useState(false);
  const action = useMutation({
    mutationFn: (kind: 'lock' | 'archive') => kind === 'lock' ? coroService.lock(detail.id) : coroService.archive(detail.id),
    onSuccess: async (_, kind) => {
      setConfirmation(undefined);
      await onRefresh();
      toast.success(kind === 'lock' ? 'Coro cuadrado y bloqueado.' : 'Coro archivado.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const publicUrl = `${window.location.origin}/coro/${detail.slug}`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Enlace del coro copiado.');
    } catch {
      toast.error('No pudimos copiar el enlace.');
    }
  };
  const active = detail.status === 'ACTIVE';

  const handleWhatsAppShare = () => {
    const shareUrl = buildCoroWhatsAppShareUrl(
      detail.name,
      detail.totalAmount,
      detail.currency,
      detail.participants.length,
      detail.slug
    );
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-w-0 space-y-6">
      <Button variant="ghost" onClick={onBack} className="-ml-3 gap-2 text-muted-foreground"><ArrowLeft className="h-4 w-4" />Mis coros</Button>
      <header className="min-w-0 rounded-2xl border bg-card p-4 sm:p-6">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate text-2xl font-black sm:text-3xl">{detail.name}</h2>
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">{statusLabel[detail.status]}</span>
              {active && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditOpen(true)}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Editar información del coro"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {detail.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{detail.description}</p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">{detail.participants.length} participantes · {detail.expenses.length} gastos</p>
            <p className="mt-1 text-2xl font-black text-primary">{formatCurrency(detail.totalAmount, detail.currency)}</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap lg:justify-end">
            <Button size="sm" variant="outline" onClick={() => window.open(`/coro/${detail.slug}`, '_blank', 'noopener,noreferrer')} className="min-w-0 gap-1.5"><ExternalLink className="h-4 w-4 shrink-0" /><span className="truncate">Vista pública</span></Button>
            <Button size="sm" variant="outline" onClick={handleWhatsAppShare} className="min-w-0 gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-500/10"><Share2 className="h-4 w-4 shrink-0" /><span className="truncate">WhatsApp</span></Button>
            <Button size="sm" variant="outline" onClick={() => void copyLink()} className="min-w-0 gap-1.5"><Copy className="h-4 w-4 shrink-0" /><span className="truncate">Copiar link</span></Button>
            {active && <Button size="sm" onClick={() => setConfirmation('lock')} className="min-w-0 gap-1.5"><LockKeyhole className="h-4 w-4 shrink-0" /><span className="truncate">Cerrar y cuadrar</span></Button>}
            {detail.status !== 'ARCHIVED' && <Button size="sm" variant="outline" onClick={() => setConfirmation('archive')} className="min-w-0 gap-1.5"><Archive className="h-4 w-4 shrink-0" /><span className="truncate">Archivar</span></Button>}
          </div>
        </div>
      </header>

      <Tabs defaultValue="summary" className="min-w-0">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <TabsList className="w-max min-w-full gap-1 rounded-2xl border bg-card p-1 sm:grid sm:grid-cols-4">
            <TabsTrigger value="summary">Resumen</TabsTrigger>
            <TabsTrigger value="expenses"><ReceiptText className="h-4 w-4" />Gastos</TabsTrigger>
            <TabsTrigger value="participants"><Users className="h-4 w-4" />Participantes</TabsTrigger>
            <TabsTrigger value="settlements"><Scale className="h-4 w-4" />El Cuadre</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="summary" className="mt-5"><CoroSummaryTab detail={detail} /></TabsContent>
        <TabsContent value="expenses" className="mt-5"><CoroExpensesTab detail={detail} onRefresh={onRefresh} /></TabsContent>
        <TabsContent value="participants" className="mt-5 space-y-4">
          <CoroParticipantsSection coroId={detail.id} participants={detail.participants} isActive={active} onRefresh={onRefresh} />
          <CoroOwnerPaymentForm current={detail.participants.find((item) => item.isOwner)?.paymentDestination} onSave={async (payment) => { await coroService.updateOwnerPayment(detail.id, payment); await onRefresh(); toast.success('Cuenta de cobro guardada.'); }} />
        </TabsContent>
        <TabsContent value="settlements" className="mt-5"><CoroSettlementsTab detail={detail} onRefresh={onRefresh} /></TabsContent>
      </Tabs>

      <CoroConfirmDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => { if (!open) setConfirmation(undefined); }}
        title={confirmation === 'lock' ? 'Cerrar y cuadrar el coro' : 'Archivar el coro'}
        description={confirmation === 'lock' ? 'Los gastos quedarán congelados y se crearán las obligaciones definitivas. No podrás desbloquearlo.' : 'El coro quedará como historial de solo lectura y sus enlaces de participante dejarán de funcionar.'}
        confirmLabel={confirmation === 'lock' ? 'Cerrar y cuadrar' : 'Archivar coro'}
        destructive={confirmation === 'archive'}
        pending={action.isPending}
        onConfirm={() => confirmation && action.mutate(confirmation)}
      />

      <CoroEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        coroId={detail.id}
        initialName={detail.name}
        initialDescription={detail.description}
        onSuccess={onRefresh}
      />
    </div>
  );
}
