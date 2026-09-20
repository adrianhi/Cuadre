import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearCoroToken, getCoroToken, saveCoroToken } from './token-storage';

function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('coro participant token storage', () => {
  beforeEach(() => vi.stubGlobal('window', { localStorage: storage() }));

  it('aisla el token por grupo y permite revocarlo localmente', () => {
    const token = 'a'.repeat(43);
    saveCoroToken('group-a', token);
    expect(getCoroToken('group-a')).toBe(token);
    expect(getCoroToken('group-b')).toBeUndefined();
    clearCoroToken('group-a');
    expect(getCoroToken('group-a')).toBeUndefined();
  });

  it('ignora valores con formato inseguro', () => {
    saveCoroToken('group-a', 'short');
    expect(getCoroToken('group-a')).toBeUndefined();
  });
});
