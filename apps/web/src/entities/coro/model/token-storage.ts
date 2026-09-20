const PREFIX = 'cuadre.coro.';

export function getCoroToken(groupId?: string | null): string | undefined {
  if (!groupId || typeof window === 'undefined') return undefined;
  const value = window.localStorage.getItem(`${PREFIX}${groupId}.participantToken`) || '';
  return /^[A-Za-z0-9_-]{40,128}$/.test(value) ? value : undefined;
}

export function saveCoroToken(groupId: string, token: string) {
  if (/^[A-Za-z0-9_-]{40,128}$/.test(token)) {
    window.localStorage.setItem(`${PREFIX}${groupId}.participantToken`, token);
  }
}

export function clearCoroToken(groupId: string) {
  window.localStorage.removeItem(`${PREFIX}${groupId}.participantToken`);
}
