import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Inbox,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type { InboxConnection, Institution } from '@/entities/connection';
import { BankSelector } from '@/entities/connection';
import { Button, Card, CardContent } from '@/shared/ui';
import { BankCoverageFooter } from './BankCoverageFooter';

interface BankConnectionStepProps {
  institutions: Institution[];
  activeInbox?: InboxConnection;
  selectedInstitutionCodes: string[];
  setSelectedInstitutionCodes: (codes: string[]) => void;
  loading: boolean;
  busy: 'google' | 'sync' | 'selection' | 'complete' | null;
  syncState: string | null;
  isSyncing: boolean;
  reconnectNeeded: boolean;
  notice: string;
  error: string;
  googleUnavailable: boolean;
  onConnectGoogle: () => void;
  onSync: (connection: InboxConnection) => void;
  onSaveSelection: () => void;
  onFinish: () => void;
}

export const BankConnectionStep: React.FC<BankConnectionStepProps> = ({
  institutions,
  activeInbox,
  selectedInstitutionCodes,
  setSelectedInstitutionCodes,
  loading,
  busy,
  syncState,
  isSyncing,
  reconnectNeeded,
  notice,
  error,
  googleUnavailable,
  onConnectGoogle,
  onSync,
  onSaveSelection,
  onFinish,
}) => {
  const summary = activeInbox?.lastSyncSummary || null;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/60 shadow-xl">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">
            Conexión Automática
          </p>
          <h1 className="mt-1 text-2xl font-bold">Trae tus movimientos automáticamente</h1>
          <p className="mt-2 max-w-lg text-sm text-emerald-50/90">
            Elige tus bancos y Cuadre buscará únicamente sus notificaciones para mantener tu Margen.
          </p>
        </div>
        <CardContent className="space-y-5 p-6">
          {loading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : activeInbox ? (
            <div className="space-y-5">
              <div className="flex gap-3 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
                <Check className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Gmail conectado</p>
                  <p className="mt-1 text-xs opacity-80">
                    {activeInbox.email} · acceso de solo lectura a los correos bancarios.
                  </p>
                </div>
              </div>
              {activeInbox.requiresBankSelection && (
                <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="flex gap-2 text-sm text-amber-800 dark:text-amber-200">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>Selecciona los bancos que autorizas antes de sincronizar.</p>
                  </div>
                  <BankSelector
                    institutions={institutions}
                    selectedCodes={selectedInstitutionCodes}
                    onChange={setSelectedInstitutionCodes}
                    disabled={Boolean(busy)}
                  />
                  <Button
                    className="w-full"
                    disabled={Boolean(busy) || selectedInstitutionCodes.length === 0}
                    onClick={onSaveSelection}
                  >
                    {busy === 'selection' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Guardar bancos
                  </Button>
                </div>
              )}
              {isSyncing && (
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4" role="status" aria-live="polite">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-sky-600" />
                    <div>
                      <p className="text-sm font-semibold text-sky-800 dark:text-sky-200">
                        {syncState === 'PENDING' ? 'Preparando sincronización' : 'Importando movimientos'}
                      </p>
                      <p className="mt-1 text-xs text-sky-700/80 dark:text-sky-300/80">Este proceso continuará en segundo plano.</p>
                    </div>
                  </div>
                </div>
              )}
              {syncState === 'FAILED' && (
                <div className="flex gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>No pudimos completar la última sincronización. Puedes reintentar.</span>
                </div>
              )}
              {notice && <div className="rounded-xl bg-sky-500/10 p-3 text-xs text-sky-700 dark:text-sky-300">{notice}</div>}
              {summary && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-muted p-3">
                    <p className="text-lg font-bold">{summary.scanned}</p>
                    <p className="text-[10px] text-muted-foreground">revisados</p>
                  </div>
                  <div className="rounded-xl bg-muted p-3">
                    <p className="text-lg font-bold">{summary.parsed}</p>
                    <p className="text-[10px] text-muted-foreground">reconocidos</p>
                  </div>
                  <div className="rounded-xl bg-muted p-3">
                    <p className="text-lg font-bold text-emerald-600">{summary.created}</p>
                    <p className="text-[10px] text-muted-foreground">agregados</p>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                className="min-h-11 w-full gap-2"
                disabled={activeInbox.requiresBankSelection || busy === 'sync' || isSyncing}
                onClick={() => onSync(activeInbox)}
              >
                {busy === 'sync' || isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {isSyncing ? 'Sincronizando…' : 'Sincronizar de nuevo'}
              </Button>
              <Button
                className="min-h-11 w-full gap-2"
                disabled={activeInbox.requiresBankSelection || Boolean(busy)}
                onClick={onFinish}
              >
                <span>Finalizar y entrar a mi Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-3 rounded-xl border border-border/60 p-4">
                <Inbox className="h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold">Privacidad por diseño</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Solo lectura. Filtramos remitentes bancarios soportados y no guardamos correos.
                  </p>
                </div>
              </div>
              <BankSelector
                institutions={institutions}
                selectedCodes={selectedInstitutionCodes}
                onChange={setSelectedInstitutionCodes}
                disabled={Boolean(busy)}
              />
              <Button
                className="h-12 w-full gap-2 text-base"
                disabled={busy === 'google' || selectedInstitutionCodes.length === 0}
                onClick={onConnectGoogle}
              >
                {busy === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {reconnectNeeded ? 'Reconectar Gmail' : 'Conectar Gmail'}
              </Button>
            </div>
          )}

          {error && (
            <div className="flex gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!activeInbox && googleUnavailable && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
              Gmail OAuth no está disponible en este entorno. Puedes continuar manualmente.
            </div>
          )}

          {!activeInbox && (
            <div className="space-y-2 text-center pt-2">
              <button
                type="button"
                className="w-full text-xs text-muted-foreground underline-offset-4 hover:underline"
                disabled={busy === 'complete'}
                onClick={onFinish}
              >
                Continuar con movimientos manuales por ahora
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <BankCoverageFooter institutions={institutions} />
    </div>
  );
};
