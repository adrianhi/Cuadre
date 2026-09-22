import { prisma } from '../../../config/database';
import type {
  CreditCard,
  CreateCreditCardInput,
  UpdateCreditCardInput,
} from '@bills/contracts';
import type { CreditCardRepository } from '../application/credit-card.ports';

interface DbCreditCard {
  id: string;
  workspaceId: string;
  institutionCode: string;
  alias: string;
  cardLast4: string;
  cardType: string | null;
  closingDay: number;
  graceDays: number;
  isDefault: boolean;
  colorTheme: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function mapToDto(card: DbCreditCard): CreditCard {
  return {
    id: card.id,
    workspaceId: card.workspaceId,
    institutionCode: card.institutionCode,
    alias: card.alias,
    cardLast4: card.cardLast4,
    cardType: card.cardType ?? 'CREDIT',
    closingDay: card.closingDay,
    graceDays: card.graceDays,
    isDefault: card.isDefault,
    colorTheme: card.colorTheme,
    notes: card.notes,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };
}

export class PrismaCreditCardRepository implements CreditCardRepository {
  public async listByWorkspace(workspaceId: string): Promise<CreditCard[]> {
    const cards = await prisma.creditCard.findMany({
      where: { workspaceId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return cards.map(mapToDto);
  }

  public async findById(workspaceId: string, id: string): Promise<CreditCard | null> {
    const card = await prisma.creditCard.findFirst({
      where: { id, workspaceId },
    });
    return card ? mapToDto(card) : null;
  }

  public async findByCardLast4AndInstitution(
    workspaceId: string,
    institutionCode: string,
    cardLast4: string,
  ): Promise<CreditCard | null> {
    const card = await prisma.creditCard.findFirst({
      where: { workspaceId, institutionCode, cardLast4 },
    });
    return card ? mapToDto(card) : null;
  }

  public async create(
    workspaceId: string,
    input: CreateCreditCardInput,
  ): Promise<CreditCard> {
    const created = await prisma.creditCard.create({
      data: {
        workspaceId,
        institutionCode: input.institutionCode,
        alias: input.alias,
        cardLast4: input.cardLast4,
        cardType: input.cardType ?? 'CREDIT',
        closingDay: input.closingDay,
        graceDays: input.graceDays ?? 22,
        isDefault: input.isDefault ?? false,
        colorTheme: input.colorTheme ?? null,
        notes: input.notes ?? null,
      },
    });
    return mapToDto(created);
  }

  public async update(
    workspaceId: string,
    id: string,
    input: UpdateCreditCardInput,
  ): Promise<CreditCard | null> {
    const existing = await prisma.creditCard.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) return null;

    const updated = await prisma.creditCard.update({
      where: { id },
      data: {
        ...(input.institutionCode !== undefined ? { institutionCode: input.institutionCode } : {}),
        ...(input.alias !== undefined ? { alias: input.alias } : {}),
        ...(input.cardLast4 !== undefined ? { cardLast4: input.cardLast4 } : {}),
        ...(input.cardType !== undefined ? { cardType: input.cardType } : {}),
        ...(input.closingDay !== undefined ? { closingDay: input.closingDay } : {}),
        ...(input.graceDays !== undefined ? { graceDays: input.graceDays } : {}),
        ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
        ...(input.colorTheme !== undefined ? { colorTheme: input.colorTheme } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
    });
    return mapToDto(updated);
  }

  public async delete(workspaceId: string, id: string): Promise<boolean> {
    const result = await prisma.creditCard.deleteMany({
      where: { id, workspaceId },
    });
    return result.count > 0;
  }

  public async unsetDefaultForAll(workspaceId: string, excludeId?: string): Promise<void> {
    await prisma.creditCard.updateMany({
      where: {
        workspaceId,
        isDefault: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      data: { isDefault: false },
    });
  }
}
