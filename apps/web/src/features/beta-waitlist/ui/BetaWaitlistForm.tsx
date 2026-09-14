import { CheckCircle2, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react';
import { Button, Input } from '@/shared/ui';
import { useBetaWaitlist } from '../model/useBetaWaitlist';

interface BetaWaitlistFormProps {
  source?: string;
  className?: string;
}

export function BetaWaitlistForm({ source = 'LANDING_HERO', className = '' }: BetaWaitlistFormProps) {
  const {
    email,
    setEmail,
    emailHasValue,
    emailIsValid,
    status,
    message,
    loading,
    handleSubmit,
  } = useBetaWaitlist({ source });
  const hasFormatError = emailHasValue && !emailIsValid;
  const isInvalid = status === 'error' || hasFormatError;

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
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu.correo@ejemplo.com"
            disabled={loading}
            required
            aria-label="Correo electrónico para la beta privada"
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? 'waitlist-error' : undefined}
            className={`h-12 bg-slate-900/90 border-slate-700/80 text-foreground placeholder:text-slate-500 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all ${
              emailHasValue && emailIsValid ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' : ''
            }`}
          />
          {emailHasValue && emailIsValid && (
            <span className="absolute right-3 top-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3 w-3 stroke-[3]" />
            </span>
          )}
        </div>
        <Button
          type="submit"
          disabled={loading || (emailHasValue && !emailIsValid)}
          className="h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enviando solicitud…</span>
            </>
          ) : (
            <>
              <span>Solicitar acceso</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {status === 'error' && (
        <p id="waitlist-error" role="alert" className="mt-2 text-xs text-rose-400 animate-in fade-in duration-200">
          {message}
        </p>
      )}

      {hasFormatError && status !== 'error' && (
        <p id="waitlist-error" className="mt-2 text-xs text-amber-400/90 animate-in fade-in duration-200">
          Ingresa un correo con formato válido (ej. nombre@correo.com).
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 justify-center sm:justify-start">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Beta privada · Cohorte limitada a 100 fundadores · 30 días de acceso completo desde la activación</span>
      </div>
    </div>
  );
}
