import { Plus, Sparkles } from 'lucide-react';
import type { DetectedUnregisteredCard } from '@bills/contracts';
import { cn } from '@/shared/lib';
import { Badge, Button, Card, CardContent } from '@/shared/ui';
import { formatCardLast4, getBankTheme } from '../model/bank-theme';

interface CardDetectedBannerProps {
  detectedCards: DetectedUnregisteredCard[];
  onRegisterDetected: (card: DetectedUnregisteredCard) => void;
}

export function CardDetectedBanner({ detectedCards, onRegisterDetected }: CardDetectedBannerProps) {
  if (detectedCards.length === 0) return null;

  return (
    <Card className="rounded-2xl border-primary/30 bg-primary/5 shadow-none">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4 shrink-0" />
          <p className="text-xs font-bold uppercase tracking-wider">
            Tarjetas detectadas en tus correos
          </p>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Encontramos tarjetas usadas en tus transacciones que aún no tienen fecha de corte configurada.
        </p>

        <div className="space-y-2">
          {detectedCards.map((detected) => {
            const bank = getBankTheme(detected.institutionCode);

            return (
              <div
                key={`${detected.institutionCode}-${detected.cardLast4}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-2.5 sm:p-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Badge
                    variant="outline"
                    className={cn('rounded-lg px-2 py-0.5 text-[11px] font-bold border', bank.badgeClass)}
                  >
                    {bank.shortName}
                  </Badge>
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {formatCardLast4(detected.cardLast4)}
                  </span>
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    ({detected.transactionCount} compras detectadas)
                  </span>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-bold rounded-xl gap-1 shrink-0 hover:border-primary/50"
                  onClick={() => onRegisterDetected(detected)}
                >
                  <Plus className="h-3.5 w-3.5 text-primary" />
                  <span>Registrar con 1 clic</span>
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

