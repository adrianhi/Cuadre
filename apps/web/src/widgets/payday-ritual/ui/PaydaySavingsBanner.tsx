import { CheckCircle2, PiggyBank, ShieldAlert } from 'lucide-react';
import type { PaydaySavingsStatus } from '@bills/contracts';
import { formatCurrency } from '@/shared/lib';

interface PaydaySavingsBannerProps {
  status: PaydaySavingsStatus;
  target: number;
  transferred: number;
  currency: string;
  hideBalances: boolean;
}

export function PaydaySavingsBanner({
  status,
  target,
  transferred,
  currency,
  hideBalances,
}: PaydaySavingsBannerProps) {
  if (status === 'NOT_SET' || target <= 0) return null;

  const money = (val: number) => (hideBalances ? '••••••' : formatCurrency(val, currency));

  if (status === 'MET') {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>¡Meta de ahorro quincenal cumplida! 🎉</span>
        </div>
        <p className="mt-1 text-emerald-900/80 dark:text-emerald-200/80 text-[11px] leading-relaxed">
          Apartaste {money(transferred)} de tu meta de {money(target)}. ¡Págate a ti primero funciona!
        </p>
      </div>
    );
  }

  if (status === 'PARTIAL') {
    return (
      <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-sky-800 dark:text-sky-300">
          <PiggyBank className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <span>Ahorro en camino ({money(transferred)} / {money(target)})</span>
        </div>
        <p className="mt-1 text-sky-900/80 dark:text-sky-200/80 text-[11px] leading-relaxed">
          Has transferido parte de tu meta de esta quincena. Faltan {money(target - transferred)} para blindar tu ahorro.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
      <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>Págate a ti primero: Ahorro de quincena pendiente</span>
      </div>
      <p className="mt-1 text-amber-900/80 dark:text-amber-200/80 text-[11px] leading-relaxed">
        Recuerda transferir tus <strong className="font-semibold">{money(target)}</strong> a tu cuenta de ahorro para protegerlos antes de empezar a gastar.
      </p>
    </div>
  );
}
