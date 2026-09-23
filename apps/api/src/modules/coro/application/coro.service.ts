import type {
  ClaimCoroParticipantInput, CoroPaymentDestination, CreateCoroExpenseInput,
  CreateCoroGroupInput, LinkCoroTransactionInput, UpdateCoroExpenseInput, UpdateCoroGroupInput,
} from '@bills/contracts';
import { AppError } from '../../../errors/app-error';

export interface CoroActor { workspaceId: string; userId: string; email: string; role?: string }

interface GroupStore {
  list(workspaceId: string): Promise<unknown>;
  create(workspaceId: string, profileId: string, email: string, input: CreateCoroGroupInput): Promise<unknown>;
  detail(workspaceId: string, profileId: string, id: string): Promise<unknown>;
  publicDetail(slug: string, token?: string): Promise<unknown>;
  update(workspaceId: string, id: string, input: UpdateCoroGroupInput): Promise<unknown>;
  addParticipant(workspaceId: string, id: string, name: string): Promise<unknown>;
  updateParticipant(workspaceId: string, id: string, participantId: string, name: string): Promise<unknown>;
  removeParticipant(workspaceId: string, id: string, participantId: string): Promise<void>;
  releaseClaim(workspaceId: string, id: string, participantId: string): Promise<void>;
  claim(slug: string, input: ClaimCoroParticipantInput): Promise<unknown>;
  updatePayment(slug: string, token: string, payment: CoroPaymentDestination | null): Promise<unknown>;
  updateOwnerPayment(workspaceId: string, profileId: string, id: string, payment: CoroPaymentDestination | null): Promise<unknown>;
}
interface ExpenseStore {
  create(slug: string, token: string, input: CreateCoroExpenseInput): Promise<unknown>;
  createOwner(workspaceId: string, profileId: string, groupId: string, input: CreateCoroExpenseInput): Promise<unknown>;
  updatePublic(slug: string, token: string, expenseId: string, input: UpdateCoroExpenseInput): Promise<unknown>;
  removePublic(slug: string, token: string, expenseId: string): Promise<unknown>;
  removeOwner(workspaceId: string, groupId: string, expenseId: string): Promise<void>;
  updateOwner(workspaceId: string, groupId: string, expenseId: string, input: UpdateCoroExpenseInput): Promise<void>;
  candidates(workspaceId: string, groupId: string): Promise<unknown>;
  link(workspaceId: string, profileId: string, groupId: string, input: LinkCoroTransactionInput): Promise<void>;
}
interface SettlementStore {
  lock(workspaceId: string, profileId: string, id: string): Promise<unknown>;
  archive(workspaceId: string, profileId: string, id: string): Promise<unknown>;
  markPaid(slug: string, token: string, id: string, note?: string | null): Promise<unknown>;
  confirm(slug: string, token: string, id: string): Promise<unknown>;
  confirmOwner(workspaceId: string, profileId: string, groupId: string, id: string): Promise<unknown>;
  markPaidOwner(workspaceId: string, profileId: string, groupId: string, id: string, note?: string | null): Promise<unknown>;
}

export class CoroService {
  constructor(private groups: GroupStore, private expenses: ExpenseStore, private settlements: SettlementStore) {}
  private owner(actor: CoroActor) {
    if (actor.role !== 'OWNER') throw new AppError(403, 'CORO_OWNER_REQUIRED', 'Solo el propietario del workspace puede administrar coros.');
  }
  list(actor: CoroActor) { this.owner(actor); return this.groups.list(actor.workspaceId); }
  create(actor: CoroActor, input: CreateCoroGroupInput) { this.owner(actor); return this.groups.create(actor.workspaceId, actor.userId, actor.email, input); }
  detail(actor: CoroActor, id: string) { this.owner(actor); return this.groups.detail(actor.workspaceId, actor.userId, id); }
  update(actor: CoroActor, id: string, input: UpdateCoroGroupInput) { this.owner(actor); return this.groups.update(actor.workspaceId, id, input); }
  addParticipant(actor: CoroActor, id: string, name: string) { this.owner(actor); return this.groups.addParticipant(actor.workspaceId, id, name); }
  updateParticipant(actor: CoroActor, id: string, participantId: string, name: string) { this.owner(actor); return this.groups.updateParticipant(actor.workspaceId, id, participantId, name); }
  removeParticipant(actor: CoroActor, id: string, participantId: string) { this.owner(actor); return this.groups.removeParticipant(actor.workspaceId, id, participantId); }
  releaseClaim(actor: CoroActor, id: string, participantId: string) { this.owner(actor); return this.groups.releaseClaim(actor.workspaceId, id, participantId); }
  candidates(actor: CoroActor, id: string) { this.owner(actor); return this.expenses.candidates(actor.workspaceId, id); }
  link(actor: CoroActor, id: string, input: LinkCoroTransactionInput) { this.owner(actor); return this.expenses.link(actor.workspaceId, actor.userId, id, input); }
  createOwnerExpense(actor: CoroActor, id: string, input: CreateCoroExpenseInput) { this.owner(actor); return this.expenses.createOwner(actor.workspaceId, actor.userId, id, input); }
  removeOwnerExpense(actor: CoroActor, id: string, expenseId: string) { this.owner(actor); return this.expenses.removeOwner(actor.workspaceId, id, expenseId); }
  updateOwnerExpense(actor: CoroActor, id: string, expenseId: string, input: UpdateCoroExpenseInput) { this.owner(actor); return this.expenses.updateOwner(actor.workspaceId, id, expenseId, input); }
  lock(actor: CoroActor, id: string) { this.owner(actor); return this.settlements.lock(actor.workspaceId, actor.userId, id); }
  archive(actor: CoroActor, id: string) { this.owner(actor); return this.settlements.archive(actor.workspaceId, actor.userId, id); }
  confirmOwner(actor: CoroActor, id: string, settlementId: string) { this.owner(actor); return this.settlements.confirmOwner(actor.workspaceId, actor.userId, id, settlementId); }
  markPaidOwner(actor: CoroActor, id: string, settlementId: string, note?: string | null) { this.owner(actor); return this.settlements.markPaidOwner(actor.workspaceId, actor.userId, id, settlementId, note); }
  publicDetail(slug: string, token?: string) { return this.groups.publicDetail(slug, token); }
  claim(slug: string, input: ClaimCoroParticipantInput) { return this.groups.claim(slug, input); }
  updatePayment(slug: string, token: string, payment: CoroPaymentDestination | null) { return this.groups.updatePayment(slug, token, payment); }
  updateOwnerPayment(actor: CoroActor, id: string, payment: CoroPaymentDestination | null) { this.owner(actor); return this.groups.updateOwnerPayment(actor.workspaceId, actor.userId, id, payment); }
  createExpense(slug: string, token: string, input: CreateCoroExpenseInput) { return this.expenses.create(slug, token, input); }
  updateExpense(slug: string, token: string, id: string, input: UpdateCoroExpenseInput) { return this.expenses.updatePublic(slug, token, id, input); }
  removeExpense(slug: string, token: string, id: string) { return this.expenses.removePublic(slug, token, id); }
  markPaid(slug: string, token: string, id: string, note?: string | null) { return this.settlements.markPaid(slug, token, id, note); }
  confirm(slug: string, token: string, id: string) { return this.settlements.confirm(slug, token, id); }
}
