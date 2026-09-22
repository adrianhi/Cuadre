import { describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Request } from 'express';
import { createApp } from '../src/app';
import { config } from '../src/config';
import { hasValidBearerToken } from '../src/shared/http/internal-auth';
import { shouldLogRequest } from '../src/shared/observability/http-request-logger';
import { sanitizeLogContext } from '../src/shared/observability/redaction';

describe('backend observability', () => {
  it('redacts credentials and financial context recursively', () => {
    const safe = sanitizeLogContext({
      requestId: 'request-1',
      authorization: 'Bearer super-secret',
      nested: { email: 'person@example.com', amount: 500, errorCode: 'JOB_FAILED' },
      message: 'Contact person@example.com using Bearer abc.def.ghi',
    });
    expect(safe).toMatchObject({
      requestId: 'request-1',
      authorization: '[REDACTED]',
      nested: { email: '[REDACTED]', amount: '[REDACTED]', errorCode: 'JOB_FAILED' },
    });
    expect(JSON.stringify(safe)).not.toContain('person@example.com');
    expect(JSON.stringify(safe)).not.toContain('abc.def.ghi');
  });

  it('uses timing-safe bearer token validation', () => {
    expect(hasValidBearerToken('Bearer exact-secret', 'exact-secret')).toBe(true);
    expect(hasValidBearerToken('Bearer wrong-secret', 'exact-secret')).toBe(false);
    expect(hasValidBearerToken(undefined, 'exact-secret')).toBe(false);
  });

  it('suppresses successful health noise while retaining writes and slow reads', () => {
    const originalSample = config.requestLogSampleRate;
    config.requestLogSampleRate = 0;
    try {
      const health = { method: 'GET', originalUrl: '/api/v1/health', path: '/v1/health' } as Request;
      const write = { method: 'POST', originalUrl: '/api/v1/transactions', path: '/v1/transactions' } as Request;
      const read = { method: 'GET', originalUrl: '/api/v1/transactions', path: '/v1/transactions' } as Request;
      expect(shouldLogRequest(health, 200, 5, 1)).toBe(false);
      expect(shouldLogRequest(write, 201, 20, 1)).toBe(true);
      expect(shouldLogRequest(read, 200, config.slowRequestMs + 1, 1)).toBe(true);
      expect(shouldLogRequest(read, 200, 20, 1)).toBe(false);
    } finally {
      config.requestLogSampleRate = originalSample;
    }
  });

  it('returns a correlation id for unknown API routes', async () => {
    const response = await request(createApp()).get('/api/v1/definitely-missing');
    expect(response.status).toBe(404);
    expect(response.headers['x-request-id']).toBeTruthy();
    expect(response.body.error.requestId).toBe(response.headers['x-request-id']);
  });

  it('protects the operations endpoint before reading the database', async () => {
    const original = config.maintenanceSecret;
    config.maintenanceSecret = 'test-operations-secret';
    try {
      const response = await request(createApp()).get('/api/v1/internal/ops/status');
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_OPERATIONS_TOKEN');
      expect(response.body.error.requestId).toBeTruthy();
    } finally {
      config.maintenanceSecret = original;
    }
  });
});
