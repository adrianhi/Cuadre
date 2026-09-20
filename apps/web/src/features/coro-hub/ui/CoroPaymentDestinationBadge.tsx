import { useState } from 'react';
import { Check, Copy, Landmark, Smartphone } from 'lucide-react';
import type { CoroPaymentDestination } from '@bills/contracts';
import { Button, toast } from '@/shared/ui';
import { copyToClipboard } from '../model/coro-share';

interface CoroPaymentDestinationBadgeProps {
  destination?: CoroPaymentDestination | null;
  className?: string;
}

const BANK_NAMES: Record<string, string> = {
  POPULAR: 'Banco Popular',
  BHD: 'Banco BHD',
  BANRESERVAS: 'Banreservas',
};

export function CoroPaymentDestinationBadge({ destination, className = '' }: CoroPaymentDestinationBadgeProps) {
  const [copied, setCopied] = useState(false);

  if (!destination) return null;

  const handleCopy = async (value: string, label: string) => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      toast.success(`${label} copiado.`);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('No se pudo copiar.');
    }
  };

  if (destination.kind === 'BANK') {
    const bankName = BANK_NAMES[destination.bankCode] ?? destination.bankCode;
    const typeName = destination.accountType === 'SAVINGS' ? 'Ahorros' : 'Corriente';

    return (
      <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs ${className}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Landmark className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-semibold text-foreground truncate">
              <span>{bankName}</span>
              <span className="text-[10px] font-normal text-muted-foreground">({typeName})</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono truncate">
              {destination.accountNumber} · {destination.accountHolder}
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[11px] gap-1 shrink-0 font-medium rounded-lg"
          onClick={() => void handleCopy(destination.accountNumber, `Cuenta de ${bankName}`)}
          aria-label={`Copiar cuenta ${destination.accountNumber}`}
        >
          {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copiada' : 'Copiar cuenta'}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
          <Smartphone className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-semibold text-foreground truncate">
            <span>Qik Banco Digital</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono truncate">
            {destination.phoneNumber} · {destination.accountHolder}
          </p>
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 px-2 text-[11px] gap-1 shrink-0 font-medium rounded-lg"
        onClick={() => void handleCopy(destination.phoneNumber, 'Teléfono Qik')}
        aria-label={`Copiar teléfono ${destination.phoneNumber}`}
      >
        {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
        <span>{copied ? 'Copiado' : 'Copiar Qik'}</span>
      </Button>
    </div>
  );
}
