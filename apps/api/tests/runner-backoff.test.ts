import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseDelayMs } from '../src/config';
import { IngestionRunner } from '../src/ingestion/ingestion-runner';
import type { IngestionJobProcessor } from '../src/modules/ingestion/application/ingestion-job.port';
import { RuleApplicationRunner } from '../src/modules/categorization/infrastructure/rule-application-runner';
import { ProactiveEmailRunner } from '../src/modules/proactivity/application/proactive-email.runner';
import type { ProactiveEmailScheduler } from '../src/modules/proactivity/application/proactive-email.scheduler';
import type { ProactiveEmailService } from '../src/modules/proactivity/application/proactive-email.service';
import { RecurringRunner } from '../src/modules/recurring/application/recurring-runner';
import type { RecurringJobProcessor } from '../src/modules/recurring/application/recurring.ports';
import { RunnerLoopControl, type RunnerDelays } from '../src/shared/application/runner-loop-control';

const delays: RunnerDelays = { idleDelayMs: 60_000, busyDelayMs: 50, errorDelayMs: 10_000 };

type TestRunner = { start(): void; stop(): Promise<void> };
type Harness = {
  runner: TestRunner;
  control: RunnerLoopControl;
  processNext: ReturnType<typeof vi.fn>;
};

function harness(kind: 'ingestion' | 'rules' | 'recurring' | 'proactive'): Harness {
  const control = new RunnerLoopControl();
  const processNext = vi.fn<() => Promise<boolean>>();
  if (kind === 'ingestion') {
    const jobs = { scheduleDue: vi.fn().mockResolvedValue(undefined), processNext } as unknown as IngestionJobProcessor;
    return { runner: new IngestionRunner(jobs, delays, control), control, processNext };
  }
  if (kind === 'rules') {
    return { runner: new RuleApplicationRunner({ processNext }, delays, control), control, processNext };
  }
  if (kind === 'recurring') {
    const jobs = { scheduleDue: vi.fn().mockResolvedValue(undefined), processNext } as unknown as RecurringJobProcessor;
    return { runner: new RecurringRunner(jobs, delays, control), control, processNext };
  }
  const scheduler = { scheduleDue: vi.fn().mockResolvedValue({}) } as unknown as ProactiveEmailScheduler;
  const service = {
    prunePayloads: vi.fn().mockResolvedValue(0),
    processNext: vi.fn(async () => ({ processed: await processNext(), accepted: false })),
  } as unknown as ProactiveEmailService;
  return { runner: new ProactiveEmailRunner(scheduler, service, delays, control), control, processNext };
}

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('worker delay configuration', () => {
  it('uses defaults for absent or invalid values and clamps valid integers', () => {
    expect(parseDelayMs(undefined, 60_000, 5_000)).toBe(60_000);
    expect(parseDelayMs('invalid', 60_000, 5_000)).toBe(60_000);
    expect(parseDelayMs('10.5', 60_000, 5_000)).toBe(60_000);
    expect(parseDelayMs('1000', 60_000, 5_000)).toBe(5_000);
    expect(parseDelayMs('120000', 60_000, 5_000)).toBe(120_000);
    expect(parseDelayMs('0', 50, 0)).toBe(0);
  });
});

describe.each(['ingestion', 'rules', 'recurring', 'proactive'] as const)('%s runner backoff', (kind) => {
  it('uses the idle delay when the queue is empty', async () => {
    vi.useFakeTimers();
    const { runner, processNext } = harness(kind);
    processNext.mockResolvedValue(false);

    runner.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(processNext).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(delays.idleDelayMs - 1);
    expect(processNext).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(processNext).toHaveBeenCalledTimes(2);
    await runner.stop();
  });

  it('uses the busy delay while draining work', async () => {
    vi.useFakeTimers();
    const { runner, processNext } = harness(kind);
    processNext.mockResolvedValueOnce(true).mockResolvedValue(false);

    runner.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(processNext).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(delays.busyDelayMs - 1);
    expect(processNext).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(processNext).toHaveBeenCalledTimes(2);
    await runner.stop();
  });

  it('does not let work notifications bypass the error delay', async () => {
    vi.useFakeTimers();
    const { runner, control, processNext } = harness(kind);
    processNext.mockRejectedValueOnce(new Error('temporary failure')).mockResolvedValue(false);

    runner.start();
    await vi.advanceTimersByTimeAsync(0);
    control.notifyWork();
    await vi.advanceTimersByTimeAsync(delays.errorDelayMs - 1);
    expect(processNext).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(processNext).toHaveBeenCalledTimes(2);
    await runner.stop();
  });

  it('wakes immediately from idle and stops without waiting for the idle timeout', async () => {
    vi.useFakeTimers();
    const { runner, control, processNext } = harness(kind);
    processNext.mockResolvedValue(false);

    runner.start();
    await vi.advanceTimersByTimeAsync(0);
    control.notifyWork();
    await vi.advanceTimersByTimeAsync(0);
    expect(processNext).toHaveBeenCalledTimes(2);

    await runner.stop();
    await vi.advanceTimersByTimeAsync(delays.idleDelayMs);
    expect(processNext).toHaveBeenCalledTimes(2);
  });
});

describe('race-free runner wakeups', () => {
  it('observes work notified after polling starts but before the idle waiter exists', async () => {
    vi.useFakeTimers();
    const control = new RunnerLoopControl();
    let resolvePoll!: (processed: boolean) => void;
    const processNext = vi.fn()
      .mockImplementationOnce(() => new Promise<boolean>((resolve) => { resolvePoll = resolve; }))
      .mockResolvedValue(false);
    const runner = new RuleApplicationRunner({ processNext }, delays, control);

    runner.start();
    control.notifyWork();
    resolvePoll(false);
    await vi.advanceTimersByTimeAsync(0);

    expect(processNext).toHaveBeenCalledTimes(2);
    await runner.stop();
  });

  it('coalesces repeated notifications into a single immediate follow-up poll', async () => {
    vi.useFakeTimers();
    const control = new RunnerLoopControl();
    let resolvePoll!: (processed: boolean) => void;
    const processNext = vi.fn()
      .mockImplementationOnce(() => new Promise<boolean>((resolve) => { resolvePoll = resolve; }))
      .mockResolvedValue(false);
    const runner = new RuleApplicationRunner({ processNext }, delays, control);

    runner.start();
    control.notifyWork();
    control.notifyWork();
    control.notifyWork();
    resolvePoll(false);
    await vi.advanceTimersByTimeAsync(0);

    expect(processNext).toHaveBeenCalledTimes(2);
    await runner.stop();
  });
});

describe('maintenance ticks', () => {
  it('keeps ingestion and recurring draining until their queues are empty', async () => {
    const ingestionJobs = {
      scheduleDue: vi.fn().mockResolvedValue(undefined),
      processNext: vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(true).mockResolvedValue(false),
    } as unknown as IngestionJobProcessor;
    const recurringJobs = {
      scheduleDue: vi.fn().mockResolvedValue(undefined),
      processNext: vi.fn().mockResolvedValueOnce(true).mockResolvedValue(false),
    } as unknown as RecurringJobProcessor;

    const ingestion = new IngestionRunner(ingestionJobs, delays, new RunnerLoopControl());
    const recurring = new RecurringRunner(recurringJobs, delays, new RunnerLoopControl());

    await expect(ingestion.maintenanceTick()).resolves.toMatchObject({ gmailProcessed: 2 });
    await expect(recurring.maintenanceTick()).resolves.toMatchObject({ recurringProcessed: 1 });
  });

  it('keeps proactive scheduling and draining independent from resident-loop delays', async () => {
    const scheduler = { scheduleDue: vi.fn().mockResolvedValue({}) } as unknown as ProactiveEmailScheduler;
    const service = {
      prunePayloads: vi.fn().mockResolvedValue(0),
      processNext: vi.fn()
        .mockResolvedValueOnce({ processed: true, accepted: true })
        .mockResolvedValue({ processed: false, accepted: false }),
    } as unknown as ProactiveEmailService;
    const runner = new ProactiveEmailRunner(scheduler, service, delays, new RunnerLoopControl());

    await expect(runner.maintenanceTick()).resolves.toEqual({ emailProcessed: 1 });
    expect(scheduler.scheduleDue).toHaveBeenCalledTimes(1);
  });
});
