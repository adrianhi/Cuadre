import { useState } from 'react';
import { CheckCircle2, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react';

interface BetaWaitlistFormProps {
  source?: string;
  className?: string;
}

export function BetaWaitlistForm({ source = 'LANDING_HERO', className = '' }: BetaWaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const emailHasValue = email.trim().length > 0;
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const hasFormatError = emailHasValue && !emailIsValid;
  const isInvalid = status === 'error' || hasFormatError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!emailIsValid) {
      setStatus('error');
      setMessage('Por favor, introduce un correo electrónico válido.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const apiUrl = (import.meta as any).env?.PUBLIC_API_URL || 'https://app.cuadre.com.do/api/v1';
      const res = await fetch(`${apiUrl}/beta-interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          source,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Hubo un error al registrarte. Inténtalo más tarde.');
      }

      setStatus('success');
      setMessage(data.message || 'Recibimos tu solicitud. Te avisaremos por correo cuando tu acceso esté disponible.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Hubo un error de conexión. Inténtalo más tarde.');
    }
  };

  if (status === 'success') {
    return (
      <div
        className={`rounded-2xl border border-emerald-500/40 bg-emerald-950/50 p-4 text-emerald-200 shadow-xl shadow-emerald-950/40 backdrop-blur-md sm:p-5 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-bold text-emerald-100 sm:text-base">Solicitud recibida</p>
            <p className="mt-0.5 text-emerald-300/90 text-xs leading-relaxed max-w-sm">
              {message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto sm:mx-0">
        <div className="relative flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu.correo@ejemplo.com"
            disabled={status === 'loading'}
            required
            aria-label="Correo electrónico para la beta privada"
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? 'waitlist-error' : undefined}
            className={`w-full h-12 bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all ${
              emailHasValue && emailIsValid ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' : ''
            }`}
          />
          {emailHasValue && emailIsValid && (
            <span className="absolute right-3 top-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3 w-3 stroke-[3]" />
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={status === 'loading' || (emailHasValue && !emailIsValid)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 text-sm font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Solicitar acceso</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {status === 'error' && (
        <p id="waitlist-error" className="mt-2 text-xs text-rose-400 text-left" role="alert">
          {message}
        </p>
      )}

      {hasFormatError && status !== 'error' && (
        <p id="waitlist-error" className="mt-2 text-xs text-amber-400/90 text-left" role="alert">
          Introduce un correo con formato válido (ejemplo: nombre@correo.com).
        </p>
      )}
    </div>
  );
}
