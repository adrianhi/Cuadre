import { useState } from 'react';
import { CreditCard, Sparkles } from 'lucide-react';
import type { CreateCreditCardInput, DetectedUnregisteredCard } from '@bills/contracts';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui';
import { useCreditCards } from '../model/useCreditCards';
import { CardDetectedBanner } from './CardDetectedBanner';
import { CardFormSection } from './CardFormSection';
import { CardManagementList } from './CardManagementList';
import { CardRecommendationHero } from './CardRecommendationHero';
import { CardRecommendationList } from './CardRecommendationList';

export interface CardTrafficLightModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardTrafficLightModal({ open, onOpenChange }: CardTrafficLightModalProps) {
  const [activeTab, setActiveTab] = useState<'recommendation' | 'cards'>('recommendation');
  const [detectedToRegister, setDetectedToRegister] = useState<DetectedUnregisteredCard | null>(null);

  const {
    cardsQuery,
    summaryQuery,
    detectedQuery,
    createCard,
    updateCard,
    deleteCard,
    selectedCard,
    isFormOpen,
    startCreating,
    startEditing,
    cancelForm,
    setIsFormOpen,
  } = useCreditCards();

  const cards = cardsQuery.data ?? [];
  const summary = summaryQuery.data;
  const detected = detectedQuery.data ?? [];
  const bestCard = summary?.bestCard;
  const otherCards = summary?.cards.filter((c) => c.card.id !== bestCard?.card.id) ?? [];

  const handleRegisterDetected = (card: DetectedUnregisteredCard) => {
    setDetectedToRegister(card);
    setIsFormOpen(true);
    setActiveTab('cards');
  };

  const handleFormSubmit = (values: CreateCreditCardInput) => {
    if (selectedCard) {
      updateCard.mutate({ id: selectedCard.id, payload: values });
    } else {
      createCard.mutate(values);
    }
    setDetectedToRegister(null);
  };

  const handleFormCancel = () => {
    cancelForm();
    setDetectedToRegister(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto border-border bg-card p-4 sm:p-6 sm:rounded-3xl shadow-2xl no-scrollbar">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-black text-foreground">
                ¿Con cuál pago hoy?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                El semáforo inteligente para maximizar hasta 54 días de financiamiento a costo cero.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'recommendation' | 'cards')} className="space-y-4 pt-2">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/60 rounded-2xl border border-border/50">
            <TabsTrigger value="recommendation" className="rounded-xl font-bold text-xs justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Recomendación de Hoy</span>
            </TabsTrigger>
            <TabsTrigger value="cards" className="rounded-xl font-bold text-xs justify-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Mis Tarjetas ({cards.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Recomendación de Hoy */}
          <TabsContent value="recommendation" className="space-y-4 focus-visible:outline-none">
            {cards.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-6 sm:p-8 text-center space-y-4 bg-muted/20">
                <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-primary/10 text-primary">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-foreground">
                    Aún no has registrado tarjetas de crédito
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Registra tus tarjetas con su día de corte mensual para calcular automáticamente cuál te da más días libres de pago.
                  </p>
                </div>

                {detected.length > 0 && (
                  <CardDetectedBanner
                    detectedCards={detected}
                    onRegisterDetected={handleRegisterDetected}
                  />
                )}

                <Button
                  type="button"
                  onClick={() => {
                    startCreating();
                    setActiveTab('cards');
                  }}
                  className="rounded-xl text-xs font-bold"
                >
                  Registrar mi primera tarjeta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bestCard && <CardRecommendationHero recommendation={bestCard} />}
                <CardRecommendationList cards={otherCards} />
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Mis Tarjetas / Gestión */}
          <TabsContent value="cards" className="space-y-4 focus-visible:outline-none">
            {detected.length > 0 && !isFormOpen && (
              <CardDetectedBanner
                detectedCards={detected}
                onRegisterDetected={handleRegisterDetected}
              />
            )}

            {isFormOpen ? (
              <CardFormSection
                key={selectedCard?.id ?? detectedToRegister?.cardLast4 ?? 'new'}
                cardToEdit={selectedCard}
                detectedCard={detectedToRegister}
                isPending={createCard.isPending || updateCard.isPending}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            ) : (
              <CardManagementList
                cards={cards}
                onStartCreate={startCreating}
                onStartEdit={(card) => {
                  startEditing(card);
                  setActiveTab('cards');
                }}
                onDelete={(id) => deleteCard.mutate(id)}
                isDeleting={deleteCard.isPending}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
