import { createApp } from './app';
import { config, validateRuntimeConfig } from './config';
import { connectDB, disconnectDB } from './config/database';
import { appContainer } from './app-container';
import { logger } from './shared/observability/logger';
import { flushErrorReporter, initializeErrorReporter, reportError } from './shared/observability/error-reporter';

async function bootstrap() {
  initializeErrorReporter();
  validateRuntimeConfig();
  await connectDB();
  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info('http_server_started', { port: config.port, apiBase: '/api/v1', processRole: config.processRole });
  });

  if (config.processRole === 'all' || config.processRole === 'worker') {
    appContainer.ingestionRunner.start();
    appContainer.ruleApplicationRunner.start();
    appContainer.recurringRunner.start();
    appContainer.proactiveEmailRunner.start();
  }

  let shuttingDown = false;
  const shutdown = async (reason = 'signal', exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info('http_server_stopping', { reason });
    await appContainer.ingestionRunner.stop();
    await appContainer.ruleApplicationRunner.stop();
    await appContainer.recurringRunner.stop();
    await appContainer.proactiveEmailRunner.stop();
    server.close(async () => {
      await disconnectDB();
      await flushErrorReporter();
      logger.info('http_server_stopped');
      process.exit(exitCode);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('unhandledRejection', (error) => {
    logger.error('process_unhandled_rejection', { errorName: error instanceof Error ? error.name : 'UnknownError' });
    reportError(error, { source: 'unhandledRejection' });
    void shutdown('unhandledRejection', 1);
  });
  process.on('uncaughtException', (error) => {
    logger.error('process_uncaught_exception', { errorName: error.name });
    reportError(error, { source: 'uncaughtException' });
    void shutdown('uncaughtException', 1);
  });
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch((err) => {
    initializeErrorReporter();
    logger.error('http_server_bootstrap_failed', { errorName: err instanceof Error ? err.name : 'UnknownError' });
    reportError(err, { source: 'bootstrap' });
    void flushErrorReporter().finally(() => process.exit(1));
  });
}
