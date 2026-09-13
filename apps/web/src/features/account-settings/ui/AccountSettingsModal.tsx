import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui';
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
}: AccountSettingsModalProps) {
  const model = useAccountSettings(isOpen, Boolean(authToken), onAccountDeleted);
  const mustSelectBanks = model.connections.some(
    (connection) => connection.status === 'ACTIVE' && connection.requiresBankSelection
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !mustSelectBanks && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
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

        <AccountConnectionsSection model={model} />
        {!mustSelectBanks && <AccountEmailNotificationsSection model={model} />}
        {!mustSelectBanks && <AccountToolsSection darkMode={darkMode} setDarkMode={setDarkMode} onRepeatTour={onRepeatTour} onOpenRules={onOpenRules} onOpenExport={onOpenExport} onLock={onLock} />}
        <AccountPrivacySections model={model} />
      </DialogContent>
    </Dialog>
  );
}
