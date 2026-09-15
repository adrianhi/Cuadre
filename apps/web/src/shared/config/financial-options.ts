import { COMMON_TRANSACTION_CATEGORIES } from '@bills/contracts';

export const COMMON_CATEGORIES = COMMON_TRANSACTION_CATEGORIES;

export const COMMON_INCOME_CATEGORIES = [
  'Nómina / Salario',
  'Honorarios / Freelance',
  'Transferencia recibida',
  'Rendimientos & Inversiones',
  'Remesa',
  'Ventas / Extra',
  'Otros ingresos',
] as const;

export const FINANCIAL_INSTITUTIONS = [
  { id: 'BHD', label: '🟢 Banco BHD', source: 'BHD_MANUAL' },
  { id: 'POPULAR', label: '🔵 Banco Popular', source: 'POPULAR_MANUAL' },
  { id: 'BANRESERVAS', label: '🔷 Banreservas', source: 'BANRESERVAS_MANUAL' },
  { id: 'QIK', label: '🟣 Qik Banco Digital', source: 'QIK_MANUAL' },
  { id: 'APAP', label: '🟠 APAP', source: 'APAP_MANUAL' },
  { id: 'SCOTIABANK', label: '🔴 Scotiabank', source: 'SCOTIABANK_MANUAL' },
  { id: 'MANUAL', label: '⚪ Manual / Efectivo', source: 'MANUAL' },
] as const;
