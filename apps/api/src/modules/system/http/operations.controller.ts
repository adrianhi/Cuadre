import type { Request, Response } from 'express';
import { config } from '../../../config';
import { AppError } from '../../../errors/app-error';
import { hasValidBearerToken } from '../../../shared/http/internal-auth';
import { databaseMetricsSnapshot } from '../../../shared/observability/database-metrics';
import { runnerStateRegistry } from '../../../shared/observability/runner-state';
import type { PrismaOperationsRepository } from '../infrastructure/prisma-operations.repository';

export class OperationsController {
  constructor(private readonly repository: PrismaOperationsRepository) {}

  status = async (req: Request, res: Response) => {
    if (!config.maintenanceSecret) throw new AppError(503, 'OPERATIONS_DISABLED', 'Operations endpoint is not configured.');
    if (!hasValidBearerToken(req.header('authorization'), config.maintenanceSecret)) {
      throw new AppError(401, 'INVALID_OPERATIONS_TOKEN', 'Operations token is invalid.');
    }
    const operational = await this.repository.inspect();
    res.status(200).json({
      success: true,
      data: {
        release: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || 'local',
        environment: config.nodeEnv,
        processRole: config.processRole,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        ...operational,
        databaseMetrics: databaseMetricsSnapshot(),
        runners: runnerStateRegistry.snapshot(),
      },
    });
  };
}
