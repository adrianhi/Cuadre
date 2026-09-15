import { useMemo } from 'react';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import type { EmailDigestSchedule } from '@bills/contracts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui';

const DIGEST_DAYS = [
  { value: '1', label: 'Lunes' },
  { value: '2', label: 'Martes' },
  { value: '3', label: 'Miércoles' },
  { value: '4', label: 'Jueves' },
  { value: '5', label: 'Viernes' },
  { value: '6', label: 'Sábado' },
  { value: '0', label: 'Domingo' },
];

const DIGEST_TIME_SLOTS = (() => {
  const slots: Array<{ value: string; label: string }> = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const hStr = String(hour).padStart(2, '0');
      const mStr = String(minute).padStart(2, '0');
      const period = hour >= 12 ? 'p. m.' : 'a. m.';
      const h12 = hour % 12 === 0 ? 12 : hour % 12;
      const h12Str = String(h12).padStart(2, '0');
      let note = '';
      if (hour === 0 && minute === 0) note = ' (Medianoche)';
      if (hour === 12 && minute === 0) note = ' (Mediodía)';
      slots.push({
        value: `${hStr}:${mStr}`,
        label: `${h12Str}:${mStr} ${period}${note}`,
      });
    }
  }
  return slots;
})();

const DIGEST_PRESETS = [
  { value: 'FRIDAY_1700', label: '🍹 Viernes, 5:00 p. m.', description: 'Planificador de fin de semana' },
  { value: 'SUNDAY_1800', label: '🛋️ Domingo, 6:00 p. m.', description: 'Cierre de semana' },
  { value: 'MONDAY_0730', label: '☕ Lunes, 7:30 a. m.', description: 'Arranque de semana' },
  { value: 'CUSTOM', label: '⚙️ Personalizado...', description: 'Elige tu día y hora exacta' },
];

function formatNextDelivery(isoString: string | null | undefined, timezone: string): string | null {
  if (!isoString) return null;
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return null;
    const formatted = new Intl.DateTimeFormat('es-DO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone || undefined,
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return null;
  }
}

interface DigestSchedulePickerProps {
  schedule: EmailDigestSchedule;
  customDayOfWeek: number | null | undefined;
  customHour: number | null | undefined;
  customMinute: number | null | undefined;
  nextWeeklyDigestAt: string | null | undefined;
  timezone: string;
  disabled: boolean;
  isSaving: boolean;
  onScheduleChange: (schedule: EmailDigestSchedule) => void;
  onCustomTimingChange: (day: number, hour: number, minute: number) => void;
}

export function DigestSchedulePicker({
  schedule,
  customDayOfWeek,
  customHour,
  customMinute,
  nextWeeklyDigestAt,
  timezone,
  disabled,
  isSaving,
  onScheduleChange,
  onCustomTimingChange,
}: DigestSchedulePickerProps) {
  const currentDay = String(customDayOfWeek ?? 5);
  const currentHour = customHour ?? 17;
  const currentMinute = customMinute ?? 0;
  const currentTimeSlot = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

  const nextDeliveryLabel = useMemo(
    () => formatNextDelivery(nextWeeklyDigestAt, timezone),
    [nextWeeklyDigestAt, timezone],
  );

  return (
    <div className="space-y-3 rounded-xl border border-muted bg-card/40 p-3">
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground" htmlFor="digest-schedule">
          <Calendar className="h-3.5 w-3.5" />
          <span>Frecuencia y horario</span>
          {isSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </label>
        <Select
          value={schedule}
          disabled={disabled}
          onValueChange={(val) => onScheduleChange(val as EmailDigestSchedule)}
        >
          <SelectTrigger id="digest-schedule" className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIGEST_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                <div className="flex flex-col text-left py-0.5">
                  <span className="font-medium">{preset.label}</span>
                  <span className="text-[10px] text-muted-foreground">{preset.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {schedule === 'CUSTOM' && (
        <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Día de entrega</span>
            <Select
              value={currentDay}
              disabled={disabled}
              onValueChange={(val) => onCustomTimingChange(Number(val), currentHour, currentMinute)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIGEST_DAYS.map((d) => (
                  <SelectItem key={d.value} value={d.value} className="text-xs">
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Hora de entrega</span>
            <Select
              value={currentTimeSlot}
              disabled={disabled}
              onValueChange={(slot) => {
                const [h, m] = slot.split(':').map(Number);
                onCustomTimingChange(Number(currentDay), h, m);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {DIGEST_TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value} className="text-xs">
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {nextDeliveryLabel && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-[11px] text-primary">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            <strong>Próximo envío:</strong> {nextDeliveryLabel}
          </span>
        </div>
      )}
    </div>
  );
}
