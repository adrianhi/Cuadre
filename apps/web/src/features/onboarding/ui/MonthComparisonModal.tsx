import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '@/shared/lib';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/shared/ui';

interface MonthComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue?: () => void;
  initialIncome?: number;
}

const PRESET_INCOMES = [35000, 50000, 80000];

export const MonthComparisonModal: React.FC<MonthComparisonModalProps> = ({
  open,
  onOpenChange,
  onContinue,
  initialIncome = 50000,
}) => {
  const [income, setIncome] = useState<number>(initialIncome);
  const [activeTab, setActiveTab] = useState<'both' | 'without' | 'with'>('both');

  const savingsTarget = Math.round(income * 0.2); // 20% págate a ti primero
  const livingMoney = income - savingsTarget;
  const fixedExpenses = Math.round(income * 0.35); // 35% fijos estimados
  const dailyMargin = Math.round((livingMoney - fixedExpenses) / 30);

  // Traditional scenario
  const traditionalSpent = Math.round(income * 0.95);
  const traditionalSaved = Math.max(0, income - traditionalSpent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl border-border/80 p-5 sm:p-7">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <Badge variant="secondary" className="text-xs font-bold text-primary">
              El Core de Cuadre
            </Badge>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Mes Anterior vs Este Mes con Cuadre
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Mira la diferencia real entre vivir al día o tener tu dinero en Piloto Automático.
          </DialogDescription>
        </DialogHeader>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-muted/30 p-3">
          <span className="text-xs font-semibold text-muted-foreground">Ejemplo de ingreso mensual:</span>
          <div className="flex gap-1.5">
            {PRESET_INCOMES.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={income === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIncome(preset)}
                className="h-8 text-xs font-bold px-2.5"
              >
                {formatCurrency(preset, 'DOP')}
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile View Selector Tabs */}
        <div className="sm:hidden">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'both' | 'without' | 'with')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/60 p-1">
              <TabsTrigger value="without" className="text-xs font-bold">
                🔴 Sin Cuadre
              </TabsTrigger>
              <TabsTrigger value="with" className="text-xs font-bold">
                🟢 Con Cuadre
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Side-by-Side Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* WITHOUT CUADRE */}
          {(activeTab === 'both' || activeTab === 'without') && (
            <div className="flex flex-col justify-between rounded-2xl border border-destructive/25 bg-destructive/[0.03] p-4 sm:p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-destructive/20 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                    <XCircle className="h-4 w-4 shrink-0" />
                    <span>Mes Pasado (Sin Cuadre)</span>
                  </div>
                  <Badge variant="destructive" className="text-[10px] uppercase font-bold">Vivir a ciegas</Badge>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="rounded-xl bg-background/60 p-2.5 border border-border/50">
                    <p className="text-muted-foreground text-[11px]">Nómina cobrada</p>
                    <p className="font-bold text-foreground text-sm">{formatCurrency(income, 'DOP')}</p>
                  </div>

                  <div className="rounded-xl bg-background/60 p-2.5 border border-border/50">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-[11px]">Gastos sin cuota diaria</p>
                      <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    </div>
                    <p className="font-bold text-destructive text-sm">-{formatCurrency(traditionalSpent, 'DOP')}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Compras sin límite claro hasta que la cuenta queda vacía.</p>
                  </div>

                  <div className="rounded-xl bg-background/60 p-2.5 border border-border/50">
                    <p className="text-muted-foreground text-[11px]">Ahorro a fin de mes (&ldquo;lo que sobró&rdquo;)</p>
                    <p className="font-bold text-muted-foreground text-sm">{formatCurrency(traditionalSaved, 'DOP')}</p>
                    <p className="text-[10px] text-destructive mt-0.5">Sólo el 4% o nada de ahorro real.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive space-y-1">
                <p className="font-bold">El resultado:</p>
                <p className="text-[11px] leading-relaxed">
                  Ansiedad a fin de quincena, pagos de tarjeta con intereses altos y la duda de &ldquo;¿en qué se me fue el sueldo?&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* WITH CUADRE */}
          {(activeTab === 'both' || activeTab === 'with') && (
            <div className="flex flex-col justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/[0.08] to-card p-4 sm:p-5 shadow-lg shadow-emerald-500/5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Este Mes (Con Cuadre)</span>
                  </div>
                  <Badge variant="success" className="text-[10px] uppercase font-bold">Piloto Automático</Badge>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="rounded-xl bg-background/80 p-2.5 border border-emerald-500/25">
                    <div className="flex items-center justify-between">
                      <p className="text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Ahorro Blindado (Día 1)
                      </p>
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm">+{formatCurrency(savingsTarget, 'DOP')}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Apartado de inmediato. Intocable en tu cuenta.</p>
                  </div>

                  <div className="rounded-xl bg-background/80 p-2.5 border border-primary/25">
                    <p className="text-primary font-bold text-[11px] flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Margen Seguro Diario
                    </p>
                    <p className="font-black text-primary text-sm">≈ {formatCurrency(dailyMargin, 'DOP')} / día libre</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Para comidas y gustitos sin culpa. Si hoy no gastas, sube mañana.</p>
                  </div>

                  <div className="rounded-xl bg-background/80 p-2.5 border border-border/60">
                    <p className="text-muted-foreground text-[11px]">Tarjetas de Crédito</p>
                    <p className="font-bold text-foreground text-sm">Hasta 54 días al 0%</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Semáforo inteligente te dice con cuál pagar hoy.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300 space-y-1 border border-emerald-500/20">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> El resultado:
                </p>
                <p className="text-[11px] leading-relaxed">
                  <strong>{formatCurrency(savingsTarget, 'DOP')}</strong> guardados en tu patrimonio, fijos cubiertos y cero estrés.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cerrar comparativa
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto font-bold gap-2 shadow-md shadow-emerald-500/20"
            onClick={() => {
              onOpenChange(false);
              onContinue?.();
            }}
          >
            <span>¡Quiero esto para mis finanzas!</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
