import type { Transaction } from '@/entities/transaction';
import { formatCurrency, formatDate, getOrganizationMeta } from '@/shared/lib';

export function TransactionEditSummary({ transaction }: { transaction: Transaction }) {
  const organization = getOrganizationMeta(transaction.source, transaction.merchant);
  return <div className="space-y-1.5 rounded-xl border bg-muted/40 p-3.5 text-xs">
    <div className="flex items-center justify-between"><span className="text-muted-foreground">Entidad / Banco:</span>
      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold ${organization.badgeClass}`}>{organization.name}</span></div>
    <div className="flex justify-between"><span className="text-muted-foreground">Monto:</span>
      <span className="text-sm font-bold text-foreground">{formatCurrency(transaction.amount, transaction.currency)}</span></div>
    <div className="flex justify-between"><span className="text-muted-foreground">Fecha:</span>
      <span>{formatDate(transaction.transactionDate)}</span></div>
    <div className="flex justify-between"><span className="text-muted-foreground">Original:</span>
      <span className="max-w-[200px] truncate font-mono text-muted-foreground" title={transaction.rawMerchant}>{transaction.rawMerchant}</span></div>
  </div>;
}
