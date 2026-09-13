import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiClientError, configureHttpAuth } from '@/shared/api';
import { authService } from '../api/auth.service';
import type { ProductGuideState } from '@bills/contracts';
import { captureInviteCode, clearInviteCode, getInviteCode } from './invite-context';

const EMPTY_GUIDE: ProductGuideState = { currentVersion: '', versionSeen: null, completedAt: null, completed: false };
export interface AuthSetupError { code: string; message: string }

const RETAIN_INVITE_ERRORS = new Set(['BETA_INVITE_EMAIL_MISMATCH']);
const CLEAR_INVITE_ERRORS = new Set(['BETA_INVITE_INVALID', 'BETA_INVITE_EXPIRED']);

export function useAuthSession() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [setupError, setSetupError] = useState<AuthSetupError | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [legalAcceptanceRequired, setLegalAcceptanceRequired] = useState(false);
  const [productGuide, setProductGuide] = useState<ProductGuideState>(EMPTY_GUIDE);
  const tokenRef = useRef<string | null>(null);
  const activatingTokenRef = useRef<string | null>(null);
  const rejectedErrorRef = useRef<AuthSetupError | null>(null);
  const inviteCodeRef = useRef(captureInviteCode());

  const clearSession = useCallback((clearError = true) => {
    tokenRef.current = null;
    setAuthToken(null);
    setOnboardingComplete(false);
    setLegalAcceptanceRequired(false);
    setProductGuide(EMPTY_GUIDE);
    if (clearError) setSetupError(null);
  }, []);

  const handleLock = useCallback(async () => {
    rejectedErrorRef.current = null;
    clearSession();
    await authService.signOut();
  }, [clearSession]);

  useEffect(() => {
    configureHttpAuth({ getToken: () => tokenRef.current, onUnauthorized: clearSession });
  }, [clearSession]);

  useEffect(() => {
    let active = true;

    const activateSession = async (token?: string) => {
      if (!active) return;
      if (!token) {
        activatingTokenRef.current = null;
        clearSession(!rejectedErrorRef.current);
        if (rejectedErrorRef.current) setSetupError(rejectedErrorRef.current);
        setCheckingSession(false);
        return;
      }
      if (activatingTokenRef.current === token) return;
      activatingTokenRef.current = token;
      tokenRef.current = token;
      setCheckingSession(true);
      setSetupError(null);
      try {
        const bootstrap = await authService.bootstrap(token, inviteCodeRef.current || getInviteCode());
        if (!active) return;
        rejectedErrorRef.current = null;
        clearInviteCode();
        inviteCodeRef.current = undefined;
        setAuthToken(token);
        setLegalAcceptanceRequired(bootstrap.legalAcceptanceRequired);
        setOnboardingComplete(bootstrap.onboardingComplete);
        setProductGuide(bootstrap.productGuide);
      } catch (error) {
        if (active) {
          const setup = error instanceof ApiClientError
            ? { code: error.code, message: error.message }
            : { code: 'SESSION_SETUP_FAILED', message: error instanceof Error ? error.message : 'No se pudo iniciar la sesión.' };
          rejectedErrorRef.current = setup;
          if (CLEAR_INVITE_ERRORS.has(setup.code)) {
            clearInviteCode();
            inviteCodeRef.current = undefined;
          } else if (!RETAIN_INVITE_ERRORS.has(setup.code)) {
            inviteCodeRef.current = getInviteCode();
          }
          clearSession(false);
          setSetupError(setup);
          window.setTimeout(() => { void authService.signOut().catch(() => undefined); }, 0);
        }
      } finally {
        activatingTokenRef.current = null;
        if (active) setCheckingSession(false);
      }
    };

    authService.getSession()
      .then((session) => activateSession(session?.access_token))
      .catch((error: unknown) => {
        if (active) {
          setSetupError({ code: 'SESSION_CHECK_FAILED', message: error instanceof Error ? error.message : 'No se pudo comprobar la sesión.' });
          setCheckingSession(false);
        }
      });
    const subscription = authService.onSessionChange((_event, session) => {
      void activateSession(session?.access_token);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [clearSession]);

  return {
    authToken,
    checkingSession,
    setupError,
    onboardingComplete,
    setOnboardingComplete,
    legalAcceptanceRequired,
    setLegalAcceptanceRequired,
    productGuide,
    setProductGuide,
    handleLock,
  };
}
