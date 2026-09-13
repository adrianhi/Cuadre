import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { accountService } from '@/entities/account';
import { connectionService } from '@/entities/connection';
import { proactiveService, type UpdateEmailNotificationPreferencesInput } from '@/entities/proactive';
import { downloadBlob } from '@/shared/lib';
import { toast } from '@/shared/ui';

export function useAccountSettings(isOpen: boolean, authenticated: boolean, onAccountDeleted: () => void) {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [confirmation, setConfirmation] = useState('');
  const [notice, setNotice] = useState('');
  const [newBankSelection, setNewBankSelection] = useState<string[]>([]);
  const [bankSelections, setBankSelections] = useState<Record<string, string[]>>({});
  const query = useQuery({
    queryKey: ['inbox-connections'], queryFn: async ({ signal }) => {
      const [connections, institutions, emailPreferences] = await Promise.all([
        connectionService.listInboxConnections(signal), connectionService.listInstitutions(signal),
        proactiveService.emailPreferences(signal),
      ]);
      return { connections, institutions, emailPreferences };
    },
    enabled: isOpen && authenticated,
    gcTime: 0,
    refetchInterval: (currentQuery) => {
      if (!isOpen) return false;
      const connections = currentQuery.state.data?.connections ?? [];
      return connections.some((item) => item.currentJob?.status === 'PENDING' || item.currentJob?.status === 'PROCESSING')
        ? 2_500
        : false;
    },
  });
  useEffect(() => {
    if (isOpen && searchParams.has('gmail')) setSearchParams({}, { replace: true });
  }, [isOpen, searchParams, setSearchParams]);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['inbox-connections'] });
  const google = useMutation({
    mutationFn: (institutionCodes: string[]) => connectionService.startGoogle('/app/home?settings=connections', institutionCodes),
    onSuccess: ({ authorizationUrl }) => window.location.assign(authorizationUrl),
    onError: (err) => toast.error(err.message || 'Error al conectar con Google.'),
  });
  const selectionMutation = useMutation({
    mutationFn: ({ id, codes }: { id: string; codes: string[] }) => connectionService.updateInstitutions(id, codes),
    onSuccess: async () => {
      const msg = 'Selección guardada. Los bancos nuevos se importarán en segundo plano.';
      setNotice(msg);
      toast.success(msg);
      await refresh();
    },
    onError: (err) => toast.error(err.message || 'Error al guardar selección de bancos.'),
  });
  const syncMutation = useMutation({
    mutationFn: connectionService.sync,
    onSuccess: async () => {
      const msg = 'Sincronización en cola; continuará en segundo plano.';
      setNotice(msg);
      toast.info(msg);
      await refresh();
    },
    onError: (err) => toast.error(err.message || 'Error al solicitar sincronización.'),
  });
  const disconnectMutation = useMutation({
    mutationFn: connectionService.disconnect,
    onSuccess: async () => {
      toast.info('Conexión desvinculada.');
      await refresh();
    },
    onError: (err) => toast.error(err.message || 'Error al desvincular.'),
  });
  const exportMutation = useMutation({
    mutationFn: accountService.exportData,
    onSuccess: (blob) => {
      downloadBlob(blob, `cuadre-account-export-${new Date().toISOString().slice(0, 10)}.json`);
      toast.success('Archivo de exportación descargado.');
    },
    onError: (err) => toast.error(err.message || 'Error al exportar datos.'),
  });
  const deleteMutation = useMutation({
    mutationFn: accountService.deleteAccount,
    onSuccess: onAccountDeleted,
    onError: (err) => toast.error(err.message || 'Error al eliminar la cuenta.'),
  });
  const emailPreferencesMutation = useMutation({
    mutationFn: proactiveService.updateEmailPreferences,
    onSuccess: async () => {
      const msg = 'Preferencias de correo guardadas.';
      setNotice(msg);
      toast.success(msg);
      await refresh();
    },
    onError: (err) => {
      setNotice('');
      toast.error(err.message || 'No se pudieron guardar las preferencias.');
    },
  });
  const emailTestMutation = useMutation({
    mutationFn: () => proactiveService.sendWeeklyDigestTest({ currency: 'DOP' }),
    onSuccess: ({ mode }) => {
      const msg = mode === 'SMTP' ? 'Correo de prueba enviado con éxito.' : 'Prueba registrada en modo auditoría.';
      setNotice(msg);
      toast.success(msg);
    },
    onError: (err) => {
      setNotice('');
      toast.error(err.message || 'No se pudo enviar el correo de prueba.');
    },
  });
  const error = query.error || google.error || selectionMutation.error || syncMutation.error || disconnectMutation.error || exportMutation.error || deleteMutation.error || emailPreferencesMutation.error || emailTestMutation.error;
  const busy = google.isPending ? 'google' : syncMutation.isPending ? `sync:${syncMutation.variables ?? ''}` :
    selectionMutation.isPending ? `selection:${selectionMutation.variables?.id ?? ''}` :
    disconnectMutation.isPending ? `disconnect:${disconnectMutation.variables ?? ''}` : exportMutation.isPending ? 'export' :
      deleteMutation.isPending ? 'delete' : emailPreferencesMutation.isPending ? 'email-preferences' : emailTestMutation.isPending ? 'email-test' : '';
  return {
    connections: query.data?.connections ?? [], institutions: query.data?.institutions ?? [],
    emailPreferences: query.data?.emailPreferences,
    newBankSelection, setNewBankSelection, bankSelections,
    setBankSelection: (id: string, codes: string[]) => setBankSelections((current) => ({ ...current, [id]: codes })),
    confirmation, setConfirmation, notice, error: error?.message ?? '', diagnosticError: error, busy,
    startGoogle: (codes = newBankSelection) => google.mutate(codes),
    saveSelection: (id: string) => selectionMutation.mutate({
      id,
      codes: bankSelections[id] ?? query.data?.connections.find((connection) => connection.id === id)?.selectedInstitutionCodes ?? [],
    }),
    sync: (id: string) => syncMutation.mutate(id),
    disconnect: (id: string) => disconnectMutation.mutate(id), exportData: () => exportMutation.mutate(),
    deleteAccount: () => deleteMutation.mutate(),
    updateEmailPreferences: (input: UpdateEmailNotificationPreferencesInput) => emailPreferencesMutation.mutate(input),
    sendEmailTest: () => emailTestMutation.mutate(),
  };
}

export type AccountSettingsModel = ReturnType<typeof useAccountSettings>;
