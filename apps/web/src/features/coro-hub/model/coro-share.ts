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

export function parseWhatsAppParticipantsList(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split(/[\r\n,;]+/);
  const result: string[] = [];
  const seen = new Set<string>();

  for (const rawLine of lines) {
    let cleaned = rawLine.trim();
    if (!cleaned || cleaned.endsWith(':')) continue;
    cleaned = cleaned.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '');
    cleaned = cleaned
      .replace(/^[\s\d]+[.)\-:]\s*/, '')
      .replace(/^[-*•–—►▪▫]+\s*/, '')
      .trim();
    if (!cleaned || cleaned.endsWith(':')) continue;
    const key = cleaned.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (key && !seen.has(key) && cleaned.length <= 80) {
      seen.add(key);
      result.push(cleaned);
    }
  }
  return result;
}

