import React, { type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FolderTree, Inbox, Wand2 } from 'lucide-react';
import type { PeriodSelection } from '@/entities/period';
import type { TransactionFinancialRole } from '@bills/contracts';
import { CategorizationInboxView } from './categories/CategorizationInboxView';
import { CategoryRulesView } from './categories/CategoryRulesView';
import { CategoryCatalogView } from './categories/CategoryCatalogView';

export type CategoryWorkspaceTab = 'inbox' | 'rules' | 'catalog';

interface CategoriesSectionProps {
  periodToolbar?: ReactNode;
  currentPeriod?: PeriodSelection;
  currency?: string;
  onSaveTransaction?: (
    id: string,
    merchant: string,
    category: string,
    notes: string,
    financialRole?: TransactionFinancialRole,
  ) => Promise<void>;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  periodToolbar,
  currentPeriod,
  currency = 'DOP',
  onSaveTransaction,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: CategoryWorkspaceTab = (() => {
    const tab = searchParams.get('tab');
    if (tab === 'rules' || tab === 'catalog') return tab;
    return 'inbox';
  })();

  const handleSelectTab = (tab: CategoryWorkspaceTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('view', 'categories');
      if (tab === 'inbox') {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    }, { replace: true });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in-0 duration-200">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl 2xl:text-3xl">
            Centro de Categorías
          </h2>
          <p className="mt-1 text-sm text-muted-foreground 2xl:text-base">
            Bandeja de categorización rápida, reglas de automatización y catálogo completo.
          </p>
        </div>
        {periodToolbar}
      </div>

      {/* Sub-tabs within categories workspace */}
      <div className="flex rounded-2xl bg-muted/70 p-1 text-xs sm:text-sm font-semibold text-muted-foreground w-fit shadow-2xs gap-1">
        <button
          type="button"
          onClick={() => handleSelectTab('inbox')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all ${
            activeTab === 'inbox'
              ? 'bg-card text-foreground font-bold shadow-xs'
              : 'hover:text-foreground hover:bg-card/40'
          }`}
          aria-pressed={activeTab === 'inbox'}
        >
          <Inbox className="h-4 w-4" />
          <span>Bandeja</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelectTab('rules')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all ${
            activeTab === 'rules'
              ? 'bg-card text-foreground font-bold shadow-xs'
              : 'hover:text-foreground hover:bg-card/40'
          }`}
          aria-pressed={activeTab === 'rules'}
        >
          <Wand2 className="h-4 w-4" />
          <span>Reglas</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelectTab('catalog')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all ${
            activeTab === 'catalog'
              ? 'bg-card text-foreground font-bold shadow-xs'
              : 'hover:text-foreground hover:bg-card/40'
          }`}
          aria-pressed={activeTab === 'catalog'}
        >
          <FolderTree className="h-4 w-4" />
          <span>Catálogo</span>
        </button>
      </div>

      {activeTab === 'inbox' && (
        <CategorizationInboxView
          currentPeriod={currentPeriod}
          currency={currency}
          onSaveTransaction={onSaveTransaction}
        />
      )}

      {activeTab === 'rules' && <CategoryRulesView />}

      {activeTab === 'catalog' && <CategoryCatalogView />}
    </div>
  );
};
