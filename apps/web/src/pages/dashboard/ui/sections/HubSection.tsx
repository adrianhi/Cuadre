import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, CreditCard, Download, Gift, HelpCircle, Landmark, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { StatsSummary } from '@/entities/stat';
import { CoroPromoCard } from '@/features/coro-hub';
import { Button, Card, CardContent } from '@/shared/ui';
import { CardTrafficLightModal } from '@/features/credit-cards';
import { DobleSueldoDialog } from '../modals/DobleSueldoDialog';
import { CuadreDelMesModal } from '@/features/cuadre-del-mes';
import { AppExplainerDialog } from '@/features/first-run-guide';

interface HubSectionProps {
  onOpenCoro: (coroId?: string) => void;
  onOpenRules: () => void;
  onOpenConnections: () => void;
  onOpenExport: () => void;
  stats: StatsSummary | null;
  currency: string;
}

interface HubCardProps {
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: 'primary' | 'emerald' | 'amber' | 'muted';
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  iconBgClass: string;
}

function HubCard({
  icon: Icon,
  badge,
  badgeVariant = 'muted',
  title,
  description,
  actionLabel,
  onAction,
  iconBgClass,
}: HubCardProps) {
  const badgeClasses = {
    primary: 'bg-primary/15 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    muted: 'bg-muted px-2.5 py-0.5 text-muted-foreground',
  }[badgeVariant];

  return (
    <Card className="border-border/70 bg-card transition hover:border-primary/40">
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`grid h-10 w-10 place-items-center rounded-2xl ${iconBgClass}`}>
              <Icon className="h-5 w-5" />
            </span>
            {badge && (
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badgeClasses}`}>
                {badge}
              </span>
            )}
          </div>
          <h3 className="font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAction}
          className="w-full justify-between rounded-xl text-xs font-bold"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function HubSection({
  onOpenCoro,
  onOpenRules,
  onOpenConnections,
  onOpenExport,
  stats,
  currency,
}: HubSectionProps) {
  const [isTrafficLightOpen, setIsTrafficLightOpen] = useState(false);
  const [isDobleSueldoOpen, setIsDobleSueldoOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-200">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Hub de Cuadre</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Herramientas inteligentes, experiencias y utilidades para tus finanzas dominicanas.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsExplainerOpen(true)}
          className="self-start sm:self-auto gap-2 rounded-xl text-xs font-bold text-primary"
        >
          <HelpCircle className="h-4 w-4" />
          ¿Cómo funciona Cuadre?
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Social & Cuentas Compartidas</p>
        <CoroPromoCard onOpenCoro={onOpenCoro} />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Finanzas & Inteligencia</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <HubCard
            icon={CreditCard}
            badge="Semáforo"
            badgeVariant="emerald"
            title="¿Con cuál pago hoy?"
            description="Finánciate hasta 54 días a costo cero eligiendo la tarjeta con la fecha de corte ideal."
            actionLabel="Consultar recomendación"
            onAction={() => setIsTrafficLightOpen(true)}
            iconBgClass="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          />
          <HubCard
            icon={Gift}
            badge="Ley 16-92 RD"
            badgeVariant="amber"
            title="Doble Sueldo"
            description="Calcula tu regalía pascual navideña estimada según tus ingresos y los meses laborados."
            actionLabel="Calcular regalía"
            onAction={() => setIsDobleSueldoOpen(true)}
            iconBgClass="bg-amber-500/15 text-amber-600 dark:text-amber-400"
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experiencias & Reportes</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <HubCard
            icon={Sparkles}
            badge="Wrapped"
            badgeVariant="primary"
            title="El Cuadre del Mes"
            description="Una historia interactiva estilo Spotify Wrapped con tus estadísticas y mejores hábitos."
            actionLabel="Ver mi Cuadre del Mes"
            onAction={() => setIsWrappedOpen(true)}
            iconBgClass="bg-primary/15 text-primary"
          />
          <HubCard
            icon={Download}
            badge="PDF & Excel"
            badgeVariant="muted"
            title="Exportar Reportes"
            description="Genera estados consolidados de tus movimientos y presupuestos listos para compartir."
            actionLabel="Abrir centro de exportación"
            onAction={onOpenExport}
            iconBgClass="bg-blue-500/15 text-blue-600 dark:text-blue-400"
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Herramientas & Automatización</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <HubCard
            icon={SlidersHorizontal}
            title="Reglas de Categorías"
            description="Define palabras clave para clasificar automáticamente tus transacciones de comercios y bancos."
            actionLabel="Gestionar reglas"
            onAction={onOpenRules}
            iconBgClass="bg-purple-500/15 text-purple-600 dark:text-purple-400"
          />
          <HubCard
            icon={Landmark}
            title="Conexiones Bancarias"
            description="Supervisa la sincronización de tu cuenta de correo y alertas de bancos dominicanos."
            actionLabel="Ver conexiones"
            onAction={onOpenConnections}
            iconBgClass="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      <CardTrafficLightModal open={isTrafficLightOpen} onOpenChange={setIsTrafficLightOpen} />
      <DobleSueldoDialog open={isDobleSueldoOpen} onOpenChange={setIsDobleSueldoOpen} currency={currency} />
      <CuadreDelMesModal open={isWrappedOpen} onOpenChange={setIsWrappedOpen} initialStats={stats} currency={currency} />
      <AppExplainerDialog open={isExplainerOpen} onOpenChange={setIsExplainerOpen} />
    </div>
  );
}
