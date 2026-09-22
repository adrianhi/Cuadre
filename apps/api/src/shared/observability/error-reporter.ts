import * as Sentry from '@sentry/node';
import { sanitizeLogContext, sanitizeText } from './redaction';

let enabled = false;

export function initializeErrorReporter() {
  if (enabled) return;
  const dsn = process.env.ERROR_TRACKING_DSN?.trim();
  if (!dsn || process.env.NODE_ENV === 'test') return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || 'local',
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend(event) {
      if (event.request) event.request = { method: event.request.method };
      event.user = undefined;
      event.breadcrumbs = undefined;
      event.exception?.values?.forEach((value) => {
        if (value.value) value.value = sanitizeText(value.value);
      });
      event.extra = event.extra ? sanitizeLogContext(event.extra) : event.extra;
      return event;
    },
  });
  enabled = true;
}

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (!enabled) return;
  Sentry.withScope((scope) => {
    Object.entries(sanitizeLogContext(context)).forEach(([key, value]) => scope.setExtra(key, value));
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
  });
}

export async function flushErrorReporter(timeoutMs = 2_000) {
  if (enabled) await Sentry.flush(timeoutMs);
}
