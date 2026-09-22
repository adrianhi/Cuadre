export type RunnerName = 'ingestion' | 'ruleApplication' | 'recurring' | 'proactiveEmail';

interface MutableRunnerState {
  running: boolean;
  activeCycle: boolean;
  cycles: number;
  processedCycles: number;
  failures: number;
  startedAt: string | null;
  stoppedAt: string | null;
  lastCycleAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastDurationMs: number | null;
  lastErrorName: string | null;
}

const initialState = (): MutableRunnerState => ({
  running: false, activeCycle: false, cycles: 0, processedCycles: 0, failures: 0,
  startedAt: null, stoppedAt: null, lastCycleAt: null, lastSuccessAt: null,
  lastFailureAt: null, lastDurationMs: null, lastErrorName: null,
});

class RunnerStateRegistry {
  private readonly states: Record<RunnerName, MutableRunnerState> = {
    ingestion: initialState(), ruleApplication: initialState(),
    recurring: initialState(), proactiveEmail: initialState(),
  };

  started(name: RunnerName) {
    Object.assign(this.states[name], { running: true, startedAt: new Date().toISOString(), stoppedAt: null });
  }

  stopped(name: RunnerName) {
    Object.assign(this.states[name], { running: false, activeCycle: false, stoppedAt: new Date().toISOString() });
  }

  cycleStarted(name: RunnerName) {
    Object.assign(this.states[name], { activeCycle: true, lastCycleAt: new Date().toISOString() });
  }

  cycleSucceeded(name: RunnerName, startedAt: number, processed: boolean) {
    const state = this.states[name];
    state.activeCycle = false;
    state.cycles += 1;
    if (processed) state.processedCycles += 1;
    state.lastSuccessAt = new Date().toISOString();
    state.lastDurationMs = Date.now() - startedAt;
    state.lastErrorName = null;
  }

  cycleFailed(name: RunnerName, startedAt: number, error: unknown) {
    const state = this.states[name];
    state.activeCycle = false;
    state.cycles += 1;
    state.failures += 1;
    state.lastFailureAt = new Date().toISOString();
    state.lastDurationMs = Date.now() - startedAt;
    state.lastErrorName = error instanceof Error ? error.name : 'UnknownError';
  }

  snapshot() {
    return Object.fromEntries(Object.entries(this.states).map(([name, state]) => [name, { ...state }]));
  }
}

export const runnerStateRegistry = new RunnerStateRegistry();
