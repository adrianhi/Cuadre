export interface DatabaseMetricsSnapshot {
  observedQueries: number;
  slowQueries: number;
  maxDurationMs: number;
  lastSlowQueryAt: string | null;
}

const metrics = {
  observedQueries: 0,
  slowQueries: 0,
  maxDurationMs: 0,
  lastSlowQueryAt: null as string | null,
};

export function recordDatabaseQuery(durationMs: number, slow: boolean) {
  metrics.observedQueries += 1;
  metrics.maxDurationMs = Math.max(metrics.maxDurationMs, durationMs);
  if (slow) {
    metrics.slowQueries += 1;
    metrics.lastSlowQueryAt = new Date().toISOString();
  }
}

export function databaseMetricsSnapshot(): DatabaseMetricsSnapshot {
  return { ...metrics };
}
