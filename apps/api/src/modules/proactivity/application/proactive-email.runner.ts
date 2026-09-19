import { logger } from '../../../shared/observability/logger';
import { RunnerLoopControl, type RunnerDelays } from '../../../shared/application/runner-loop-control';
import { ProactiveEmailScheduler } from './proactive-email.scheduler';
import { ProactiveEmailService } from './proactive-email.service';

const delay = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export class ProactiveEmailRunner {
  private running = false;
  private loopPromise: Promise<void> | null = null;
  private activeCycle: Promise<boolean> | null = null;
  private nextScheduleAt = 0;
  private nextPruneAt = 0;

  constructor(
    private readonly scheduler: ProactiveEmailScheduler,
    private readonly service: ProactiveEmailService,
    private readonly delays: RunnerDelays,
    private readonly control: RunnerLoopControl,
  ) {}

  start() {
    if (this.running) return;
    this.running = true; this.loopPromise = this.loop();
    logger.info('proactive_email_runner_started', { ...this.delays });
  }

  async stop(timeoutMs = 25_000) {
    this.running = false;
    this.control.interruptAll();
    if (this.loopPromise) await Promise.race([this.loopPromise, delay(timeoutMs)]);
    logger.info('proactive_email_runner_stopped');
  }

  async maintenanceTick(timeBudgetMs = 4_000) {
    const started = Date.now(); let processed = 0;
    await this.scheduler.scheduleDue(new Date(started), started + Math.floor(timeBudgetMs * 0.6));
    while (Date.now() - started < timeBudgetMs && await this.runCycle(false)) processed++;
    return { emailProcessed: processed };
  }

  private async loop() {
    while (this.running) {
      const observedVersion = this.control.version;
      try {
        const processed = await this.runCycle(true);
        if (!this.running) break;
        await this.control.wait(
          processed ? this.delays.busyDelayMs : this.delays.idleDelayMs,
          observedVersion,
        );
      } catch (error) {
        logger.error('proactive_email_runner_cycle_failed', { errorName: error instanceof Error ? error.name : 'UnknownError' });
        if (!this.running) break;
        await this.control.wait(this.delays.errorDelayMs, this.control.version, false);
      }
    }
  }

  private runCycle(schedule: boolean) {
    if (this.activeCycle) return this.activeCycle;
    this.activeCycle = this.performCycle(schedule).finally(() => { this.activeCycle = null; });
    return this.activeCycle;
  }

  private async performCycle(schedule: boolean) {
    const now = Date.now();
    if (schedule && now >= this.nextScheduleAt) {
      await this.scheduler.scheduleDue(new Date(now)); this.nextScheduleAt = now + 60_000;
    }
    if (now >= this.nextPruneAt) {
      await this.service.prunePayloads(new Date(now)); this.nextPruneAt = now + 3_600_000;
    }
    return (await this.service.processNext()).processed;
  }
}
