import {
  cardTrafficLightSummarySchema,
  creditCardSchema,
  detectedUnregisteredCardSchema,
  type CardTrafficLightSummary,
  type CreateCreditCardInput,
  type CreditCard,
  type DetectedUnregisteredCard,
  type UpdateCreditCardInput,
} from '@bills/contracts';
import { httpClient, parseResponse } from '@/shared/api';

export type CardTrafficLightSummaryDto = CardTrafficLightSummary;
export type DetectedUnregisteredCardDto = DetectedUnregisteredCard;

export const creditCardKeys = {
  all: ['credit-cards'] as const,
  list: () => ['credit-cards', 'list'] as const,
  summary: () => ['credit-cards', 'summary'] as const,
  detected: () => ['credit-cards', 'detected'] as const,
};

export const creditCardsService = {
  async list(): Promise<CreditCard[]> {
    const response = await httpClient.get('/credit-cards');
    return parseResponse(creditCardSchema.array(), response.data?.data);
  },

  async getSummary(): Promise<CardTrafficLightSummaryDto> {
    const response = await httpClient.get('/credit-cards/recommendation');
    return parseResponse(cardTrafficLightSummarySchema, response.data?.data);
  },

  async getDetected(): Promise<DetectedUnregisteredCardDto[]> {
    const response = await httpClient.get('/credit-cards/detected');
    return parseResponse(detectedUnregisteredCardSchema.array(), response.data?.data);
  },

  async create(payload: CreateCreditCardInput): Promise<CreditCard> {
    const response = await httpClient.post('/credit-cards', payload);
    return parseResponse(creditCardSchema, response.data?.data);
  },

  async update(id: string, payload: UpdateCreditCardInput): Promise<CreditCard> {
    const response = await httpClient.patch(`/credit-cards/${id}`, payload);
    return parseResponse(creditCardSchema, response.data?.data);
  },

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/credit-cards/${id}`);
  },
};
