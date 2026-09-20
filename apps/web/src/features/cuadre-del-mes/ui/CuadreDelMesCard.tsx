import React from 'react';
import { formatCurrency } from '@/shared/lib';
import type { CuadreDelMesData } from '../model/wrapped-calculator';

interface CuadreDelMesCardProps {
  cuadre: CuadreDelMesData;
  monthLabel: string;
}

export const CuadreDelMesCard: React.FC<CuadreDelMesCardProps> = ({
  cuadre,
  monthLabel,
}) => {
  const {
    archetype,
    topCategory,
    topMerchant,
    daysUnderControl,
    totalDaysInPeriod,
    daysWithoutExpense,
    savingsRate,
    hasIncomeData,
    isSpendingLess,
    expenseChangePercent,
    totalSpent,
    currency,
    protectedMode,
  } = cuadre;

  return (
    <div className="w-full max-w-sm mx-auto rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/40 p-5 shadow-2xl space-y-4">
      {/* Header Pill & Month */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-[11px] font-bold text-foreground">
          🇩🇴 El Cuadre del Mes
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          {monthLabel}
        </span>
      </div>

      {/* Hero Archetype Card */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-center space-y-2.5">
        <div className="text-5xl">{archetype.emoji}</div>
        <div>
          <h3 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
            {archetype.name}
          </h3>
          <span className="mt-1 inline-block rounded-full bg-primary/15 px-3 py-0.5 text-xs font-bold text-primary">
            {archetype.badge}
          </span>
        </div>
        <p className="text-xs italic font-medium text-foreground/90 px-1">
          &ldquo;{archetype.quote}&rdquo;
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {archetype.description}
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 gap-2.5 text-left">
        {/* Categoría Reina */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            👑 Categoría
          </p>
          <p className="text-xs font-bold text-foreground truncate">
            {topCategory?.name ?? 'Varios'}
          </p>
          <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
            {topCategory?.percentage ?? 0}%
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {!protectedMode && topCategory
              ? formatCurrency(topCategory.rawAmount, currency)
              : 'Oculto'}
          </p>
        </div>

        {/* Comercio Top */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            🏪 Parada Top
          </p>
          <p className="text-xs font-bold text-foreground truncate">
            {topMerchant?.name ?? 'Sin registros'}
          </p>
          <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
            {topMerchant?.visits ?? 0} visitas
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {!protectedMode && topMerchant
              ? formatCurrency(topMerchant.rawAmount, currency)
              : 'Oculto'}
          </p>
        </div>

        {/* Días Bajo Control */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            🧘 En Control
          </p>
          <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {daysUnderControl} días
          </p>
          <p className="text-[10px] text-muted-foreground">
            de {totalDaysInPeriod} días
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {daysWithoutExpense} días en cero
          </p>
        </div>

        {/* Balance Mensual */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            📈 Balance
          </p>
          <p className="text-sm font-extrabold text-primary">
            {hasIncomeData && savingsRate > 0
              ? `${savingsRate}%`
              : (isSpendingLess ? 'Control' : 'Activo')}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {hasIncomeData && savingsRate > 0
              ? 'Tasa de ahorro'
              : (expenseChangePercent !== null
                  ? `${Math.abs(Math.round(expenseChangePercent))}% ${isSpendingLess ? 'menos' : 'más'}`
                  : 'Organizado')}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {!protectedMode ? formatCurrency(totalSpent, currency) : 'Oculto'}
          </p>
        </div>
      </div>

      {/* Watermark Branding */}
      <div className="pt-1 text-center border-t border-border/40 space-y-0.5">
        <p className="text-xs font-black tracking-wider text-foreground">
          CUADRE · cuadre.app
        </p>
        <p className="text-[10px] text-muted-foreground">
          Finanzas personales en República Dominicana 🇩🇴
        </p>
      </div>
    </div>
  );
};
