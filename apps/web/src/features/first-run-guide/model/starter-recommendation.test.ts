import { describe, it, expect } from 'vitest';
import { getStarterRecommendation } from './starter-recommendation';

describe('starter-recommendation engine', () => {
  it('recommends CONNECT_BANKS as Step 1 when user has no transactions and no connection', () => {
    const rec = getStarterRecommendation({
      hasTransactions: false,
      hasConnection: false,
      hasBudget: false,
      hasUncategorized: false,
      interactedSteps: new Set(),
    });

    expect(rec.type).toBe('CONNECT_BANKS');
    expect(rec.stepNumber).toBe(1);
    expect(rec.badge).toContain('PASO 1');
    expect(rec.primaryActionLabel).toBe('Conectar bancos por Gmail');
    expect(rec.secondaryActionLabel).toBe('+ Anotar gasto a mano');
  });

  it('recommends SET_MONTHLY_BUDGET as Step 2 when user has transactions or connections but no budget', () => {
    const rec = getStarterRecommendation({
      hasTransactions: true,
      hasConnection: true,
      hasBudget: false,
      hasUncategorized: false,
      interactedSteps: new Set(),
    });

    expect(rec.type).toBe('SET_MONTHLY_BUDGET');
    expect(rec.stepNumber).toBe(2);
    expect(rec.badge).toContain('PASO 2');
    expect(rec.primaryActionLabel).toBe('Fijar límite en Presupuesto');
    expect(rec.targetStepId).toBe('budget_limit');
  });

  it('recommends CATEGORIZE_TRANSACTIONS when budget is set but uncategorized transactions exist', () => {
    const rec = getStarterRecommendation({
      hasTransactions: true,
      hasConnection: true,
      hasBudget: true,
      hasUncategorized: true,
      interactedSteps: new Set(),
    });

    expect(rec.type).toBe('CATEGORIZE_TRANSACTIONS');
    expect(rec.stepNumber).toBe(3);
    expect(rec.badge).toContain('PASO 3');
    expect(rec.primaryActionLabel).toBe('Clasificar movimientos');
  });

  it('recommends CARD_TRAFFIC_LIGHT when budget and transactions are ready but traffic light was not used', () => {
    const rec = getStarterRecommendation({
      hasTransactions: true,
      hasConnection: true,
      hasBudget: true,
      hasUncategorized: false,
      interactedSteps: new Set(),
    });

    expect(rec.type).toBe('CARD_TRAFFIC_LIGHT');
    expect(rec.targetStepId).toBe('traffic_light');
  });

  it('recommends EXPLORE_CORO when traffic light has been checked', () => {
    const rec = getStarterRecommendation({
      hasTransactions: true,
      hasConnection: true,
      hasBudget: true,
      hasUncategorized: false,
      interactedSteps: new Set(['traffic_light']),
    });

    expect(rec.type).toBe('EXPLORE_CORO');
    expect(rec.targetStepId).toBe('coro');
    expect(rec.primaryActionLabel).toBe('Probar Modo Coro');
  });
});
