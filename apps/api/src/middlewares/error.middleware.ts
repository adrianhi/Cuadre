import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config';
import { AppError } from '../errors/app-error';
import { logger } from '../shared/observability/logger';
import { reportError } from '../shared/observability/error-reporter';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  void req;
  void next;
  if (err instanceof ZodError) {
    logger.debug('request_validation_failed', { requestId: req.requestId, route: req.path, method: req.method });
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid data.',
        requestId: req.requestId,
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  if (
    err instanceof Error
    && err.name === 'PrismaClientKnownRequestError'
    && 'code' in err
  ) {
    if (err.code === 'P2002') {
      logger.warn('request_resource_conflict', { requestId: req.requestId, route: req.path, method: req.method });
      res.status(409).json({
        success: false,
        error: {
          code: 'RESOURCE_CONFLICT',
          message: 'A record with this unique identifier already exists.',
          requestId: req.requestId,
        },
      });
      return;
    }
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const context = {
    requestId: req.requestId,
    route: req.path,
    method: req.method,
    errorCode: code,
    errorName: err instanceof Error ? err.name : 'UnknownError',
    errorMessage: err instanceof Error ? err.message : String(err),
  };
  if (config.nodeEnv !== 'test') {
    if (statusCode >= 500) {
      logger.error('request_failed', context);
      reportError(err, context);
    } else if (statusCode === 429 || statusCode >= 409) {
      logger.warn('request_rejected', context);
    } else {
      logger.debug('request_rejected', context);
    }
  }
  const message =
    err instanceof AppError
      ? err.message
      : statusCode >= 500
        ? 'An unexpected error occurred.'
        : err instanceof Error
          ? err.message || 'Request failed.'
          : 'Request failed.';
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      requestId: req.requestId,
      ...(err instanceof AppError && err.details ? { details: err.details } : {}),
    },
  });
}
