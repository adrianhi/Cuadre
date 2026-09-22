import type {
  CreditCard,
  CreateCreditCardInput,
  UpdateCreditCardInput,
  CardTrafficLightSummary,
  DetectedUnregisteredCard,
} from '@bills/contracts';
import { AppError } from '../../../errors/app-error';
import {
  validateClosingDay,
  validateGraceDays,
  validateCardLast4,
} from '../domain/credit-card';
import {
  evaluateCardFinancing,
  sortCardRecommendations,
} from '../domain/traffic-light-calculator';
import type {
  CreditCardRepository,
  CardDetectionReader,
} from './credit-card.ports';

export class CreditCardService {
  constructor(
    private readonly repository: CreditCardRepository,
    private readonly cardDetectionReader: CardDetectionReader,
  ) {}

  public async listCards(workspaceId: string): Promise<CreditCard[]> {
    return this.repository.listByWorkspace(workspaceId);
  }

  public async getCard(workspaceId: string, id: string): Promise<CreditCard> {
    const card = await this.repository.findById(workspaceId, id);
    if (!card) {
      throw new AppError(404, 'CREDIT_CARD_NOT_FOUND', 'Tarjeta de crédito no encontrada.');
    }
    return card;
  }

  public async createCard(
    workspaceId: string,
    input: CreateCreditCardInput,
  ): Promise<CreditCard> {
    validateClosingDay(input.closingDay);
    if (input.graceDays !== undefined) validateGraceDays(input.graceDays);
    validateCardLast4(input.cardLast4);

    const existing = await this.repository.findByCardLast4AndInstitution(
      workspaceId,
      input.institutionCode,
      input.cardLast4,
    );
    if (existing) {
      throw new AppError(
        409,
        'CREDIT_CARD_ALREADY_EXISTS',
        'Ya tienes registrada una tarjeta con esta institución y últimos 4 dígitos.',
      );
    }

    if (input.isDefault) {
      await this.repository.unsetDefaultForAll(workspaceId);
    }

    return this.repository.create(workspaceId, input);
  }

  public async updateCard(
    workspaceId: string,
    id: string,
    input: UpdateCreditCardInput,
  ): Promise<CreditCard> {
    const existing = await this.repository.findById(workspaceId, id);
    if (!existing) {
      throw new AppError(404, 'CREDIT_CARD_NOT_FOUND', 'Tarjeta de crédito no encontrada.');
    }

    if (input.closingDay !== undefined) validateClosingDay(input.closingDay);
    if (input.graceDays !== undefined) validateGraceDays(input.graceDays);
    if (input.cardLast4 !== undefined) validateCardLast4(input.cardLast4);

    if (input.isDefault) {
      await this.repository.unsetDefaultForAll(workspaceId, id);
    }

    const updated = await this.repository.update(workspaceId, id, input);
    if (!updated) {
      throw new AppError(404, 'CREDIT_CARD_NOT_FOUND', 'Tarjeta de crédito no encontrada.');
    }
    return updated;
  }

  public async deleteCard(workspaceId: string, id: string): Promise<void> {
    const existing = await this.repository.findById(workspaceId, id);
    if (!existing) {
      throw new AppError(404, 'CREDIT_CARD_NOT_FOUND', 'Tarjeta de crédito no encontrada.');
    }
    await this.repository.delete(workspaceId, id);
  }

  public async getTrafficLightSummary(
    workspaceId: string,
    today: Date = new Date(),
  ): Promise<CardTrafficLightSummary> {
    const cards = await this.repository.listByWorkspace(workspaceId);
    const recommendations = cards.map((card) => evaluateCardFinancing(card, today));
    const sorted = sortCardRecommendations(recommendations);
    const bestCard = sorted[0] ?? null;
    const detectedUnregisteredCards = await this.cardDetectionReader.findUnregisteredCards(workspaceId);

    return {
      bestCard,
      cards: sorted,
      detectedUnregisteredCards,
    };
  }

  public async detectUnregistered(workspaceId: string): Promise<DetectedUnregisteredCard[]> {
    return this.cardDetectionReader.findUnregisteredCards(workspaceId);
  }
}
