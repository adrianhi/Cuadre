import type { InboxConnection } from '../api/connection.service';

export interface ConnectionStatusInfo {
  label: string;
  dot: string;
}

export function getConnectionStatus(connection?: InboxConnection): ConnectionStatusInfo {
  if (!connection || connection.status === 'REVOKED') {
    return { label: 'Gmail desconectado', dot: 'bg-slate-400' };
  }
  if (connection.requiresBankSelection || ['REAUTH_REQUIRED', 'ERROR'].includes(connection.status)) {
    return { label: 'Gmail requiere atención', dot: 'bg-red-500' };
  }
  if (connection.currentJob?.status === 'PENDING' || connection.currentJob?.status === 'PROCESSING') {
    return { label: 'Sincronizando Gmail', dot: 'bg-blue-500 animate-pulse' };
  }
  if (connection.status === 'ACTIVE') {
    return { label: 'Gmail al día', dot: 'bg-emerald-500' };
  }
  return { label: 'Conectando Gmail', dot: 'bg-amber-500' };
}
