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
      <DialogContent className="max-h-[92dvh] overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Cuenta y preferencias</DialogTitle>
          <DialogDescription>
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

        <Tabs value={mustSelectBanks ? 'connections' : activeTab} onValueChange={(value) => !mustSelectBanks && setActiveTab(value)}
          className="flex min-h-0 flex-1 flex-col gap-4 md:grid md:grid-cols-[13rem_1fr]">
          <TabsList className="-mx-1 shrink-0 gap-1 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-col md:items-stretch md:overflow-visible md:border-r md:pr-4">
            <TabsTrigger value="connections" className="shrink-0"><Landmark className="h-4 w-4" />Bancos y Gmail</TabsTrigger>
            <TabsTrigger value="automation" disabled={mustSelectBanks} className="shrink-0"><WandSparkles className="h-4 w-4" />Reglas y automatización</TabsTrigger>
            <TabsTrigger value="notifications" disabled={mustSelectBanks} className="shrink-0"><Bell className="h-4 w-4" />Notificaciones</TabsTrigger>
            <TabsTrigger value="security" disabled={mustSelectBanks} className="shrink-0"><ShieldCheck className="h-4 w-4" />Seguridad y datos</TabsTrigger>
          </TabsList>
          <div className="min-h-0 overflow-y-auto pr-1 md:max-h-[68dvh]">
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
