import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/observability/logger';
import { recordDatabaseQuery } from '../shared/observability/database-metrics';
import { config } from './index';

// Load .env from current directory or monorepo root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function querySummary(query: string) {
  const normalized = query.replace(/\s+/g, ' ').trim();
  return {
    operation: normalized.split(' ', 1)[0]?.toUpperCase() || 'UNKNOWN',
    fingerprint: crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16),
  };
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });
  client.$on('query', (event) => {
    const slow = event.duration >= config.slowQueryMs;
    recordDatabaseQuery(event.duration, slow);
    if (config.dbQueryLogMode === 'off') return;
    if (config.dbQueryLogMode === 'all' && config.nodeEnv !== 'production') {
      logger.debug('database_query_completed', {
        durationMs: event.duration,
        target: event.target,
        query: event.query,
        parameters: event.params,
      });
      return;
    }
    if (slow) logger.warn('database_slow_query', { durationMs: event.duration, target: event.target, ...querySummary(event.query) });
  });
  client.$on('warn', (event) => logger.warn('database_warning', { message: event.message, target: event.target }));
  client.$on('error', (event) => logger.error('database_client_error', { message: event.message, target: event.target }));
  return client;
}

type DatabaseClient = ReturnType<typeof createPrismaClient>;

declare global {
  // eslint-disable-next-line no-var
  var prisma: DatabaseClient | undefined;
}

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('database_connected');
  } catch (error) {
    logger.error('database_connection_failed', { errorName: error instanceof Error ? error.name : 'UnknownError' });
    throw error;
  }
}

export async function disconnectDB() {
  await prisma.$disconnect();
  logger.info('database_disconnected');
}
