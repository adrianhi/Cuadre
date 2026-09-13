import { beforeEach, describe, expect, it, vi } from 'vitest';

const { signInWithOAuth } = vi.hoisted(() => ({ signInWithOAuth: vi.fn() }));

vi.mock('@/shared/lib', () => ({
  supabase: {
    auth: {
      signInWithOAuth,
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
      signInWithOtp: vi.fn(),
    },
  },
}));

import { authService } from './auth.service';

describe('authService.signInWithGoogle', () => {
  beforeEach(() => {
    signInWithOAuth.mockReset();
    signInWithOAuth.mockResolvedValue({ error: null });
  });

  it('forces the Google account selector for an invited user', async () => {
    await authService.signInWithGoogle('https://cuadre.test/auth/callback', { selectAccount: true });

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'https://cuadre.test/auth/callback',
        queryParams: { prompt: 'select_account' },
      },
    });
  });

  it('keeps the regular Google login free of an extra account prompt', async () => {
    await authService.signInWithGoogle('https://cuadre.test/auth/callback');

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'https://cuadre.test/auth/callback' },
    });
  });
});
