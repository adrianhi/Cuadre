import { useState } from 'react';
import { ArrowRight, CreditCard, Sparkles } from 'lucide-react';
import { Badge, Button, Card, CardContent } from '@/shared/ui';
import { getBankTheme } from '../model/bank-theme';
import { useCreditCardsSummary } from '../model/useCreditCards';
import { CardTrafficLightModal } from './CardTrafficLightModal';

interface CardTrafficLightWidgetProps {
  className?: string;
  onOpen?: () => void;
}

export function CardTrafficLightWidget({ className = '', onOpen }: CardTrafficLightWidgetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { data: summary, isLoading } = useCreditCardsSummary();

  const handleOpen = () => {
    if (onOpen) {
      onOpen();
    } else {
      setInternalOpen(true);
    }
  };

  const bestCard = summary?.bestCard;
  const bank = bestCard ? getBankTheme(bestCard.card.institutionCode) : null;

  return (
    <>
      <Card className={`border-border/70 bg-card transition hover:border-emerald-500/40 ${className}`}>
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CreditCard className="h-5 w-5" />
              </span>

              {bestCard ? (
                <Badge
                  variant="success"
                  className="gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                >
                  <Sparkles className="h-3 w-3" />
                  {bestCard.freeFinancingDays} días gratis
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                >
                  Semáforo
                </Badge>
              )}
            </div>

            <div>
              <h3 className="font-bold text-foreground">¿Con cuál pago hoy?</h3>
              {isLoading ? (
                <p className="text-xs text-muted-foreground mt-1">Calculando mejores opciones…</p>
              ) : bestCard && bank ? (
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-foreground font-semibold flex items-center gap-1.5">
                    <span>{bank.shortName}:</span>
                    <span className="text-muted-foreground font-normal truncate">{bestCard.card.alias}</span>
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Te da <strong className="text-emerald-600 dark:text-emerald-400">{bestCard.freeFinancingDays} días</strong> sin intereses.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Finánciate hasta 54 días a costo cero eligiendo la tarjeta con la fecha de corte ideal.
                </p>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpen}
            className="w-full justify-between rounded-xl text-xs font-bold"
          >
            <span>{bestCard ? 'Ver recomendación' : 'Configurar tarjetas'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardContent>
      </Card>

      {!onOpen && (
        <CardTrafficLightModal open={internalOpen} onOpenChange={setInternalOpen} />
      )}
    </>
  );
}
