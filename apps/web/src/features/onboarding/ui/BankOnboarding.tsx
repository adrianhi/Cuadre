import { LogOut } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useBankOnboarding } from '../model/useBankOnboarding';
import { FinancialBaselineStep } from './FinancialBaselineStep';
import { OnboardingHookCarousel } from './OnboardingHookCarousel';
import { BankConnectionStep } from './BankConnectionStep';

interface BankOnboardingProps {
  authToken: string;
  onComplete: () => void;
  onLogout: () => void;
}

export function BankOnboarding({ authToken, onComplete, onLogout }: BankOnboardingProps) {
  const model = useBankOnboarding(Boolean(authToken), onComplete);
  const {
    institutions,
    activeInbox,
    reconnectNeeded,
    selectedInstitutionCodes,
    setSelectedInstitutionCodes,
    loading,
    busy,
    syncState,
    isSyncing,
    step,
    error,
    notice,
    googleUnavailable,
    connectGoogle,
    sync,
    saveSelection,
    startPersonalSetup,
    goToConnection,
    finishWithBaseline,
    skipToDashboard,
  } = model;

  if (step === 'hook') {
    return (
      <OnboardingHookCarousel
        onStartSetup={startPersonalSetup}
        onSkip={skipToDashboard}
        onLogout={onLogout}
      />
    );
  }

  if (step === 'baseline') {
    return (
      <div className="min-h-screen bg-background px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] sm:py-12">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-black text-white shadow-lg shadow-emerald-500/20">
                C.
              </div>
              <div>
                <p className="font-bold">Tu Margen Seguro</p>
                <p className="text-xs text-muted-foreground">
                  Define tu límite y los compromisos que debemos reservar.
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-2" onClick={onLogout}>
              <LogOut className="h-4 w-4" /> Salir
            </Button>
          </div>

          <FinancialBaselineStep
            busy={busy === 'complete'}
            error={error}
            onFinish={finishWithBaseline}
            onSkip={() => goToConnection()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] sm:py-12">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-black text-white shadow-lg shadow-emerald-500/20">
              C.
            </div>
            <div>
              <p className="font-bold">Conecta tus Bancos</p>
              <p className="text-xs text-muted-foreground">
                Tus movimientos mantendrán tu Margen actualizado.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-2" onClick={onLogout}>
            <LogOut className="h-4 w-4" /> Salir
          </Button>
        </div>

        <BankConnectionStep
          institutions={institutions}
          activeInbox={activeInbox}
          selectedInstitutionCodes={selectedInstitutionCodes}
          setSelectedInstitutionCodes={setSelectedInstitutionCodes}
          loading={loading}
          busy={busy}
          syncState={syncState}
          isSyncing={isSyncing}
          reconnectNeeded={reconnectNeeded}
          notice={notice}
          error={error}
          googleUnavailable={googleUnavailable}
          onConnectGoogle={connectGoogle}
          onSync={sync}
          onSaveSelection={saveSelection}
          onFinish={skipToDashboard}
        />
      </div>
    </div>
  );
}
