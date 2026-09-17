export function formatCurrency(amount: number | null | undefined, currency = 'DOP'): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '-';
  const code = (currency || 'DOP').toUpperCase();
  const prefix = code === 'USD' ? '$ ' : code === 'EUR' ? '€ ' : 'RD$ ';
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${prefix}${formatted}`;
}

export function formatAmountInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const normalized = normalizeAmount(value);
  if (!normalized) return '';
  const [integer = '0', decimals] = normalized.split('.');
  const integerFormatted = Number(integer || 0).toLocaleString('en-US');
  return decimals === undefined ? integerFormatted : `${integerFormatted}.${decimals.slice(0, 2)}`;
}

export function formatAmountInputOnBlur(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const parsed = Number(parseAmountInput(value));
  if (!Number.isFinite(parsed)) return '';
  return parsed.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseAmountInput(value: string | number | null | undefined): string {
  const normalized = normalizeAmount(value);
  if (!normalized || normalized.endsWith('.')) return normalized.replace('.', '');
  const num = Number.parseFloat(normalized);
  return Number.isNaN(num) ? '' : String(num);
}

function normalizeAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const raw = String(value).trim().replace(/[^0-9.,]/g, '');
  if (!raw) return '';

  const lastDot = raw.lastIndexOf('.');
  const lastComma = raw.lastIndexOf(',');
  let decimalSeparator = '';

  if (lastDot >= 0 && lastComma >= 0) {
    decimalSeparator = lastDot > lastComma ? '.' : ',';
  } else {
    const separator = lastDot >= 0 ? '.' : lastComma >= 0 ? ',' : '';
    if (separator) {
      const occurrences = raw.split(separator).length - 1;
      const fractionLength = raw.length - raw.lastIndexOf(separator) - 1;
      if (fractionLength <= 2 || (occurrences > 1 && fractionLength > 0 && fractionLength <= 2)) {
        decimalSeparator = separator;
      }
    }
  }

  const decimalIndex = decimalSeparator ? raw.lastIndexOf(decimalSeparator) : -1;
  const integerDigits = (decimalIndex >= 0 ? raw.slice(0, decimalIndex) : raw).replace(/[^0-9]/g, '');
  const fractionDigits = decimalIndex >= 0 ? raw.slice(decimalIndex + 1).replace(/[^0-9]/g, '') : undefined;
  if (!integerDigits && fractionDigits === undefined) return '';
  const integer = integerDigits.replace(/^0+(?=\d)/, '') || '0';
  return fractionDigits === undefined ? integer : `${integer}.${fractionDigits.slice(0, 2)}`;
}
