import type { InboxConnection } from '../api/connection.service';
import { getConnectionStatus } from '../model/connection-status';

export function ConnectionStatusBadge({ connection, showLabel = true }: { connection?: InboxConnection; showLabel?: boolean }) {
  const status = getConnectionStatus(connection);
  return <span className="inline-flex min-w-0 items-center gap-1.5" title={status.label} aria-label={status.label}>
    <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} aria-hidden="true" />
    {showLabel && <span className="truncate text-[10px] text-muted-foreground">{status.label}</span>}
  </span>;
}

