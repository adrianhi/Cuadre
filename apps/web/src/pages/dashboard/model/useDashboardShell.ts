import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductGuideState } from '@bills/contracts';
import { useLocation, useNavigate } from 'react-router-dom';
import { connectionService } from '@/entities/connection';
import { toast } from '@/shared/ui';
import { APP_SECTIONS, type AppSection } from '@/widgets/bottom-nav';

export const DASHBOARD_SECTION_TITLES: Record<AppSection, string> = {
  home: 'Inicio',
  transactions: 'Movimientos',
  control: 'Control',
  hub: 'Hub',
};

function sectionFromPath(pathname: string): AppSection | null {
  if (pathname.includes('/transactions') || pathname.includes('/movimientos')) return 'transactions';
  if (pathname.includes('/control')) return 'control';
  if (pathname.includes('/hub')) return 'hub';
  if (pathname.includes('/analytics') || pathname.includes('/analitica')) return 'control';
  if (pathname.includes('/budget') || pathname.includes('/presupuesto') || pathname.includes('/recurring')) return 'control';
  if (pathname.includes('/categories') || pathname.includes('/categorias')) return 'control';
  if (pathname.includes('/rules') || pathname.includes('/reglas')) return 'control';
  if (pathname.includes('/more') || pathname.includes('/mas')) return 'hub';
  if (pathname.includes('/home') || pathname.includes('/inicio')) return 'home';
  return null;
}

export function useDashboardShell(productGuide: ProductGuideState) {
  const location = useLocation();
  const navigate = useNavigate();
  const isCoroRoute = /^\/app\/coro(?:\/|$)/.test(location.pathname);
  const activeSection = sectionFromPath(location.pathname) ?? 'home';
  const [isSettingsOpen, setIsSettingsOpen] = useState(
    () => new URLSearchParams(window.location.search).has('settings')
  );
  const [isTourInviteOpen, setIsTourInviteOpen] = useState(
    () => productGuide.versionSeen !== productGuide.currentVersion
  );
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const connectionsQuery = useQuery({
    queryKey: ['inbox-connections', 'dashboard'],
    queryFn: ({ signal }) => connectionService.listInboxConnections(signal),
    gcTime: 0,
    refetchInterval: (query) =>
      query.state.data?.some(
        (connection) =>
          connection.currentJob?.status === 'PENDING' ||
          connection.currentJob?.status === 'PROCESSING'
      )
        ? 2_500
        : false,
  });
  const syncMutation = useMutation({
    mutationFn: (connectionId: string) => connectionService.sync(connectionId),
    onSuccess: async () => {
      await connectionsQuery.refetch();
    },
  });
  const queryClient = useQueryClient();
  const wasSyncingRef = useRef(false);

  useEffect(() => {
    const isCurrentlySyncing = connectionsQuery.data?.some(
      (connection) =>
        connection.currentJob?.status === 'PENDING' ||
        connection.currentJob?.status === 'PROCESSING'
    ) ?? false;

    if (wasSyncingRef.current && !isCurrentlySyncing) {
      const active = connectionsQuery.data?.find((c) => c.status === 'ACTIVE');
      const created = active?.lastSyncSummary?.created;
      const message = typeof created === 'number' && created > 0
        ? `Se agregaron ${created} transacciones de tus bancos.`
        : 'Tus movimientos están al día.';
      toast.success(message, '🎉 ¡Sincronización completada!');
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
      void queryClient.invalidateQueries({ queryKey: ['budgets'] });
    }

    wasSyncingRef.current = isCurrentlySyncing;
  }, [connectionsQuery.data, queryClient]);

  useEffect(() => {
    if (location.pathname.includes('/mas') || location.pathname.includes('/more')) {
      navigate('/app/hub', { replace: true });
      return;
    }
    if (location.pathname.includes('/inicio')) {
      navigate('/app/home', { replace: true });
      return;
    }
    if (location.pathname.includes('/movimientos')) {
      navigate('/app/transactions', { replace: true });
      return;
    }
    if (location.pathname.includes('/presupuesto') || location.pathname.includes('/budget')) {
      navigate('/app/control?view=budget', { replace: true });
      return;
    }
    if (location.pathname.includes('/recurring') || location.pathname.includes('/suscripciones')) {
      navigate('/app/control?view=budget&tab=recurring', { replace: true });
      return;
    }
    if (location.pathname.includes('/analitica') || location.pathname.includes('/analytics')) {
      navigate('/app/control?view=analytics', { replace: true });
      return;
    }
    if (location.pathname.includes('/reglas') || location.pathname.includes('/rules')) {
      navigate('/app/control?view=categories&tab=rules', { replace: true });
      return;
    }
    if (location.pathname.includes('/categorias') || location.pathname.includes('/categories')) {
      navigate('/app/control?view=categories', { replace: true });
      return;
    }
    if (!sectionFromPath(location.pathname) && !isCoroRoute) {
      navigate('/app/home', { replace: true });
    }
  }, [isCoroRoute, location.pathname, navigate]);

  const selectSection = useCallback((
    section: AppSection,
    replace = false,
    behavior: ScrollBehavior = 'smooth'
  ) => {
    const target = APP_SECTIONS.find((item) => item.id === section);
    if (target) navigate(target.path, { replace });
    window.scrollTo({ top: 0, behavior });
  }, [navigate]);

  const navigateForTour = useCallback((section: AppSection) => {
    const target = APP_SECTIONS.find((item) => item.id === section);
    if (target) navigate(target.path, { replace: true });
  }, [navigate]);

  return {
    activeSection,
    isCoroRoute,
    selectSection,
    navigateForTour,
    connectionsQuery,
    primaryConnection:
      connectionsQuery.data?.find((connection) => connection.status !== 'REVOKED') ??
      connectionsQuery.data?.[0],
    requiresBankSelection:
      connectionsQuery.data?.some(
        (connection) => connection.status === 'ACTIVE' && connection.requiresBankSelection
      ) ?? false,
    isSettingsOpen,
    setIsSettingsOpen,
    isTourInviteOpen,
    setIsTourInviteOpen,
    isTourOpen,
    setIsTourOpen,
    isExportModalOpen,
    setIsExportModalOpen,
    handleSyncConnection: (connectionId: string) => syncMutation.mutate(connectionId),
    isSyncingConnection: syncMutation.isPending,
  };
}
