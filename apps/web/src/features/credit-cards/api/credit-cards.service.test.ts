import { afterEach, describe, expect, it } from 'vitest';
import AxiosMockAdapter from 'axios-mock-adapter';
import { httpClient } from '@/shared/api';
import { creditCardsService } from './credit-cards.service';

const mock = new AxiosMockAdapter(httpClient);

const sampleCard = {
  id: 'a0000000-0000-0000-0000-000000000001',
  workspaceId: 'b0000000-0000-0000-0000-000000000001',
  institutionCode: 'POPULAR',
  alias: 'Popular Visa',
  cardLast4: '1234',
  cardType: 'CREDIT',
  closingDay: 15,
  graceDays: 22,
  isDefault: true,
  colorTheme: null,
  notes: null,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

const sampleRecommendation = {
  card: sampleCard,
  freeFinancingDays: 45,
  status: 'EXCELLENT',
  nextClosingDate: '2026-10-15T00:00:00.000Z',
  dueDate: '2026-11-06T00:00:00.000Z',
  reason: 'Cortó ayer.',
};

const sampleSummary = {
  bestCard: sampleRecommendation,
  cards: [sampleRecommendation],
  detectedUnregisteredCards: [
    {
      institutionCode: 'BHD',
      cardLast4: '5678',
      transactionCount: 3,
      lastUsedAt: '2026-09-20T00:00:00.000Z',
    },
  ],
};

afterEach(() => mock.reset());

describe('creditCardsService', () => {
  it('fetches and parses card list', async () => {
    mock.onGet('/credit-cards').reply(200, { success: true, data: [sampleCard] });
    const result = await creditCardsService.list();
    expect(result).toHaveLength(1);
    expect(result[0].alias).toBe('Popular Visa');
  });

  it('fetches and parses traffic light summary', async () => {
    mock.onGet('/credit-cards/recommendation').reply(200, { success: true, data: sampleSummary });
    const result = await creditCardsService.getSummary();
    expect(result.bestCard?.freeFinancingDays).toBe(45);
    expect(result.cards).toHaveLength(1);
    expect(result.detectedUnregisteredCards).toHaveLength(1);
  });

  it('fetches detected unregistered cards', async () => {
    mock.onGet('/credit-cards/detected').reply(200, {
      success: true,
      data: sampleSummary.detectedUnregisteredCards,
    });
    const result = await creditCardsService.getDetected();
    expect(result).toHaveLength(1);
    expect(result[0].cardLast4).toBe('5678');
  });

  it('creates card and parses response', async () => {
    mock.onPost('/credit-cards').reply(201, { success: true, data: sampleCard });
    const result = await creditCardsService.create({
      institutionCode: 'POPULAR',
      alias: 'Popular Visa',
      cardLast4: '1234',
      closingDay: 15,
      graceDays: 22,
    });
    expect(result.id).toBe(sampleCard.id);
  });

  it('updates card and parses response', async () => {
    mock.onPatch(`/credit-cards/${sampleCard.id}`).reply(200, { success: true, data: sampleCard });
    const result = await creditCardsService.update(sampleCard.id, { alias: 'Updated' });
    expect(result.id).toBe(sampleCard.id);
  });

  it('deletes card successfully', async () => {
    mock.onDelete(`/credit-cards/${sampleCard.id}`).reply(200, { success: true });
    await expect(creditCardsService.delete(sampleCard.id)).resolves.toBeUndefined();
  });
});
