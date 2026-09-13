import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { captureInviteCode, clearInviteCode, getInviteCode, hasInviteCode } from './invite-context';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('beta invite context', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: { search: '' }, sessionStorage: memoryStorage() });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('captures a valid opaque code for the OAuth round trip', () => {
    const code = 'abcdefghijklmnopqrstuvwxyz_1234567890';
    expect(captureInviteCode(`?invite=${code}`)).toBe(code);
    expect(getInviteCode()).toBe(code);
    expect(hasInviteCode()).toBe(true);
  });

  it('ignores malformed values and clears stored context explicitly', () => {
    expect(captureInviteCode('?invite=<script>')).toBeUndefined();
    const code = 'abcdefghijklmnopqrstuvwxyz_1234567890';
    captureInviteCode(`?invite=${code}`);
    clearInviteCode();
    expect(getInviteCode()).toBeUndefined();
  });
});
