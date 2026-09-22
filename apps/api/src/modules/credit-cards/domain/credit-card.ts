export interface CreditCardData {
  id: string;
  workspaceId: string;
  institutionCode: string;
  alias: string;
  cardLast4: string;
  cardType: string;
  closingDay: number;
  graceDays: number;
  isDefault: boolean;
  colorTheme?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function validateClosingDay(closingDay: number): void {
  if (!Number.isInteger(closingDay) || closingDay < 1 || closingDay > 31) {
    throw new Error('El día de corte debe ser un número entero entre 1 y 31.');
  }
}

export function validateGraceDays(graceDays: number): void {
  if (!Number.isInteger(graceDays) || graceDays < 0 || graceDays > 90) {
    throw new Error('Los días de gracia deben ser un número entero mayor o igual a 0.');
  }
}

export function validateCardLast4(cardLast4: string): void {
  if (!/^\d{4}$/.test(cardLast4)) {
    throw new Error('Los últimos 4 dígitos de la tarjeta deben contener exactamente 4 dígitos numéricos.');
  }
}
