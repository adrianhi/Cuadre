import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Mail, Send } from 'lucide-react';
import type { EmailDigestSchedule } from '@bills/contracts';
import { Button, Switch } from '@/shared/ui';
import type { AccountSettingsModel } from '../model/useAccountSettings';
import { DigestSchedulePicker } from './DigestSchedulePicker';

export function AccountEmailNotificationsSection({ model }: { model: AccountSettingsModel }) {
  const value = model.emailPreferences;
  const [activeToggle, setActiveToggle] = useState<'weekly' | 'critical' | 'schedule' | null>(null);

  if (!value) {
    return <section className="h-32 animate-pulse rounded-2xl bg-muted" aria-label="Cargando preferencias de correo" />;
  }

  const busy = model.busy === 'email-preferences';

  const update = (changes: Partial<typeof value>, fieldKey: 'weekly' | 'critical' | 'schedule') => {
    setActiveToggle(fieldKey);
    model.updateEmailPreferences({
      weeklyDigestEnabled: value.weeklyDigestEnabled,
      criticalAlertsEnabled: value.criticalAlertsEnabled,
      digestSchedule: value.digestSchedule,
      customDayOfWeek: value.customDayOfWeek,
      customHour: value.customHour,
      customMinute: value.customMinute,
      ...changes,
    });
  };

  const handleScheduleChange = (schedule: EmailDigestSchedule) => {
    if (schedule === 'CUSTOM') {
      update({
        digestSchedule: 'CUSTOM',
        customDayOfWeek: value.customDayOfWeek ?? 5,
        customHour: value.customHour ?? 17,
        customMinute: value.customMinute ?? 0,
      }, 'schedule');
    } else {
      update({ digestSchedule: schedule }, 'schedule');
    }
  };

  const handleCustomTimingChange = (day: number, hour: number, minute: number) => {
    update({
      digestSchedule: 'CUSTOM',
      customDayOfWeek: day,
      customHour: hour,
      customMinute: minute,
    }, 'schedule');
  };

  return (
    <section className="space-y-4 rounded-2xl border p-4" aria-labelledby="email-notifications-title">
      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
        <div>
          <h3 id="email-notifications-title" className="text-sm font-bold">Notificaciones por correo</h3>
          <p className="text-xs text-muted-foreground">Se enviarán a {value.recipientMasked} en la zona {value.timezone}.</p>
        </div>
      </div>

      <div className="flex min-h-11 items-center justify-between gap-4 rounded-xl border p-3 bg-card/50 transition-colors">
        <div className="space-y-0.5">
          <span className="block text-xs font-bold">Pulso semanal</span>
          <span className="block text-[11px] text-muted-foreground">Tus últimos siete días y los próximos cobros.</span>
        </div>
        <Switch
          aria-label="Activar Pulso semanal"
          checked={value.weeklyDigestEnabled}
          disabled={busy}
          loading={busy && activeToggle === 'weekly'}
          onCheckedChange={(checked) => update({ weeklyDigestEnabled: checked }, 'weekly')}
        />
      </div>

      {value.weeklyDigestEnabled && (
        <DigestSchedulePicker
          schedule={value.digestSchedule}
          customDayOfWeek={value.customDayOfWeek}
          customHour={value.customHour}
          customMinute={value.customMinute}
          nextWeeklyDigestAt={value.nextWeeklyDigestAt}
          timezone={value.timezone}
          disabled={busy}
          isSaving={busy && activeToggle === 'schedule'}
          onScheduleChange={handleScheduleChange}
          onCustomTimingChange={handleCustomTimingChange}
        />
      )}

      <div className="flex min-h-11 items-center justify-between gap-4 rounded-xl border p-3 bg-card/50 transition-colors">
        <div className="space-y-0.5">
          <span className="block text-xs font-bold">Alertas críticas</span>
          <span className="block text-[11px] text-muted-foreground">Cobros confirmados importantes y cambios relevantes.</span>
        </div>
        <Switch
          aria-label="Activar alertas críticas"
          checked={value.criticalAlertsEnabled}
          disabled={busy}
          loading={busy && activeToggle === 'critical'}
          onCheckedChange={(checked) => update({ criticalAlertsEnabled: checked }, 'critical')}
        />
      </div>

      <Button
        variant="outline"
        className="w-full gap-2 transition-all"
        disabled={model.busy === 'email-test' || busy}
        onClick={model.sendEmailTest}
      >
        {model.busy === 'email-test' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Enviando correo de prueba...</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>Enviarme un correo de prueba</span>
          </>
        )}
      </Button>

      {model.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1 space-y-0.5">
            <p className="font-bold leading-tight">No se pudo completar</p>
            <p className="text-[11px] opacity-90 leading-relaxed">{model.error}</p>
          </div>
        </div>
      )}

      {model.notice && !model.error && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="flex-1 space-y-0.5">
            <p className="font-bold leading-tight">Operación completada</p>
            <p className="text-[11px] opacity-90 leading-relaxed">{model.notice}</p>
          </div>
        </div>
      )}
    </section>
  );
}
