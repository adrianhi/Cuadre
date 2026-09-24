import React, { useState } from 'react';
import { ArrowRight, HelpCircle, Landmark, Plus, Sparkles, Wallet, X } from 'lucide-react';
import { Button, Card, CardContent } from '@/shared/ui';
import type { FirstRunGuideOptions } from '../model/first-run-types';
import { useFirstRunGuide } from '../model/useFirstRunGuide';
import { AppExplainerDialog } from './AppExplainerDialog';

interface StarterHeroBannerProps extends FirstRunGuideOptions {
  onStartTour?: () => void;
}

const STARTER_BANNER_DISMISSED_KEY = 'cuadre_starter_hero_dismissed_v1';

export const StarterHeroBanner: React.FC<StarterHeroBannerProps> = (props) => {
  const {
    recommendation,
    handleStepAction,
    allCompleted,
  } = useFirstRunGuide(props);

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STARTER_BANNER_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  // If dismissed or user completed everything, don't show the hero banner
  if (isDismissed || allCompleted) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(STARTER_BANNER_DISMISSED_KEY, 'true');
    } catch {
      // ignore
    }
  };

  return (
    <>
      <Card
        className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card shadow-md transition"
        data-product-tour="starter-hero"
      >
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] sm:text-xs font-black tracking-wide text-primary">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                {recommendation.badge}
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground">
                ¡Dile adiós al descuadre! Vamos a cuadrarte en 3 pasos
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                {recommendation.description}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExplainerOpen(true)}
                className="h-8 gap-1 px-2 text-xs font-semibold text-primary"
                title="¿Cómo funciona Cuadre?"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">¿Cómo funciona?</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Cerrar sugerencia de inicio"
                title="Ocultar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Primary Recommended Action Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3.5 sm:p-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Paso sugerido para ti ahora
              </p>
              <p className="text-sm font-bold text-foreground">
                {recommendation.title}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {recommendation.secondaryActionLabel && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={props.onAddManual}
                  className="h-9 text-xs font-semibold"
                >
                  {recommendation.secondaryActionLabel}
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={() => handleStepAction(recommendation.targetStepId)}
                className="h-9 gap-1.5 text-xs font-bold shadow-sm shadow-primary/20"
              >
                <span>{recommendation.primaryActionLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* 3 Quick Starter Paths */}
          <div className="pt-1">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              ¿Por dónde prefieres arrancar?
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={props.onOpenConnections}
                className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-card p-3 text-left transition hover:border-primary/40 hover:bg-muted/40"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Landmark className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground">1. Conectar bancos</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Alertas Gmail automáticas
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={props.onAddManual}
                className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-card p-3 text-left transition hover:border-primary/40 hover:bg-muted/40"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Plus className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground">2. Gasto rápido</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Anota compras en 10 seg
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={props.onOpenBudget}
                className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-card p-3 text-left transition hover:border-primary/40 hover:bg-muted/40"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Wallet className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground">3. Presupuesto</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Fija tu límite del mes
                  </p>
                </div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AppExplainerDialog
        open={isExplainerOpen}
        onOpenChange={setIsExplainerOpen}
        onStartTour={props.onStartTour}
      />
    </>
  );
};
