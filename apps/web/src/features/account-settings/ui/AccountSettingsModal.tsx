import { useState, type ReactNode } from 'react';
import { AlertCircle, Bell, Landmark, ShieldCheck, WandSparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui';
import { useAccountSettings } from '../model/useAccountSettings';
import { AccountConnectionsSection } from './AccountConnectionsSection';
import { AccountPrivacySections } from './AccountPrivacySections';
import { AccountToolsSection } from './AccountToolsSection';
import { AccountEmailNotificationsSection } from './AccountEmailNotificationsSection';

interface AccountSettingsModalProps {
  authToken: string;
  isOpen: boolean;
  onClose: () => void;
  onAccountDeleted: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onRepeatTour: () => void;
  onOpenRules: () => void;
  onOpenExport: () => void;
  onLock: () => void;
  onOpenIncomeSettings?: () => void;
  categoryManagement?: ReactNode;
}

export function AccountSettingsModal({
  authToken,
  isOpen,
  onClose,
  onAccountDeleted,
  darkMode,
  setDarkMode,
  onRepeatTour,
  onOpenRules,
  onOpenExport,
  onLock,
  onOpenIncomeSettings,
  categoryManagement,
}: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState('connections');
  const model = useAccountSettings(isOpen, Boolean(authToken), onAccountDeleted);
  const mustSelectBanks = model.connections.some(
    (connection) => connection.status === 'ACTIVE' && connection.requiresBankSelection
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !mustSelectBanks && onClose()}>
      <DialogContent className="w-[calc(100vw-1.25rem)] max-h-[92dvh] p-4 sm:p-6 overflow-hidden sm:max-w-4xl rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4">
        <DialogHeader className="text-left pr-8 sm:pr-0">
          <DialogTitle className="text-base sm:text-lg font-bold">Cuenta y preferencias</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {mustSelectBanks
              ? 'Selecciona al menos un banco para reanudar Gmail.'
              : 'Controla tus conexiones, notificaciones y derechos sobre los datos.'}
          </DialogDescription>
        </DialogHeader>

        {model.error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1 space-y-0.5">
              <p className="font-bold leading-tight">Aviso</p>
              <p className="text-[11px] opacity-90 leading-relaxed">{model.error}</p>
            </div>
          </div>
        )}

        <Tabs
          value={mustSelectBanks ? 'connections' : activeTab}
          onValueChange={(value) => !mustSelectBanks && setActiveTab(value)}
          className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4 md:grid md:grid-cols-[13.5rem_1fr]"
        >
          <TabsList className="grid grid-cols-2 gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/50 sm:grid-cols-4 md:flex md:flex-col md:bg-transparent md:border-0 md:border-r md:p-0 md:pr-4 md:rounded-none md:gap-1 shrink-0">
            <TabsTrigger
              value="connections"
              className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/60 p-2 sm:p-2.5 text-left text-xs font-semibold text-muted-foreground transition hover:text-foreground data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-xs md:min-h-11 md:gap-3 md:border-0 md:bg-transparent md:p-3 md:text-sm"
            >
              <Landmark className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="min-w-0 flex-1 leading-tight text-[11px] sm:text-xs md:text-sm">Bancos y Gmail</span>
            </TabsTrigger>

            <TabsTrigger
              value="automation"
              disabled={mustSelectBanks}
              className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/60 p-2 sm:p-2.5 text-left text-xs font-semibold text-muted-foreground transition hover:text-foreground data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-xs md:min-h-11 md:gap-3 md:border-0 md:bg-transparent md:p-3 md:text-sm"
            >
              <WandSparkles className="h-4 w-4 shrink-0 text-purple-500" />
              <span className="min-w-0 flex-1 leading-tight text-[11px] sm:text-xs md:text-sm">Reglas y automatización</span>
            </TabsTrigger>

            <TabsTrigger
              value="notifications"
              disabled={mustSelectBanks}
              className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/60 p-2 sm:p-2.5 text-left text-xs font-semibold text-muted-foreground transition hover:text-foreground data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-xs md:min-h-11 md:gap-3 md:border-0 md:bg-transparent md:p-3 md:text-sm"
            >
              <Bell className="h-4 w-4 shrink-0 text-amber-500" />
              <span className="min-w-0 flex-1 leading-tight text-[11px] sm:text-xs md:text-sm">Notificaciones</span>
            </TabsTrigger>

            <TabsTrigger
              value="security"
              disabled={mustSelectBanks}
              className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/60 p-2 sm:p-2.5 text-left text-xs font-semibold text-muted-foreground transition hover:text-foreground data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-xs md:min-h-11 md:gap-3 md:border-0 md:bg-transparent md:p-3 md:text-sm"
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-blue-500" />
              <span className="min-w-0 flex-1 leading-tight text-[11px] sm:text-xs md:text-sm">Seguridad y datos</span>
            </TabsTrigger>
          </TabsList>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 sm:pr-1 md:max-h-[68dvh] space-y-4">
            <TabsContent value="connections"><AccountConnectionsSection model={model} /></TabsContent>
            <TabsContent value="automation" className="space-y-4">
              <AccountToolsSection mode="automation" darkMode={darkMode} setDarkMode={setDarkMode} onRepeatTour={onRepeatTour}
                onOpenRules={onOpenRules} onOpenExport={onOpenExport} onLock={onLock} onOpenIncomeSettings={onOpenIncomeSettings} />
              {categoryManagement}
            </TabsContent>
            <TabsContent value="notifications"><AccountEmailNotificationsSection model={model} /></TabsContent>
            <TabsContent value="security" className="space-y-4">
              <AccountToolsSection mode="account" darkMode={darkMode} setDarkMode={setDarkMode} onRepeatTour={onRepeatTour}
                onOpenRules={onOpenRules} onOpenExport={onOpenExport} onLock={onLock} />
              <AccountPrivacySections model={model} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
