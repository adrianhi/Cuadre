import type { IngestionJobProcessor } from '../modules/ingestion/application/ingestion-job.port';
import { RunnerLoopControl, type RunnerDelays } from '../shared/application/runner-loop-control';
import { logger } from '../shared/observability/logger';
import { runnerStateRegistry } from '../shared/observability/runner-state';

type CycleResult = {
  gmailProcessed: boolean;
};

const delay = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

/**
 * Coordinates Gmail ingestion in the API process. Database leases remain
 * the source of truth, so an HTTP cron tick and the resident loop can safely race.
 */
export class IngestionRunner {
  private running = false;
  private loopPromise: Promise<void> | null = null;
  private activeCycle: Promise<CycleResult> | null = null;
  private nextScheduleAt = 0;

  public constructor(
    private readonly jobs: IngestionJobProcessor,
    private readonly delays: RunnerDelays,
    private readonly control: RunnerLoopControl,
  ) {}

  public start() {
    if (this.running) return;
    this.running = true;
    this.loopPromise = this.loop();
    runnerStateRegistry.started('ingestion');
    logger.info('ingestion_runner_started', { ...this.delays });
  }

  public async stop(timeoutMs = 25_000) {
    this.running = false;
    this.control.interruptAll();
    const pending = this.loopPromise;
    if (pending) await Promise.race([pending, delay(timeoutMs)]);
    runnerStateRegistry.stopped('ingestion');
    logger.info('ingestion_runner_stopped');
  }

  public async maintenanceTick(timeBudgetMs = 8_000) {
    const startedAt = Date.now();
    let gmailProcessed = 0;
    let firstCycle = true;

    while (Date.now() - startedAt < timeBudgetMs) {
      const result = await this.runCycle(firstCycle);
      firstCycle = false;
      if (result.gmailProcessed) gmailProcessed += 1;
      if (!result.gmailProcessed) break;
    }

    return { gmailProcessed, durationMs: Date.now() - startedAt };
  }

  private async loop() {
    while (this.running) {
      const observedVersion = this.control.version;
      try {
        const result = await this.runCycle(false);
        if (!this.running) break;
        await this.control.wait(
          result.gmailProcessed ? this.delays.busyDelayMs : this.delays.idleDelayMs,
          observedVersion,
        );
      } catch (error) {
        logger.error('embedded_worker_cycle_failed', {
          errorName: error instanceof Error ? error.name : 'UnknownError',
        });
        if (!this.running) break;
        await this.control.wait(this.delays.errorDelayMs, this.control.version, false);
      }
    }
  }

  private runCycle(forceSchedule: boolean): Promise<CycleResult> {
    if (this.activeCycle) return this.activeCycle;
    const startedAt = Date.now();
    runnerStateRegistry.cycleStarted('ingestion');
    this.activeCycle = this.performCycle(forceSchedule)
      .then((result) => {
        runnerStateRegistry.cycleSucceeded('ingestion', startedAt, result.gmailProcessed);
        return result;
      })
      .catch((error) => {
        runnerStateRegistry.cycleFailed('ingestion', startedAt, error);
        throw error;
      })
      .finally(() => { this.activeCycle = null; });
    return this.activeCycle;
  }

  private async performCycle(forceSchedule: boolean): Promise<CycleResult> {
    const now = Date.now();
    if (forceSchedule || now >= this.nextScheduleAt) {
      await this.jobs.scheduleDue();
      this.nextScheduleAt = now + 60_000;
    }

    const gmailProcessed = await this.jobs.processNext();
    return { gmailProcessed };
  }
}
