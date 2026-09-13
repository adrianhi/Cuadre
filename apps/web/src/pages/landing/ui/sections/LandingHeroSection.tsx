import { Sparkles, ShieldCheck } from 'lucide-react';
import { BetaWaitlistForm } from '@/features/beta-waitlist';
import { InteractiveMarginCalculator } from '../InteractiveMarginCalculator';

export function LandingHeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      {/* Background ambient breathing glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.18),rgba(255,255,255,0))] animate-landing-glow pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Cohort badge with live pulse */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-300 backdrop-blur-xs mb-6 animate-fade-in-up [animation-delay:100ms] shadow-sm shadow-emerald-950/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>Beta privada · Cohorte limitada a 100 fundadores</span>
        </div>

        {/* Core Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.12] animate-fade-in-up [animation-delay:200ms]">
          ¿Cuánto puedes gastar hoy{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
            sin descuadrar tu quincena?
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:300ms]">
          Cuadre procesa las notificaciones de tus tarjetas y cuentas desde Gmail en modo de solo lectura. Sin claves bancarias ni digitación de vouchers: cada mañana tienes tu Margen Seguro Diario listo para decidir con tranquilidad.
        </p>

        {/* Trust bullet */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 animate-fade-in-up [animation-delay:380ms]">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Solo lectura vía Google API · Nunca pedimos contraseñas de bancos · Cero cargos sorpresa</span>
        </div>

        {/* Waitlist Form */}
        <div id="beta-waitlist" className="mt-8 flex scroll-mt-28 justify-center animate-fade-in-up [animation-delay:460ms]">
          <BetaWaitlistForm source="LANDING_HERO" className="max-w-lg" />
        </div>

        {/* Interactive Demo */}
        <div className="mt-14 max-w-4xl mx-auto text-left animate-fade-in-up [animation-delay:540ms]">
          <InteractiveMarginCalculator />
        </div>
      </div>
    </section>
  );
}
