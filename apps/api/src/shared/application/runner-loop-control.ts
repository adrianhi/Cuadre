export interface RunnerDelays {
  idleDelayMs: number;
  busyDelayMs: number;
  errorDelayMs: number;
}

type Waiter = {
  interruptOnWork: boolean;
  finish(): void;
};

/** Coordinates wakeable runner waits without losing notifications between a poll and its delay. */
export class RunnerLoopControl {
  private workVersion = 0;
  private readonly waiters = new Set<Waiter>();

  get version() {
    return this.workVersion;
  }

  notifyWork() {
    this.workVersion += 1;
    for (const waiter of [...this.waiters]) {
      if (waiter.interruptOnWork) waiter.finish();
    }
  }

  wait(delayMs: number, observedVersion: number, interruptOnWork = true): Promise<void> {
    if (delayMs <= 0 || (interruptOnWork && observedVersion !== this.workVersion)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const waiter: Waiter = {
        interruptOnWork,
        finish: () => {
          if (!this.waiters.delete(waiter)) return;
          if (timer) clearTimeout(timer);
          resolve();
        },
      };
      this.waiters.add(waiter);
      timer = setTimeout(waiter.finish, delayMs);

      // Close the race where work arrives after the first version check but
      // before the waiter is registered.
      if (interruptOnWork && observedVersion !== this.workVersion) waiter.finish();
    });
  }

  interruptAll() {
    for (const waiter of [...this.waiters]) waiter.finish();
  }
}
