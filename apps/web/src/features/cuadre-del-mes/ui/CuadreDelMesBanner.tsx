import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button, Card, CardContent } from '@/shared/ui';

interface CuadreDelMesBannerProps {
  onOpen: () => void;
  className?: string;
}

export const CuadreDelMesBanner: React.FC<CuadreDelMesBannerProps> = ({
  onOpen,
  className = '',
}) => {
  return (
    <Card className={`overflow-hidden border-border/70 bg-gradient-to-r from-primary/10 via-card to-card transition hover:border-primary/40 ${className}`}>
      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5 max-w-md">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary">
              Estilo Wrapped 🇩🇴
            </span>
          </div>
          <h3 className="text-base font-bold text-foreground">
            El Cuadre del Mes
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Descubre tu arquetipo financiero dominicano, tu parada favorita y genera tu historia para Instagram o WhatsApp.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={onOpen}
          className="rounded-xl text-xs font-bold gap-1.5 shrink-0 self-start sm:self-center"
        >
          <span>Ver mi Cuadre</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
};
