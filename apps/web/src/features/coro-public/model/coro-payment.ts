import type { CoroPaymentDestination } from '@/entities/coro';
import { toast } from '@/shared/ui';

export async function copyPaymentDestination(destination: CoroPaymentDestination) {
  const text = destination.kind === 'QIK'
    ? `Qik: ${destination.phoneNumber} | ${destination.accountHolder}`
    : `${destination.bankCode} ${destination.accountType === 'SAVINGS' ? 'Ahorros' : 'Corriente'}: ${destination.accountNumber} | ${destination.accountHolder}`;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  toast.success('Cuenta copiada al portapapeles.');
}
