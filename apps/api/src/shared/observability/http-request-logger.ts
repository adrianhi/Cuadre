import type { NextFunction, Request, Response } from 'express';
import { config } from '../../config';
import { logger } from './logger';

function safePath(req: Request): string {
  const route = req.route?.path;
  if (typeof route === 'string') return `${req.baseUrl}${route}`;
  try {
    const url = new URL(req.originalUrl, 'http://localhost');
    return url.pathname
      .replace(/(\/(?:api\/v1\/public\/)?coro\/)[^/]+/i, '$1[REDACTED]')
      .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, ':id');
  } catch {
    return req.path;
  }
}

export function shouldLogRequest(req: Request, statusCode: number, durationMs: number, random = Math.random()): boolean {
  const path = safePath(req);
  if (statusCode < 400 && (path.endsWith('/health') || path.includes('/internal/maintenance/tick'))) return false;
  if (statusCode >= 400 || durationMs >= config.slowRequestMs) return true;
  if (!['GET', 'HEAD'].includes(req.method)) return true;
  return random < config.requestLogSampleRate;
}

export function httpRequestLogger(req: Request, res: Response, next: NextFunction) {
  const startedAt = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    if (!shouldLogRequest(req, res.statusCode, durationMs)) return;
    const context = {
      requestId: req.requestId,
      method: req.method,
      route: safePath(req),
      statusCode: res.statusCode,
      durationMs,
    };
    if (res.statusCode >= 500) logger.error('http_request_completed', context);
    else if (res.statusCode >= 400 || durationMs >= config.slowRequestMs) logger.warn('http_request_completed', context);
    else logger.info('http_request_completed', context);
  });
  next();
}
