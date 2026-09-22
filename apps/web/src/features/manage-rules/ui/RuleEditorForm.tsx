import type { FormEvent } from 'react';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { CategoryPicker } from '@/entities/category';
import type { useRulesManager } from '../model/useRulesManager';

const NO_MERCHANT = '__none__';

export function RuleEditorForm({ model, disabled, onSaved }: {
  model: ReturnType<typeof useRulesManager>; disabled: boolean; onSaved: (id: string) => void;
}) {
  const { draft, setDraft } = model;
  const selectedMerchant = model.merchants.find((m) => m.key === draft.merchantKey);
  const field = (key: keyof typeof draft, value: string) => setDraft((old) => ({ ...old, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    const rule = await model.save();
    if (rule) onSaved(rule.id);
  }
  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{model.editing ? 'Editar regla' : 'Nueva regla'}</h3>
        {model.editing && <Button type="button" variant="ghost" size="sm" onClick={model.reset}>Nueva</Button>}
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium">Coincidencia</label>
        <Select
          value={draft.matchType}
          onValueChange={(value) => field('matchType', value)}
        >
          <SelectTrigger className="h-10 w-full" aria-label="Coincidencia">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MERCHANT">Este comercio</SelectItem>
            <SelectItem value="CONTAINS">El texto contiene…</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {draft.matchType === 'MERCHANT' ? (
        <div className="space-y-2">
          <Input aria-label="Buscar comercio" placeholder="Buscar comercio" value={model.search} onChange={(event) => model.setSearch(event.target.value)} />
          <Select
            value={draft.merchantKey || NO_MERCHANT}
            onValueChange={(value) => field('merchantKey', value === NO_MERCHANT ? '' : value)}
          >
            <SelectTrigger className="h-10 w-full" aria-label="Comercio exacto">
              <SelectValue placeholder="Selecciona un comercio">
                {selectedMerchant?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_MERCHANT}>Selecciona un comercio</SelectItem>
              {model.merchants.map((item) => (
                <SelectItem key={item.key} value={item.key}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">El nombre visible no cambia esta identidad. Uber Viajes y Uber Eats son comercios distintos.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Input aria-label="Texto del patrón" maxLength={60} placeholder="Ej. FARMACIA CAROL" value={draft.pattern} onChange={(event) => field('pattern', event.target.value)} />
          <p className="text-xs text-amber-700 dark:text-amber-300">Una coincidencia amplia puede afectar a varios comercios. “UBER” también coincide con Uber Eats. Revisa la vista previa.</p>
        </div>
      )}
      <label className="block space-y-1 text-sm">
        Categoría
        <CategoryPicker value={draft.category} onValueChange={(value) => field('category', value)} ariaLabel="Categoría de la regla" />
      </label>
      <label className="block text-sm">
        Nombre visible opcional
        <Input aria-label="Nombre visible opcional" value={draft.normalizedMerchant || ''}
          maxLength={60} placeholder="Dejar vacío para conservar el nombre" onChange={(event) => field('normalizedMerchant', event.target.value)} />
      </label>
      <p className="text-xs text-muted-foreground">Guardar afecta a movimientos futuros. Para el histórico, genera y confirma una vista previa.</p>
      <Button type="submit" disabled={disabled || model.pending || model.loading}>{model.pending ? 'Guardando…' : 'Guardar regla'}</Button>
    </form>
  );
}
