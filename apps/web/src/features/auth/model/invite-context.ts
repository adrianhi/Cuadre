const STORAGE_KEY = 'cuadre.betaInviteCode';
const CODE_PATTERN = /^[A-Za-z0-9_-]{20,128}$/;

export function captureInviteCode(search = window.location.search) {
  const code = new URLSearchParams(search).get('invite')?.trim() || '';
  if (!CODE_PATTERN.test(code)) return getInviteCode();
  window.sessionStorage.setItem(STORAGE_KEY, code);
  return code;
}

export function getInviteCode() {
  const code = window.sessionStorage.getItem(STORAGE_KEY) || '';
  return CODE_PATTERN.test(code) ? code : undefined;
}

export function clearInviteCode() {
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function hasInviteCode() {
  return Boolean(getInviteCode());
}
