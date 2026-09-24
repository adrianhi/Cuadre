import React from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  HelpCircle,
  X,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/shared/ui';
import type { FirstRunGuideOptions } from '../model/first-run-types';
import { useFirstRunGuide } from '../model/useFirstRunGuide';
import { AppExplainerDialog } from './AppExplainerDialog';

interface FirstRunGuideCardProps extends FirstRunGuideOptions {
  onStartTour?: () => void;
}

export const FirstRunGuideCard: React.FC<FirstRunGuideCardProps> = (props) => {
  const {
    steps,
    completedCount,
    totalSteps,
    progressPercent,
    allCompleted,
    isDismissed,
    isCollapsed,
    isExplainerOpen,
    setIsExplainerOpen,
    handleStepAction,
    dismiss,
    toggleCollapse,
  } = useFirstRunGuide(props);

  if (isDismissed) return null;

  return (
    <>
      <Card
        className="relative overflow-hidden border-primary/25 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm transition"
        data-product-tour="first-run-guide"
      >
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Compass className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                  Tu ruta para cuadrarte
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {allCompleted
                    ? '🎉 ¡Completaste todos los pasos clave!'
                    : `${completedCount} de ${totalSteps} pasos completados (${progressPercent}%)`}
                </p>
              </div>
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
                onClick={toggleCollapse}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label={isCollapsed ? 'Expandir guía' : 'Minimizar guía'}
              >
                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={dismiss}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Ocultar guía"
                title="Ocultar guía"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {!isCollapsed && (
            <div className="space-y-2 pt-1 animate-in fade-in-0 duration-200">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border p-3 transition ${
                    step.isCompleted
                      ? 'border-border/40 bg-muted/20 opacity-75'
                      : 'border-border/80 bg-card hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    {step.isCompleted ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <span className="grid mt-0.5 h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {idx + 1}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-bold ${
                          step.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant={step.isCompleted ? 'ghost' : 'outline'}
                    size="sm"
                    onClick={() => handleStepAction(step.id)}
                    className="self-end sm:self-auto shrink-0 h-8 text-xs font-semibold"
                  >
                    {step.actionLabel}
                  </Button>
                </div>
              ))}
            </div>
          )}
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
