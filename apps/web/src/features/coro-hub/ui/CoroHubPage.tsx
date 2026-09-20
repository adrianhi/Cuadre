import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { coroKeys, coroService } from '@/entities/coro';
import { ApiClientError } from '@/shared/api';
import { AsyncErrorState, Button } from '@/shared/ui';
import { CoroDetailView } from './CoroDetailView';
import { CoroListView } from './CoroListView';

function coroIdFromPath(pathname: string) {
  const match = pathname.match(/^\/app\/coro\/([^/]+)\/?$/);
  if (!match) return undefined;
  try { return decodeURIComponent(match[1]); } catch { return match[1]; }
}

export function CoroHubPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const coroId = coroIdFromPath(location.pathname);
  const validCoroId = !coroId || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(coroId);
  const list = useQuery({
    queryKey: coroKeys.list(),
    queryFn: () => coroService.list(),
    enabled: !coroId,
    staleTime: 30_000,
  });
  const detail = useQuery({
    queryKey: coroKeys.detail(coroId ?? ''),
    queryFn: () => coroService.detail(coroId!),
    enabled: Boolean(coroId) && validCoroId,
  });
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: coroKeys.all });
  };
  const open = (id: string) => {
    navigate(`/app/coro/${encodeURIComponent(id)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!coroId) {
    return (
      <CoroListView
        coros={list.data ?? []}
        loading={list.isLoading}
        error={list.error}
        onRetry={() => void list.refetch()}
        onOpen={open}
        onCreated={async (id) => { await refresh(); open(id); }}
      />
    );
  }
  if (!validCoroId) {
    return <div className="flex flex-col items-center gap-3 py-16 text-center"><h2 className="text-xl font-black">Coro no encontrado</h2><p className="text-sm text-muted-foreground">El identificador del coro no es válido.</p><Button onClick={() => navigate('/app/coro')}>Volver a mis coros</Button></div>;
  }
  if (detail.isLoading) return <p className="py-16 text-center text-sm text-muted-foreground">Cargando el coro…</p>;
  if (detail.error instanceof ApiClientError && detail.error.status === 404) {
    return <div className="flex flex-col items-center gap-3 py-16 text-center"><h2 className="text-xl font-black">Coro no encontrado</h2><p className="text-sm text-muted-foreground">El enlace puede ser incorrecto o el coro ya no está disponible.</p><Button onClick={() => navigate('/app/coro')}>Volver a mis coros</Button></div>;
  }
  if (detail.error || !detail.data) {
    return <AsyncErrorState title="No pudimos abrir este coro" description="Vuelve a intentarlo o regresa a la lista." onRetry={() => void detail.refetch()} error={detail.error} area="detalle de coro" />;
  }
  return <CoroDetailView detail={detail.data} onBack={() => navigate('/app/coro')} onRefresh={refresh} />;
}
