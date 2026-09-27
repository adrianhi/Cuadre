import React from 'react';
import {
  ArrowLeftRight,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/shared/ui';
import type { OnboardingHookSlide as OnboardingHookSlideData } from '../model/onboarding-hook-slides';

interface OnboardingHookSlideProps {
  slide: OnboardingHookSlideData;
}

export const OnboardingHookSlide: React.FC<OnboardingHookSlideProps> = ({ slide }) => {
  return (
    <div className="flex flex-col items-center text-center space-y-4 sm:space-y-5 max-w-lg mx-auto w-full select-none">
      <Badge
        variant="secondary"
        className="rounded-full px-3.5 py-1 text-xs font-semibold border border-primary/20 bg-primary/10 text-primary"
      >
        {slide.badge}
      </Badge>

      <div className="space-y-2 px-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
          {slide.title}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {slide.explanation}
        </p>
      </div>

      <div className="w-full pt-1">
        {slide.visualType === 'pay_yourself_first' && (
          <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-center sm:text-left">
              <div className="flex-1 rounded-xl bg-muted/50 p-3 w-full sm:w-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cobras</span>
                <p className="mt-0.5 text-base sm:text-lg font-black text-foreground">RD$ 50,000</p>
              </div>
              <span className="text-xl font-bold text-muted-foreground shrink-0">-</span>
              <div className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 w-full sm:w-auto">
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Ahorras</span>
                </div>
                <p className="mt-0.5 text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300">RD$ 10,000</p>
              </div>
              <span className="text-xl font-bold text-muted-foreground shrink-0">=</span>
              <div className="flex-1 rounded-xl border border-primary/30 bg-primary/10 p-3 w-full sm:w-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Para vivir</span>
                <p className="mt-0.5 text-base sm:text-lg font-black text-primary">RD$ 40,000</p>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Blindado: tu ahorro se guarda primero y disfrutas el resto sin culpa.
            </p>
          </div>
        )}

        {slide.visualType === 'transfers_not_expenses' && (
          <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3.5">
              <div className="flex items-center gap-3 text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <ArrowLeftRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Transferencia a Cuenta Ahorro</p>
                  <p className="text-xs text-muted-foreground">Banreservas ➔ Qik / BHD</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <Badge variant="success" className="text-[11px]">Ahorro blindado</Badge>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">Gasto: RD$ 0</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-800 dark:text-emerald-300 text-left">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Tu Margen Diario se mantiene 100% intacto, sin penalizarte.</span>
            </div>
          </div>
        )}

        {slide.visualType === 'daily_margin' && (
          <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Piloto automático</span>
            </div>
            <div className="py-2">
              <p className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                ≈ RD$ 1,150 <span className="text-sm sm:text-base font-semibold text-muted-foreground">/ día libre</span>
              </p>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Para comidas, salidas o gustitos. Si hoy no gastas, se acumula para mañana.
              </p>
            </div>
          </div>
        )}

        {slide.visualType === 'superpowers' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/70 bg-card p-4 text-left shadow-xs space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <CreditCard className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-foreground">Semáforo de Tarjetas</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Paga con la tarjeta en verde para ganar hasta 54 días a 0% de interés.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-4 text-left shadow-xs space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
                <CalendarCheck className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-foreground">Ritual de Quincena</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sincronizado con tus cobros 15/30 o 14/29 para llegar en control total.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
