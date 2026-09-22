import { describe, expect, it, vi } from 'vitest';
import type { CreditCard, CreateCreditCardInput, DetectedUnregisteredCard } from '@bills/contracts';
import {
  evaluateCardFinancing,
  findBestCardForToday,
  sortCardRecommendations,
} from '../src/modules/credit-cards/domain/traffic-light-calculator';
import type { CreditCardData } from '../src/modules/credit-cards/domain/credit-card';
import { CreditCardService } from '../src/modules/credit-cards/application/credit-card.service';
import { CreditCardController } from '../src/modules/credit-cards/http/credit-card.controller';
import type {
  CreditCardRepository,
  CardDetectionReader,
} from '../src/modules/credit-cards/application/credit-card.ports';

function createMockCard(overrides: Partial<CreditCardData> = {}): CreditCardData {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    workspaceId: '22222222-2222-4222-8222-222222222222',
    institutionCode: 'BHD',
    alias: 'BHD Mujer Gold',
    cardLast4: '4589',
    cardType: 'CREDIT',
    closingDay: 15,
    graceDays: 22,
    isDefault: false,
    colorTheme: '#0055A5',
    notes: 'Tarjeta principal de uso diario',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('Credit Card Traffic Light Calculator (Domain)', () => {
  it('identifies EXCELLENT financing right after closing date (e.g. 2 days after cut)', () => {
    // Card cut is day 15. Today is May 17.
    // Cut was 2 days ago (May 15). Next cut: June 15. Due: June 15 + 22 = July 7.
    // Days from May 17 to July 7: (31 - 17) + 15 + 22 = 14 + 15 + 22 = 51 days.
    const card = createMockCard({ closingDay: 15, graceDays: 22 });
    const today = new Date(Date.UTC(2026, 4, 17)); // May 17, 2026

    const result = evaluateCardFinancing(card, today);

    expect(result.status).toBe('EXCELLENT');
    expect(result.freeFinancingDays).toBe(51);
    expect(result.reason).toContain('Cortó hace 2 días');
    expect(result.reason).toContain('51 días de financiamiento a tasa 0%');
    expect(result.nextClosingDate).toBe(new Date(Date.UTC(2026, 5, 15)).toISOString());
    expect(result.dueDate).toBe(new Date(Date.UTC(2026, 6, 7)).toISOString());
  });

  it('identifies EXCELLENT when cut was yesterday (1 day after cut)', () => {
    const card = createMockCard({ closingDay: 15, graceDays: 22 });
    const today = new Date(Date.UTC(2026, 4, 16)); // May 16, 2026

    const result = evaluateCardFinancing(card, today);

    expect(result.status).toBe('EXCELLENT');
    expect(result.freeFinancingDays).toBe(52);
    expect(result.reason).toContain('Cortó ayer');
    expect(result.reason).toContain('52 días de financiamiento a tasa 0%');
  });

  it('identifies GOOD financing in mid-cycle (e.g. 25-39 days)', () => {
    // Cut is day 15. Today is June 1.
    // Next cut: June 15. Due: June 15 + 22 = July 7.
    // Days from June 1 to July 7 = 14 + 22 = 36 days.
    const card = createMockCard({ closingDay: 15, graceDays: 22 });
    const today = new Date(Date.UTC(2026, 5, 1)); // June 1, 2026

    const result = evaluateCardFinancing(card, today);

    expect(result.status).toBe('GOOD');
    expect(result.freeFinancingDays).toBe(36);
    expect(result.reason).toContain('Faltan 14 días para el corte');
    expect(result.reason).toContain('36 días de financiamiento disponible');
  });

  it('flags AVOID_CUT_IMMINENT when closing is in 3 days', () => {
    // Cut is June 15. Today is June 12 (3 days before).
    const card = createMockCard({ closingDay: 15, graceDays: 22 });
    const today = new Date(Date.UTC(2026, 5, 12)); // June 12, 2026

    const result = evaluateCardFinancing(card, today);

    expect(result.status).toBe('AVOID_CUT_IMMINENT');
    expect(result.freeFinancingDays).toBe(25);
    expect(result.reason).toContain('Corte inminente en 3 días');
  });

  it('flags AVOID_CUT_IMMINENT when closing is tomorrow (1 day before)', () => {
    // Cut is June 15. Today is June 14.
    const card = createMockCard({ closingDay: 15, graceDays: 22 });
    const today = new Date(Date.UTC(2026, 5, 14)); // June 14, 2026

    const result = evaluateCardFinancing(card, today);

    expect(result.status).toBe('AVOID_CUT_IMMINENT');
    expect(result.freeFinancingDays).toBe(23);
    expect(result.reason).toContain('Corte inminente mañana');
  });

  it('flags AVOID_CUT_IMMINENT on closing day itself', () => {
    // Cut is June 15. Today is June 15.
    const card = createMockCard({ closingDay: 15, graceDays: 22 });
    const today = new Date(Date.UTC(2026, 5, 15)); // June 15, 2026

    const result = evaluateCardFinancing(card, today);

    expect(result.status).toBe('AVOID_CUT_IMMINENT');
    expect(result.freeFinancingDays).toBe(22);
    expect(result.reason).toContain('El corte es hoy');
  });

  it('handles cards closing on day 31 in shorter months like February or April', () => {
    // Card cut is day 31. Today is Feb 15 in non-leap year (2025).
    // Feb has 28 days. The cut in Feb is Feb 28.
    // Next cut: Feb 28, 2025. Due: Feb 28 + 22 = March 22, 2025.
    const card = createMockCard({ closingDay: 31, graceDays: 22 });
    const today = new Date(Date.UTC(2025, 1, 15)); // Feb 15, 2025

    const result = evaluateCardFinancing(card, today);

    expect(result.nextClosingDate).toBe(new Date(Date.UTC(2025, 1, 28)).toISOString());
    expect(result.freeFinancingDays).toBe(13 + 22); // 35 days -> GOOD
    expect(result.status).toBe('GOOD');
  });

  it('selects the best card for today from a collection of cards', () => {
    const today = new Date(Date.UTC(2026, 4, 18)); // May 18, 2026

    // Card 1: cut on 15th (cortó hace 3 días -> ~50 días) -> EXCELLENT
    const card1 = createMockCard({
      id: 'c1',
      alias: 'Popular Orbit',
      institutionCode: 'POPULAR',
      cardLast4: '1111',
      closingDay: 15,
      graceDays: 22,
    });

    // Card 2: cut on 20th (cortará en 2 días) -> AVOID_CUT_IMMINENT
    const card2 = createMockCard({
      id: 'c2',
      alias: 'BHD Miles',
      institutionCode: 'BHD',
      cardLast4: '2222',
      closingDay: 20,
      graceDays: 22,
    });

    // Card 3: cut on 2nd (cortó hace 16 días -> ~36 días) -> GOOD
    const card3 = createMockCard({
      id: 'c3',
      alias: 'Banreservas Visa',
      institutionCode: 'BANRESERVAS',
      cardLast4: '3333',
      closingDay: 2,
      graceDays: 22,
    });

    const best = findBestCardForToday([card1, card2, card3], today);
    expect(best).not.toBeNull();
    expect(best?.card.id).toBe('c1');
    expect(best?.status).toBe('EXCELLENT');
  });

  it('breaks ties using isDefault flag', () => {
    const today = new Date(Date.UTC(2026, 4, 18));

    const cardA = createMockCard({
      id: 'ca',
      alias: 'Card A',
      closingDay: 15,
      isDefault: false,
    });
    const cardB = createMockCard({
      id: 'cb',
      alias: 'Card B',
      closingDay: 15,
      isDefault: true,
    });

    const best = findBestCardForToday([cardA, cardB], today);
    expect(best?.card.id).toBe('cb');
  });

  it('returns null when findBestCardForToday is given an empty array', () => {
    expect(findBestCardForToday([])).toBeNull();
  });
});

describe('CreditCardService (Application with Mocks)', () => {
  function createMockEnvironment() {
    const mockCards: CreditCard[] = [];

    const repository: CreditCardRepository = {
      listByWorkspace: vi.fn().mockImplementation(async (wId: string) =>
        mockCards.filter((c) => c.workspaceId === wId),
      ),
      findById: vi.fn().mockImplementation(async (wId: string, id: string) =>
        mockCards.find((c) => c.workspaceId === wId && c.id === id) ?? null,
      ),
      findByCardLast4AndInstitution: vi.fn().mockImplementation(
        async (wId: string, inst: string, l4: string) =>
          mockCards.find((c) => c.workspaceId === wId && c.institutionCode === inst && c.cardLast4 === l4) ?? null,
      ),
      create: vi.fn().mockImplementation(async (wId: string, input: CreateCreditCardInput) => {
        const created: CreditCard = {
          id: 'new-id-' + Math.random().toString(36).slice(2),
          workspaceId: wId,
          institutionCode: input.institutionCode,
          alias: input.alias,
          cardLast4: input.cardLast4,
          cardType: input.cardType ?? 'CREDIT',
          closingDay: input.closingDay,
          graceDays: input.graceDays ?? 22,
          isDefault: input.isDefault ?? false,
          colorTheme: input.colorTheme ?? null,
          notes: input.notes ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockCards.push(created);
        return created;
      }),
      update: vi.fn().mockImplementation(async (wId: string, id: string, input) => {
        const idx = mockCards.findIndex((c) => c.workspaceId === wId && c.id === id);
        if (idx === -1) return null;
        mockCards[idx] = { ...mockCards[idx], ...input, updatedAt: new Date().toISOString() };
        return mockCards[idx];
      }),
      delete: vi.fn().mockImplementation(async (wId: string, id: string) => {
        const idx = mockCards.findIndex((c) => c.workspaceId === wId && c.id === id);
        if (idx === -1) return false;
        mockCards.splice(idx, 1);
        return true;
      }),
      unsetDefaultForAll: vi.fn().mockImplementation(async (wId: string, excludeId?: string) => {
        for (const card of mockCards) {
          if (card.workspaceId === wId && card.id !== excludeId) {
            card.isDefault = false;
          }
        }
      }),
    };

    const detectedList: DetectedUnregisteredCard[] = [
      { institutionCode: 'QIK', cardLast4: '9988', transactionCount: 14, lastUsedAt: '2026-05-10T15:30:00.000Z' },
    ];

    const cardDetectionReader: CardDetectionReader = {
      findUnregisteredCards: vi.fn().mockResolvedValue(detectedList),
    };

    const service = new CreditCardService(repository, cardDetectionReader);

    return { repository, cardDetectionReader, service, mockCards };
  }

  const workspaceId = '33333333-3333-4333-8333-333333333333';

  it('lists cards for the workspace', async () => {
    const { service, mockCards } = createMockEnvironment();
    mockCards.push(createMockCard({ workspaceId, id: 'card-1' }));

    const cards = await service.listCards(workspaceId);
    expect(cards).toHaveLength(1);
    expect(cards[0].id).toBe('card-1');
  });

  it('creates a card and validates closingDay, graceDays, and cardLast4', async () => {
    const { service } = createMockEnvironment();

    // Invalid closing day
    await expect(
      service.createCard(workspaceId, {
        institutionCode: 'BHD',
        alias: 'Test',
        cardLast4: '1234',
        closingDay: 35,
      }),
    ).rejects.toThrow('El día de corte debe ser un número entero entre 1 y 31');

    // Invalid grace days
    await expect(
      service.createCard(workspaceId, {
        institutionCode: 'BHD',
        alias: 'Test',
        cardLast4: '1234',
        closingDay: 15,
        graceDays: -5,
      }),
    ).rejects.toThrow('Los días de gracia deben ser un número entero');

    // Invalid cardLast4
    await expect(
      service.createCard(workspaceId, {
        institutionCode: 'BHD',
        alias: 'Test',
        cardLast4: 'ABCD',
        closingDay: 15,
      }),
    ).rejects.toThrow('Los últimos 4 dígitos de la tarjeta deben contener exactamente 4 dígitos numéricos');

    // Valid card
    const card = await service.createCard(workspaceId, {
      institutionCode: 'BHD',
      alias: 'BHD Platinum',
      cardLast4: '5566',
      closingDay: 20,
      graceDays: 25,
      isDefault: true,
    });

    expect(card.id).toBeDefined();
    expect(card.alias).toBe('BHD Platinum');
    expect(card.isDefault).toBe(true);
  });

  it('rejects duplicate card with same institution and cardLast4 in the same workspace', async () => {
    const { service, mockCards } = createMockEnvironment();
    mockCards.push(createMockCard({ workspaceId, institutionCode: 'BHD', cardLast4: '5566' }));

    await expect(
      service.createCard(workspaceId, {
        institutionCode: 'BHD',
        alias: 'Another BHD',
        cardLast4: '5566',
        closingDay: 10,
      }),
    ).rejects.toThrow('Ya tienes registrada una tarjeta con esta institución y últimos 4 dígitos');
  });

  it('updates card and manages default flag unsetting', async () => {
    const { service, mockCards, repository } = createMockEnvironment();
    const card1 = createMockCard({ workspaceId, id: 'c1', isDefault: true });
    const card2 = createMockCard({ workspaceId, id: 'c2', isDefault: false });
    mockCards.push(card1, card2);

    const updated = await service.updateCard(workspaceId, 'c2', { isDefault: true, alias: 'Updated Name' });
    expect(updated.alias).toBe('Updated Name');
    expect(repository.unsetDefaultForAll).toHaveBeenCalledWith(workspaceId, 'c2');
  });

  it('throws 404 when updating non-existent card', async () => {
    const { service } = createMockEnvironment();
    await expect(
      service.updateCard(workspaceId, 'non-existent', { alias: 'New' }),
    ).rejects.toThrow('Tarjeta de crédito no encontrada');
  });

  it('deletes card and throws 404 when deleting non-existent card', async () => {
    const { service, mockCards } = createMockEnvironment();
    mockCards.push(createMockCard({ workspaceId, id: 'card-del' }));

    await service.deleteCard(workspaceId, 'card-del');
    expect(mockCards).toHaveLength(0);

    await expect(service.deleteCard(workspaceId, 'card-del')).rejects.toThrow('Tarjeta de crédito no encontrada');
  });

  it('generates traffic light summary with recommendations, best card, and detected unregistered cards', async () => {
    const { service, mockCards } = createMockEnvironment();
    const today = new Date(Date.UTC(2026, 4, 18)); // May 18

    // Card with cut on 15th -> EXCELLENT
    mockCards.push(
      createMockCard({ workspaceId, id: 'c1', alias: 'BHD Card', closingDay: 15 }),
    );
    // Card with cut on 20th -> AVOID_CUT_IMMINENT
    mockCards.push(
      createMockCard({ workspaceId, id: 'c2', alias: 'Popular Card', closingDay: 20 }),
    );

    const summary = await service.getTrafficLightSummary(workspaceId, today);

    expect(summary.cards).toHaveLength(2);
    expect(summary.bestCard?.card.id).toBe('c1');
    expect(summary.bestCard?.status).toBe('EXCELLENT');
    expect(summary.detectedUnregisteredCards).toHaveLength(1);
    expect(summary.detectedUnregisteredCards[0].institutionCode).toBe('QIK');
  });
});

describe('CreditCardController (HTTP Handlers)', () => {
  const workspaceId = '44444444-4444-4444-8444-444444444444';

  function createControllerEnv() {
    const mockCards: CreditCard[] = [];
    const repository: CreditCardRepository = {
      listByWorkspace: vi.fn().mockResolvedValue(mockCards),
      findById: vi.fn().mockImplementation(async (_wId, id) => mockCards.find((c) => c.id === id) ?? null),
      findByCardLast4AndInstitution: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async (wId, input) => {
        const card: CreditCard = {
          id: 'card-created-1',
          workspaceId: wId,
          institutionCode: input.institutionCode,
          alias: input.alias,
          cardLast4: input.cardLast4,
          cardType: input.cardType ?? 'CREDIT',
          closingDay: input.closingDay,
          graceDays: input.graceDays ?? 22,
          isDefault: input.isDefault ?? false,
          colorTheme: input.colorTheme ?? null,
          notes: input.notes ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockCards.push(card);
        return card;
      }),
      update: vi.fn().mockImplementation(async (_wId, id, input) => {
        const card = mockCards.find((c) => c.id === id);
        if (!card) return null;
        Object.assign(card, input);
        return card;
      }),
      delete: vi.fn().mockResolvedValue(true),
      unsetDefaultForAll: vi.fn().mockResolvedValue(undefined),
    };
    const cardDetectionReader: CardDetectionReader = {
      findUnregisteredCards: vi.fn().mockResolvedValue([]),
    };
    const service = new CreditCardService(repository, cardDetectionReader);
    const controller = new CreditCardController(service);

    const mockReqRes = (body: any = {}, params: any = {}) => {
      const req = {
        body,
        params,
        requestId: 'req-123',
        auth: {
          user: { id: 'u-1', email: 'test@example.com' },
          workspaceId,
          role: 'OWNER',
        },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      return { req: req as any, res: res as any };
    };

    return { controller, service, repository, mockCards, mockReqRes };
  }

  it('handles GET /credit-cards', async () => {
    const { controller, mockReqRes } = createControllerEnv();
    const { req, res } = mockReqRes();

    await controller.list(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Array) }));
  });

  it('handles POST /credit-cards with valid body', async () => {
    const { controller, mockReqRes } = createControllerEnv();
    const { req, res } = mockReqRes({
      institutionCode: 'POPULAR',
      alias: 'Orbit Popular',
      cardLast4: '4321',
      closingDay: 18,
      graceDays: 22,
    });

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ alias: 'Orbit Popular' }),
    }));
  });

  it('handles GET /credit-cards/recommendation', async () => {
    const { controller, mockReqRes } = createControllerEnv();
    const { req, res } = mockReqRes();

    await controller.recommendation(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ cards: expect.any(Array), detectedUnregisteredCards: expect.any(Array) }),
    }));
  });

  it('handles GET /credit-cards/detected', async () => {
    const { controller, mockReqRes } = createControllerEnv();
    const { req, res } = mockReqRes();

    await controller.detected(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.any(Array),
    }));
  });

  it('handles PATCH /credit-cards/:id', async () => {
    const { controller, mockCards, mockReqRes } = createControllerEnv();
    mockCards.push(createMockCard({ id: 'c-edit', workspaceId }));
    const { req, res } = mockReqRes({ alias: 'Renamed Card' }, { id: 'c-edit' });

    await controller.update(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ alias: 'Renamed Card' }),
    }));
  });

  it('handles DELETE /credit-cards/:id', async () => {
    const { controller, mockCards, mockReqRes } = createControllerEnv();
    mockCards.push(createMockCard({ id: 'c-del', workspaceId }));
    const { req, res } = mockReqRes({}, { id: 'c-del' });

    await controller.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });
});

