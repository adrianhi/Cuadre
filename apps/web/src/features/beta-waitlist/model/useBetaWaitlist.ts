import { useState, useTransition } from 'react';
import { isValidEmail, saveInviteCode } from '@/shared/lib';
import { betaWaitlistService } from '../api/beta-waitlist.service';

export function useBetaWaitlist(options?: { source?: string; campaignCode?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [activationUrl, setActivationUrl] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setStatus('error');
      setMessage('Por favor, introduce un correo electrónico válido.');
      return;
    }

    setStatus('loading');
    setMessage('');

    startTransition(async () => {
      try {
        const result = await betaWaitlistService.register({
          email: cleanEmail,
          source: options?.source || 'LANDING_HERO',
          campaignCode: options?.campaignCode,
        });

        if (result.inviteCode) {
          setInviteCode(result.inviteCode);
          saveInviteCode(result.inviteCode);
        }
        if (result.activationUrl) {
          setActivationUrl(result.activationUrl);
        }

        setStatus('success');
        setMessage(result.message || '¡Tu acceso a la beta está listo!');
      } catch (err: unknown) {
        setStatus('error');
        const errMessage = err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Hubo un error al registrarte. Inténtalo más tarde.';
        setMessage(errMessage);
      }
    });
  };

  return {
    email,
    setEmail,
    emailHasValue: email.trim().length > 0,
    emailIsValid: isValidEmail(email),
    status,
    message,
    activationUrl,
    inviteCode,
    loading: status === 'loading' || isPending,
    handleSubmit,
    reset: () => {
      setEmail('');
      setStatus('idle');
      setMessage('');
      setActivationUrl(null);
      setInviteCode(null);
    },
  };
}
