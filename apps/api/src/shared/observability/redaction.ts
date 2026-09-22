const sensitiveKey = /(?:authorization|cookie|password|secret|token|payload|body|rawContent|email|recipient|accountNumber|phone|merchant|amount|slug|inviteUrl)/i;

export function sanitizeText(value: string): string {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [REDACTED]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
    .replace(/([?&](?:token|code|invite)=)[^&\s]+/gi, '$1[REDACTED]')
    .replace(/(\/(?:api\/v1\/public\/)?coro\/)[^/?\s]+/gi, '$1[REDACTED]');
}

function sanitizeValue(value: unknown, depth: number): unknown {
  if (depth > 5) return '[TRUNCATED]';
  if (typeof value === 'string') return sanitizeText(value);
  if (Array.isArray(value)) return value.slice(0, 25).map((item) => sanitizeValue(item, depth + 1));
  if (!value || typeof value !== 'object') return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) {
    return { name: value.name, message: sanitizeText(value.message), stack: sanitizeText(value.stack || '') };
  }
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [
    key,
    sensitiveKey.test(key) ? '[REDACTED]' : sanitizeValue(item, depth + 1),
  ]));
}

export function sanitizeLogContext(context: Record<string, unknown>): Record<string, unknown> {
  return sanitizeValue(context, 0) as Record<string, unknown>;
}
