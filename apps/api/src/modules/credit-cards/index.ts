export { CreditCardService } from './application/credit-card.service';
export type { CreditCardRepository, CardDetectionReader } from './application/credit-card.ports';
export { CreditCardController } from './http/credit-card.controller';
export { PrismaCreditCardRepository } from './infrastructure/prisma-credit-card.repository';
export { PrismaCardDetectionReader } from './infrastructure/prisma-card-detection.reader';
export { createCreditCardController } from './credit-card.composition';
export {
  evaluateCardFinancing,
  findBestCardForToday,
  sortCardRecommendations,
} from './domain/traffic-light-calculator';
export {
  validateClosingDay,
  validateGraceDays,
  validateCardLast4,
  type CreditCardData,
} from './domain/credit-card';
export { creditCardRoutes, createCreditCardRouter } from './credit-card.routes';
