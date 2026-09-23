import { CheckCircle2, Split, User, Users } from 'lucide-react';
import type { CoroParticipant } from '@bills/contracts';
import { formatCurrency, parseAmountInput } from '@/shared/lib';
import { Checkbox, CurrencyAmountInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui';

export interface PayerShare {
  participantId: string;
  amount: number;
}

interface CoroMultiPayerSectionProps {
  participants: CoroParticipant[];
  currency: 'DOP' | 'USD';
  totalAmount: number;
  singlePaidById: string;
  onSinglePaidByIdChange: (id: string) => void;
  isMultiPayer: boolean;
  onIsMultiPayerChange: (isMulti: boolean) => void;
  payers: PayerShare[];
  onPayersChange: (payers: PayerShare[]) => void;
}

export function CoroMultiPayerSection({
  participants,
  currency,
  totalAmount,
  singlePaidById,
  onSinglePaidByIdChange,
  isMultiPayer,
  onIsMultiPayerChange,
  payers,
  onPayersChange,
}: CoroMultiPayerSectionProps) {
  const currencySymbol = currency === 'DOP' ? 'RD$' : '$';
  const totalPaid = payers.reduce((sum, p) => sum + p.amount, 0);
  const diff = Math.round((totalAmount - totalPaid) * 100) / 100;
  const isBalanced = totalAmount > 0 && Math.abs(diff) < 0.01;

  const handleTogglePayer = (participantId: string) => {
    const exists = payers.some((p) => p.participantId === participantId);
    if (exists) {
      onPayersChange(payers.filter((p) => p.participantId !== participantId));
    } else {
      const remaining = Math.max(0, diff);
      onPayersChange([...payers, { participantId, amount: remaining }]);
    }
  };

  const handleAmountChange = (participantId: string, val: string) => {
    const numeric = Number(parseAmountInput(val));
    const nextAmount = Number.isFinite(numeric) && numeric >= 0 ? numeric : 0;
    onPayersChange(
      payers.map((p) => (p.participantId === participantId ? { ...p, amount: nextAmount } : p))
    );
  };

  const handleSplitEqually = () => {
    if (payers.length === 0 || totalAmount <= 0) return;
    const base = Math.floor((totalAmount / payers.length) * 100) / 100;
    let remainder = Math.round((totalAmount - base * payers.length) * 100);
    const updated = payers.map((p) => {
      const extra = remainder > 0 ? 0.01 : 0;
      if (remainder > 0) remainder -= 1;
      return { ...p, amount: Math.round((base + extra) * 100) / 100 };
    });
    onPayersChange(updated);
  };

  return (
    <div className="space-y-2 rounded-xl border border-border/70 bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-foreground">
          {isMultiPayer ? 'Quiénes pagaron' : 'Quién pagó'}
        </label>
        <div className="flex rounded-lg border border-border/60 bg-muted/30 p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => onIsMultiPayerChange(false)}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition ${
              !isMultiPayer ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="h-3 w-3" />
            <span>1 persona</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onIsMultiPayerChange(true);
              if (payers.length === 0) {
                onPayersChange([{ participantId: singlePaidById || participants[0]?.id || '', amount: totalAmount }]);
              }
            }}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition ${
              isMultiPayer ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-3 w-3" />
            <span>Varios</span>
          </button>
        </div>
      </div>

      {!isMultiPayer ? (
        <Select value={singlePaidById} onValueChange={onSinglePaidByIdChange}>
          <SelectTrigger className="w-full text-xs sm:text-sm h-9" aria-label="Quién pagó">
            <SelectValue placeholder="Selecciona quién pagó" />
          </SelectTrigger>
          <SelectContent>
            {participants.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-xs sm:text-sm">
                {p.name} {p.isOwner ? '(Anfitrión)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">
              Selecciona quiénes aportaron al pago:
            </span>
            {payers.length > 1 && totalAmount > 0 && (
              <button
                type="button"
                onClick={handleSplitEqually}
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <Split className="h-3 w-3" />
                <span>En partes iguales</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {participants.map((p) => {
              const active = payers.some((item) => item.participantId === p.id);
              const payer = payers.find((item) => item.participantId === p.id);
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between gap-2 rounded-xl border p-2 text-xs transition ${
                    active ? 'border-primary/40 bg-primary/[0.03]' : 'border-border/60 bg-muted/20'
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
                    <Checkbox checked={active} onChange={() => handleTogglePayer(p.id)} />
                    <span className="truncate font-medium text-foreground">
                      {p.name} {p.isOwner ? '(Anfitrión)' : ''}
                    </span>
                  </label>
                  {active && (
                    <div className="relative w-28 shrink-0">
                      <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-[10px] font-bold text-muted-foreground">
                        {currencySymbol}
                      </span>
                      <CurrencyAmountInput
                        value={payer ? String(payer.amount) : ''}
                        onValueChange={(val) => handleAmountChange(p.id, val)}
                        placeholder="0.00"
                        className="h-7 pl-8 pr-2 text-right text-xs font-bold"
                        aria-label={`Monto pagado por ${p.name}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-2 text-[11px]">
            <span className="text-muted-foreground">
              Total pagado: <strong className="text-foreground">{formatCurrency(totalPaid, currency)}</strong> / {formatCurrency(totalAmount, currency)}
            </span>
            {isBalanced ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Cuadrado</span>
              </span>
            ) : diff > 0 ? (
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                Faltan {formatCurrency(diff, currency)}
              </span>
            ) : (
              <span className="font-semibold text-destructive">
                Sobra {formatCurrency(Math.abs(diff), currency)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
