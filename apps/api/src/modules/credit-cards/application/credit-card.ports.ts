import type {
  CreditCard,
  CreateCreditCardInput,
  UpdateCreditCardInput,
  DetectedUnregisteredCard,
} from '@bills/contracts';

export interface CreditCardRepository {
  listByWorkspace(workspaceId: string): Promise<CreditCard[]>;
  findById(workspaceId: string, id: string): Promise<CreditCard | null>;
  findByCardLast4AndInstitution(workspaceId: string, institutionCode: string, cardLast4: string): Promise<CreditCard | null>;
  create(workspaceId: string, input: CreateCreditCardInput): Promise<CreditCard>;
  update(workspaceId: string, id: string, input: UpdateCreditCardInput): Promise<CreditCard | null>;
  delete(workspaceId: string, id: string): Promise<boolean>;
  unsetDefaultForAll(workspaceId: string, excludeId?: string): Promise<void>;
}

export interface CardDetectionReader {
  findUnregisteredCards(workspaceId: string): Promise<DetectedUnregisteredCard[]>;
}
