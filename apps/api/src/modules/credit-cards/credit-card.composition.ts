import { CreditCardService } from './application/credit-card.service';
import { CreditCardController } from './http/credit-card.controller';
import { PrismaCreditCardRepository } from './infrastructure/prisma-credit-card.repository';
import { PrismaCardDetectionReader } from './infrastructure/prisma-card-detection.reader';

export function createCreditCardController(): CreditCardController {
  const repository = new PrismaCreditCardRepository();
  const reader = new PrismaCardDetectionReader();
  return new CreditCardController(new CreditCardService(repository, reader));
}
