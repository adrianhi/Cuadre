import { Request, Response } from 'express';
import { config } from '../config';
import { AppError } from '../errors/app-error';
import type { IngestionRunner } from '../ingestion/ingestion-runner';
import type { RecurringRunner } from '../modules/recurring';
import type { EngagementService } from '../modules/engagement';
import type { ProactiveEmailRunner } from '../modules/proactivity';
import { hasValidBearerToken } from '../shared/http/internal-auth';
import { logger } from '../shared/observability/logger';

async function notifyHeartbeat() {
  if (!config.maintenanceHeartbeatUrl) return;
  try {
    const response = await fetch(config.maintenanceHeartbeatUrl, { signal: AbortSignal.timeout(2_000) });
    if (!response.ok) throw new Error(`Heartbeat responded with HTTP ${response.status}`);
  } catch (error) {
    logger.warn('maintenance_heartbeat_failed', { errorName: error instanceof Error ? error.name : 'UnknownError' });
  }
}

export class MaintenanceController {
  public constructor(
    private readonly ingestionRunner: IngestionRunner,
    private readonly recurringRunner: RecurringRunner,
    private readonly emailRunner: ProactiveEmailRunner,
    private readonly engagement: EngagementService,
  ) {}

  public tick = async (req: Request, res: Response) => {
    if (!config.maintenanceSecret) {
      throw new AppError(503, 'MAINTENANCE_DISABLED', 'Maintenance endpoint is not configured.');
    }
    if (!hasValidBearerToken(req.header('authorization'), config.maintenanceSecret)) {
      throw new AppError(401, 'INVALID_MAINTENANCE_TOKEN', 'Maintenance token is invalid.');
    }
    const [ingestion, recurring, email] = await Promise.all([
      this.ingestionRunner.maintenanceTick(4_000),
      this.recurringRunner.maintenanceTick(4_000),
      this.emailRunner.maintenanceTick(4_000),
      this.engagement.pruneExpired(),
    ]);
    const data = { ...ingestion, ...recurring, ...email };
    await notifyHeartbeat();
    logger.info('maintenance_tick_completed', data);
    res.status(200).json({ success: true, data });
  };
}
