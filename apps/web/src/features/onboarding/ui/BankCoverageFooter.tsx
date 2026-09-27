import React from 'react';
import { Building2, ExternalLink } from 'lucide-react';
import type { Institution } from '@/entities/connection';

interface BankCoverageFooterProps {
  institutions: Institution[];
}

export const BankCoverageFooter: React.FC<BankCoverageFooterProps> = ({ institutions }) => {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-emerald-500" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Cobertura multi-banco
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {institutions.map((institution) => (
          <span
            key={institution.code}
            className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground"
          >
            {institution.displayName}
          </span>
        ))}
      </div>
      <a
        href="/legal/privacy"
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
      >
        Privacidad y manejo de datos <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
};
