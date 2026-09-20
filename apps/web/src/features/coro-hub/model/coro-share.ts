import type { CoroTransferSuggestion } from '@bills/contracts';
import { formatCurrency } from '@/shared/lib';

export function getCoroPublicUrl(slug: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/coro/${encodeURIComponent(slug)}`;
  }
  return `/coro/${encodeURIComponent(slug)}`;
}

export function buildCoroWhatsAppShareUrl(
  name: string,
  totalAmount: number,
  currency: string,
  participantCount: number,
  slug: string
): string {
  const url = getCoroPublicUrl(slug);
  const text = [
    `🌴 *${name.trim()}*`,
    `💰 Total acumulado: ${formatCurrency(totalAmount, currency)}`,
    `👥 Participantes: ${participantCount} personas`,
    '',
    'Entra al coro para ver los gastos, tu balance y cuadrar:',
    `👉 ${url}`,
  ].join('\n');

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildSettlementsWhatsAppText(
  name: string,
  totalAmount: number,
  currency: string,
  settlements: CoroTransferSuggestion[]
): string {
  const pendingSettlements = settlements.filter((s) => s.status !== 'CONFIRMED');

  const lines = [
    `💰 *CUADRE FINAL - ${name.trim()}*`,
    `Total del coro: ${formatCurrency(totalAmount, currency)}`,
    '────────────────────────',
  ];

  if (pendingSettlements.length === 0) {
    lines.push('🎉 ¡Todo el mundo está al día! No hay pagos pendientes.');
  } else {
    for (const item of pendingSettlements) {
      const statusIcon = item.status === 'MARKED_PAID' ? '⏳ (Reportado pagado)' : '👉';
      lines.push(
        `${statusIcon} ${item.fromName} le debe a ${item.toName}: ${formatCurrency(item.amount, currency)}`
      );
    }
  }

  lines.push('────────────────────────');
  lines.push('✅ ¡Cuentas claras conservan amistades!');

  return lines.join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
