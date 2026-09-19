import { RunnerLoopControl, type RunnerDelays } from '../../../shared/application/runner-loop-control';
import { logger } from '../../../shared/observability/logger';

export class RuleApplicationRunner {
  private running = false;
  private loopPromise: Promise<void> | null = null;
  constructor(
    private readonly processor: { processNext(): Promise<boolean> },
    private readonly delays: RunnerDelays,
    private readonly control: RunnerLoopControl,
  ) {}
  start() {
    if (this.running) return;
    this.running = true;
    this.loopPromise = this.loop();
    logger.info('rule_application_runner_started', { ...this.delays });
  }
  async stop() {
    this.running = false;
    this.control.interruptAll();
    if (this.loopPromise) await this.loopPromise;
    logger.info('rule_application_runner_stopped');
  }
  private async loop() {
    while (this.running) {
      const observedVersion = this.control.version;
      try {
        const processed = await this.processor.processNext();
        if (!this.running) break;
        await this.control.wait(
          processed ? this.delays.busyDelayMs : this.delays.idleDelayMs,
          observedVersion,
        );
      } catch {
        logger.error('rule_application_worker_failed');
        if (!this.running) break;
        await this.control.wait(this.delays.errorDelayMs, this.control.version, false);
      }
    }
  }
}
