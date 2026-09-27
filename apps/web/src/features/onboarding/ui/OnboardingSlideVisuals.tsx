import React from 'react';
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Coffee,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react';
import { Badge, Button } from '@/shared/ui';
import type { OnboardingVisualType } from '../model/onboarding-hook-slides';

interface OnboardingSlideVisualsProps {
  visualType: OnboardingVisualType;
  onOpenComparison?: () => void;
}

export const OnboardingSlideVisuals: React.FC<OnboardingSlideVisualsProps> = ({
  visualType,
  onOpenComparison,
}) => {
  if (visualType === 'pay_yourself_first') {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-card via-card to-emerald-500/[0.04] p-4 sm:p-5 shadow-lg shadow-emerald-500/5 space-y-3.5">
        <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-background/90 p-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tu cobro quincenal</span>
              <p className="text-base font-black text-foreground">RD$ 50,000</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-[10px] font-bold">Nómina neta</Badge>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground">
          <ArrowDown className="h-4 w-4 text-emerald-500 animate-bounce" />
          <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Bifurcación automática
          </span>
          <ArrowDown className="h-4 w-4 text-emerald-500 animate-bounce" />
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-left">
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <Badge variant="success" className="text-[9px] px-1.5 py-0 font-bold">Blindado</Badge>
            </div>
            <p className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 pt-1">
              1. Ahorro (20%)
            </p>
            <p className="text-base font-black text-emerald-700 dark:text-emerald-300">RD$ 10,000</p>
            <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 leading-tight">
              Intocable en tu cuenta.
            </p>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3 space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <Zap className="h-4 w-4" />
              </div>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-bold text-primary">Sin culpa</Badge>
            </div>
            <p className="text-[10px] font-bold uppercase text-primary pt-1">
              2. Para Vivir
            </p>
            <p className="text-base font-black text-primary">RD$ 40,000</p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Fijos + tu margen diario.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 rounded-xl py-1.5 px-3">
          <Lock className="h-3 w-3 shrink-0" />
          <span>Protegido el día de cobro: nunca más llegas en cero al final.</span>
        </div>
      </div>
    );
  }

  if (visualType === 'transfers_not_expenses') {
    return (
      <div className="rounded-3xl border border-border/80 bg-gradient-to-b from-card to-card/60 p-4 sm:p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-3.5 border border-border/50 text-left">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Origen</span>
            <p className="text-xs sm:text-sm font-bold text-foreground">Cuenta Corriente</p>
            <p className="text-[10px] text-muted-foreground">Banreservas / Popular</p>
          </div>
          <div className="flex flex-col items-center px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ArrowRight className="h-4 w-4" />
            </div>
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 mt-1">RD$ 5,000</span>
          </div>
          <div className="space-y-0.5 text-right">
            <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Destino</span>
            <p className="text-xs sm:text-sm font-bold text-foreground">Cuenta de Ahorros</p>
            <p className="text-[10px] text-muted-foreground">Qik / BHD Metas</p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Transferencia propia detectada</p>
              <p className="text-[11px] text-muted-foreground">Gasto computado: <strong className="text-emerald-600 dark:text-emerald-400">RD$ 0.00</strong></p>
            </div>
          </div>
          <Badge variant="success" className="text-[10px] font-bold shrink-0">100% Intacto</Badge>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Mover dinero a tus ahorros nunca te penaliza ni reduce tu cuota del día.
        </p>
      </div>
    );
  }

  if (visualType === 'daily_margin') {
    return (
      <div className="rounded-3xl border border-primary/25 bg-gradient-to-b from-card to-primary/[0.04] p-5 shadow-lg space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-black text-primary">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span>Tu cuota libre para hoy</span>
        </div>

        <div className="py-1">
          <p className="text-4xl sm:text-5xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 drop-shadow-xs">
            RD$ 1,150
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">
            Disponible cada día sin remordimientos
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl bg-muted/50 p-2 border border-border/60">
            <Coffee className="h-3.5 w-3.5 mx-auto text-amber-500 mb-1" />
            <p className="text-[10px] text-muted-foreground">Café / Merienda</p>
            <p className="font-bold text-foreground text-xs mt-0.5">RD$ 150</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-2 border border-border/60">
            <Utensils className="h-3.5 w-3.5 mx-auto text-blue-500 mb-1" />
            <p className="text-[10px] text-muted-foreground">Almuerzo</p>
            <p className="font-bold text-foreground text-xs mt-0.5">RD$ 380</p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2">
            <CheckCircle2 className="h-3.5 w-3.5 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
            <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">Te sobran</p>
            <p className="font-black text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">RD$ 620</p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          ¿No gastaste hoy? Tu margen de mañana sube automáticamente. ¡Cero hojas de Excel!
        </p>
      </div>
    );
  }

  // Superpowers
  return (
    <div className="space-y-3 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-3.5 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="h-4 w-4" />
            </div>
            <Badge variant="success" className="text-[9px] font-bold">52 días 0%</Badge>
          </div>
          <p className="text-xs font-bold text-foreground">Semáforo de Tarjetas</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Paga con la tarjeta que acaba de cortar y gánale tiempo al banco sin intereses.
          </p>
        </div>

        <div className="rounded-2xl border border-primary/30 bg-primary/[0.06] p-3.5 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <Badge variant="secondary" className="text-[9px] font-bold text-primary">15 y 30</Badge>
          </div>
          <p className="text-xs font-bold text-foreground">Ritual de Quincena</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Sincronizado con tus cobros dominicanos para llegar siempre en positivo.
          </p>
        </div>
      </div>

      {onOpenComparison && (
        <Button
          type="button"
          variant="outline"
          onClick={onOpenComparison}
          className="w-full justify-between rounded-2xl border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-card to-card p-4 hover:border-emerald-500 hover:bg-emerald-500/15 transition-all shadow-sm group min-h-14"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-foreground flex items-center gap-1.5">
                <span>Ver Comparación: Mes Pasado vs Este Mes</span>
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              </p>
              <p className="text-[11px] text-muted-foreground">
                Toca aquí para ver el Core en acción
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
        </Button>
      )}
    </div>
  );
};
