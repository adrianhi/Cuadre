import React from 'react';
import { Calendar, Edit3, Trash2 } from 'lucide-react';
import type { Transaction } from '@/entities/transaction';
import type { groupTransactionsByDate } from '@/entities/transaction';
import { isInternalTransfer, isSentTransfer, statusCode } from '@/entities/transaction';
import { formatCurrency, formatDate, getOrganizationMeta } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { TransactionIcon, TransactionStatus, TransactionTypeBadge } from './transaction-presenters';

type TransactionGroup = ReturnType<typeof groupTransactionsByDate>[number];

const GroupHeader = ({ group, hideBalances }: { group: TransactionGroup; hideBalances: boolean }) => (
  <tr className="border-y border-border/60 bg-muted/40">
    <td colSpan={8} className="px-3.5 py-2 sm:px-4 2xl:px-6">
      <div className="flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-emerald-500" />
          <span>{group.title}</span>
          <span className="font-normal text-muted-foreground">• {group.subtitle} ({group.transactions.length} {group.transactions.length === 1 ? 'movimiento' : 'movimientos'})</span>
        </div>
        {hideBalances ? <span className="text-muted-foreground">••••••</span> : (
          <div className="flex items-center gap-3">
            <span className="font-normal text-muted-foreground">En esta página:</span>
            {group.totalExpenseDOP > 0 && <span>Gasto: -{formatCurrency(group.totalExpenseDOP, 'DOP')}</span>}
          </div>
        )}
      </div>
    </td>
  </tr>
);

const TransactionRow = ({ transaction, hideBalances, onEdit, onDelete }: {
  transaction: Transaction;
  hideBalances: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}) => {
  const inactive = statusCode(transaction) !== 'APPROVED';
  const sent = isSentTransfer(transaction);
  const internal = isInternalTransfer(transaction);
  const institution = getOrganizationMeta(transaction.source, transaction.merchant);
  return (
    <tr className="group transition-colors hover:bg-muted/30">
      <td className="px-3.5 py-3.5 sm:px-4 2xl:px-6 2xl:py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 2xl:h-10 2xl:w-10 flex-shrink-0 items-center justify-center rounded-xl ${internal ? 'bg-violet-500/15' : sent ? 'bg-sky-500/15' : 'bg-muted/60'}`}><TransactionIcon transaction={transaction} /></div>
          <div className="min-w-0">
            <div className="max-w-[200px] xl:max-w-[260px] 2xl:max-w-[380px] 3xl:max-w-[500px] truncate font-semibold" title={transaction.merchant}>{transaction.merchant}</div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className={`inline-flex rounded border px-1.5 py-0.2 text-[10px] font-semibold ${institution.badgeClass}`}>{institution.shortName}</span>
              <span className="max-w-[120px] xl:max-w-[180px] 2xl:max-w-[280px] 3xl:max-w-[400px] truncate font-mono text-[11px] text-muted-foreground" title={transaction.notes || transaction.rawMerchant}>{transaction.notes || transaction.rawMerchant}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="hidden 2xl:table-cell px-3.5 py-3.5 2xl:px-6 2xl:py-4"><TransactionTypeBadge transaction={transaction} /></td>
      <td className="px-3.5 py-3.5 sm:px-4 2xl:px-6 2xl:py-4"><span className="inline-flex rounded-full border border-border/50 bg-muted/60 px-2.5 py-1 text-xs font-medium 2xl:max-w-none">{transaction.category || 'Otros'}</span></td>
      <td className="whitespace-nowrap px-3.5 py-3.5 sm:px-4 2xl:px-6 2xl:py-4 text-xs text-muted-foreground">{formatDate(transaction.transactionDate)}</td>
      <td className="px-3.5 py-3.5 sm:px-4 2xl:px-6 2xl:py-4 font-mono text-xs text-muted-foreground">{transaction.cardLast4 ? `•••• ${transaction.cardLast4}` : 'N/A'}</td>
      <td className="hidden 2xl:table-cell px-3.5 py-3.5 2xl:px-6 2xl:py-4"><TransactionStatus transaction={transaction} /></td>
      <td className="whitespace-nowrap px-3.5 py-3.5 sm:px-4 2xl:px-6 2xl:py-4 text-right"><div className={`font-mono text-sm font-bold ${inactive ? 'text-muted-foreground line-through' : ''}`}>{hideBalances ? '••••••' : formatCurrency(transaction.amount, transaction.currency)}</div></td>
      <td className="px-3.5 py-3.5 sm:px-4 2xl:px-6 2xl:py-4 text-center">
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)} className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground" title="Editar clasificación">
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(transaction)}
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Eliminar movimiento"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const TransactionDesktopTable = ({ groups, hideBalances, onEdit, onDelete }: {
  groups: TransactionGroup[];
  hideBalances: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}) => (
  <div className="hidden w-full min-w-0 overflow-x-auto lg:block">
    <table className="w-full text-left text-sm">
      <thead className="border-y bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <tr>
          <th className="px-3.5 py-3 sm:px-4 2xl:px-6 2xl:py-3.5">Comercio / Beneficiario</th>
          <th className="hidden 2xl:table-cell px-3.5 py-3 2xl:px-6 2xl:py-3.5">Tipo de Movimiento</th>
          <th className="px-3.5 py-3 sm:px-4 2xl:px-6 2xl:py-3.5">Categoría</th>
          <th className="px-3.5 py-3 sm:px-4 2xl:px-6 2xl:py-3.5">Fecha & Hora</th>
          <th className="px-3.5 py-3 sm:px-4 2xl:px-6 2xl:py-3.5">Cuenta / Tarjeta</th>
          <th className="hidden 2xl:table-cell px-3.5 py-3 2xl:px-6 2xl:py-3.5">Estado</th>
          <th className="px-3.5 py-3 sm:px-4 2xl:px-6 2xl:py-3.5 text-right">Monto</th>
          <th className="px-3.5 py-3 sm:px-4 2xl:px-6 2xl:py-3.5 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/40">
        {groups.map((group) => <React.Fragment key={group.dateKey}><GroupHeader group={group} hideBalances={hideBalances} />{group.transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} hideBalances={hideBalances} onEdit={onEdit} onDelete={onDelete} />)}</React.Fragment>)}
      </tbody>
    </table>
  </div>
);
