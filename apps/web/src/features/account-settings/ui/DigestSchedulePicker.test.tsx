import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DigestSchedulePicker } from './DigestSchedulePicker';

describe('DigestSchedulePicker', () => {
  it('renders preset selection and next delivery label', () => {
    const html = renderToStaticMarkup(
      <DigestSchedulePicker
        schedule="FRIDAY_1700"
        customDayOfWeek={5}
        customHour={17}
        customMinute={0}
        nextWeeklyDigestAt="2026-09-18T21:00:00.000Z"
        timezone="America/Santo_Domingo"
        disabled={false}
        isSaving={false}
        onScheduleChange={vi.fn()}
        onCustomTimingChange={vi.fn()}
      />
    );

    expect(html).toContain('Frecuencia y horario');
    expect(html).toContain('Próximo envío:');
    expect(html).toContain('septiembre');
  });

  it('renders day and hour selectors when schedule is CUSTOM', () => {
    const html = renderToStaticMarkup(
      <DigestSchedulePicker
        schedule="CUSTOM"
        customDayOfWeek={3}
        customHour={14}
        customMinute={0}
        nextWeeklyDigestAt="2026-09-16T18:00:00.000Z"
        timezone="America/Santo_Domingo"
        disabled={false}
        isSaving={false}
        onScheduleChange={vi.fn()}
        onCustomTimingChange={vi.fn()}
      />
    );

    expect(html).toContain('Día de entrega');
    expect(html).toContain('Hora de entrega');
  });

  it('does not render custom timing pickers when a standard preset is selected', () => {
    const html = renderToStaticMarkup(
      <DigestSchedulePicker
        schedule="MONDAY_0730"
        customDayOfWeek={null}
        customHour={null}
        customMinute={null}
        nextWeeklyDigestAt={null}
        timezone="America/Santo_Domingo"
        disabled={false}
        isSaving={false}
        onScheduleChange={vi.fn()}
        onCustomTimingChange={vi.fn()}
      />
    );

    expect(html).not.toContain('Día de entrega');
    expect(html).not.toContain('Hora de entrega');
    expect(html).not.toContain('Próximo envío:');
  });
});
