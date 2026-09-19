import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Static asset caching and CORS isolation', () => {
  const app = createApp();

  it('serves static assets without credentialed CORS headers and with long-lived public cache', async () => {
    const res = await request(app).get('/favicon.svg');
    if (res.status === 200) {
      expect(res.headers['cache-control']).toMatch(/public/);
      expect(res.headers['access-control-allow-credentials']).toBeUndefined();
      expect(res.headers['vary']).toBeUndefined();
    }
  });

  it('protects /api routes with private no-store cache headers', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['cache-control']).toBe('private, no-store, max-age=0, must-revalidate');
  });

  it('applies CORS credentials on /api routes when origin is provided', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
