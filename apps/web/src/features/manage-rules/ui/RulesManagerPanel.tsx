import { useRulesManager } from '../model/useRulesManager';
import { useRuleHistory } from '../model/useRuleHistory';
import type { RuleSuggestion } from '../model/rule-editor';
import { RuleEditorForm } from './RuleEditorForm';
import { RuleList } from './RuleList';
import { RuleHistoryPanel } from './RuleHistoryPanel';
import { RulesHeaderGuide } from './RulesHeaderGuide';

interface RulesManagerPanelProps {
  suggestion?: RuleSuggestion;
  enabled?: boolean;
}

export function RulesManagerPanel({ suggestion, enabled = true }: RulesManagerPanelProps) {
  const model = useRulesManager(enabled, true, suggestion);
  const history = useRuleHistory(true);

  return (
    <div className="space-y-4">
      <RulesHeaderGuide />
      <div>
        <h3 className="font-bold text-base">Reglas de clasificación</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Organiza futuros gastos y revisa los cambios antes de aplicarlos al pasado.
        </p>
      </div>
      {history.active && (
        <p role="status" className="rounded-lg bg-muted p-3 text-xs">
          Hay una operación en curso. Podrás modificar reglas cuando termine.
        </p>
      )}
      {model.error && <p role="alert" className="text-xs text-destructive">{model.error}</p>}
      {model.loading ? (
        <p role="status" className="text-xs text-muted-foreground">Cargando reglas…</p>
      ) : (
        <>
          <RuleEditorForm model={model} disabled={history.active} onSaved={history.setRuleId} />
          <RuleList
            rules={model.rules}
            disabled={history.active || model.pending}
            onEdit={model.edit}
            onToggle={(rule) => model.act('toggle', rule)}
            onRemove={(rule) => model.act('delete', rule)}
            onPreview={history.setRuleId}
          />
        </>
      )}
      <RuleHistoryPanel model={history} />
    </div>
  );
}
