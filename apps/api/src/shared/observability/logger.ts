import pino from 'pino';
import { sanitizeLogContext } from './redaction';

export interface LogContext {
  requestId?: string;
  workspaceId?: string;
  jobId?: string;
  providerEventId?: string;
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

const allowedLevels = new Set(['debug', 'info', 'warn', 'error', 'silent']);
const requestedLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info');
const configuredLevel = process.env.NODE_ENV === 'test'
  ? 'silent'
  : allowedLevels.has(requestedLevel) ? requestedLevel : 'info';

const destination = pino({
  level: configuredLevel,
  messageKey: 'message',
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: 'cuadre-api',
    environment: process.env.NODE_ENV || 'development',
    release: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || 'local',
  },
});

function write(level: 'debug' | 'info' | 'warn' | 'error', message: string, context: LogContext = {}) {
  destination[level](sanitizeLogContext(context), message);
}

export const logger: Logger = {
  debug: (message, context) => write('debug', message, context),
  info: (message, context) => write('info', message, context),
  warn: (message, context) => write('warn', message, context),
  error: (message, context) => write('error', message, context),
};
