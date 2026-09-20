import type { InboxConnection } from '../api/connection.service';

function getConnectionStatus(connection?: InboxConnection) {
  if (!connection || connection.status === 'REVOKED') return { label: 'Gmail desconectado', dot: 'bg-slate-400' };
  if (connection.requiresBankSelection || ['REAUTH_REQUIRED', 'ERROR'].includes(connection.status)) {
    return { label: 'Gmail requiere atención', dot: 'bg-red-500' };
  }
  if (connection.currentJob?.status === 'PENDING' || connection.currentJob?.status === 'PROCESSING') {
    return { label: 'Sincronizando Gmail', dot: 'bg-blue-500 animate-pulse' };
  }
  if (connection.status === 'ACTIVE') return { label: 'Gmail al día', dot: 'bg-emerald-500' };
  return { label: 'Conectando Gmail', dot: 'bg-amber-500' };
}

export function ConnectionStatusBadge({ connection, showLabel = true }: { connection?: InboxConnection; showLabel?: boolean }) {
  const status = getConnectionStatus(connection);
  return <span className="inline-flex min-w-0 items-center gap-1.5" title={status.label} aria-label={status.label}>
    <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} aria-hidden="true" />
    {showLabel && <span className="truncate text-[10px] text-muted-foreground">{status.label}</span>}
  </span>;
}

