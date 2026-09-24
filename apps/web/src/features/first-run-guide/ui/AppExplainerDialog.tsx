import React from 'react';
import { CreditCard, Landmark, ShieldCheck, Sparkles, Users } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui';

interface AppExplainerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTour?: () => void;
}

const PILLARS = [
  {
    icon: Landmark,
    title: '1. Bancos al día sin contraseñas',
    description:
      'Conecta tu Gmail para leer los correos de notificación de Banreservas, Popular, BHD, Qik y Scotia. 100% solo lectura, jamás te pedimos contraseñas de banco.',
    colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: ShieldCheck,
    title: '2. Tu Margen Seguro Diario',
    description:
      'El número central de Cuadre. Aparta tus pagos fijos, compromisos de quincena y metas, diciéndote cuánto puedes gastar libremente hoy sin descuadrarte.',
    colorClass: 'bg-primary/10 text-primary',
  },
  {
    icon: CreditCard,
    title: '3. Semáforo: ¿Con cuál pago hoy?',
    description:
      'Cada tarjeta tiene una fecha de corte distinta. Cuadre te recomienda cuál pasar para financiarte hasta 54 días a costo cero sin pagar intereses.',
    colorClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    icon: Users,
    title: '4. Modo Coro entre amigos',
    description:
      'Salidas a cenar, viajes a la playa o juntaderas. Registra gastos compartidos con varios pagadores y Cuadre liquida transferencias mínimas por banco.',
    colorClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
];

export const AppExplainerDialog: React.FC<AppExplainerDialogProps> = ({
  open,
  onOpenChange,
  onStartTour,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Guía esencial</span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-black">
            ¿Cómo funciona Cuadre?
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Diseñado especialmente para la forma en que los dominicanos cobramos, gastamos y salimos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {PILLARS.map(({ icon: Icon, title, description, colorClass }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3.5 transition hover:bg-muted/40"
            >
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${colorClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center">
          {onStartTour ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onStartTour();
              }}
              className="text-xs text-primary font-semibold"
            >
              Iniciar recorrido interactivo
            </Button>
          ) : (
            <span />
          )}
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto font-bold"
          >
            ¡Entendido, a cuadrar!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
